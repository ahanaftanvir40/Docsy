import { Request, Response } from "express";
import Document from "../../models/document";
import { AuthenticatedRequest } from "../../types";
import User from "../../models/user";

export const CreateHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      res.status(400).json({ message: "Title and content are required" });
      return;
    }
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
      .populate({
        path: "sharedDocuments.document",
        model: "Document",
        populate: {
          path: "authorId",
          model: "User",
          select: "fullname email",
        },
      });

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
    res.status(500).json({ message: "Error retrieving documents" });
    return;
  }
};
