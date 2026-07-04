import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<string, string> = {
  primary:
    "bg-[#14141C] text-[#FAFAF8] hover:bg-[#065F46] active:scale-[0.98]",
  secondary:
    "bg-[#ECEDF3] text-[#14141C] hover:bg-[#DEDFE8] active:scale-[0.98]",
  ghost:
    "bg-transparent text-[#14141C] hover:bg-[#ECEDF3] active:scale-[0.98]",
};

const sizes: Record<string, string> = {
  md: "h-11 px-6 text-[14px]",
  sm: "h-9 px-4 text-[13px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
