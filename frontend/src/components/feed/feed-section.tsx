import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { isMemberFeedTab, resolveFeedTab } from "@/lib/feed-tabs";
import { fetchDiscussions } from "@/lib/strapi/discussions";
import { Feed } from "./feed";

type FeedSectionProps = {
  pathname: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  /** Restreint le fil à un espace. Absent sur l'accueil. */
  categorySlug?: string;
};

/**
 * Résout l'onglet puis charge sa première page.
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
  const { tab } = await searchParams;
  const feedTab = resolveFeedTab(typeof tab === "string" ? tab : undefined);
  const user = isMemberFeedTab(feedTab) ? await getSessionUser() : null;

  if (isMemberFeedTab(feedTab) && !user) redirect(pathname);

  const discussions = await fetchDiscussions(feedTab, user?.id, categorySlug);

  return (
    <Feed discussions={discussions} tab={feedTab} category={categorySlug} />
  );
};
