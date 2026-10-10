import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldBase } from "./field-styles";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn(fieldBase, "h-9 py-1", className)} {...props} />;
}

export { Input };
