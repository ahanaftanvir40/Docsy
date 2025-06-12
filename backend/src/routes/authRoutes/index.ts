import express from "express";
import { LoginHandler } from "../../controllers/auth/Login";

const router = express.Router();

router.post("/login", LoginHandler);

export default router;
