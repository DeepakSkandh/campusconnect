import { useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Info, LoaderCircle, Plus, Trash2, TriangleAlert } from "lucide-react";
import { FormField, fieldDescriptionId } from "@/components/common/form-field";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useDepartments } from "@/features/resources/api";
import { isApiError } from "@/lib/api-client";
import { createId } from "@/lib/id";
import { formatRange } from "@/lib/format";
import { EVENT_CATEGORY_LABELS, RESOURCE_CATEGORY_LABELS, type CampusEvent, type EventCategory } from "@/types/domain";
import { useCreateEvent } from "./api";
import { VENUE_CATEGORIES, eventDraftSchema, toCreateEventPayload, type EventDraftForm } from "./schema";

const categoryOptions = Object.entries(EVENT_CATEGORY_LABELS) as [EventCategory, string][];

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

/** Accessibility props linking a control to its FormField hint/error. */
const describe = (id: string, error?: string) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": fieldDescriptionId(id),
});

export function CreateEventPage() {
  const departments = useDepartments();
  const createEvent = useCreateEvent();
  // One key per logical submission: retries of the same submit reuse it.
  const idempotencyKey = useRef(createId());

  const form = useForm<EventDraftForm>({
    resolver: zodResolver(eventDraftSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      hostDepartmentId: "",
      start: "",
      end: "",
      venueCategory: "",
      equipment: [],
      volunteerRoles: [],
    },
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;
  const equipment = useFieldArray({ control, name: "equipment" });
  const volunteerRoles = useFieldArray({ control, name: "volunteerRoles" });

  const onSubmit = handleSubmit((values) => {
    createEvent.mutate({ payload: toCreateEventPayload(values), idempotencyKey: idempotencyKey.current });
  });

  function startOver() {
    form.reset();
    createEvent.reset();
    idempotencyKey.current = createId();
  }

  if (createEvent.isSuccess) {
    return <DraftSaved event={createEvent.data} onCreateAnother={startOver} />;
  }

  const serverError = createEvent.error;

  return (
    <>
      <PageHeader
        title="Create an event"
        description="Describe what you want to run and what you need. It is saved as a draft; nothing is booked yet."
      />

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Section title="About the event" description="What it is and who is hosting it.">
          <FormField id="title" label="Event title" required error={errors.title?.message}>
            <Input {...describe("title", errors.title?.message)} {...register("title")} placeholder="e.g. Hands-on ML Workshop" />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="category" label="Category" required error={errors.category?.message}>
              <NativeSelect {...describe("category", errors.category?.message)} {...register("category")} defaultValue="">
                <option value="" disabled>
                  Choose a category
                </option>
                {categoryOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            </FormField>

            <FormField
              id="hostDepartmentId"
              label="Host department"
              required
              error={errors.hostDepartmentId?.message}
              hint={departments.isError ? "Couldn't load departments. Refresh to try again." : undefined}
            >
              <NativeSelect
                {...describe("hostDepartmentId", errors.hostDepartmentId?.message)}
                {...register("hostDepartmentId")}
                disabled={departments.isPending}
              >
                <option value="" disabled>
                  {departments.isPending ? "Loading…" : "Choose a department"}
                </option>
                {departments.data?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
          </div>

          <FormField
            id="description"
            label="Description"
            required
            error={errors.description?.message}
            hint="What will participants do or learn?"
          >
            <Textarea {...describe("description", errors.description?.message)} {...register("description")} rows={4} />
          </FormField>
        </Section>

        <Section title="When and how many" description="Times are in India Standard Time.">
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="start" label="Starts" required error={errors.start?.message}>
              <Input {...describe("start", errors.start?.message)} type="datetime-local" {...register("start")} />
            </FormField>
            <FormField id="end" label="Ends" required error={errors.end?.message}>
              <Input {...describe("end", errors.end?.message)} type="datetime-local" {...register("end")} />
            </FormField>
            <FormField id="expectedAttendance" label="Expected attendance" required error={errors.expectedAttendance?.message}>
              <Input
                {...describe("expectedAttendance", errors.expectedAttendance?.message)}
                type="number"
                inputMode="numeric"
                min={1}
                {...register("expectedAttendance", { valueAsNumber: true })}
              />
            </FormField>
          </div>
        </Section>

        <Section title="Venue and equipment" description="Used later to suggest suitable rooms and equipment.">
          <FormField
            id="venueCategory"
            label="Type of venue"
            error={errors.venueCategory?.message}
            hint="Capacity is matched against expected attendance."
          >
            <NativeSelect {...describe("venueCategory", errors.venueCategory?.message)} {...register("venueCategory")}>
              <option value="">No venue needed / not sure</option>
              {VENUE_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {RESOURCE_CATEGORY_LABELS[value]}
                </option>
              ))}
            </NativeSelect>
          </FormField>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Equipment needed</legend>
            {equipment.fields.length === 0 && (
              <p className="text-sm text-muted-foreground">No equipment added.</p>
            )}
            {equipment.fields.map((field, index) => {
              const nameError = errors.equipment?.[index]?.name?.message;
              const qtyError = errors.equipment?.[index]?.quantity?.message;
              return (
                <div key={field.id} className="grid items-start gap-3 rounded-md bg-muted/60 p-3 sm:grid-cols-[1fr_120px_auto]">
                  <FormField id={`equipment-${index}-name`} label="Item" error={nameError}>
                    <Input
                      {...describe(`equipment-${index}-name`, nameError)}
                      placeholder="e.g. Projector"
                      {...register(`equipment.${index}.name`)}
                    />
                  </FormField>
                  <FormField id={`equipment-${index}-quantity`} label="Quantity" error={qtyError}>
                    <Input
                      {...describe(`equipment-${index}-quantity`, qtyError)}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      {...register(`equipment.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </FormField>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:mt-6"
                    onClick={() => equipment.remove(index)}
                    aria-label={`Remove equipment item ${index + 1}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => equipment.append({ name: "", quantity: 1 })}>
              <Plus /> Add equipment
            </Button>
          </fieldset>
        </Section>

        <Section title="Volunteers" description="Roles you need filled, and the skills each role requires.">
          {volunteerRoles.fields.length === 0 && <p className="text-sm text-muted-foreground">No volunteer roles added.</p>}
          {volunteerRoles.fields.map((field, index) => {
            const titleError = errors.volunteerRoles?.[index]?.title?.message;
            const skillsError = errors.volunteerRoles?.[index]?.skills?.message;
            const slotsError = errors.volunteerRoles?.[index]?.slots?.message;
            return (
              <div key={field.id} className="grid items-start gap-3 rounded-md bg-muted/60 p-3 sm:grid-cols-[1fr_1.4fr_100px_auto]">
                <FormField id={`role-${index}-title`} label="Role" error={titleError}>
                  <Input {...describe(`role-${index}-title`, titleError)} placeholder="e.g. Lab assistant" {...register(`volunteerRoles.${index}.title`)} />
                </FormField>
                <FormField id={`role-${index}-skills`} label="Required skills" error={skillsError} hint="Comma-separated">
                  <Input
                    {...describe(`role-${index}-skills`, skillsError)}
                    placeholder="Python, Machine Learning"
                    {...register(`volunteerRoles.${index}.skills`)}
                  />
                </FormField>
                <FormField id={`role-${index}-slots`} label="People" error={slotsError}>
                  <Input
                    {...describe(`role-${index}-slots`, slotsError)}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    {...register(`volunteerRoles.${index}.slots`, { valueAsNumber: true })}
                  />
                </FormField>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:mt-6"
                  onClick={() => volunteerRoles.remove(index)}
                  aria-label={`Remove volunteer role ${index + 1}`}
                >
                  <Trash2 />
                </Button>
              </div>
            );
          })}
          <Button variant="outline" size="sm" onClick={() => volunteerRoles.append({ title: "", skills: "", slots: 1 })}>
            <Plus /> Add volunteer role
          </Button>
        </Section>

        {serverError && (
          <div role="alert" className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">
                {isApiError(serverError) && serverError.isConflict
                  ? "This conflicts with existing data."
                  : "The event couldn't be saved."}
              </p>
              <p>{isApiError(serverError) ? serverError.message : "Check your connection and try again."}</p>
              {isApiError(serverError) && Object.keys(serverError.fieldErrors).length > 0 && (
                <ul className="mt-1 list-disc pl-5">
                  {Object.entries(serverError.fieldErrors).map(([field, message]) => (
                    <li key={field}>
                      {field}: {message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <Card className="py-4">
          <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              Saving creates a draft. Booking requests are made separately after you review suggestions.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/events">Cancel</Link>
              </Button>
              <Button type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending && <LoaderCircle className="animate-spin" />}
                Save draft
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </>
  );
}

function DraftSaved({ event, onCreateAnother }: { event: CampusEvent; onCreateAnother: () => void }) {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="items-start">
        <div className="flex items-center gap-2 text-emerald-700">
          <CircleCheck className="size-5" aria-hidden />
          <span className="text-sm font-medium">Draft saved</span>
        </div>
        <CardTitle className="text-xl">{event.title}</CardTitle>
        <CardDescription>{formatRange(event.start, event.end)}</CardDescription>
        <StatusBadge kind="event" status={event.status} />
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="font-medium">What happens next</p>
        <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>CampusConnect suggests venues, equipment and volunteers that fit your requirements (Phase 3).</li>
          <li>You choose from the suggestions and submit booking requests.</li>
          <li>The owning departments approve them. Only then is a booking confirmed.</li>
        </ol>
        <p className="text-muted-foreground">Nothing has been reserved yet.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild>
          <Link to="/events">View events</Link>
        </Button>
        <Button variant="outline" onClick={onCreateAnother}>
          Create another
        </Button>
      </CardFooter>
    </Card>
  );
}
