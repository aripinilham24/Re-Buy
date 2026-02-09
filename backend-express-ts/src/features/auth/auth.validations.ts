import type { FormRegister } from "../../types/formAuth.types.js";
import type { FormLogin } from "../../types/formAuth.types.js";

export const validateRegister = ({
  username,
  email,
  password,
}: FormRegister) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!username || !email || !password) {
    throw {
      success: false,
      message: "All fields are required",
      error: "ValidationError",
    };
  }

  if (!emailRegex.test(email)) {
    throw {
      success: false,
      message: "Invalid email format",
      error: "ValidationError",
    };
  }
};

export const validateLogin = ({ email, password }: FormLogin) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !password) {
    throw {
      success: false,
      message: "Email and password are required",
      error: "ValidationError",
    };
  }

  if (!emailRegex.test(email)) {
    throw {
      success: false,
      message: "Invalid email format",
      error: "ValidationError",
    };
  }
};
