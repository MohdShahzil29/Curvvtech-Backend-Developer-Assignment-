import { Router } from "express";
import * as AuthController from "@controllers/auth.controller";
import { validate } from "@middleware/validate";
import { signupSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/signup", validate(signupSchema), AuthController.signup);
router.post("/login", validate(loginSchema), AuthController.login);

export default router;
