import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/api-client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      // Retry network/5xx failures, never 4xx: a 403 or 404 won't fix itself.
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      // Never auto-retry writes; the user decides (idempotency keys make manual retries safe).
      retry: false,
    },
  },
});
