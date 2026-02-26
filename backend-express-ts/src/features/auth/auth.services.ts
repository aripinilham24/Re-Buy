import UserModel from "../../models/user/user.model.js";
import bcrypt from "bcrypt";
import type { FormRegister, FormLogin } from "../../types/formAuth.types.js";
import { validateRegister, validateLogin } from "./auth.validations.js";
import createJwt from "../../utils/jwt.utils.js";
import { AppError } from "../../utils/AppError.js";

const register = async (data: FormRegister) => {
  validateRegister(data);
  const { username, email, password } = data;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) throw new AppError("Email already in use", 409);

  const saltRounds = Number(process.env.BCRYPT_SALT) || 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await UserModel.create({
    username,
    email,
    password: hashedPassword,
  });

  return {
    success: true,
    message: "User registered successfully",
    data: {
      userId: user._id,
      name: user.username,
      email: user.email,
      profile: user.avatar,
    },
  };
};

const login = async (data: FormLogin) => {
  validateLogin(data);
  const { email, password } = data;

  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid email or password", 409);

  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (!isPasswordValid) throw new AppError("Invalid email or password", 409);

  const tokens = createJwt(user);

  return {
    data: {
      success: true,
      message: "User logged in successfully",
      data: {
        userId: user._id,
        name: user.username,
        email: user.email,
        profile: user.avatar,
      },
    },
    tokens,
  };
};

export default { register, login };
