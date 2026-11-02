import Link from "next/link";
import { BookOpen, LayoutGrid, Trophy, House } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Premier bloc du rail de navigation de la maquette.
 * La section « Espaces » (les catégories) viendra ensuite.
 *
 * Seule la route « / » existe pour l'instant : les autres liens sont des
 * emplacements. À remplacer par les vraies routes, et `active` sera alors
 * déduit de `usePathname()` plutôt que codé en dur.
 */
const LINKS = [
  { href: "/", label: "Accueil", icon: House, active: true },
  { href: "#", label: "Tous les espaces", icon: LayoutGrid, active: false },
  { href: "#", label: "Classement", icon: Trophy, active: false },
  { href: "#", label: "Charte", icon: BookOpen, active: false },
];

export const SideNav = () => (
  <nav
    aria-label="Navigation principale"
    className="sticky top-[86px] hidden w-[212px] flex-none flex-col gap-0.5 md:flex"
  >
    {LINKS.map(({ href, label, icon: Icon, active }) => (
      <Link
        key={label}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-[11px] rounded-sm px-2.5 py-[7px] text-sm font-medium text-foreground-secondary hover:bg-accent hover:text-foreground",
          active && "bg-accent-strong font-semibold text-foreground",
        )}
      >
        <Icon
          className={cn("size-[18px] flex-none", active && "text-primary-text")}
        />
        {label}
      </Link>
    ))}
  </nav>
);
