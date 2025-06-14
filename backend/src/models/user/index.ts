import mongoose, { Schema } from "mongoose";
import { sharedDocumentSchema, ISharedDocument } from "../document";

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  fullname: string;
  avatar: string;
  email: string;
  documents: mongoose.Types.ObjectId[];
  sharedDocuments: ISharedDocument[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  fullname: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "https://example.com/default-avatar.png",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  documents: [
    {
      type: Schema.Types.ObjectId,
      ref: "Document",
    },
  ],
  sharedDocuments: [sharedDocumentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
