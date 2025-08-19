import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "@config/jwt";
import { StatusCodes } from "http-status-codes";

export interface AuthRequest extends Request {
  user?: { id: string; role: "user" | "admin" };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ success: false, message: "Missing token" });
  }
  try {
    const token = header.split(" ")[1];
    const payload = verifyJwt(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (e) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ success: false, message: "Invalid/Expired token" });
  }
};
