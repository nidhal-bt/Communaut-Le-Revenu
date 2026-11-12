import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { isMemberFeedTab, resolveFeedTab } from "@/lib/feed-tabs";
import { feedHref, resolveFeedPage } from "@/lib/feed-url";
import { fetchDiscussions } from "@/lib/strapi/discussions";
import { Feed } from "./feed";

type FeedSectionProps = {
  pathname: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  /** Restreint le fil à un espace. Absent sur l'accueil. */
  categorySlug?: string;
};

/**
 * `searchParams` est attendu *ici*, pas dans `page.tsx` : une lecture de la requête
 * dans le corps de la page la rendrait dynamique en entier, et le hero comme la
 * barre de publication perdraient leur pré-rendu.
 *
 * La session n'est lue que pour l'onglet membre : `fetchDiscussions` est un scope
 * `use cache` dont les arguments forment la clé, et passer l'identifiant sur les
 * onglets publics découperait leur entrée partagée en une entrée par membre.
 *
 * Un visiteur sur l'onglet membre est redirigé, et non replié en silence : sinon il
 * recevrait le fil « Récentes » sous une URL qui annonce « Pour vous ». `pathname`
 * arrive en prop faute de pouvoir se lire côté serveur, et c'est ce qui permet à la
 * redirection de revenir dans un espace plutôt que sur l'accueil.
 */
export const FeedSection = async ({
  pathname,
  searchParams,
  categorySlug,
}: FeedSectionProps) => {
  const { tab, page } = await searchParams;
  const feedTab = resolveFeedTab(typeof tab === "string" ? tab : undefined);
  const feedPage = resolveFeedPage(typeof page === "string" ? page : undefined);
  const user = isMemberFeedTab(feedTab) ? await getSessionUser() : null;

  if (isMemberFeedTab(feedTab) && !user) redirect(pathname);

  const { discussions, pageCount } = await fetchDiscussions(
    feedTab,
    feedPage,
    user?.id,
    categorySlug,
  );

  /* Une page au-delà de la dernière est ramenée sur la dernière, et non laissée
     afficher « Rien ici pour l'instant » au milieu d'un fil plein. `pageCount` à
     zéro est le fil vide ou le backend éteint : aucune page où renvoyer. */
  if (pageCount > 0 && feedPage > pageCount) {
    redirect(
      feedHref(pathname, new URLSearchParams(), {
        tab: feedTab,
        page: pageCount,
      }),
    );
  }

  return (
    <Feed
      discussions={discussions}
      pageCount={pageCount}
      tab={feedTab}
      category={categorySlug}
    />
  );
};
