import { useContext } from "react";
import { AuthContext } from "./auth-context";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

/** For pages that are only rendered behind <RequireAuth>. */
export function useCurrentUser() {
  const { user } = useAuth();
  if (!user) throw new Error("useCurrentUser called without an authenticated user");
  return user;
}
