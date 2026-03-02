import api from "@/src/lib/axios.js";
import { useAuthStore } from "@/src/store/auth.store.js";

export const fetchMe = async () => {
  try {
    const res = await api.get("/auth/me");
    useAuthStore.getState().setUser(res.data.user);
  } catch {
    useAuthStore.getState().setUser(null);
  }
};
