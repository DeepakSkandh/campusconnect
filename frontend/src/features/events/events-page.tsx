import { useState } from "react";
import { Link } from "react-router";
import { CalendarPlus, Search } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/query-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useAuth } from "@/features/auth/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { EVENT_CATEGORY_LABELS, type EventCategory } from "@/types/domain";
import { useEvents } from "./api";
import { EventCard } from "./event-card";

const categoryOptions = Object.entries(EVENT_CATEGORY_LABELS) as [EventCategory, string][];

export function EventsPage() {
  const { hasRole } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<EventCategory | "">("");
  const debouncedSearch = useDebouncedValue(search);
  const events = useEvents({ q: debouncedSearch.trim() || undefined, category: category || undefined });

  return (
    <>
      <PageHeader
        title="Campus events"
        description="Workshops, hackathons, lectures and activities across campus. Your own drafts are visible only to you."
        actions={
          hasRole("student", "organizer") && (
            <Button asChild>
              <Link to="/events/new">
                <CalendarPlus /> Create event
              </Link>
            </Button>
          )
        }
      />

      <div role="search" className="mb-6 grid gap-3 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-[1fr_240px]">
        <div className="space-y-1.5">
          <Label htmlFor="event-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="event-search"
              type="search"
              placeholder="Title, organizer or department"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="event-category">Category</Label>
          <NativeSelect
            id="event-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory | "")}
          >
            <option value="">All categories</option>
            {categoryOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {events.isPending ? (
        <LoadingState label="Loading events…" />
      ) : events.isError ? (
        <ErrorState error={events.error} onRetry={() => events.refetch()} />
      ) : events.data.length === 0 ? (
        <EmptyState title="No events found" description="Try another search, or propose your own event." />
      ) : (
        <div className="space-y-3">
          {events.data.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </>
  );
}
