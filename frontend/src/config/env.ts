/**
 * Typed access to build-time environment variables (see .env.example).
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  /** When true, feature hooks read from src/mocks instead of the FastAPI backend. */
  useMocks: (import.meta.env.VITE_USE_MOCKS ?? "true") === "true",
  /** Institution time zone used for displaying dates. Storage is always UTC. */
  timeZone: "Asia/Kolkata",
} as const;
