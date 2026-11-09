import { formatCount } from "@/lib/format-count";
import { fetchCategoryStats } from "@/lib/strapi/categories";

/**
 * « N discussions · N réponses ».
 *
 * La maquette affiche un troisième chiffre, « N membres actifs ce mois-ci »,
 * qu'elle calcule en divisant les réponses par neuf : il est inventé. Écarté —
 * il n'existe aucun modèle d'activité, et un nombre qui a l'air dérivé vaut
 * moins que pas de nombre.
 */
export const CategoryStats = async ({ slug }: { slug: string }) => {
  const { discussions, replies } = await fetchCategoryStats(slug);

  return (
    <>
      <span>
        <b className="font-semibold tabular-nums text-foreground-secondary">
          {formatCount(discussions)}
        </b>{" "}
        {discussions === 1 ? "discussion" : "discussions"}
      </span>
      <span>
        <b className="font-semibold tabular-nums text-foreground-secondary">
          {formatCount(replies)}
        </b>{" "}
        {replies === 1 ? "réponse" : "réponses"}
      </span>
    </>
  );
};

export const CategoryStatsSkeleton = () => (
  <>
    {[0, 1].map((index) => (
      <span key={index} aria-hidden className="h-2.5 w-24 rounded-full bg-accent" />
    ))}
  </>
);
