"use client"
import { useState } from "react";
import { RegisterTypeProps } from "../auth.types";
import { registerService } from "../services/authServices";
import Swal from "sweetalert2";

export const useRegister = () => {
    const [loading, setLoading] = useState(false);

    const register = async (data: RegisterTypeProps) => {
        setLoading(!loading);
        try {
            const res = await registerService(data);
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Registrasi berhasil!",
            });
            return res;
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Registrasi gagal. Silakan coba lagi.",
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return { register, loading };
}