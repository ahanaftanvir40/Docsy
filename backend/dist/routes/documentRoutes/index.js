"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const document_1 = require("../../controllers/document");
const auth_1 = require("../../middlewares/auth");
const router = express_1.default.Router();
router.post("/create", auth_1.auth, document_1.CreateHandler);
router.get("/get/:id", auth_1.auth, document_1.GetHandler);
router.get("/getAll", auth_1.auth, document_1.GetAllHandler);
exports.default = router;
