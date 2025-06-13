import express from "express";
import { LoginHandler, MeHandler } from "../../controllers/auth/Login";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.post("/login", LoginHandler);
router.get("/me", auth, MeHandler);

export default router;
