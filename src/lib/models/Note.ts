import { INote } from "@/types/commonTypes";
import { Schema, model, models, Types, Model } from "mongoose";

const NoteSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Note: Model<INote> =
  models.Note || model<INote>("Note", NoteSchema)