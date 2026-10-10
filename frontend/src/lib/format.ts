import { env } from "@/config/env";

/*
 * The backend stores and returns timezone-aware UTC timestamps (ISO 8601).
 * All display formatting happens here, in the institution's time zone.
 */

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: env.timeZone,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: env.timeZone,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: env.timeZone,
  hour: "numeric",
  minute: "2-digit",
});

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: env.timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** "Fri, 17 Oct 2026 · 10:00 am – 1:00 pm", or both full timestamps if the range spans days. */
export function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (dayKeyFormatter.format(start) === dayKeyFormatter.format(end)) {
    return `${dateFormatter.format(start)} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
  }
  return `${dateTimeFormatter.format(start)} – ${dateTimeFormatter.format(end)}`;
}

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelative(iso: string, now: Date = new Date()): string {
  const diffSeconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return relativeFormatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return "just now";
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const dayPartFormatter = new Intl.DateTimeFormat("en-IN", { timeZone: env.timeZone, day: "numeric" });
const monthPartFormatter = new Intl.DateTimeFormat("en-IN", { timeZone: env.timeZone, month: "short" });

/** { day: "17", month: "Oct" } for calendar-style date blocks. */
export function dateBlock(iso: string): { day: string; month: string } {
  const date = new Date(iso);
  return { day: dayPartFormatter.format(date), month: monthPartFormatter.format(date) };
}
