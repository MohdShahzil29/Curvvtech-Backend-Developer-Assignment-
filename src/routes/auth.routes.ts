import { Router } from "express";
import * as AuthController from "@controllers/auth.controller.ts";
import { validate } from "@middleware/validate.ts";
import { signupSchema, loginSchema } from "../schemas/auth.schema.ts";

const router = Router();

router.post("/signup", validate(signupSchema), AuthController.signup);
router.post("/login", validate(loginSchema), AuthController.login);

export default router;
