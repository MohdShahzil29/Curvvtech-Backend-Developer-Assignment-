import { AnyZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      return next();
    } catch (err) {
      const zerr = err as ZodError;
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: zerr.flatten() });
    }
  };
