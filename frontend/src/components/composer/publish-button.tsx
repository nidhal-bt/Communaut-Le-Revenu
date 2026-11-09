"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { LoginModal } from "@/components/auth/login-modal";
import { ComposerModal } from "@/components/composer/composer-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { DEFAULT_DISCUSSION_TYPE } from "@/lib/discussion-types";
import type { Category, DiscussionType } from "@/types/models";

/**
 * Le bouton qui ouvre le composer : « Publier » dans l'en-tête, « Publier
 * ici » sur un espace.
 *
 * Un visiteur voit d'abord la connexion. `useAuth` suspend, le bouton vit donc
 * sous la frontière `<Suspense>` que son appelant lui donne.
 */

const SPACE_PREFIX = "/espaces/";

/** Le slug de l'espace qu'on est en train de lire, s'il y en a un. */
const spaceSlugFrom = (pathname: string): string | null => {
  if (!pathname.startsWith(SPACE_PREFIX)) return null;

  const [slug] = pathname.slice(SPACE_PREFIX.length).split("/");

  return slug === "" ? null : decodeURIComponent(slug);
};

type PublishButtonProps = {
  categories: Category[];
  label: string;
  /** `documentId` de l'espace à présélectionner. Sinon déduit de l'URL. */
  defaultCategory?: string;
  className?: string;
};

export const PublishButton = ({
  categories,
  label,
  defaultCategory,
  className,
}: PublishButtonProps) => {
  const { isAuth } = useAuth();
  const pathname = usePathname();
  const [loginOpen, setLoginOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState<DiscussionType>(
    DEFAULT_DISCUSSION_TYPE,
  );

  /* L'appelant qui tient déjà l'espace le passe — l'en-tête d'un espace a son
     `documentId` en main. Les autres n'ont que l'URL : c'est elle qui dit si
     l'on publie depuis un espace, et le slug qu'elle porte se retrouve dans la
     liste que le select affiche de toute façon. */
  const slug = spaceSlugFrom(pathname);
  const fromPath = categories.find((category) => category.slug === slug);
  const preselected = defaultCategory ?? fromPath?.documentId ?? "";

  const openComposer = () => {
    if (!isAuth) {
      setLoginOpen(true);
      return;
    }

    setComposerOpen(true);
  };

  return (
    <>
      <Button size="lg" className={className} onClick={openComposer}>
        <Plus />
        {label}
      </Button>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <ComposerModal
        open={composerOpen}
        onOpenChange={setComposerOpen}
        type={composerType}
        onTypeChange={setComposerType}
        categories={categories}
        defaultCategory={preselected}
      />
    </>
  );
};

/** Même gabarit, le temps de lire le cookie et la liste des espaces. */
export const PublishButtonSkeleton = () => (
  <span aria-hidden className="h-9 w-[132px] flex-none rounded-lg bg-accent" />
);
