import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-primary text-on-solid hover:bg-primary-hover",
  quiet: "border border-line bg-surface text-ink hover:bg-sunken",
  danger: "bg-danger text-on-solid hover:bg-danger-hover",
  ghost: "text-ink hover:bg-sunken",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
