import { Search } from "lucide-react";

/**
 * Les morceaux que la page de recherche partage avec son repli de chargement
 * et avec ses propres frontières `<Suspense>` : sans eux, chaque état
 * redessinerait un en-tête et un champ qui peuvent diverger.
 *
 * Même raison que `SPACES_GRID` dans `espaces/_components/spaces-grid.tsx`.
 */

export const SearchHeader = () => (
  <header>
    <h1 className="font-heading text-[28px] leading-tight font-bold tracking-[-0.01em]">
      Rechercher
    </h1>
    <p className="mt-1.5 max-w-[62ch] text-foreground-secondary">
      La question a peut-être déjà sa réponse : la recherche parcourt les titres
      et le contenu des discussions.
    </p>
  </header>
);

/**
 * Le champ de la maquette (`#f-search2`) : un `form` nu, dont la soumission
 * native recharge la page avec `q`. Pas de `"use client"`, pas d'état.
 */
export const SearchField = ({ query }: { query: string }) => (
  <form
    action="/recherche"
    role="search"
    className="flex h-11 items-center gap-2.5 rounded-[10px] border bg-card px-3.5 text-sm text-muted-foreground shadow-card focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/25"
  >
    <Search className="size-[18px] flex-none" />
    <input
      type="search"
      name="q"
      defaultValue={query}
      aria-label="Rechercher une discussion"
      placeholder="PEA, donation, SCPI…"
      className="h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
    />
  </form>
);
