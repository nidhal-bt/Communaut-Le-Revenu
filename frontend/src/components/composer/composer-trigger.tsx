"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LoginModal } from "@/components/auth/login-modal";
import { ComposerModal } from "@/components/composer/composer-modal";
import { useAuth } from "@/lib/auth/auth-context";
import { DEFAULT_DISCUSSION_TYPE } from "@/lib/discussion-types";
import type { Category, DiscussionType } from "@/types/models";

const SPACE_PREFIX = "/espaces/";

const spaceSlugFrom = (pathname: string): string | null => {
  if (!pathname.startsWith(SPACE_PREFIX)) return null;

  const [slug] = pathname.slice(SPACE_PREFIX.length).split("/");

  return slug === "" ? null : decodeURIComponent(slug);
};

type ComposerTriggerProps = {
  categories: Category[];
  /** `documentId` de l'espace à présélectionner. Sinon déduit de l'URL. */
  defaultCategory?: string;
  children: (openComposer: (type?: DiscussionType) => void) => React.ReactNode;
};

/**
 * Trois affordances ouvrent le composer, chacune avec son dessin : seul le
 * déclenchement est commun — garde-fou visiteur, les deux modales, espace
 * présélectionné. L'appelant ne fournit que son bouton.
 */
export const ComposerTrigger = ({
  categories,
  defaultCategory,
  children,
}: ComposerTriggerProps) => {
  const { isAuth } = useAuth();
  const pathname = usePathname();
  const [loginOpen, setLoginOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState<DiscussionType>(
    DEFAULT_DISCUSSION_TYPE,
  );

  /* L'appelant qui tient déjà l'espace le passe ; les autres n'ont que l'URL. */
  const slug = spaceSlugFrom(pathname);
  const fromPath = categories.find((category) => category.slug === slug);
  const preselected = defaultCategory ?? fromPath?.documentId ?? "";

  const openComposer = (type: DiscussionType = DEFAULT_DISCUSSION_TYPE) => {
    if (!isAuth) {
      setLoginOpen(true);
      return;
    }

    setComposerType(type);
    setComposerOpen(true);
  };

  return (
    <>
      {children(openComposer)}

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
