"use client";

import { useEffect } from "react";
import { fetchMe } from "@/src/lib/fetchAuth";
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetchMe();
  }, []);

  return children;
}
