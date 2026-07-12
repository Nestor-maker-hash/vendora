import { ButtonHTMLAttributes } from "react";
import { cn } from "@/src/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 text-white",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-900",
    danger:
      "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 font-medium transition disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
