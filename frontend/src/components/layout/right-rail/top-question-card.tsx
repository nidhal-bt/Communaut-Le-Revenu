import { Star } from "lucide-react";
import { RailCard } from "./rail-card";
import { SkeletonBar } from "./skeleton-bar";

/**
 * Bloc « question de la semaine » : l'intitulé de la question, puis la réponse
 * la mieux notée (auteur + extrait).
 *
 * Emplacement seulement : la mise en page est celle de la maquette, le contenu
 * viendra de l'API (question mise en avant et sa meilleure réponse).
 */
export const TopQuestionCard = () => (
  <RailCard title="Question de la semaine" icon={<Star />}>
    <div className="flex flex-col gap-2">
      <SkeletonBar className="h-3.5 w-full" />
      <SkeletonBar className="h-3.5 w-3/5" />
    </div>

    <div className="mt-[18px] flex items-start gap-2.5">
      <SkeletonBar className="size-7 flex-none" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <SkeletonBar className="h-2.5 w-2/5" />
        <SkeletonBar className="h-2.5 w-full" />
        <SkeletonBar className="h-2.5 w-4/5" />
      </div>
    </div>
  </RailCard>
);
