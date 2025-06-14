"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllHandler = exports.GetHandler = exports.DeleteHandler = exports.UpdateHandler = exports.CreateHandler = void 0;
const document_1 = __importDefault(require("../../models/document"));
const user_1 = __importDefault(require("../../models/user"));
const CreateHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, content } = req.body;
        const document = new document_1.default({
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
            title,
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        yield document.save();
        const user = yield user_1.default.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId);
        if (!user) {
            res.status(404).json({ message: "User not found, document not created" });
            return;
        }
        user.documents.push(document._id);
        yield user.save();
        res
            .status(201)
            .json({ message: "Document created successfully", data: document });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error creating document" });
        return;
    }
});
exports.CreateHandler = CreateHandler;
const UpdateHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        if (!id) {
            res.status(400).json({ message: "Document ID is required" });
            return;
        }
        const document = yield document_1.default.findByIdAndUpdate(id, { title, content, updatedAt: new Date() }, { new: true });
        if (!document) {
            res.status(404).json({ message: "Document not found" });
            return;
        }
        res.status(200).json({
            message: `Document with ID ${id} updated successfully`,
            data: document,
        });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error updating document" });
        return;
    }
});
exports.UpdateHandler = UpdateHandler;
const DeleteHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "Document ID is required" });
            return;
        }
        const document = yield document_1.default.findByIdAndDelete(id);
        if (!document) {
            res.status(404).json({ message: "Document not found" });
            return;
        }
        yield user_1.default.updateOne({ _id: document.userId }, { $pull: { documents: document._id } });
        res.status(200).json({
            message: `Document with ID ${id} deleted successfully`,
            data: document,
        });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting document" });
        return;
    }
});
exports.DeleteHandler = DeleteHandler;
const GetHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "Document ID is required" });
            return;
        }
        const document = yield document_1.default.findById(id).populate("userId", "fullname email");
        res.status(200).json({
            message: `Document with ID ${id} retrieved successfully`,
            data: document,
        });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving document" });
        return;
    }
});
exports.GetHandler = GetHandler;
const GetAllHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield user_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)
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
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving documents" });
        return;
    }
});
exports.GetAllHandler = GetAllHandler;
