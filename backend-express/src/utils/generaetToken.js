import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function generateToken(user) {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.access_token, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.refresh_token, {
    expiresIn: "15m",
  });

  return { accessToken, refreshToken };
}

export default generateToken;