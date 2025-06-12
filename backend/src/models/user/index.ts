import mongoose, { Schema } from "mongoose";

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  fullname: string;
  role: "viewer" | "editor";
  avatar: string;
  email: string;
  documents: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  fullname: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["viewer", "editor"],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
