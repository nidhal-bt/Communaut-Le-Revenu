import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { isMemberFeedTab, resolveFeedTab } from "@/lib/feed-tabs";
import { feedHref, resolveFeedPage } from "@/lib/feed-url";
import { fetchDiscussions } from "@/lib/strapi/discussions";
import { Feed } from "./feed";

type FeedSectionProps = {
  pathname: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  /** Restreint le fil à un espace. Absent sur l'accueil, qui le lit dans l'URL. */
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
  const { tab, page, category } = await searchParams;
  const feedTab = resolveFeedTab(typeof tab === "string" ? tab : undefined);
  const feedPage = resolveFeedPage(typeof page === "string" ? page : undefined);
  const user = isMemberFeedTab(feedTab) ? await getSessionUser() : null;

  if (isMemberFeedTab(feedTab) && !user) redirect(pathname);

  /* La route gagne sur l'URL : dans un espace, `?category=` est ignoré plutôt que
     de contredire l'adresse. */
  const slug =
    categorySlug ?? (typeof category === "string" ? category : undefined);

  const feed = await fetchDiscussions(feedTab, feedPage, user?.id, slug);

  /* Sur une panne, `pageCount` ne veut rien dire : pas de redirection. */
  if ("failed" in feed) {
    return (
      <Feed
        failed
        discussions={[]}
        pageCount={0}
        tab={feedTab}
        category={categorySlug}
      />
    );
  }

  /* Une page au-delà de la dernière est ramenée sur la dernière, et non laissée
     afficher « Rien ici pour l'instant » au milieu d'un fil plein. `pageCount` à
     zéro est le fil vide : aucune page où renvoyer. */
  if (feed.pageCount > 0 && feedPage > feed.pageCount) {
    redirect(
      feedHref(pathname, new URLSearchParams(), {
        tab: feedTab,
        page: feed.pageCount,
        category: slug,
      }),
    );
  }

  /* `category` et non `slug` : la prop masque l'onglet membre dans un espace, et
     une puce choisie sur l'accueil ne doit pas le faire disparaître. */
  return (
    <Feed
      discussions={feed.discussions}
      pageCount={feed.pageCount}
      tab={feedTab}
      category={categorySlug}
    />
  );
};
