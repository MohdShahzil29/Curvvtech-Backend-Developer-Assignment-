import { User } from "@models/User";
import bcrypt from "bcryptjs";
import { signJwt } from "@config/jwt";

export async function signup(
  name: string,
  email: string,
  password: string,
  role: "user" | "admin" = "user"
) {
  const existing = await User.findOne({ email });
  if (existing)
    throw Object.assign(new Error("Email already registered"), { status: 409 });
  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hash, role });
  return { success: true, message: "User registered successfully" };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user)
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok)
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const token = signJwt({ sub: user.id, role: user.role });
  return {
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}
