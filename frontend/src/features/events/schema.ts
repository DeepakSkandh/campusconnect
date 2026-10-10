import { z } from "zod";
import {
  EVENT_CATEGORY_LABELS,
  type CreateEventPayload,
  type EventCategory,
  type ResourceCategory,
} from "@/types/domain";

const eventCategories = Object.keys(EVENT_CATEGORY_LABELS) as [EventCategory, ...EventCategory[]];

/** Space types an organizer can ask for as a venue. */
export const VENUE_CATEGORIES = [
  "seminar_hall",
  "laboratory",
  "computer_lab",
  "classroom",
  "conference_room",
] as const satisfies readonly ResourceCategory[];

const wholeNumber = (min: number, max: number) =>
  z
    .number({ error: "Enter a number" })
    .int("Use a whole number")
    .min(min, `Must be at least ${min}`)
    .max(max, `Must be ${max} or less`);

/**
 * Client-side validation for the "create event" form. It gives fast feedback
 * only; the backend validates the same rules again (and returns 422 if not).
 */
export const eventDraftSchema = z
  .object({
    title: z.string().trim().min(5, "Title must be at least 5 characters").max(120, "Keep the title under 120 characters"),
    category: z.enum(eventCategories, { error: "Choose a category" }),
    description: z
      .string()
      .trim()
      .min(20, "Describe the event in at least 20 characters")
      .max(2000, "Keep the description under 2000 characters"),
    hostDepartmentId: z.string().min(1, "Choose the host department"),
    start: z.string().min(1, "Choose a start date and time"),
    end: z.string().min(1, "Choose an end date and time"),
    expectedAttendance: wholeNumber(1, 5000),
    venueCategory: z.union([z.enum(VENUE_CATEGORIES), z.literal("")]),
    equipment: z
      .array(
        z.object({
          name: z.string().trim().min(1, "Name the item"),
          quantity: wholeNumber(1, 500),
        }),
      )
      .max(20, "At most 20 equipment items"),
    volunteerRoles: z
      .array(
        z.object({
          title: z.string().trim().min(2, "Name the role"),
          skills: z.string().trim().min(1, "List at least one skill"),
          slots: wholeNumber(1, 50),
        }),
      )
      .max(10, "At most 10 volunteer roles"),
  })
  .refine((v) => new Date(v.start).getTime() > Date.now(), {
    message: "The event must start in the future",
    path: ["start"],
  })
  .refine((v) => new Date(v.end).getTime() > new Date(v.start).getTime(), {
    message: "End must be after the start",
    path: ["end"],
  });

export type EventDraftForm = z.infer<typeof eventDraftSchema>;

/** Form values → API payload. `datetime-local` values are read in the browser's time zone. */
export function toCreateEventPayload(values: EventDraftForm): CreateEventPayload {
  return {
    title: values.title,
    description: values.description,
    category: values.category,
    hostDepartmentId: values.hostDepartmentId,
    start: new Date(values.start).toISOString(),
    end: new Date(values.end).toISOString(),
    expectedAttendance: values.expectedAttendance,
    venueCategory: values.venueCategory || null,
    equipmentRequirements: values.equipment,
    volunteerRoles: values.volunteerRoles.map((role) => ({
      title: role.title,
      slots: role.slots,
      requiredSkills: [
        ...new Set(
          role.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        ),
      ],
    })),
  };
}
