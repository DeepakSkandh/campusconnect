/*
 * Frontend mirror of the backend domain model.
 *
 * These types must stay in sync with the FastAPI Pydantic schemas. Once the
 * backend exists, generate them from its OpenAPI document instead of editing
 * by hand (e.g. `npx openapi-typescript http://localhost:8000/openapi.json`).
 *
 * All timestamps are ISO 8601 strings in UTC.
 */

// ── Identity & organization ────────────────────────────────────────────────

export type Role = "student" | "organizer" | "dept_admin" | "campus_admin";

export const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  organizer: "Event Organizer",
  dept_admin: "Department Admin",
  campus_admin: "Campus Admin",
};

export interface Department {
  id: string;
  code: string;
  name: string;
}

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  /** Institutional roll number for students; null for staff. */
  rollNumber: string | null;
  departmentId: string;
  roles: Role[];
  /** Departments this user administers. Authorization is still enforced by the backend. */
  adminDepartmentIds: string[];
}

// ── Resources ──────────────────────────────────────────────────────────────

export type ResourceCategory =
  | "laboratory"
  | "computer_lab"
  | "classroom"
  | "seminar_hall"
  | "conference_room"
  | "presentation_equipment"
  | "computing_equipment"
  | "robotics_electronics"
  | "fabrication"
  | "other";

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  laboratory: "Laboratory",
  computer_lab: "Computer lab",
  classroom: "Classroom",
  seminar_hall: "Seminar hall",
  conference_room: "Conference room",
  presentation_equipment: "Presentation equipment",
  computing_equipment: "Computers & workstations",
  robotics_electronics: "Robotics & electronics",
  fabrication: "3D printing & fabrication",
  other: "Other",
};

export type ResourceStatus = "active" | "inactive" | "under_maintenance";

/**
 * How concurrent bookings are counted.
 * - exclusive: one active booking per time range (rooms, labs)
 * - pooled: N identical units; bookings consume quantity (kits, projectors)
 */
export type CapacityModel = "exclusive" | "pooled";

export interface OperatingHours {
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: number;
  /** Local institution time, "HH:mm" */
  opens: string;
  closes: string;
}

export interface EquipmentItem {
  name: string;
  quantity: number;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  category: ResourceCategory;
  departmentId: string;
  departmentName: string;
  location: string;
  /** Seating / occupancy for spaces; null for equipment. */
  capacity: number | null;
  capacityModel: CapacityModel;
  /** Number of identical units for pooled resources. */
  unitCount: number | null;
  status: ResourceStatus;
  requiresApproval: boolean;
  /** Human-readable eligibility summary computed by the backend policy. */
  eligibility: string;
  equipment: EquipmentItem[];
  operatingHours: OperatingHours[];
}

export interface ResourceFilters {
  q?: string;
  category?: ResourceCategory;
  departmentId?: string;
}

// ── Bookings ───────────────────────────────────────────────────────────────

/** A booking is only confirmed when status === "approved". */
export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled" | "expired";

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  departmentId: string;
  departmentName: string;
  eventId: string | null;
  eventTitle: string | null;
  requestedByName: string;
  purpose: string;
  start: string;
  end: string;
  /** Units requested for pooled resources; 1 for exclusive ones. */
  quantity: number;
  status: BookingStatus;
  requestedAt: string;
  /** When an unapproved pending request stops holding its slot (if the policy holds slots). */
  expiresAt: string | null;
}

// ── Events ─────────────────────────────────────────────────────────────────

export type EventStatus =
  | "draft"
  | "submitted"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

export type EventCategory =
  | "hackathon"
  | "workshop"
  | "seminar"
  | "conference"
  | "competition"
  | "cultural"
  | "club"
  | "research"
  | "other";

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  hackathon: "Hackathon",
  workshop: "Technical workshop",
  seminar: "Seminar / guest lecture",
  conference: "Conference",
  competition: "Competition",
  cultural: "Cultural activity",
  club: "Student club event",
  research: "Research & innovation",
  other: "Other",
};

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizerId: string;
  organizerName: string;
  hostDepartmentId: string;
  hostDepartmentName: string;
  start: string;
  end: string;
  expectedAttendance: number;
  status: EventStatus;
  openVolunteerSlots: number;
  createdAt: string;
}

export interface EventFilters {
  q?: string;
  category?: EventCategory;
}

/** Payload for POST /events. The backend always creates events in "draft". */
export interface CreateEventPayload {
  title: string;
  description: string;
  category: EventCategory;
  hostDepartmentId: string;
  start: string;
  end: string;
  expectedAttendance: number;
  venueCategory: ResourceCategory | null;
  equipmentRequirements: EquipmentItem[];
  volunteerRoles: {
    title: string;
    requiredSkills: string[];
    slots: number;
  }[];
}

// ── Skills & volunteering ──────────────────────────────────────────────────

export type Proficiency = "beginner" | "intermediate" | "advanced";

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserSkill {
  skill: Skill;
  proficiency: Proficiency;
}

export interface SkillProfile {
  skills: UserSkill[];
  interests: string[];
  openToVolunteer: boolean;
}

export interface VolunteerOpportunity {
  id: string;
  eventId: string;
  eventTitle: string;
  eventStart: string;
  roleTitle: string;
  requiredSkills: string[];
  slotsTotal: number;
  slotsFilled: number;
}

export type VolunteerApplicationStatus =
  | "applied"
  | "invited"
  | "accepted"
  | "declined"
  | "selected"
  | "rejected"
  | "withdrawn";

// ── Platform ───────────────────────────────────────────────────────────────

export type NotificationKind = "booking" | "event" | "volunteer" | "system";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** In-app route to open, if any. */
  link: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
