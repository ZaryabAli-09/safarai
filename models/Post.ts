import mongoose from "mongoose";

import { MAX_DESCRIPTION_LENGTH } from "@/lib/feed/config";
import type { IPost, IPostImage } from "@/types/app-types";

export type { IPost, IPostImage };

/**
 * Shared media sub-document: `{ url, publicId }`.
 *
 * Reused by `images` today and by `videos` when upload support lands, so both
 * arrays stay structurally identical.
 */
const PostMediaSchema = new mongoose.Schema<IPostImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const PostSchema = new mongoose.Schema<IPost>(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: MAX_DESCRIPTION_LENGTH,
    },
    images: {
      type: [PostMediaSchema],
      default: [],
      validate: {
        validator: (images: IPostImage[]) =>
          Array.isArray(images) && images.length > 0,
        message: "A post needs at least one image.",
      },
    },
    // Reserved for future video support: the array exists so enabling video
    // uploads later needs no schema change, and stays empty until then.
    videos: { type: [PostMediaSchema], default: [] },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    likeCount: { type: Number, default: 0, min: 0 },
    comments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    commentCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  },
);

/**
 * Indexes chosen for the two feed orderings and the caption search:
 *  - `createdAt: -1`           → "Recent" (default feed ordering)
 *  - `likeCount: -1, createdAt`→ "Most Liked" (sorted field is indexed)
 *  - `authorId + createdAt`    → a user's own posts / profile feeds
 *  - `likes`                   → "did I like these posts?" lookups
 *  - text index on description → indexed caption search (`$text`)
 */
PostSchema.index({ createdAt: -1 });
PostSchema.index({ likeCount: -1, createdAt: -1 });
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ likes: 1 });
PostSchema.index({ description: "text" });

/**
 * Safety net: whenever a post is written through a document (`save()`) the
 * counters are re-derived from their source arrays. The API routes update both
 * atomically in a single `updateOne`, this only guards against future writes
 * that forget to.
 */
PostSchema.pre("save", function (next) {
  if (this.isModified("likes")) {
    this.likeCount = this.likes?.length ?? 0;
  }
  if (this.isModified("comments")) {
    this.commentCount = this.comments?.length ?? 0;
  }
  next();
});

// Typed explicitly so `findById(...).lean()` resolves to a single document
// instead of `Model<any>`'s union of query results.
const Post: mongoose.Model<IPost> =
  (mongoose.models.Post as mongoose.Model<IPost> | undefined) ??
  mongoose.model<IPost>("Post", PostSchema);

export { Post };
