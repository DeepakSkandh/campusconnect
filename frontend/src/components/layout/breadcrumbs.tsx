import { Link, useMatches } from "react-router";
import { ChevronRight } from "lucide-react";

/** Routes opt in by setting `handle: { crumb: "Label" }` in the router config. */
export interface RouteHandle {
  crumb?: string;
}

export function Breadcrumbs() {
  const crumbs = useMatches()
    .map((match) => ({ path: match.pathname, label: (match.handle as RouteHandle | undefined)?.crumb }))
    .filter((crumb): crumb is { path: string; label: string } => Boolean(crumb.label))
    // A route and its index child share a pathname; keep one crumb per path.
    .filter((crumb, index, all) => all.findIndex((c) => c.path === crumb.path) === index);

  return (
    <nav aria-label="Breadcrumb" className="border-b bg-card">
      <ol className="mx-auto flex h-9 max-w-7xl items-center gap-1 overflow-x-auto px-4 text-xs">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-1 whitespace-nowrap">
              {index > 0 && <ChevronRight className="size-3 shrink-0 text-muted-foreground" aria-hidden />}
              {isLast ? (
                <span aria-current="page" className="text-muted-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.path} className="text-primary hover:underline">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
