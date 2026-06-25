import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/store/auth.store";

export const fetchMe = async () => {
  try {
    const res = await api.get("/auth/me");
    useAuthStore.getState().setUser(res.data.data);
  } catch {
    useAuthStore.getState().setUser(null);
  }
};
