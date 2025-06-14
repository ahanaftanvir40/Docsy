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

  socket.on("join", (documentId, userId) => {
    currentDoc = documentId;
    currentUser = userId;
    socket.join(documentId);

    if (!documentUsers.has(documentId)) {
      documentUsers.set(documentId, new Set());
    }
    documentUsers.get(documentId)!.add(userId);

    const users = Array.from(documentUsers.get(documentId)!);
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
        } else {
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
