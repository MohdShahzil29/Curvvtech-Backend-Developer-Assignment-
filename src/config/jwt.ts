import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "@config/env";

export interface JwtPayload {
  sub: string; // user id
  role: "user" | "admin";
}

export const signJwt = (payload: JwtPayload) => {
  const secret = (env.JWT_SECRET || "testsecret") as Secret;
  const expiresIn = (env.JWT_EXPIRES_IN || "1h") as SignOptions["expiresIn"];

  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyJwt = (token: string): JwtPayload => {
  const secret = (env.JWT_SECRET || "testsecret") as Secret;
  return jwt.verify(token, secret) as JwtPayload;
};
