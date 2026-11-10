import Link from "next/link";
import { Trophy } from "lucide-react";
import { discussionHref } from "@/lib/discussion-slug";
import { fetchTopOfWeek } from "@/lib/strapi/discussions";
import { cn } from "@/lib/utils";
import { RailCard, RailCardMessage } from "./rail-card";
import { SkeletonBar } from "./skeleton-bar";

const TITLE = "Discussions les plus actives";
const ICON = <Trophy />;
const LIMIT = 5;

const ROW = "flex items-center gap-2.5 py-[7px]";
const RANK = "w-5 flex-none text-center text-[13px] font-semibold tabular-nums";
const COUNT =
  "flex-none text-[13px] font-semibold tabular-nums text-foreground-secondary";

/**
 * « Tout voir » renvoie au fil trié par activité — l'onglet nommé plutôt que
 * l'adresse nue, pour que le lien garde son sens si l'onglet par défaut change.
 * La maquette pointait vers un classement de membres, qui n'existe pas ici.
 */
const SeeAll = (
  <Link
    href="/?tab=tendances"
    className="text-[13px] font-medium text-primary-text hover:underline"
  >
    Tout voir
  </Link>
);

/**
 * Bloc « discussions les plus actives » : les cinq discussions les plus
 * commentées des sept derniers jours.
 *
 * Même lecture que la carte au-dessus, à deux arguments près — le type et la
 * limite — donc une entrée de cache et une étiquette distinctes. Les questions
 * en sont exclues : elles ont leur propre carte.
 *
 * La maquette classait des membres à leurs points (`topWidget`), notion absente
 * du backend ; seule la géométrie des rangées est reprise.
 */
export const TopDiscussionsCard = async () => {
  const result = await fetchTopOfWeek("discussion", LIMIT);

  if ("failed" in result) {
    return (
      <RailCardMessage title={TITLE} icon={ICON}>
        Ce bloc n’a pas pu être chargé.
      </RailCardMessage>
    );
  }

  const { discussions } = result;

  if (discussions.length === 0) {
    return (
      <RailCardMessage title={TITLE} icon={ICON}>
        Aucune discussion cette semaine.
      </RailCardMessage>
    );
  }

  return (
    <RailCard title={TITLE} icon={ICON} action={SeeAll}>
      <div>
        {discussions.map((discussion, index) => (
          <Link
            key={discussion.documentId}
            href={discussionHref(discussion)}
            className={cn(ROW, "group")}
          >
            {/* Le podium en rouge, comme la maquette. Le compteur reste neutre :
                le rouge sur un nombre de réponses veut déjà dire « sans
                réponse » dans ce code (`discussion-row.tsx`). */}
            <span
              className={cn(
                RANK,
                index < 3 ? "text-primary-text" : "text-muted-foreground",
              )}
            >
              {index + 1}
            </span>

            <b className="min-w-0 flex-1 truncate text-sm font-semibold group-hover:text-primary-text">
              {discussion.title}
            </b>

            <span className={COUNT}>{discussion.replyCount ?? 0}</span>
          </Link>
        ))}
      </div>
    </RailCard>
  );
};

/**
 * Le repli de la carte : cinq rangées grises dans la géométrie des vraies. Les
 * largeurs varient pour donner l'allure de titres plutôt que d'un gabarit.
 */
const TITLE_WIDTHS = ["w-full", "w-11/12", "w-full", "w-10/12", "w-8/12"];

export const TopDiscussionsCardSkeleton = () => (
  <RailCard title={TITLE} icon={ICON}>
    <div>
      {TITLE_WIDTHS.map((width, index) => (
        <div key={index} className={ROW}>
          <SkeletonBar className="h-2.5 w-5 flex-none" />
          <div className="min-w-0 flex-1">
            <SkeletonBar className={cn("h-2.5", width)} />
          </div>
          <SkeletonBar className="h-2.5 w-7 flex-none" />
        </div>
      ))}
    </div>
  </RailCard>
);
