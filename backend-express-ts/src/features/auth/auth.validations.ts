import type { FormRegister } from "../../types/formAuth.types.js";
import type { FormLogin } from "../../types/formAuth.types.js";
import { AppError } from "../../utils/AppError.js";

export const validateRegister = ({
  username,
  email,
  password,
}: FormRegister) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!username || !email || !password) {
    throw new AppError("All fields are required", 400);
  }

  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }
};

export const validateLogin = ({ email, password }: FormLogin) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }
};
