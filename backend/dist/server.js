"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const db_1 = require("./utils/db");
dotenv_1.default.config();
(0, db_1.connectDb)();
// routes import
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/user", authRoutes_1.default);
app.use("/api/document", documentRoutes_1.default);
//server
const httpServer = http_1.default.createServer(app);
const PORT = process.env.PORT || 3000;
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
// Map: documentId -> Set of userIds
const documentUsers = new Map();
io.on("connection", (socket) => {
    let currentDoc = null;
    let currentUser = null;
    console.log(`User connected: ${socket.id}`);
    socket.on("join", (documentId, userId) => {
        currentDoc = documentId;
        currentUser = userId;
        socket.join(documentId);
        if (!documentUsers.has(documentId)) {
            documentUsers.set(documentId, new Set());
        }
        documentUsers.get(documentId).add(userId);
        const users = Array.from(documentUsers.get(documentId));
        io.to(documentId).emit("connectedUsers", users);
        console.log(`User ${userId} joined document: ${documentId}`);
    });
    socket.on("documentChange", (data) => {
        const { documentId, content } = data;
        socket.to(documentId).emit("documentChange", content);
    });
    socket.on("disconnect", () => {
        if (currentDoc && currentUser) {
            const usersSet = documentUsers.get(currentDoc);
            if (usersSet) {
                usersSet.delete(currentUser);
                if (usersSet.size === 0) {
                    documentUsers.delete(currentDoc);
                }
                else {
                    // Broadcast updated user list
                    io.to(currentDoc).emit("connectedUsers", Array.from(usersSet));
                }
            }
            console.log(`User ${currentUser} left document: ${currentDoc}`);
        }
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
