import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      style={{
        color: 'black',
        backgroundColor: 'white',
        ...props.style
      }}
      className={cn(
        "file:text-foreground placeholder:!text-black selection:bg-primary selection:text-primary-foreground !bg-white !text-black !border-gray-300 h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::placeholder]:!text-black",
        "focus-visible:!border-orange-500 focus-visible:!ring-orange-500/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...props} />
  );
}

export { Input }
