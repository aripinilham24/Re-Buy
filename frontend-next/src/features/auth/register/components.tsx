"use client";
import { useState } from "react";
import { RegisterTypeProps } from "../auth.types";
import axios from "axios";
import Swal from "sweetalert2";

export default function Register() {
  const [form, setForm] = useState<RegisterTypeProps>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submit, setSubmit] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmit(!submit);

    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Lengkapi semua form yang ada.",
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Password tidak sesuai.",
      });
    }

    try {
      await axios.post("http://localhost:3000/auth/register", form);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan saat registrasi.",
      });
    } finally {
      setSubmit(!submit);
    }
  };
  return (
    <>
      <main>
        <div>
          <h1>Register Re:Buy</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Username</label>
              <input
                value={form.username}
                onChange={handleChange}
                type="text"
                name="username"
                id="username"
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                value={form.email}
                onChange={handleChange}
                type="email"
                name="email"
                id="email"
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                value={form.password}
                onChange={handleChange}
                type="password"
                name="password"
                id="password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                value={form.confirmPassword}
                onChange={handleChange}
                type="password"
                name="confirmPassword"
                id="confirmPassword"
              />
            </div>
            <button type="submit" disabled={submit}>
              {submit ? "Submitting..." : "Register"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
