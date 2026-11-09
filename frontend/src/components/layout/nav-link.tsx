"use client";

import { Suspense } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  label: string;
  /** Le visuel de tête : une icône Lucide, ou la pastille d'un espace. */
  children: ReactNode;
};

/**
 * Le lien lui-même, sans aucun accès à l'URL : il reçoit son état.
 *
 * La teinte active ne touche que l'enfant *direct* (`>svg`) : l'icône d'un lien
 * ordinaire la prend, celle nichée dans une pastille d'espace garde la couleur
 * que lui donne la pastille.
 */
const NavLinkShell = ({
  href,
  label,
  active,
  children,
}: NavLinkProps & { active: boolean }) => (
  <Link
    href={href}
    aria-current={active ? "page" : undefined}
    className={cn(
      "flex items-center gap-[11px] rounded-sm px-2.5 py-[7px] text-sm font-medium text-foreground-secondary hover:bg-accent hover:text-foreground",
      "[&[aria-current=page]>svg]:text-primary-text",
      active && "bg-accent-strong font-semibold text-foreground",
    )}
  >
    {children}
    {label}
  </Link>
);

/**
 * Comparaison exacte, et non par préfixe : « Tous les espaces » ne doit pas
 * rester sélectionné pendant qu'on lit un espace, la maquette traitant les deux
 * comme des vues distinctes.
 */
const ActiveNavLink = (props: NavLinkProps) => (
  <NavLinkShell {...props} active={usePathname() === props.href} />
);

/**
 * Une entrée du rail, qui déduit elle-même si elle est la page courante.
 *
 * `usePathname` est une donnée de requête : sous `cacheComponents` elle bloque
 * le pré-rendu si elle n'est pas isolée — le build le refuse. D'où la
 * frontière, dont le repli est *le lien lui-même*, simplement pas encore
 * surligné : le rail est donc pré-rendu en entier, et seul le surlignage arrive
 * après. Un squelette, ici, ferait clignoter toute la navigation.
 */
export const NavLink = (props: NavLinkProps) => (
  <Suspense fallback={<NavLinkShell {...props} active={false} />}>
    <ActiveNavLink {...props} />
  </Suspense>
);
