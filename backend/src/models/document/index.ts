import mongoose, { Schema } from "mongoose";

export interface IDocument {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ISharedDocument {
  authorId?: mongoose.Types.ObjectId;
  document: mongoose.Types.ObjectId;
  role: "viewer" | "editor";
}

export const sharedDocumentSchema = new Schema<ISharedDocument>({
  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  document: {
    type: Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  role: {
    type: String,
    enum: ["viewer", "editor"],
    required: true,
  },
});

const documentSchema = new Schema<IDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Document = mongoose.model<IDocument>("Document", documentSchema);
export default Document;
