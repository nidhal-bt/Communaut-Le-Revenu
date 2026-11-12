import type { ReactNode } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Volontairement NON collante : elle défile hors de l'écran et laisse l'en-tête
 * seul en haut.
 *
 * La pastille d'abonnement reste dans son état « S'abonner » : la maquette a un
 * second état pour les abonnés, mais `User` n'expose pas encore ce champ. C'est ce
 * qui permet à ce composant de rester un composant serveur.
 */

/** Tous les liens pointent vers l'accueil du site, comme dans la maquette. */
export const SITE_URL = "https://www.lerevenu.com";

const RUBRIQUES = [
  "Bourse",
  "Économie",
  "Placements",
  "Immobilier",
  "Impôts",
  "Succession",
  "Vie pratique",
];

type SiteLinkProps = {
  className?: string;
  children: ReactNode;
};

/** Lien sortant : une balise `a` et non `next/link`, la cible est hors application. */
const SiteLink = ({ className, children }: SiteLinkProps) => (
  <a
    href={SITE_URL}
    target="_blank"
    rel="noopener"
    className={cn(
      "inline-flex items-center gap-1.5 whitespace-nowrap hover:text-primary-text",
      className,
    )}
  >
    {children}
  </a>
);

export const SiteBar = () => (
  <div className="border-b bg-card text-[13px] text-foreground-secondary">
    <div className="mx-auto flex h-[38px] max-w-[1260px] items-center gap-5 px-4">
      <SiteLink className="flex-none font-semibold text-foreground">
        <ArrowLeft className="size-[15px] flex-none" />
        Retour sur lerevenu.com
      </SiteLink>

      <nav
        aria-label="Rubriques de lerevenu.com"
        className="flex min-w-0 gap-4 overflow-hidden border-l border-border-divider pl-5"
      >
        {RUBRIQUES.map((rubrique) => (
          <SiteLink key={rubrique}>{rubrique}</SiteLink>
        ))}
      </nav>

      <div className="ml-auto flex flex-none items-center gap-4">
        <SiteLink className="hidden md:inline-flex">
          <BookOpen className="size-[15px] flex-none" />
          Le magazine
        </SiteLink>
        <SiteLink className="rounded-full bg-primary px-[11px] py-[3px] font-semibold text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground">
          S&apos;abonner
        </SiteLink>
      </div>
    </div>
  </div>
);
