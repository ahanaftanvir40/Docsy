import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { verifyGoogleToken } from "../../utils/verify-token";
import User from "../../models/user";

export const LoginHandler = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const payload = await verifyGoogleToken(token);

    if (!payload) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        fullname: payload.name,
        email: payload.email,
        avatar: payload.picture,
      });

      await user.save();
    }

    const jwtToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      data: user,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Authentication Failed" });
    return;
  }
};
