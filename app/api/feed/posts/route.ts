import mongoose from "mongoose";
import { NextRequest } from "next/server";

import { deleteImagesSafely, uploadImageFile } from "@/config/cloudinary";
import { dbConnect } from "@/config/db";
import {
  FEED_MAX_PAGE_SIZE,
  FEED_PAGE_SIZE,
  MAX_DESCRIPTION_LENGTH,
  POST_IMAGES_FOLDER,
} from "@/config/feed";
import { requireFeedUser } from "@/lib/feed/auth";
import {
  FEED_POST_AUTHOR_FIELDS,
  FEED_POST_LIST_PROJECTION,
  buildFeedQueries,
  buildFeedSort,
  isMissingTextIndexError,
} from "@/lib/feed/feed-queries";
import { validateImageFiles } from "@/lib/feed/image-validation";
import { toFeedPost, type PopulatedPostInput } from "@/lib/feed/post-serializers";
import { response } from "@/lib/helperFunctions";
import { sanitizeString } from "@/lib/sanitization";
import { Post } from "@/models/Post";
import type { FeedSort, IPostImage } from "@/types/feed-types";

/**
 * GET /api/feed/posts
 * The public feed: newest first by default, `?sort=most-liked` for the
 * engagement ordering. 10 posts per page (infinite scroll), caption search and
 * a hard page-size ceiling so `?limit=` cannot drain the collection.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireFeedUser();
    if (!auth.ok) return auth.unauthorized;

    const { searchParams } = new URL(req.url);
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
    );
    const limit = Math.min(
      FEED_MAX_PAGE_SIZE,
      Math.max(
        1,
        Number.parseInt(searchParams.get("limit") ?? "", 10) || FEED_PAGE_SIZE,
      ),
    );
    const skip = (page - 1) * limit;
    const sort: FeedSort =
      searchParams.get("sort") === "most-liked" ? "most-liked" : "recent";
    const searchTerm = sanitizeString(searchParams.get("search") ?? "", 100);

    await dbConnect();

    const { primary, fallback } = buildFeedQueries(searchTerm);
    const ordering = buildFeedSort(sort);

    const fetchPage = (query: Record<string, unknown>) =>
      Post.find(query)
        .sort(ordering)
        .skip(skip)
        .limit(limit)
        .select(FEED_POST_LIST_PROJECTION)
        .populate("authorId", FEED_POST_AUTHOR_FIELDS)
        .lean();

    let total = 0;
    let rawPosts: Awaited<ReturnType<typeof fetchPage>> = [];

    try {
      total = await Post.countDocuments(primary);
      rawPosts = await fetchPage(primary);
    } catch (error) {
      // A text index is built in the background on first use. Degrade to a
      // regex scan for this single request instead of failing the whole feed.
      if (!fallback || !isMissingTextIndexError(error)) throw error;
      total = await Post.countDocuments(fallback);
      rawPosts = await fetchPage(fallback);
    }

    // One indexed query answers "which of these posts did I like?" — cheaper
    // than returning every post's `likes` array to the client.
    const postIds = rawPosts.map((post) => post._id);
    const likedPostIds = new Set<string>();
    if (postIds.length > 0) {
      const liked = await Post.find({
        _id: { $in: postIds },
        likes: auth.userId,
      })
        .select("_id")
        .lean();
      liked.forEach((post) => likedPostIds.add(String(post._id)));
    }

    const posts = rawPosts.map((post) =>
      toFeedPost(
        post as unknown as PopulatedPostInput,
        auth.userId,
        likedPostIds,
      ),
    );
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return response(true, 200, "Feed retrieved successfully", {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Get feed error:", error);
    return response(false, 500, "Internal server error");
  }
}

/**
 * POST /api/feed/posts
 * Creates a post from multipart form data: a non-empty `description` plus one
 * or more `images` (max 10 files, 10 MB each, images only — PDFs are rejected).
 * Every asset is uploaded to Cloudinary first and rolled back if the document
 * cannot be saved, so no orphaned files are ever left in storage.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireFeedUser();
    if (!auth.ok) return auth.unauthorized;

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return response(false, 400, "Invalid post data. Please try again.");
    }

    const rawDescription = formData.get("description");
    const description =
      typeof rawDescription === "string"
        ? sanitizeString(rawDescription, MAX_DESCRIPTION_LENGTH)
        : "";

    if (!description) {
      return response(false, 400, "Please write a description for your post.");
    }

    const images = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const fileError = validateImageFiles(images);
    if (fileError) {
      return response(false, 400, fileError);
    }

    await dbConnect();

    const uploaded: IPostImage[] = [];

    try {
      for (const image of images) {
        uploaded.push(await uploadImageFile(image, POST_IMAGES_FOLDER));
      }

      const created = await Post.create({
        authorId: auth.userId,
        description,
        images: uploaded,
      });

      const post = await Post.findById(created._id)
        .select(FEED_POST_LIST_PROJECTION)
        .populate("authorId", FEED_POST_AUTHOR_FIELDS)
        .lean();

      const payload = (post ??
        created.toObject()) as unknown as PopulatedPostInput;

      return response(
        true,
        201,
        "Post created successfully",
        toFeedPost(payload, auth.userId),
      );
    } catch (error) {
      // The post never made it to the database, so its images must not stay.
      await deleteImagesSafely(uploaded.map((image) => image.publicId));

      if (error instanceof mongoose.Error.ValidationError) {
        const firstError = Object.values(error.errors)[0];
        return response(
          false,
          400,
          firstError?.message ?? "Please check your post details.",
        );
      }

      console.error("Create post error:", error);
      return response(
        false,
        500,
        "Could not create your post. Please try again.",
      );
    }
  } catch (error) {
    console.error("Create post error:", error);
    return response(false, 500, "Internal server error");
  }
}

