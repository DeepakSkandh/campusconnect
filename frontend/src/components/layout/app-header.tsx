import { Link, NavLink, useNavigate } from "react-router";
import { Bell, LogOut } from "lucide-react";
import { MAIN_NAV } from "@/config/navigation";
import { useAuth, useCurrentUser } from "@/features/auth/use-auth";
import { useNotifications } from "@/features/notifications/api";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/types/domain";
import { BrandMark } from "./brand";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive ? "bg-white/20 text-white" : "text-white/85 hover:bg-white/10 hover:text-white",
  );
}

export function AppHeader() {
  const user = useCurrentUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const unread = notifications.data?.filter((n) => !n.read).length ?? 0;

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 rounded-md text-white">
          <BrandMark className="text-white" />
          <span className="text-lg font-semibold tracking-tight">CampusConnect</span>
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/notifications"
            className="relative flex size-9 items-center justify-center rounded-md text-white/90 hover:bg-white/10 hover:text-white"
            aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          >
            <Bell className="size-5" aria-hidden />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] leading-4 font-semibold text-white">
                {unread}
              </span>
            )}
          </Link>

          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-white/75">{user.roles.map((role) => ROLE_LABELS[role]).join(" · ")}</p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex size-9 items-center justify-center rounded-md text-white/90 hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Compact module navigation for small screens */}
      <nav aria-label="Main (mobile)" className="flex gap-1 overflow-x-auto bg-black/10 px-3 py-1.5 md:hidden">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"} className={navLinkClass}>
            <item.icon className="size-4" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
