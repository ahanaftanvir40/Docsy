"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Login_1 = require("../../controllers/auth/Login");
const auth_1 = require("../../middlewares/auth");
const router = express_1.default.Router();
router.post("/login", Login_1.LoginHandler);
router.get("/me", auth_1.auth, Login_1.MeHandler);
exports.default = router;
