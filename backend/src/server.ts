import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import { connectDb } from "./utils/db";
dotenv.config();
connectDb();

// routes import
import authRoutes from "./routes/authRoutes";
import documentRoutes from "./routes/documentRoutes";
import User from "./models/user";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", authRoutes);
app.use("/api/document", documentRoutes);

//server
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Map: documentId -> Set of userIds
const documentUsers = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  let currentDoc: string | null = null;
  let currentUser: string | null = null;

  socket.on("join", async (documentId, userId) => {
    currentDoc = documentId;
    currentUser = userId;
    socket.join(documentId);

    if (!documentUsers.has(documentId)) {
      documentUsers.set(documentId, new Set());
    }
    documentUsers.get(documentId)!.add(userId);

    const users = Array.from(documentUsers.get(documentId)!);

    const userInfos = await Promise.all(
      users.map(async (id) => {
        const user = await User.findById(id).select("fullname avatar");

        return user
          ? { id: user._id, fullname: user.fullname, avatar: user.avatar }
          : null;
      })
    );
    io.to(documentId).emit("connectedUsers", userInfos);
    
  });

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
        } else {
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
