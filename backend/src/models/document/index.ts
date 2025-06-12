import mongoose, { Schema } from "mongoose";

export interface IDocument {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
}

const documentSchema = new Schema<IDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
  },
  title: {
    type: String,
    required: true,
  },
  text: {
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
