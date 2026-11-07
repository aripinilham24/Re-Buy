import type {
  AdminSettingsDto,
  AdminStatsDto,
  AdminUserDto,
  AdminUserListQuery,
  ApiSuccess,
  UpdateAdminUserInput,
  UpdateSettingsInput,
} from "@rebuy/contracts";
import api from "@/lib/axios";

export const getAdminStatsService = async () => {
  const response = await api.get<ApiSuccess<AdminStatsDto>>("/admin/stats");
  return response.data.data;
};

export const listAdminUsersService = async (params: AdminUserListQuery) => {
  const response = await api.get<ApiSuccess<AdminUserDto[]>>("/admin/users", {
    params,
  });
  return {
    items: response.data.data,
    meta: response.data.meta,
  };
};

export const updateAdminUserService = async (
  userId: string,
  data: UpdateAdminUserInput,
) => {
  const response = await api.patch<ApiSuccess<AdminUserDto>>(
    `/admin/users/${userId}`,
    data,
  );
  return response.data.data;
};

export const getAdminSettingsService = async () => {
  const response =
    await api.get<ApiSuccess<AdminSettingsDto>>("/admin/settings");
  return response.data.data;
};

export const updateAdminSettingsService = async (
  data: UpdateSettingsInput,
) => {
  const response = await api.patch<ApiSuccess<AdminSettingsDto>>(
    "/admin/settings",
    data,
  );
  return response.data.data;
};
