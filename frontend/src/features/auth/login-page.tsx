import { useState } from "react";
import { Navigate, useLocation, useNavigate, type Location } from "react-router";
import { ChevronRight, FlaskConical } from "lucide-react";
import { env } from "@/config/env";
import { demoAccounts } from "@/mocks/data";
import { ROLE_LABELS } from "@/types/domain";
import { useAuth } from "./use-auth";

function Wordmark() {
  return (
    <div className="flex items-end justify-center select-none" aria-label="CampusConnect">
      <span className="relative z-10 -mr-3 mb-6 font-serif text-4xl font-semibold text-gold italic sm:-mr-4 sm:text-5xl">
        Campus
      </span>
      <span className="-skew-x-12 rounded-md bg-primary px-6 py-2 shadow-md sm:px-8 sm:py-3">
        <span className="block skew-x-12 text-4xl font-semibold tracking-wide text-white sm:text-6xl">CONNECT</span>
      </span>
    </div>
  );
}

export function LoginPage() {
  const { status, signIn, signInAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";
  if (status === "authenticated") return <Navigate to={from} replace />;

  function handleLoginClick() {
    if (env.useMocks) setShowDemoAccounts(true);
    else signIn();
  }

  function chooseDemoAccount(userId: string) {
    signInAsDemo(userId);
    navigate(from, { replace: true });
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{
        backgroundColor: "#f1f1f3",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--primary) 12%, transparent) 1px, transparent 0)",
        backgroundSize: "22px 22px",
      }}
    >
      <h1 className="sr-only">Sign in to CampusConnect</h1>
      <Wordmark />
      <p className="mt-5 text-center text-sm tracking-[0.18em] text-foreground/80 uppercase sm:text-lg">
        Your window to campus resources, events &amp; people
      </p>
      <hr className="my-8 w-full max-w-md border-foreground/30" />

      <button
        type="button"
        onClick={handleLoginClick}
        className="group flex items-center gap-3 rounded-full px-4 py-1 text-5xl font-medium text-primary transition-transform hover:scale-[1.02] sm:text-6xl"
      >
        LOGIN
        <span className="flex size-12 items-center justify-center rounded-full bg-gold text-white shadow-md transition-transform group-hover:translate-x-1 sm:size-14">
          <ChevronRight className="size-7" aria-hidden />
        </span>
      </button>

      {env.useMocks && showDemoAccounts && (
        <section aria-labelledby="demo-heading" className="mt-10 w-full max-w-2xl">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <FlaskConical className="size-4 text-gold" aria-hidden />
            <h2 id="demo-heading">Development sign-in: choose a synthetic account</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {demoAccounts.map(({ user, summary }) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => chooseDemoAccount(user.id)}
                  className="w-full rounded-lg border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-xs font-medium text-primary">
                    {user.roles.map((role) => ROLE_LABELS[role]).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{summary}</p>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Replaced by institutional sign-in when the backend is connected (VITE_USE_MOCKS=false).
          </p>
        </section>
      )}
    </main>
  );
}
