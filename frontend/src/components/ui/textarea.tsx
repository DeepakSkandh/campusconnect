import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldBase } from "./field-styles";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(fieldBase, "min-h-24 py-2", className)} {...props} />;
}

export { Textarea };
