import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { discussionHref } from "@/lib/discussion-slug";
import { fetchTopOfWeek } from "@/lib/strapi/discussions";
import { fetchLatestReply } from "@/lib/strapi/replies";
import { RailCard, RailCardMessage } from "./rail-card";
import { SkeletonBar } from "./skeleton-bar";

const TITLE = "Question de la semaine";
const ICON = <Star />;

/**
 * Bloc « question de la semaine » : la question la plus commentée des sept
 * derniers jours, puis sa dernière réponse.
 *
 * La maquette met en avant une question choisie à la main (`featured`, signée
 * « LaRedaction ») et sa réponse la mieux notée. Ni le drapeau ni la notation
 * n'existent dans le modèle de données : la question est donc déduite du
 * classement, et « la mieux notée » devient « la plus récente ».
 *
 * La réponse n'est lue que si le compteur est non nul : une question sans
 * réponse ne coûte alors pas une seconde requête, et le bloc se replie.
 *
 * Écarté de la maquette : le bouton « Je réponds », qui demanderait une route
 * vers la zone de réponse, et la pile des quatre premiers répondants, qui
 * demanderait l'auteur de chaque réponse pour une rangée décorative.
 */
export const TopQuestionCard = async () => {
  const result = await fetchTopOfWeek("question", 1);

  if ("failed" in result) {
    return (
      <RailCardMessage title={TITLE} icon={ICON}>
        Ce bloc n’a pas pu être chargé.
      </RailCardMessage>
    );
  }

  const [question] = result.discussions;

  if (!question) {
    return (
      <RailCardMessage title={TITLE} icon={ICON}>
        Aucune question cette semaine.
      </RailCardMessage>
    );
  }

  const replyCount = question.replyCount ?? 0;
  const latestReply =
    replyCount > 0 ? await fetchLatestReply(question.documentId) : null;

  return (
    <RailCard title={TITLE} icon={ICON}>
      <Link
        href={discussionHref(question)}
        className="font-heading text-[18px] leading-[1.3] font-bold tracking-[-0.01em] hover:text-primary-text"
      >
        {question.title}
      </Link>

      <p className="mt-2 text-[13px] text-muted-foreground">
        {replyCount} {replyCount === 1 ? "réponse" : "réponses"}
        {question.category && ` · ${question.category.name}`}
      </p>

      {latestReply?.author && (
        <div className="mt-[18px] flex items-start gap-2.5">
          <Avatar username={latestReply.author.username} size="sm" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <b className="truncate text-xs font-semibold">
              {latestReply.author.username}
            </b>
            <p className="line-clamp-2 text-[13px] text-foreground-secondary">
              {latestReply.content}
            </p>
          </div>
        </div>
      )}
    </RailCard>
  );
};

/**
 * Le repli de la carte : les barres qui tenaient la place avant que l'API ne
 * serve le bloc. Deux pour le titre, puis l'avatar et trois lignes pour la
 * réponse — la silhouette de ce que rend `TopQuestionCard`.
 */
export const TopQuestionCardSkeleton = () => (
  <RailCard title={TITLE} icon={ICON}>
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
