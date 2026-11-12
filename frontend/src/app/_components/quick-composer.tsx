"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { LoginModal } from "@/components/auth/login-modal";
import { useAuth } from "@/lib/auth/auth-context";
import {
  DEFAULT_DISCUSSION_TYPE,
  DISCUSSION_TYPES,
} from "@/lib/discussion-types";
import { cn } from "@/lib/utils";
import type { Category, DiscussionType } from "@/types/models";
import { ComposerModal } from "@/components/composer/composer-modal";

/**
 * La maquette propose un troisième raccourci, « Sondage », écarté — voir
 * `@/lib/discussion-types`.
 *
 * Les deux raccourcis disparaissent sous `md` : c'est le bouton central de la barre
 * basse qui tient ce rôle sur mobile. On garde `md:` (768px) plutôt que son 760px,
 * pour rompre au même point que `bottom-nav.tsx` et `side-nav.tsx`.
 */

/** Gabarit de la barre, partagé avec le squelette pour qu'ils ne divergent pas. */
const BAR =
  "flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2.5 shadow-card";

/** Anneau de focus : les `button` nus n'héritent pas de celui de `ui/button.tsx`. */
const FOCUS =
  "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * Un `Avatar` partagé attendra un troisième appelant : la pastille de `navbar.tsx`
 * ne partage ni la taille, ni le fond, ni le contenu.
 */
const Avatar = ({ username }: { username: string | null }) => {
  if (username === null) {
    return (
      <span
        aria-hidden
        className="grid size-10 flex-none place-items-center rounded-full bg-muted-foreground text-primary-foreground"
      >
        <UserRound className="size-5" />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="grid size-10 flex-none place-items-center rounded-full bg-avatar-5 text-sm font-semibold text-primary-foreground"
    >
      {username.trim().charAt(0).toUpperCase()}
    </span>
  );
};

export const QuickComposer = ({ categories }: { categories: Category[] }) => {
  const { user, isAuth } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState<DiscussionType>(
    DEFAULT_DISCUSSION_TYPE,
  );

  /* Un visiteur doit d'abord se connecter. */
  const openComposer = (type: DiscussionType) => {
    if (!isAuth) {
      setLoginOpen(true);
      return;
    }

    setComposerType(type);
    setComposerOpen(true);
  };

  return (
    <>
      <div
        role="group"
        aria-label="Nouvelle publication"
        className={cn(BAR, "hover:border-border-strong")}
      >
        <Avatar username={user?.username ?? null} />

        <button
          type="button"
          onClick={() => openComposer(DEFAULT_DISCUSSION_TYPE)}
          className={cn(
            FOCUS,
            "min-w-0 flex-1 truncate rounded-[10px] border border-transparent bg-accent px-3.5 py-[9px] text-left text-muted-foreground hover:bg-accent-strong",
          )}
        >
          Posez votre question à la communauté…
        </button>

        <div className="hidden flex-none gap-1 md:flex">
          {DISCUSSION_TYPES.map(({ value, icon: Icon, shortLabel }) => (
            <button
              key={value}
              type="button"
              onClick={() => openComposer(value)}
              className={cn(
                FOCUS,
                "inline-flex items-center gap-1.5 rounded-sm border border-transparent px-2.5 py-[7px] text-[13.5px] font-medium text-foreground-secondary hover:bg-accent",
              )}
            >
              <Icon className="size-[18px] flex-none" />
              {shortLabel}
            </button>
          ))}
        </div>
      </div>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <ComposerModal
        open={composerOpen}
        onOpenChange={setComposerOpen}
        type={composerType}
        onTypeChange={setComposerType}
        categories={categories}
      />
    </>
  );
};

export const QuickComposerSkeleton = () => (
  <div aria-hidden className={BAR}>
    <span className="size-10 flex-none rounded-full bg-accent" />
    <span className="h-[38px] flex-1 rounded-[10px] bg-accent" />
  </div>
);
