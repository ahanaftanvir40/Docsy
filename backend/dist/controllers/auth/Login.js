"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeHandler = exports.LoginHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verify_token_1 = require("../../utils/verify-token");
const user_1 = __importDefault(require("../../models/user"));
const LoginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        console.log("Received token:", token);
        const payload = yield (0, verify_token_1.verifyGoogleToken)(token);
        if (!payload) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        let user = yield user_1.default.findOne({ email: payload.email });
        if (!user) {
            user = new user_1.default({
                fullname: payload.name,
                email: payload.email,
                avatar: payload.picture,
            });
            yield user.save();
        }
        const jwtToken = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email,
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });
        //remove token in production
        res.status(200).json({
            message: "Login successful",
            token: jwtToken,
            data: user,
        });
        return;
    }
    catch (error) {
        console.log("Login error:", error);
        res.status(500).json({ message: "Authentication Failed" });
        return;
    }
});
exports.LoginHandler = LoginHandler;
const MeHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield user_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            message: "User data retrieved successfully",
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving user data" });
    }
});
exports.MeHandler = MeHandler;
