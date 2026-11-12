import { cn } from "@/lib/utils";

const AVATAR_TINTS = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
];

/**
 * Des tailles nommées plutôt qu'un ratio unique : dans la maquette le rapport
 * police/boîte n'est pas constant (0,432 à 22px, 0,383 à 30px, 0,350 à 40px),
 * contrairement à celui de `SpaceTile` où un seul `--s` suffit.
 */
const AVATAR_SIZES = {
  xs: "size-[22px] text-[9.5px]",
  sm: "size-[30px] text-[11.5px]",
  md: "size-[40px] text-[14px]",
} as const;

export type AvatarSize = keyof typeof AVATAR_SIZES;

/** Teinte stable pour un pseudo donné : la même au rendu serveur et client. */
export const tintFor = (username: string) => {
  const sum = [...username].reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );

  return AVATAR_TINTS[sum % AVATAR_TINTS.length];
};

export const Avatar = ({
  username,
  size,
  className,
}: {
  username: string;
  size: AvatarSize;
  className?: string;
}) => (
  <span
    aria-hidden
    className={cn(
      "grid flex-none place-items-center rounded-full font-semibold text-primary-foreground",
      AVATAR_SIZES[size],
      tintFor(username),
      className,
    )}
  >
    {username.trim().charAt(0).toUpperCase()}
  </span>
);
