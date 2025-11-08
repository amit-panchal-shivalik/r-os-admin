import * as React from "react"
import { cn } from "@/lib/utils"

interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string
  error?: string
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputId = id || `floating-input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="relative">
        {/* Input Field with peer class */}
        <input
          id={inputId}
          type={type}
          className={cn(
            "peer block w-full h-12 rounded-lg border focus-visible:border-design-primary focus:border-design-primary bg-background px-3 py-3 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-transparent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
            error ? "border-red-500 focus-visible:ring-red-500" : "border-input",
            className
          )}
          ref={ref}
          placeholder=" "
          {...props}
        />

        {/* Floating Label using peer selector */}
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-3 transition-all duration-300 ease-out pointer-events-none font-medium",
            "peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground",
            "peer-focus:scale-75 peer-focus:-translate-y-2 peer-focus:top-0 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-background peer-focus:px-1",
            "scale-75 -translate-y-2 top-0 text-xs text-primary bg-background px-1"
          )}
        >
          {label}
        </label>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

FloatingInput.displayName = "FloatingInput"

export { FloatingInput }
