import { InputHTMLAttributes } from "react";
import { cn } from "@/src/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function Input({
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition",
        "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
        className
      )}
      {...props}
    />
  );
}
