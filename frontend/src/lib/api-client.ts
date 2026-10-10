import { env } from "@/config/env";

/**
 * Error raised for any non-2xx response from the backend.
 *
 * FastAPI returns `{ "detail": "..." }` for HTTPException and
 * `{ "detail": [{ "loc": [...], "msg": "..." }] }` for 422 validation errors.
 * Both shapes are normalised here so components never parse raw responses.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Field-level validation messages keyed by field name (422 responses). */
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isUnauthenticated() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  /** Booking / allocation conflict: the slot or capacity was taken. */
  get isConflict() {
    return this.status === 409;
  }
  get isValidation() {
    return this.status === 422;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: QueryParams;
  signal?: AbortSignal;
  /**
   * Sent as the Idempotency-Key header on mutating requests so that a retried
   * or double-clicked submission cannot create a duplicate booking or event.
   */
  idempotencyKey?: string;
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = `${env.apiBaseUrl}${path}`;
  if (!params) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `${url}?${query}` : url;
}

async function parseError(response: Response): Promise<ApiError> {
  let message = response.statusText || "Request failed";
  const fieldErrors: Record<string, string> = {};
  try {
    const payload: unknown = await response.json();
    const detail = (payload as { detail?: unknown })?.detail;
    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = "Some fields are invalid.";
      for (const item of detail as { loc?: (string | number)[]; msg?: string }[]) {
        const field = item.loc?.[item.loc.length - 1];
        if (field !== undefined && item.msg) fieldErrors[String(field)] = item.msg;
      }
    }
  } catch {
    // Non-JSON error body; keep the status text.
  }
  return new ApiError(response.status, message, fieldErrors);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, signal, idempotencyKey } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    // Session cookie (httpOnly) is managed by the backend; never stored in JS.
    credentials: "include",
  });

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
