"use client";
import { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { RegisterTypeProps } from "../auth.types";
import Link from "next/link";

export default function Register() {
  const [form, setForm] = useState<RegisterTypeProps>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { register, loading } = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await register(form);
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Register ReBuy</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <label htmlFor="username">Username</label>
            <input
              value={form.username}
              onChange={handleChange}
              type="text"
              name="username"
              required
              id="username"
            />
          </div>
          <div className="input-container">
            <label htmlFor="email">Email</label>
            <input
              value={form.email}
              onChange={handleChange}
              type="email"
              name="email"
              required
              id="email"
            />
          </div>
          <div className="input-container">
            <label htmlFor="password">Password</label>
            <input
              value={form.password}
              onChange={handleChange}
              type="password"
              name="password"
              required
              id="password"
            />
          </div>
          <div className="input-container">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              value={form.confirmPassword}
              onChange={handleChange}
              type="password"
              name="confirmPassword"
              required
              id="confirmPassword"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Register"}
          </button>
        </form>
        <div className="text-white mt-10 flex justify-center">
          <Link href={"/login"}>Sudah punya akun</Link>
        </div>
      </div>
    </div>
  );
}
