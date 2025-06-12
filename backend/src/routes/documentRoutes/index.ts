import express from "express";
import {
  CreateHandler,
  GetAllHandler,
  GetHandler,
} from "../../controllers/document";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.post("/create", auth, CreateHandler);
router.get("/get/:id", auth, GetHandler);
router.get("/getAll", auth, GetAllHandler);

export default router;
