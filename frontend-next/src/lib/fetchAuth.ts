import { useAuthStore } from "@/store/auth.store";
import { fetchMeService } from "@/features/auth/services/authServices";

export const fetchMe = async () => {
  try {
    const user = await fetchMeService();
    useAuthStore.getState().setUser(user);
    return user;
  } catch {
    useAuthStore.getState().setUser(null);
    return null;
  }
};
