import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

import { authOptions } from "@/config/authOptions";
import { deleteImages } from "@/config/cloudinary";
import { dbConnect } from "@/config/db";
import {
  FEED_POST_AUTHOR_FIELDS,
  FEED_POST_LIST_PROJECTION,
  extractPublicIds,
} from "@/lib/feed/feed-queries";
import { toFeedPost, type PopulatedPostInput } from "@/lib/feed/post-serializers";
import { response } from "@/lib/helperFunctions";
import { Comment } from "@/models/Comment";
import { Post } from "@/models/Post";

/** GET /api/feed/posts/[postid] — single post hydration (e.g. share links). */
export async function GET(
  req: NextRequest,
  params: { params: Promise<{ postid: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?._id;

    if (!userId) {
      return response(false, 401, "Please sign in");
    }

    const { postid } = await params.params;
    if (!mongoose.Types.ObjectId.isValid(postid)) {
      return response(false, 400, "Valid post id is required");
    }

    await dbConnect();

    const post = await Post.findById(postid)
      .select(FEED_POST_LIST_PROJECTION)
      .populate("authorId", FEED_POST_AUTHOR_FIELDS)
      .lean();

    if (!post) {
      return response(false, 404, "Post not found");
    }

    const likedByMe = await Post.exists({ _id: postid, likes: userId });
    const likedPostIds = new Set(likedByMe ? [postid] : []);

    return response(
      true,
      200,
      "Post retrieved successfully",
      toFeedPost(post as unknown as PopulatedPostInput, userId, likedPostIds),
    );
  } catch (error) {
    console.error("Get post error:", error);
    return response(false, 500, "Internal server error");
  }
}

/**
 * DELETE /api/feed/posts/[postid]
 * Owner-only. Cloudinary is cleaned first: if any asset cannot be deleted the
 * request aborts with the database untouched, so a post is never removed while
 * its images still exist in storage. Comments are removed with the post.
 */
export async function DELETE(
  req: NextRequest,
  params: { params: Promise<{ postid: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?._id;

    if (!userId) {
      return response(false, 401, "Please sign in");
    }

    const { postid } = await params.params;
    if (!mongoose.Types.ObjectId.isValid(postid)) {
      return response(false, 400, "Valid post id is required");
    }

    await dbConnect();

    const post = await Post.findById(postid).select("authorId images").lean();
    if (!post) {
      return response(false, 404, "Post not found");
    }

    if (String(post.authorId) !== userId) {
      return response(false, 403, "You can only delete your own post");
    }

    try {
      await deleteImages(extractPublicIds(post.images));
    } catch (error) {
      console.error("Delete post images error:", error);
      return response(
        false,
        502,
        "The post images could not be removed from storage, so the post was not deleted. Please try again.",
      );
    }

    // Storage is clean — now the database records can go.
    await Comment.deleteMany({ postId: post._id });
    await Post.findByIdAndDelete(post._id);

    return response(true, 200, "Post deleted successfully");
  } catch (error) {
    console.error("Delete post error:", error);
    return response(false, 500, "Internal server error");
  }
}
