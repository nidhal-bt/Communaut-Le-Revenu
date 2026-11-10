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
 * Résout l'onglet et le numéro de page, puis charge cette page.
 *
 * `searchParams` est attendu *ici*, pas dans `page.tsx` : une lecture de la
 * requête dans le corps de la page la rendrait dynamique en entier, et le hero
 * comme la barre de publication perdraient leur pré-rendu.
 *
 * La session n'est lue que pour l'onglet membre. `fetchDiscussions` est un
 * scope `use cache` dont ses arguments forment la clé : passer l'identifiant
 * sur les onglets publics découperait leur unique entrée partagée en une entrée
 * par membre, pour une requête identique.
 *
 * Un visiteur sur l'onglet membre est redirigé, et non replié en silence sur le
 * tri par défaut : sans ce garde-fou il recevrait le fil « Récentes » complet
 * sous une URL qui annonce « Pour vous », et aucun onglet du rail ne
 * ressortirait comme sélectionné. `pathname` arrive en prop faute de pouvoir se
 * lire côté serveur, et c'est aussi ce qui permet de servir un espace : la
 * redirection doit y revenir, pas retomber sur l'accueil.
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
     afficher « Rien ici pour l'instant » au milieu d'un fil pourtant plein.
     `pageCount` à zéro est le fil vide ou le backend éteint : il n'y a alors
     aucune page où renvoyer. L'onglet et la page sont les deux seuls
     paramètres du fil, les reposer suffit donc à reconstruire l'adresse. */
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
