import UserModel from "./user.model.js";

export const findUserById = (userId: string) => UserModel.findById(userId);

export const updateUserProfile = (
  userId: string,
  data: { username: string },
) =>
  UserModel.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });
