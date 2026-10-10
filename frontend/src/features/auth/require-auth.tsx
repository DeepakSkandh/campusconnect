import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { ShieldAlert } from "lucide-react";
import { LoadingState, StateMessage } from "@/components/common/query-states";
import type { Role } from "@/types/domain";
import { useAuth } from "./use-auth";

/** Sends anonymous visitors to /login and returns them afterwards. */
export function RequireAuth({ children }: { children?: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <LoadingState label="Checking your session…" className="min-h-screen" />;
  if (status === "anonymous") return <Navigate to="/login" replace state={{ from: location }} />;
  return children ?? <Outlet />;
}

/**
 * Hides pages from users without the required role.
 *
 * This is a usability guard, NOT security: every protected API call is
 * authorized again by the backend, which returns 403 if this check is bypassed.
 */
export function RequireRole({ roles, children }: { roles: Role[]; children?: ReactNode }) {
  const { hasRole } = useAuth();

  if (!hasRole(...roles)) {
    return (
      <StateMessage
        icon={ShieldAlert}
        title="You don't have access to this page"
        description="This area is limited to specific roles. If you think you should have access, contact your department administrator."
      />
    );
  }
  return children ?? <Outlet />;
}
