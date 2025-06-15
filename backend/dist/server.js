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
const user_1 = __importDefault(require("./models/user"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
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
    socket.on("join", (documentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
        currentDoc = documentId;
        currentUser = userId;
        socket.join(documentId);
        if (!documentUsers.has(documentId)) {
            documentUsers.set(documentId, new Set());
        }
        documentUsers.get(documentId).add(userId);
        const users = Array.from(documentUsers.get(documentId));
        const userInfos = yield Promise.all(users.map((id) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_1.default.findById(id).select("fullname avatar");
            return user
                ? { id: user._id, fullname: user.fullname, avatar: user.avatar }
                : null;
        })));
        io.to(documentId).emit("connectedUsers", userInfos);
    }));
    socket.on("documentChange", (data) => {
        const { documentId, content } = data;
        socket.to(documentId).emit("documentChange", content);
    });
    socket.on("disconnect", () => {
        console.log(`User ${currentUser} disconnected from document: ${currentDoc}`);
        if (currentDoc && currentUser) {
            const usersSet = documentUsers.get(currentDoc);
            if (usersSet) {
                usersSet.delete(currentUser);
                if (usersSet.size === 0) {
                    documentUsers.delete(currentDoc);
                }
                else {
                    io.to(currentDoc).emit("onDisconnect", currentUser);
                }
            }
            console.log(`User ${currentUser} left document: ${currentDoc}`);
        }
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
