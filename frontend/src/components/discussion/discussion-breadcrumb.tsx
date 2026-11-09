import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Category } from "@/types/models";

/**
 * La `.crumbs` de la maquette : Accueil ▸ espace.
 *
 * `category` est requis par le schéma, mais facultatif dans le type : sans lui,
 * le fil se réduit à « Accueil » plutôt que d'afficher un chevron orphelin.
 */
export const DiscussionBreadcrumb = ({
  category,
}: {
  category?: Category;
}) => (
  <nav
    aria-label="Fil d'Ariane"
    className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-muted-foreground"
  >
    <Link href="/" className="hover:text-foreground">
      Accueil
    </Link>

    {category && (
      <>
        <ChevronRight aria-hidden className="size-3.5" />
        <Link
          href={`/espaces/${category.slug}`}
          className="hover:text-foreground"
        >
          {category.name}
        </Link>
      </>
    )}
  </nav>
);
