import type { AuthUser } from "@rebuy/contracts";
import type { UserDocument } from "../user/user.model.js";

export const toAuthUser = (user: UserDocument): AuthUser => ({
  userId: user._id.toString(),
  username: user.username,
  email: user.email,
  role: user.role ?? "user",
  profile: user.avatar ?? "profile.png",
  emailVerified: Boolean(user.emailVerifiedAt),
  createdAt: new Date(user.createdAt).toISOString(),
});
