/**
 * Les morceaux que la page des espaces et son repli de chargement partagent : sans
 * eux, `loading.tsx` redessinerait une grille qui peut diverger de la page.
 */
export const SPACES_GRID =
  "grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5";

const SKELETON_CARDS = [0, 1, 2, 3, 4, 5];

export const SpacesHeader = () => (
  <header>
    <h1 className="font-heading text-[28px] leading-tight font-bold tracking-[-0.01em]">
      Tous les espaces
    </h1>
    <p className="mt-1.5 max-w-[62ch] text-foreground-secondary">
      Les espaces thématiques de la communauté, calqués sur les grandes
      rubriques du Revenu.
    </p>
  </header>
);

export const SpacesGridSkeleton = () => (
  <div aria-hidden className={SPACES_GRID}>
    {SKELETON_CARDS.map((index) => (
      <span
        key={index}
        className="flex flex-col gap-2.5 rounded-lg border bg-card p-[18px] shadow-card"
      >
        <span className="mb-1.5 size-10 rounded-[11px] bg-accent" />
        <span className="h-4 w-40 rounded-full bg-accent" />
        <span className="h-3 w-full rounded-full bg-accent" />
        <span className="h-2.5 w-32 rounded-full bg-accent" />
      </span>
    ))}
  </div>
);
