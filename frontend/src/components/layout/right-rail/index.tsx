import { cn } from "@/lib/utils";
import { JoinCard } from "./join-card";
import { TopQuestionCard } from "./top-question-card";
import { TopDiscussionsCard } from "./top-discussions-card";

/**
 * Troisième colonne de la maquette (304px) : les blocs de la communauté.
 * La colonne n'est pas collante — seule la navigation de gauche l'est.
 */
export const RightRail = ({ className }: { className?: string }) => (
  <aside
    aria-label="Informations de la communauté"
    className={cn("flex min-w-0 flex-col gap-[18px]", className)}
  >
    <JoinCard />
    <TopQuestionCard />
    <TopDiscussionsCard />
  </aside>
);
