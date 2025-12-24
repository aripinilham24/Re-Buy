"use client";

import { useState} from "react";
import Swal from "sweetalert2";
import api from "@/src/lib/axios";
import { LoginTypeProps } from "../auth.types";
import { loginService } from "../services/authServices";

export const useLogin = () => {
    const [loading, setLoading] = useState(false);

    const login = async (data:LoginTypeProps)=> {
        setLoading(true);
        try{
            const res = await loginService(data);
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Login berhasil!",
            });
            return res;
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Login gagal. Periksa kembali username dan password Anda.",
            });
        } finally {
            setLoading(false);
        }
    }
    return { login, loading };
}