import { CategoryIcon } from "@/components/category-icon";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/models";

type SpaceTileProps = {
  category: Pick<Category, "icon" | "color">;
  size: number;
  className?: string;
};

/**
 * Une seule variable, `--s`, porte la taille : le rayon et l'icône s'en déduisent
 * par les mêmes ratios que la maquette (0.27 et 0.6), ce qui évite une table de
 * variantes pour cinq tailles.
 *
 * `--tile-color` est lu par l'utilitaire `bg-tile` ; il vient des données, seul cas
 * où une couleur arrive autrement que par un token.
 */
export const SpaceTile = ({ category, size, className }: SpaceTileProps) => (
  <span
    aria-hidden
    style={
      {
        "--s": `${size}px`,
        "--tile-color": category.color,
      } as React.CSSProperties
    }
    className={cn(
      "grid size-[var(--s)] flex-none place-items-center rounded-[calc(var(--s)*0.27)] bg-tile text-primary-foreground shadow-gloss",
      className,
    )}
  >
    <CategoryIcon icon={category.icon} className="size-[calc(var(--s)*0.6)]" />
  </span>
);
