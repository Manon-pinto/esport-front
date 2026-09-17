import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        gradient:
          "btn-shine bg-gradient-to-br from-[#7C8CF8] via-[#7B5CE8] to-[#764BA2] text-white " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_20px_rgba(102,126,234,0.5)] " +
          "hover:brightness-110 hover:-translate-y-0.5 " +
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_28px_rgba(102,126,234,0.65)] " +
          "active:translate-y-0 active:brightness-95",
        outline:
          "bg-[rgba(102,126,234,0.1)] border-[1.5px] border-[rgba(102,126,234,0.45)] text-slate-200 " +
          "hover:bg-[rgba(102,126,234,0.2)] hover:border-[#7C8CF8] hover:text-white hover:-translate-y-0.5 " +
          "active:translate-y-0",
        ghost:
          "bg-[rgba(102,126,234,0.12)] border border-[rgba(102,126,234,0.3)] text-slate-300 font-semibold " +
          "hover:bg-[rgba(102,126,234,0.25)] hover:text-white hover:border-[#7C8CF8]",
        quiet:
          "bg-transparent border border-[rgba(102,126,234,0.3)] text-slate-400 font-semibold " +
          "hover:bg-[rgba(102,126,234,0.1)] hover:text-white hover:border-[rgba(102,126,234,0.5)]",
        destructive:
          "bg-[rgba(239,68,68,0.12)] border-[1.5px] border-[rgba(239,68,68,0.4)] text-red-400 " +
          "shadow-[0_4px_14px_rgba(239,68,68,0.15)] " +
          "hover:bg-[rgba(239,68,68,0.22)] hover:text-red-300 hover:border-red-400 hover:-translate-y-0.5",
      },
      size: {
        sm: "text-xs px-3 py-1.5 rounded-md",
        default: "text-sm px-4 py-2 rounded-lg",
        lg: "text-base px-6 py-3 rounded-lg",
        chip: "text-sm px-3.5 py-1.5 rounded-lg",
        pill: "text-sm px-5 py-2 rounded-full",
        "pill-lg": "text-lg px-7 py-3 rounded-full",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        active: true,
        class:
          "bg-[rgba(102,126,234,0.18)] border-[#667EEA] text-white shadow-[0_0_12px_rgba(102,126,234,0.2)]",
      },
      {
        variant: "ghost",
        active: true,
        class:
          "bg-[rgba(102,126,234,0.2)] border-[#667EEA] text-white shadow-[0_0_0_2px_rgba(102,126,234,0.25)]",
      },
    ],
    defaultVariants: {
      variant: "gradient",
      size: "default",
      active: false,
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, active }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
