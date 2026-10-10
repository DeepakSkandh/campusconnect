import { createContext } from "react";
import type { CurrentUser, Role } from "@/types/domain";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface AuthContextValue {
  user: CurrentUser | null;
  status: AuthStatus;
  /** True if the user holds at least one of the given roles. UI hint only; the backend authorizes. */
  hasRole: (...roles: Role[]) => boolean;
  /** Development only: sign in as one of the synthetic demo accounts. */
  signInAsDemo: (userId: string) => void;
  /** Real sign-in: hands off to the backend (institutional SSO or local login). */
  signIn: () => void;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
