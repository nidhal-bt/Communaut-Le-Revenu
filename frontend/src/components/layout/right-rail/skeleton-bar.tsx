import { cn } from "@/lib/utils";

/**
 * Barre grise tenant la place d'une ligne de contenu. La hauteur et la largeur
 * viennent de l'appelant.
 *
 * Volontairement sans animation : ce n'est pas un état de chargement mais un
 * emplacement, en attendant que l'API serve le bloc.
 */
export const SkeletonBar = ({ className }: { className?: string }) => (
  <span aria-hidden className={cn("block rounded-full bg-accent", className)} />
);
