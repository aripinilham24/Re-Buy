import api from "@/src/lib/axios";
import { useAuthStore } from "@/src/store/auth.store";

export const fetchMe = async () => {
  try {
    const res = await api.get("/auth/me");
    useAuthStore.getState().setUser(res.data.user);
    console.log(res)
  } catch (err) {
    useAuthStore.getState().setUser(null);
    console.log(err)
  }
};
