import type { SVGProps } from "react";

/**
 * Icones au trait (DESIGN.md §7), reprises du prototype : toujours
 * decoratives (aria-hidden), en currentColor pour suivre le theme et les
 * etats. Le sens est porte par un texte visible ou masque a cote.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, strokeWidth = 1.75, children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </Icon>
);

export const UserIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </Icon>
);

export const DocumentIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 3h7l5 5v13H7z" />
    <path d="M14 3v5h5" />
  </Icon>
);

export const BookmarkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </Icon>
);

export const ChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 20V11M11 20V5M17 20v-6M3 20h18" />
  </Icon>
);

export const MoonIcon = (p: IconProps) => (
  <Icon strokeWidth={1.9} {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Icon>
);

export const SunIcon = (p: IconProps) => (
  <Icon strokeWidth={1.9} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);

export const BurgerIcon = (p: IconProps) => (
  <Icon size={24} strokeWidth={2} {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon size={24} strokeWidth={2} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const ChevronIcon = (p: IconProps) => (
  <Icon size={16} strokeWidth={2} {...p}>
    <path d="m6 15 6-6 6 6" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon size={18} strokeWidth={2.2} {...p}>
    <path d="M5 12l5 5L20 7" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </Icon>
);

export const EyeIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const ThumbUpIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </Icon>
);

export const ThumbDownIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
  </Icon>
);

export const CommentIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
  </Icon>
);

/** Fleche de retour : inversee en RTL (DESIGN.md §11). Remplace l'emoji 🔙. */
export const BackArrowIcon = ({ className = "", ...p }: IconProps) => (
  <Icon size={18} strokeWidth={2} className={`rtl:-scale-x-100 ${className}`} {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Icon>
);

export const AlertIcon = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.01" />
  </Icon>
);

/** Traduction (« Traduire en … »). */
export const TranslateIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </Icon>
);
