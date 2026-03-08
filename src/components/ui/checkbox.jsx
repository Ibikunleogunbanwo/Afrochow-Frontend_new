"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer bg-white border-gray-400 data-[state=checked]:bg-orange-600 data-[state=checked]:text-white data-[state=checked]:border-orange-600 focus-visible:border-orange-500 focus-visible:ring-orange-500/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive size-5 shrink-0 rounded-md border-2 shadow-sm transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:border-orange-400 hover:shadow-md",
        className
      )}
      {...props}>
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none">
        <CheckIcon className="size-4 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox }
