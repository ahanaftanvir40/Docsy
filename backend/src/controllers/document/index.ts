import { Request, Response } from "express";
import Document from "../../models/document";
import { AuthenticatedRequest } from "../../types";
import User from "../../models/user";
import mongoose from "mongoose";

export const CreateHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { title, content } = req.body;
    const document = new Document({
      userId: req.user?.userId,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await document.save();

    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: "User not found, document not created" });
      return;
    }
    user.documents.push(document._id);
    await user.save();
    res
      .status(201)
      .json({ message: "Document created successfully", data: document });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error creating document" });
    return;
  }
};

export const UpdateHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!id) {
      res.status(400).json({ message: "Document ID is required" });
      return;
    }

    const document = await Document.findByIdAndUpdate(
      id,
      { title, content, updatedAt: new Date() },
      { new: true }
    );

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.status(200).json({
      message: `Document with ID ${id} updated successfully`,
      data: document,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error updating document" });
    return;
  }
};

export const DeleteHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Document ID is required" });
      return;
    }

    const document = await Document.findByIdAndDelete(id);

    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    await User.updateOne(
      { _id: document.userId },
      { $pull: { documents: document._id } }
    );

    res.status(200).json({
      message: `Document with ID ${id} deleted successfully`,
      data: document,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error deleting document" });
    return;
  }
};

export const GetHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Document ID is required" });
      return;
    }
    const document = await Document.findById(id).populate(
      "userId",
      "fullname email"
    );
    res.status(200).json({
      message: `Document with ID ${id} retrieved successfully`,
      data: document,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error retrieving document" });
    return;
  }
};

export const GetAllHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = await User.findById(req.user?.userId)
      .populate("documents")
      .populate("sharedDocuments.document")
      .populate("sharedDocuments.authorId", "fullname email");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "All documents retrieved successfully",
      data: {
        documents: user.documents,
        sharedDocuments: user.sharedDocuments,
      },
    });
    return;
  } catch (error) {
    console.log("Get all documents error:", error);

    res.status(500).json({ message: "Error retrieving documents" });
    return;
  }
};

export const ShareHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { userEmail, role } = req.body;

    if (!id || !userEmail) {
      res
        .status(400)
        .json({ message: "Document ID and User Email are required" });
      return;
    }

    const document = await Document.findById(id);
    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    if (document.userId.toString() !== req.user?.userId) {
      res
        .status(403)
        .json({ message: "You don't have permission to share this document" });
      return;
    }

    const targetUser = await User.findOne({ email: userEmail });
    if (!targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isAlreadyShared = targetUser.sharedDocuments.some(
      (shared) => shared.document.toString() === id
    );

    if (isAlreadyShared) {
      res
        .status(400)
        .json({ message: "Document is already shared with this user" });
      return;
    }

    targetUser.sharedDocuments.push({
      document: new mongoose.Types.ObjectId(id),
      authorId: new mongoose.Types.ObjectId(req.user?.userId),
      role: role,
    });

    await targetUser.save();

    res.status(200).json({
      message: `Document "${document.title}" shared with ${targetUser.fullname} successfully`,
      data: {
        document,
        sharedWith: {
          userId: targetUser._id,
          fullname: targetUser.fullname,
          email: targetUser.email,
          role: role,
        },
      },
    });
    return;
  } catch (error) {
    console.error("Share document error:", error);
    res.status(500).json({ message: "Error sharing document" });
    return;
  }
};
