import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  /** Must match the id of the control passed as children. */
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Label + control + hint/error. Give the control
 * `aria-invalid={!!error}` and `aria-describedby={fieldDescriptionId(id)}`.
 */
export function FormField({ id, label, error, hint, required, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="-ml-1.5 text-primary" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p id={fieldDescriptionId(id)} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={fieldDescriptionId(id)} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const fieldDescriptionId = (id: string) => `${id}-description`;
