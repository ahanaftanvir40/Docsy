import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URI || "");
    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });
    connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
