/*
 * In-browser stand-in for the FastAPI backend, used while VITE_USE_MOCKS=true.
 *
 * Each function mirrors a planned /api/v1 endpoint and returns the same shape
 * the backend will. Feature hooks are the only callers, so switching to the
 * real API never touches page components.
 *
 * This is NOT a source of truth: availability, conflicts and permissions are
 * decided by the backend and PostgreSQL. Nothing here should be copied there.
 */
import { ApiError } from "@/lib/api-client";
import { createId } from "@/lib/id";
import type {
  AppNotification,
  Booking,
  CampusEvent,
  CreateEventPayload,
  CurrentUser,
  Department,
  EventFilters,
  Paginated,
  Resource,
  ResourceFilters,
  SkillProfile,
  VolunteerOpportunity,
} from "@/types/domain";
import * as db from "./data";

const LATENCY_MS = 350;

function respond<T>(value: T): Promise<T> {
  // structuredClone so callers can never mutate the mock "database".
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), LATENCY_MS));
}

function fail(status: number, message: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new ApiError(status, message)), LATENCY_MS));
}

function paginate<T>(items: T[], page = 1, pageSize = 50): Paginated<T> {
  const startIndex = (page - 1) * pageSize;
  return { items: items.slice(startIndex, startIndex + pageSize), total: items.length, page, pageSize };
}

const matchesText = (query: string | undefined, ...fields: string[]) => {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  return fields.some((field) => field.toLowerCase().includes(needle));
};

function stripRequester(mockBooking: db.MockBooking): Booking {
  const { requestedById, ...booking } = mockBooking;
  void requestedById; // mock-only field; the real API never exposes it in this shape
  return booking;
}

// Idempotency emulation: the same key returns the same created event.
const createdEventsByKey = new Map<string, CampusEvent>();

export const mockApi = {
  listDepartments(): Promise<Department[]> {
    return respond(db.departments);
  },

  listResources(filters: ResourceFilters): Promise<Paginated<Resource>> {
    const items = db.resources.filter(
      (r) =>
        matchesText(filters.q, r.name, r.description, r.location, r.departmentName) &&
        (!filters.category || r.category === filters.category) &&
        (!filters.departmentId || r.departmentId === filters.departmentId),
    );
    return respond(paginate(items));
  },

  getResource(id: string): Promise<Resource> {
    const resource = db.resources.find((r) => r.id === id);
    return resource ? respond(resource) : fail(404, "Resource not found.");
  },

  listMyBookings(user: CurrentUser): Promise<Booking[]> {
    const mine = db.bookings
      .filter((b) => b.requestedById === user.id)
      .sort((a, b) => b.start.localeCompare(a.start))
      .map(stripRequester);
    return respond(mine);
  },

  /** Pending requests for resources owned by departments the user administers. */
  listApprovalQueue(user: CurrentUser): Promise<Booking[]> {
    if (!user.roles.includes("dept_admin") && !user.roles.includes("campus_admin")) {
      return fail(403, "You do not administer any department.");
    }
    const scope = user.roles.includes("campus_admin") ? null : new Set(user.adminDepartmentIds);
    const queue = db.bookings
      .filter((b) => b.status === "pending" && (!scope || scope.has(b.departmentId)))
      .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt))
      .map(stripRequester);
    return respond(queue);
  },

  listEvents(user: CurrentUser, filters: EventFilters): Promise<CampusEvent[]> {
    const visible = db.events.filter(
      (e) =>
        // Drafts are private to their organizer.
        (e.status !== "draft" || e.organizerId === user.id) &&
        e.status !== "cancelled" &&
        (!filters.category || e.category === filters.category) &&
        matchesText(filters.q, e.title, e.description, e.organizerName, e.hostDepartmentName),
    );
    return respond([...visible].sort((a, b) => a.start.localeCompare(b.start)));
  },

  createEvent(user: CurrentUser, payload: CreateEventPayload, idempotencyKey: string): Promise<CampusEvent> {
    const existing = createdEventsByKey.get(idempotencyKey);
    if (existing) return respond(existing);

    const host = db.departments.find((d) => d.id === payload.hostDepartmentId);
    if (!host) return fail(422, "Unknown host department.");

    const created: CampusEvent = {
      id: `e-${createId().slice(0, 8)}`,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      organizerId: user.id,
      organizerName: user.fullName,
      hostDepartmentId: host.id,
      hostDepartmentName: host.name,
      start: payload.start,
      end: payload.end,
      expectedAttendance: payload.expectedAttendance,
      status: "draft",
      openVolunteerSlots: payload.volunteerRoles.reduce((sum, role) => sum + role.slots, 0),
      createdAt: new Date().toISOString(),
    };
    db.events.push(created);
    createdEventsByKey.set(idempotencyKey, created);
    return respond(created);
  },

  getSkillProfile(user: CurrentUser): Promise<SkillProfile> {
    return respond(db.skillProfiles[user.id] ?? { skills: [], interests: [], openToVolunteer: false });
  },

  listVolunteerOpportunities(): Promise<VolunteerOpportunity[]> {
    return respond([...db.volunteerOpportunities].sort((a, b) => a.eventStart.localeCompare(b.eventStart)));
  },

  listNotifications(): Promise<AppNotification[]> {
    return respond([...db.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },
};
