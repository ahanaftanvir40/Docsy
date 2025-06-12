import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
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
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
