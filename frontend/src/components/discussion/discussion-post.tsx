import { SkeletonBar } from "@/components/layout/right-rail/skeleton-bar";
import { SpaceTile } from "@/components/space-tile";
import { cn } from "@/lib/utils";
import type { Discussion } from "@/types/models";
import { AuthorByline } from "./author-byline";
import { POST_SHELL } from "./post-shell";
import { Prose } from "./prose";

/**
 * La `.post-main` de la maquette : les méta, le titre, l'auteur, le corps.
 *
 * Écarté faute de champ côté backend : les vues, les « utiles », « Suivre »,
 * « Épinglé », la meilleure réponse, les rôles et les points de l'auteur, le
 * bloc « Lier un article du Revenu » et les sondages. Toute la rangée
 * `.actions` est donc absente plutôt que rendue inerte — un bouton qui ne fait
 * rien est une régression d'accessibilité. « Copier le lien » est la seule
 * action qui se passerait du backend, mais elle demanderait un composant client
 * et un `<Toaster />` monté dans le layout.
 */
export const DiscussionPost = ({ discussion }: { discussion: Discussion }) => (
  <article className={POST_SHELL}>
    <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
      {discussion.category && (
        <span className="inline-flex items-center gap-1.5 font-semibold text-primary-text">
          <SpaceTile category={discussion.category} size={18} />
          {discussion.category.name}
        </span>
      )}

      {discussion.type === "question" && (
        <span className="rounded-full bg-accent px-2 py-px text-[11.5px] font-semibold text-foreground-secondary">
          Question
        </span>
      )}
    </div>

    <h1 className="mt-1.5 mb-3.5 font-heading text-[24px] leading-[1.2] font-bold tracking-[-0.01em] md:text-[29px]">
      {discussion.title}
    </h1>

    <AuthorByline
      author={discussion.author}
      createdAt={discussion.createdAt}
      size="md"
    />

    <Prose text={discussion.content} className="mt-3.5" />
  </article>
);

export const DiscussionPostSkeleton = () => (
  <div aria-hidden className="flex flex-col gap-2.5">
    <SkeletonBar className="h-3.5 w-48" />

    <div className={cn(POST_SHELL, "flex flex-col gap-3.5")}>
      <SkeletonBar className="h-3 w-32" />

      <div className="flex flex-col gap-2">
        <SkeletonBar className="h-6 w-full" />
        <SkeletonBar className="h-6 w-2/3" />
      </div>

      <div className="flex items-center gap-[11px]">
        <span className="size-10 flex-none rounded-full bg-accent" />
        <div className="flex flex-col gap-1.5">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-2.5 w-16" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SkeletonBar className="h-3 w-full" />
        <SkeletonBar className="h-3 w-full" />
        <SkeletonBar className="h-3 w-5/6" />
      </div>
    </div>
  </div>
);
