import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { env } from "@/config/env";
import { apiClient } from "@/lib/api-client";
import { mockApi } from "@/mocks/mock-api";
import type { Department, Paginated, Resource, ResourceFilters } from "@/types/domain";

export const resourceKeys = {
  all: ["resources"] as const,
  list: (filters: ResourceFilters) => [...resourceKeys.all, "list", filters] as const,
  detail: (id: string) => [...resourceKeys.all, "detail", id] as const,
};

export const departmentKeys = {
  all: ["departments"] as const,
};

export function useResources(filters: ResourceFilters) {
  return useQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: ({ signal }) =>
      env.useMocks
        ? mockApi.listResources(filters)
        : apiClient.get<Paginated<Resource>>("/resources", {
            signal,
            params: { q: filters.q, category: filters.category, department_id: filters.departmentId },
          }),
    // Keep showing the previous results while a new search loads.
    placeholderData: keepPreviousData,
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: ({ signal }) =>
      env.useMocks ? mockApi.getResource(id) : apiClient.get<Resource>(`/resources/${id}`, { signal }),
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.all,
    queryFn: ({ signal }) =>
      env.useMocks ? mockApi.listDepartments() : apiClient.get<Department[]>("/departments", { signal }),
    staleTime: 10 * 60_000,
  });
}
