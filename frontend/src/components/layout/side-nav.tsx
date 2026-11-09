import { Suspense } from "react";
import { BookOpen, ExternalLink, House, LayoutGrid, Trophy } from "lucide-react";
import { NavLink } from "@/components/layout/nav-link";
import { SITE_URL } from "@/components/layout/site-bar";
import { SpaceTile } from "@/components/space-tile";
import { fetchCategories } from "@/lib/strapi/categories";

/**
 * Le rail de navigation de la maquette : les pages, puis les espaces.
 *
 * « Classement » et « Charte » n'ont pas encore de route : ce sont des
 * emplacements. Les autres liens pointent sur du réel, et `NavLink` déduit
 * lui-même lequel est sélectionné.
 */
const LINKS = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/espaces", label: "Tous les espaces", icon: LayoutGrid },
  { href: "#", label: "Classement", icon: Trophy },
  { href: "#", label: "Charte", icon: BookOpen },
];

/** `.nav-title` de la maquette. */
const SECTION_TITLE =
  "px-2.5 pt-[18px] pb-1.5 text-[11.5px] font-semibold text-muted-foreground";

/**
 * Un lien par espace.
 *
 * Liste vide — backend éteint — : rien ne s'affiche. Le rail doit survivre à
 * l'absence de Strapi, les liens de navigation au-dessus n'en dépendant pas.
 *
 * Le point rouge des centres d'intérêt de la maquette est écarté : il n'existe
 * aucun modèle d'intérêts.
 */
const SpacesNav = async () => {
  const categories = await fetchCategories();

  return categories.map((category) => (
    <NavLink
      key={category.documentId}
      href={`/espaces/${category.slug}`}
      label={category.name}
    >
      <SpaceTile category={category} size={22} />
    </NavLink>
  ));
};

const SpacesNavSkeleton = () => (
  <>
    {[0, 1, 2, 3, 4, 5].map((index) => (
      <span
        key={index}
        aria-hidden
        className="flex items-center gap-[11px] px-2.5 py-[7px]"
      >
        <span className="size-[22px] flex-none rounded-[6px] bg-accent" />
        <span className="h-2.5 w-28 rounded-full bg-accent" />
      </span>
    ))}
  </>
);

export const SideNav = () => (
  <nav
    aria-label="Navigation principale"
    className="sticky top-[86px] hidden w-[212px] flex-none flex-col gap-0.5 md:flex"
  >
    {LINKS.map(({ href, label, icon: Icon }) => (
      <NavLink key={label} href={href} label={label}>
        <Icon className="size-[18px] flex-none" />
      </NavLink>
    ))}

    <h2 className={SECTION_TITLE}>Espaces</h2>

    {/* La liste est un scope `use cache`, donc pré-rendable : la frontière
        n'est plus imposée par le build, elle évite seulement que les liens
        au-dessus attendent Strapi quand le cache est froid. */}
    <Suspense fallback={<SpacesNavSkeleton />}>
      <SpacesNav />
    </Suspense>

    {/* Pied de rail : le second retour vers le site, comme dans la maquette. */}
    <a
      href={SITE_URL}
      target="_blank"
      rel="noopener"
      className="mt-[18px] flex items-center gap-2 border-t px-2.5 pt-3 text-[13px] text-muted-foreground hover:text-primary-text"
    >
      Retour sur lerevenu.com
      <ExternalLink className="ml-auto size-[13px] flex-none" />
    </a>
  </nav>
);
