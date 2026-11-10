import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { JoinCard } from "./join-card";
import {
  TopQuestionCard,
  TopQuestionCardSkeleton,
} from "./top-question-card";
import {
  TopDiscussionsCard,
  TopDiscussionsCardSkeleton,
} from "./top-discussions-card";

/**
 * Troisième colonne de la maquette (304px) : les blocs de la communauté.
 * La colonne n'est pas collante — seule la navigation de gauche l'est.
 *
 * Les deux cartes du haut lisent Strapi dans une portée `use cache`, qui se
 * résout au prérendu : elles arrivent donc dans la coquille statique et ces
 * frontières ne s'affichent normalement jamais. Elles sont le filet d'une
 * entrée froide et du premier rendu après une invalidation — et la garantie que
 * le rail, monté dans le layout, ne bloque aucune route.
 *
 * `JoinCard` porte déjà la sienne : son repli est vide, parce que la carte
 * disparaît pour un membre.
 */
export const RightRail = ({ className }: { className?: string }) => (
  <aside
    aria-label="Informations de la communauté"
    className={cn("flex min-w-0 flex-col gap-[18px]", className)}
  >
    <JoinCard />

    <Suspense fallback={<TopQuestionCardSkeleton />}>
      <TopQuestionCard />
    </Suspense>

    <Suspense fallback={<TopDiscussionsCardSkeleton />}>
      <TopDiscussionsCard />
    </Suspense>
  </aside>
);
