import userModel from "../user/user.model";
import bcrypt from "bcryptjs";
import generateToken from "../../utils/generaetToken";

const register = async (data) => {
  const { username, email, password } = data;

  const existing = await userModel.findOne({ email });
  if (existing) throw { status: 400, message: "Email sudah terdaftar" };

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: passwordHash,
  });

  const tokens = generateToken(user);

  return {
    status: "success",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    tokens,
  };
};

const login = async (data) => {
  const { email, password } = data;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) throw { status: 400, message: "Email atau password salah" };

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 400, message: "Email atau password salah" };

  const tokens = generateToken(user);

  return {
    status: "success",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    tokens,
  };
};

const services = { register, login };

export default services;
