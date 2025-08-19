import { Request, Response } from "express";
import * as Auth from "@services/auth.service.ts";
import { StatusCodes } from "http-status-codes";

export async function signup(req: Request, res: Response) {
  const { name, email, password, role } = req.body;
  const out = await Auth.signup(name, email, password, role);
  return res.status(StatusCodes.CREATED).json(out);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const out = await Auth.login(email, password);
  return res.status(StatusCodes.OK).json(out);
}
