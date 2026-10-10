import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/query-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { RESOURCE_CATEGORY_LABELS, type ResourceCategory } from "@/types/domain";
import { useDepartments, useResources } from "./api";
import { ResourceCard } from "./resource-card";

const categoryOptions = Object.entries(RESOURCE_CATEGORY_LABELS) as [ResourceCategory, string][];

export function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ResourceCategory | "">("");
  const [departmentId, setDepartmentId] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const departments = useDepartments();
  const resources = useResources({
    q: debouncedSearch.trim() || undefined,
    category: category || undefined,
    departmentId: departmentId || undefined,
  });

  const hasFilters = Boolean(search || category || departmentId);
  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setDepartmentId("");
  };

  return (
    <>
      <PageHeader
        title="Campus resources"
        description="Labs, rooms and equipment across all departments. Availability shown on each resource comes from the booking system."
      />

      <div
        role="search"
        className="mb-6 grid gap-3 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-[1fr_200px_220px]"
      >
        <div className="space-y-1.5">
          <Label htmlFor="resource-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="resource-search"
              type="search"
              placeholder="Name, location or department"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resource-category">Category</Label>
          <NativeSelect
            id="resource-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ResourceCategory | "")}
          >
            <option value="">All categories</option>
            {categoryOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resource-department">Department</Label>
          <NativeSelect id="resource-department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">All departments</option>
            {departments.data?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {resources.isPending ? (
        <LoadingState label="Loading resources…" />
      ) : resources.isError ? (
        <ErrorState error={resources.error} onRetry={() => resources.refetch()} />
      ) : resources.data.items.length === 0 ? (
        <EmptyState
          title="No resources match"
          description="Try a different search or clear the filters."
          action={
            hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
            {resources.data.total} {resources.data.total === 1 ? "resource" : "resources"}
            {resources.isFetching && " · updating…"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.data.items.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
