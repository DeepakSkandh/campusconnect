import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalTileProps {
  to: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

/**
 * Dashboard shortcut tile: a white bar with a centred label and an angled
 * crimson block holding the icon. Whole tile is one link for accessibility.
 */
export function PortalTile({ to, label, icon: Icon, description, className }: PortalTileProps) {
  return (
    <Link
      to={to}
      title={description}
      className={cn(
        "group relative flex h-12 items-stretch overflow-hidden rounded-sm bg-card shadow-sm ring-1 ring-black/5 transition-all",
        "hover:-translate-y-0.5 hover:shadow-md focus-visible:-translate-y-0.5",
        className,
      )}
    >
      <span className="flex flex-1 items-center justify-center truncate px-3 text-sm font-medium tracking-wide text-primary uppercase">
        {label}
      </span>
      <span
        aria-hidden
        className="flex w-20 shrink-0 items-center justify-end bg-primary pr-5 text-primary-foreground transition-colors [clip-path:polygon(38%_0,100%_0,100%_100%,0_100%)] group-hover:bg-primary/90"
      >
        <Icon className="size-4" />
      </span>
      {description && <span className="sr-only">: {description}</span>}
    </Link>
  );
}
