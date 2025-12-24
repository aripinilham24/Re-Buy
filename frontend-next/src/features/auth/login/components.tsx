"use client";
import { useState } from "react";
import { LoginTypeProps } from "../auth.types";
import Swal from "sweetalert2";
import axios from "axios";

export default function Login() {
  const api = process.env.NEXT_PUBLIC_API_BASE_URL;
  console.log("API URL:", api);
  const [submitEvent, setSubmitEvent] = useState(false);
  const [form, setForm] = useState<LoginTypeProps>({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitEvent(!submitEvent);

    if (!form.username || !form.password) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Lengkapi semua form yang ada.",
      });
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/login",
        form
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Login berhasil!",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Login gagal. Periksa kembali username dan password Anda.",
      });
    } finally {
      setSubmitEvent(!submitEvent);
    }
  };
  return (
    <>
      <main className="w-full h-screen bg-gray-800 flex flex-col justify-center items-center">
        <div className="bg-gray-100 rounded shadow-lg p-5 w-lg">
          <h1 className="text-center text-3xl font-semibold">Login Re:Buy</h1>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center items-center gap-5 mt-10"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="username">Username</label>
              <input
                value={form.username}
                onChange={handleChange}
                type="text"
                name="username"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password">Password</label>
              <input
                value={form.password}
                onChange={handleChange}
                type="password"
                name="password"
              />
            </div>
            <button
              type="submit"
              className="mx-auto bg-blue-500 text-white rounded p-3"
              disabled={submitEvent}
            >
              {submitEvent ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
