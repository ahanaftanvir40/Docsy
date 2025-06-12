import { Request } from "express";
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
}
