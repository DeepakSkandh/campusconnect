import { Outlet, ScrollRestoration } from "react-router";
import { env } from "@/config/env";
import { AppHeader } from "./app-header";
import { Breadcrumbs } from "./breadcrumbs";

/** Layout for every signed-in page: crimson header, breadcrumb strip, content. */
export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-card px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <AppHeader />
      <Breadcrumbs />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t bg-card py-3 text-center text-xs text-muted-foreground">
        CampusConnect {env.useMocks && "· Development mode: synthetic data"}
      </footer>
      <ScrollRestoration />
    </div>
  );
}
