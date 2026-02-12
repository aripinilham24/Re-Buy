"use client";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { LoginTypeProps } from "../auth.types";
import Link from "next/link";

export default function Login() {
  const { login, loading } = useLogin();

  const [form, setForm] = useState<LoginTypeProps>({
    email: "",
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
    await login(form);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login Re:Buy</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <label htmlFor="email">Email</label>
            <input
              required
              value={form.email}
              onChange={handleChange}
              type="text"
              name="email"
              placeholder="email"
            />
          </div>
          <div className="input-container">
            <label htmlFor="password">Password</label>
            <input
              required
              value={form.password}
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="password"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="text-white flex justify-between mt-10">
          <Link href={"/register"}>Belum punya akun</Link>
          <Link href={"/forgot-password"}>Lupa Password</Link>
        </div>
      </div>
    </div>
  );
}
