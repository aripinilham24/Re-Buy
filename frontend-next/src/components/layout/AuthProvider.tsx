"use client";

import { useEffect } from "react";
import { fetchMe } from "@/src/lib/fetchAuth.js";
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetchMe();
  }, []);

  return children;
}
