import { resolveFeedTab } from "@/lib/feed-tabs";
import { fetchDiscussions } from "@/lib/strapi/discussions";
import { Feed } from "./feed";

type FeedSectionProps = {
  searchParams: PageProps<"/">["searchParams"];
};

/**
 * Résout l'onglet puis charge sa première page.
 *
 * `searchParams` est attendu *ici*, pas dans `page.tsx` : une lecture de la
 * requête dans le corps de la page la rendrait dynamique en entier, et le hero
 * comme la barre de publication perdraient leur pré-rendu.
 */
export const FeedSection = async ({ searchParams }: FeedSectionProps) => {
  const { tab } = await searchParams;
  const feedTab = resolveFeedTab(typeof tab === "string" ? tab : undefined);
  const discussions = await fetchDiscussions(feedTab);

  return <Feed discussions={discussions} tab={feedTab} />;
};
