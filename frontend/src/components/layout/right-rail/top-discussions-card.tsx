import { Trophy } from "lucide-react";
import { RailCard } from "./rail-card";
import { SkeletonBar } from "./skeleton-bar";

/**
 * Bloc « discussions les plus actives » : le titre de chaque discussion et son
 * nombre de réponses.
 *
 * Emplacement seulement : cinq lignes grises à la place du classement, que
 * l'API servira plus tard. Les largeurs varient pour donner l'allure de vrais
 * titres. Le lien « Tout voir » n'a pas encore de route.
 */
const TITLE_WIDTHS = ["w-full", "w-11/12", "w-full", "w-10/12", "w-8/12"];

export const TopDiscussionsCard = () => (
  <RailCard
    title="Discussions les plus actives"
    icon={<Trophy />}
    action={
      <span className="text-[13px] font-medium text-primary-text">
        Tout voir
      </span>
    }
  >
    <div>
      {TITLE_WIDTHS.map((width, index) => (
        <div key={index} className="flex items-center gap-2.5 py-[7px]">
          <SkeletonBar className="h-2.5 w-4 flex-none" />
          <div className="min-w-0 flex-1">
            <SkeletonBar className={`h-2.5 ${width}`} />
          </div>
          <SkeletonBar className="h-2.5 w-7 flex-none" />
        </div>
      ))}
    </div>
  </RailCard>
);
