import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldBase } from "./field-styles";

/**
 * Styled native <select>. Native selects are accessible and behave well on
 * mobile. For a custom dropdown later, add shadcn's `select` component.
 */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return <select data-slot="native-select" className={cn(fieldBase, "h-9 py-1 pr-8", className)} {...props} />;
}

export { NativeSelect };
