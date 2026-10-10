import { cn } from "@/lib/utils";

/** CampusConnect logo mark (also used as the favicon). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path
        d="M21.5 11.2a7 7 0 1 0 0 9.6"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="22.5" cy="16" r="2.4" fill="var(--gold)" />
    </svg>
  );
}
