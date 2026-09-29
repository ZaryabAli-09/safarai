import mongoose from "mongoose";
import { NextRequest } from "next/server";

import { dbConnect } from "@/config/db";
import { MAX_COMMENT_LENGTH, MAX_COMMENTS_PER_POST } from "@/config/feed";
import { requireFeedUser } from "@/lib/feed/auth";
import { FEED_POST_AUTHOR_FIELDS } from "@/lib/feed/feed-queries";
import {
  toFeedCommentItem,
  type PopulatedCommentInput,
} from "@/lib/feed/post-serializers";
import { response } from "@/lib/helperFunctions";
import { sanitizeString } from "@/lib/sanitization";
import { Comment } from "@/models/Comment";
import { Post } from "@/models/Post";

/**
 * GET /api/feed/posts/[postid]/comments
 * The post's flat comment list, oldest first (how they were posted).
 */
export async function GET(
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

    const comments = await Comment.find({ postId: postid })
      .sort({ createdAt: 1 })
      .limit(MAX_COMMENTS_PER_POST)
      .populate("authorId", FEED_POST_AUTHOR_FIELDS)
      .lean();

    return response(
      true,
      200,
      "Comments retrieved successfully",
      comments.map((comment) =>
        toFeedCommentItem(
          comment as unknown as PopulatedCommentInput,
          auth.userId,
        ),
      ),
    );
  } catch (error) {
    console.error("Get comments error:", error);
    return response(false, 500, "Internal server error");
  }
}

/**
 * POST /api/feed/posts/[postid]/comments
 * Adds one flat comment. The same user may comment as many times as they like.
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

    const body = await req.json().catch(() => null);
    const text =
      typeof body?.text === "string"
        ? sanitizeString(body.text, MAX_COMMENT_LENGTH)
        : "";

    if (!text) {
      return response(false, 400, "Please write a comment before posting.");
    }

    await dbConnect();

    const exists = await Post.exists({ _id: postid });
    if (!exists) {
      return response(false, 404, "Post not found");
    }

    const comment = await Comment.create({
      postId: postid,
      authorId: auth.userId,
      text,
    });

    const attached = await Post.updateOne(
      { _id: postid },
      { $push: { comments: comment._id }, $inc: { commentCount: 1 } },
    );

    if (attached.matchedCount === 0) {
      // The post disappeared mid-request: do not leave a dangling comment.
      await Comment.findByIdAndDelete(comment._id);
      return response(false, 404, "Post not found");
    }

    const populated = await Comment.findById(comment._id)
      .populate("authorId", FEED_POST_AUTHOR_FIELDS)
      .lean();

    const payload = (populated ??
      comment.toObject()) as unknown as PopulatedCommentInput;

    return response(
      true,
      201,
      "Comment added successfully",
      toFeedCommentItem(payload, auth.userId),
    );
  } catch (error) {
    console.error("Add comment error:", error);
    return response(false, 500, "Internal server error");
  }
}
