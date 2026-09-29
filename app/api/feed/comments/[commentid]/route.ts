import mongoose from "mongoose";
import { NextRequest } from "next/server";

import { dbConnect } from "@/config/db";
import { requireFeedUser } from "@/lib/feed/auth";
import { response } from "@/lib/helperFunctions";
import { Comment } from "@/models/Comment";
import { Post } from "@/models/Post";

/**
 * DELETE /api/feed/comments/[commentid]
 * Owner-only: a user can only remove their own comment, and doing so keeps the
 * post's counter in step with its comment list.
 */
export async function DELETE(
  req: NextRequest,
  params: { params: Promise<{ commentid: string }> },
) {
  try {
    const auth = await requireFeedUser();
    if (!auth.ok) return auth.unauthorized;

    const { commentid } = await params.params;
    if (!mongoose.Types.ObjectId.isValid(commentid)) {
      return response(false, 400, "Valid comment id is required");
    }

    await dbConnect();

    const comment = await Comment.findById(commentid)
      .select("postId authorId")
      .lean();

    if (!comment) {
      return response(false, 404, "Comment not found");
    }

    if (String(comment.authorId) !== auth.userId) {
      return response(false, 403, "You can only delete your own comment");
    }

    await Comment.findByIdAndDelete(commentid);

    const updated = await Post.updateOne(
      { _id: comment.postId },
      { $pull: { comments: comment._id }, $inc: { commentCount: -1 } },
    );

    // If the post no longer exists there is nothing left to keep in sync.
    if (updated.matchedCount === 0) {
      return response(true, 200, "Comment deleted successfully", {
        commentId: commentid,
        commentCount: 0,
      });
    }

    const post = await Post.findById(comment.postId)
      .select("comments commentCount")
      .lean();
    const commentCount = post?.comments?.length ?? 0;

    if (post && post.commentCount !== commentCount) {
      await Post.updateOne(
        { _id: comment.postId },
        { $set: { commentCount } },
      );
    }

    return response(true, 200, "Comment deleted successfully", {
      commentId: commentid,
      commentCount,
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return response(false, 500, "Internal server error");
  }
}
