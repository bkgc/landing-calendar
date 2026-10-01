"use client";

import { useAuth } from "@/lib/hooks/useAuth";

export function useBusiness() {
  const { business, loading } = useAuth();
  return { business, loading };
}
