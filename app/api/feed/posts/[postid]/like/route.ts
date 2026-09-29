import mongoose from "mongoose";
import { NextRequest } from "next/server";

import { dbConnect } from "@/config/db";
import { requireFeedUser } from "@/lib/feed/auth";
import { response } from "@/lib/helperFunctions";
import { Post } from "@/models/Post";

/**
 * POST /api/feed/posts/[postid]/like
 * Toggles the signed-in user's like (a user may like their own post).
 *
 * `likes` remains the source of truth and the counter is updated in the same
 * atomic write, guarded by `$ne` / `$push`-style filters so two rapid taps can
 * never double-count.
 */
export async function POST(
  req: NextRequest,
  params: { params: Promise<{ postid: string }> },
) {
  try {
    const auth = await requireFeedUser();
    if (!auth.ok) return auth.unauthorized;

    const { postid } = await params.params;
    if (!mongoose.Types.ObjectId.isValid(postid)) {
      return response(false, 400, "Valid post id is required");
    }

    await dbConnect();

    const exists = await Post.exists({ _id: postid });
    if (!exists) {
      return response(false, 404, "Post not found");
    }

    const likeResult = await Post.updateOne(
      { _id: postid, likes: { $ne: auth.userId } },
      { $addToSet: { likes: auth.userId }, $inc: { likeCount: 1 } },
    );

    let liked: boolean;

    if (likeResult.matchedCount > 0) {
      liked = true;
    } else {
      // The user is already in `likes`, so this tap is an unlike.
      const unlikeResult = await Post.updateOne(
        { _id: postid, likes: auth.userId },
        { $pull: { likes: auth.userId }, $inc: { likeCount: -1 } },
      );

      if (unlikeResult.matchedCount === 0) {
        return response(false, 404, "Post not found");
      }

      liked = false;
    }

    const updated = await Post.findById(postid).select("likes likeCount").lean();
    const likeCount = updated?.likes?.length ?? 0;

    // Self-heal the counter if it ever drifts from the array it mirrors.
    if (updated && updated.likeCount !== likeCount) {
      await Post.updateOne({ _id: postid }, { $set: { likeCount } });
    }

    return response(true, 200, liked ? "Post liked" : "Post unliked", {
      postId: postid,
      liked,
      likeCount,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    return response(false, 500, "Internal server error");
  }
}
