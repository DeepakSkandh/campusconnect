import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { env } from "@/config/env";
import { apiClient, isApiError } from "@/lib/api-client";
import { demoAccounts } from "@/mocks/data";
import type { CurrentUser, Role } from "@/types/domain";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./auth-context";

/*
 * Two modes:
 * - Mock mode (VITE_USE_MOCKS=true): pick a synthetic demo account. The choice
 *   is kept in sessionStorage so a page refresh doesn't log you out.
 * - Real mode: the backend owns the session (httpOnly cookie). We only ask
 *   GET /auth/me who is signed in. No tokens are ever stored in JavaScript.
 */

const DEMO_USER_KEY = "campusconnect.demoUserId";

function readDemoUserId(): string | null {
  try {
    return window.sessionStorage.getItem(DEMO_USER_KEY);
  } catch {
    return null;
  }
}

function writeDemoUserId(id: string | null) {
  try {
    if (id) window.sessionStorage.setItem(DEMO_USER_KEY, id);
    else window.sessionStorage.removeItem(DEMO_USER_KEY);
  } catch {
    // Storage unavailable (private mode etc.): the demo session just won't survive a refresh.
  }
}

const currentUserQueryKey = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [demoUserId, setDemoUserId] = useState<string | null>(() => (env.useMocks ? readDemoUserId() : null));

  const meQuery = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async ({ signal }) => {
      try {
        return await apiClient.get<CurrentUser>("/auth/me", { signal });
      } catch (error) {
        if (isApiError(error) && error.isUnauthenticated) return null;
        throw error;
      }
    },
    enabled: !env.useMocks,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const user: CurrentUser | null = env.useMocks
    ? (demoAccounts.find((account) => account.user.id === demoUserId)?.user ?? null)
    : (meQuery.data ?? null);

  const status: AuthStatus = env.useMocks
    ? user
      ? "authenticated"
      : "anonymous"
    : meQuery.isPending
      ? "loading"
      : user
        ? "authenticated"
        : "anonymous";

  const hasRole = useCallback((...roles: Role[]) => !!user && roles.some((role) => user.roles.includes(role)), [user]);

  const signInAsDemo = useCallback(
    (userId: string) => {
      queryClient.clear();
      writeDemoUserId(userId);
      setDemoUserId(userId);
    },
    [queryClient],
  );

  const signIn = useCallback(() => {
    // The backend decides the flow (SSO redirect or its own login page).
    window.location.assign(`${env.apiBaseUrl}/auth/login`);
  }, []);

  const signOut = useCallback(async () => {
    if (env.useMocks) {
      writeDemoUserId(null);
      setDemoUserId(null);
    } else {
      await apiClient.post("/auth/logout");
    }
    // Drop every cached response so the next user never sees the previous user's data.
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, hasRole, signInAsDemo, signIn, signOut }),
    [user, status, hasRole, signInAsDemo, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
