import express from "express";
import {
  CreateHandler,
  UpdateHandler,
  GetAllHandler,
  GetHandler,
  DeleteHandler,
} from "../../controllers/document";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.post("/create", auth, CreateHandler);
router.put("/update/:id", auth, UpdateHandler);
router.delete("/delete/:id", auth, DeleteHandler);
router.get("/get/:id", auth, GetHandler);
router.get("/getAll", auth, GetAllHandler);

export default router;
