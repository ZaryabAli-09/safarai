import mongoose from "mongoose";

import { MAX_COMMENT_LENGTH } from "@/lib/feed/config";
import type { IComment } from "@/types/app-types";

export type { IComment };

/**
 * Comments are deliberately flat: a comment belongs to one post, has one
 * author and one body of text. There is no parent/reply field, so threading
 * cannot be introduced by accident.
 */
const CommentSchema = new mongoose.Schema<IComment>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: MAX_COMMENT_LENGTH,
    },
  },
  {
    timestamps: true,
  },
);

/** Index used to read a post's comments in posting order. */
CommentSchema.index({ postId: 1, createdAt: 1 });
/** Index used for "my comments" listings and author lookups. */
CommentSchema.index({ authorId: 1, createdAt: -1 });

// Typed explicitly so `findById(...).lean()` resolves to a single document
// instead of `Model<any>`'s union of query results.
const Comment: mongoose.Model<IComment> =
  (mongoose.models.Comment as mongoose.Model<IComment> | undefined) ??
  mongoose.model<IComment>("Comment", CommentSchema);

export { Comment };
