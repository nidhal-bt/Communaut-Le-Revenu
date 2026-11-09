import type { FeedTabKey, FeedView } from "@/lib/feed-tabs";
import type { Discussion } from "@/types/models";
import { DiscussionCard } from "./discussion-card";
import { DiscussionRow, DiscussionRowHeader } from "./discussion-row";

/** Coquille du fil, partagée avec le squelette pour qu'ils ne divergent pas. */
export const FEED_SHELL =
  "overflow-hidden rounded-lg border bg-card shadow-card";

const FeedEmpty = ({ tab }: { tab: FeedTabKey }) => {
  const answered = tab === "sans-reponse";

  return (
    <div className={`${FEED_SHELL} px-5 py-10 text-center`}>
      <h3 className="mb-1.5 font-heading text-xl tracking-[-0.01em]">
        {answered
          ? "Toutes les questions ont une réponse"
          : "Rien ici pour l'instant"}
      </h3>
      <p className="text-sm text-foreground-secondary">
        {answered
          ? "Bravo à la communauté ! Revenez plus tard ou posez à votre tour une question."
          : "Lancez la première discussion avec la barre de publication ci-dessus."}
      </p>
    </div>
  );
};

type FeedListProps = {
  discussions: Discussion[];
  view: FeedView;
  tab: FeedTabKey;
};

export const FeedList = ({ discussions, view, tab }: FeedListProps) => {
  if (!discussions.length) return <FeedEmpty tab={tab} />;

  if (view === "compact") {
    return (
      <div className={FEED_SHELL}>
        <DiscussionRowHeader />
        {discussions.map((discussion) => (
          <DiscussionRow key={discussion.documentId} discussion={discussion} />
        ))}
      </div>
    );
  }

  return (
    <div className={FEED_SHELL}>
      {discussions.map((discussion) => (
        <DiscussionCard key={discussion.documentId} discussion={discussion} />
      ))}
    </div>
  );
};
