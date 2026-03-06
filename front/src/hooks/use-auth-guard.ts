import { useRouter } from "next/router";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

export function useAuthGuard() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      void router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  return { hasHydrated, isAuthenticated };
}
