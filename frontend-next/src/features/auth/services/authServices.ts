import api from "@/src/lib/axios";
import { LoginTypeProps, RegisterTypeProps, AuthResponse } from "../auth.types";

export const loginService = async (data: LoginTypeProps): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data;
}

export const registerService = async (data: RegisterTypeProps): Promise<AuthResponse> => {
    const res = await api.post("/auth/registerv2", data);
    return res.data;
}