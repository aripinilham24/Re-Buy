import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";

export const fetchMe = async () => {
  try {
    const res = await api.get("/auth/me");
    useAuthStore.getState().setUser(res.data.data);
  } catch {
    useAuthStore.getState().setUser(null);
  }
};
