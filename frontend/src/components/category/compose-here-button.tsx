"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { LoginModal } from "@/components/auth/login-modal";
import { ComposerModal } from "@/components/composer/composer-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { DEFAULT_DISCUSSION_TYPE } from "@/lib/discussion-types";
import type { Category, DiscussionType } from "@/types/models";

type ComposeHereButtonProps = {
  categories: Category[];
  /** `documentId` de l'espace courant : le select s'ouvre dessus. */
  defaultCategory: string;
};

/**
 * « Publier ici » : le composer, ouvert sur l'espace qu'on est en train de
 * lire.
 *
 * Même garde-fou que la barre de l'accueil — un visiteur voit d'abord la
 * connexion. `useAuth` suspend, ce bouton vit donc sous la frontière que l'en-
 * tête lui donne.
 */
export const ComposeHereButton = ({
  categories,
  defaultCategory,
}: ComposeHereButtonProps) => {
  const { isAuth } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState<DiscussionType>(
    DEFAULT_DISCUSSION_TYPE,
  );

  const openComposer = () => {
    if (!isAuth) {
      setLoginOpen(true);
      return;
    }

    setComposerOpen(true);
  };

  return (
    <>
      <Button size="lg" className="flex-none" onClick={openComposer}>
        <Plus />
        Publier ici
      </Button>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <ComposerModal
        open={composerOpen}
        onOpenChange={setComposerOpen}
        type={composerType}
        onTypeChange={setComposerType}
        categories={categories}
        defaultCategory={defaultCategory}
      />
    </>
  );
};

/** Même gabarit, le temps de lire le cookie et la liste des espaces. */
export const ComposeHereButtonSkeleton = () => (
  <span aria-hidden className="h-9 w-[132px] flex-none rounded-lg bg-accent" />
);

