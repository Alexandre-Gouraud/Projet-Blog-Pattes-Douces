import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Boutons (DESIGN.md §9.1) : <button> pour une action, ButtonLink (<a>) pour
 * une navigation, avec les memes styles. Cibles d'au moins 44 x 44 px ; dans
 * une rangee, les boutons passent a la ligne entiers, sans etre coupes.
 */
export type ButtonVariant = "primary" | "secondary" | "danger" | "danger-solid" | "icon";
export type ButtonSize = "md" | "lg";

const BASE =
  "inline-flex shrink-0 max-w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-semibold leading-tight no-underline";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary px-5 py-2 text-primary-ink shadow-sm hover:bg-primary-hover hover:text-white",
  secondary: "border-[1.5px] border-brand bg-surface px-5 py-2 text-ink hover:bg-tint hover:text-ink",
  danger: "border-[1.5px] border-danger bg-surface px-4 py-2 text-danger hover:bg-danger-bg hover:text-danger",
  "danger-solid": "bg-danger-solid px-[18px] py-2 text-white hover:text-white",
  icon: "size-11 bg-transparent p-0 text-ink hover:bg-surface",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11",
  lg: "min-h-12",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = "") {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize };

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
