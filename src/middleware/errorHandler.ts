import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function notFound(_req: Request, res: Response) {
  return res
    .status(StatusCodes.NOT_FOUND)
    .json({ success: false, message: "Route not found" });
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal server error";
  return res.status(status).json({ success: false, message });
}
