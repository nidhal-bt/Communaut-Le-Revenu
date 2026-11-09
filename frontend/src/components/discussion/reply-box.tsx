"use client";

import { Suspense, useTransition } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/avatar";
import { SkeletonBar } from "@/components/layout/right-rail/skeleton-bar";
import { Button } from "@/components/ui/button";
import { FIELD } from "@/components/ui/field";
import { useAuth } from "@/lib/auth/auth-context";
import { createReplyAction } from "@/lib/reply-actions";
import { cn } from "@/lib/utils";
import type { User } from "@/types/models";
import { POST_SHELL } from "./post-shell";
import { ReplyLoginCard } from "./reply-login-card";

export const ReplyBoxSkeleton = () => (
  <div aria-hidden className={cn(POST_SHELL, "flex flex-col gap-2.5")}>
    <div className="flex items-center gap-[11px]">
      <span className="size-[30px] flex-none rounded-full bg-accent" />
      <SkeletonBar className="h-3 w-40" />
    </div>

    <span className="block min-h-[110px] rounded-sm bg-accent" />

    <div className="flex items-center justify-between gap-2.5">
      <SkeletonBar className="h-3 w-40" />
      <SkeletonBar className="h-10 w-40 rounded-md" />
    </div>
  </div>
);

/**
 * La `.reply-box` de la maquette.
 *
 * Non contrôlée, comme `login-modal.tsx` : l'action lit le `FormData`. Appel
 * impératif plutôt que `action={...}`, parce qu'on fait trois choses du
 * résultat — l'annoncer, vider le champ, garder le focus — et aucune ne demande
 * un effet.
 *
 * Écarté de la maquette : l'enregistrement automatique du brouillon, et l'outil
 * « Mentionner », qui demanderait la recherche de pseudo que le backend
 * n'expose pas.
 */
const ReplyBox = ({
  user,
  discussionDocumentId,
}: {
  user: User;
  discussionDocumentId: string;
}) => {
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    /* `currentTarget` est remis à null dès que le gestionnaire rend la main :
       le formulaire est capturé ici pour pouvoir être vidé après l'attente. */
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createReplyAction(formData);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      /* Vidé seulement en cas de succès : un échec doit laisser au membre ce
         qu'il vient d'écrire. */
      form.reset();
      toast.success("Votre réponse est publiée.");
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey) || event.key !== "Enter") return;

    event.preventDefault();
    /* `requestSubmit` et non `submit` : lui seul valide le `required` et
       déclenche vraiment l'événement `submit`. */
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(POST_SHELL, "flex flex-col gap-2.5")}
    >
      <input type="hidden" name="discussion" value={discussionDocumentId} />

      <div className="flex items-center gap-[11px]">
        <Avatar username={user.username} size="sm" />
        <p className="text-[12.5px] text-muted-foreground">
          Répondre en tant que{" "}
          <b className="font-semibold text-foreground">{user.username}</b>
        </p>
      </div>

      <label htmlFor="reply-content" className="sr-only">
        Votre réponse
      </label>
      <textarea
        id="reply-content"
        name="content"
        required
        onKeyDown={handleKeyDown}
        placeholder="Partagez votre expérience, même partielle…"
        className={cn(FIELD, "min-h-[110px] resize-y py-3 leading-[1.5]")}
      />

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <span className="text-[12.5px] text-muted-foreground">
          Ctrl + Entrée pour publier
        </span>

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-10 px-4"
        >
          {pending ? "Publication…" : "Publier ma réponse"}
        </Button>
      </div>
    </form>
  );
};

const ReplyAreaBody = ({
  discussionDocumentId,
}: {
  discussionDocumentId: string;
}) => {
  const { user } = useAuth();

  if (user === null) return <ReplyLoginCard />;

  return <ReplyBox user={user} discussionDocumentId={discussionDocumentId} />;
};

/**
 * `useAuth` suspend : la zone porte sa propre frontière, sinon tout le fil
 * attendrait aussi la lecture du cookie.
 *
 * Le repli n'est pas `null`, contrairement à `join-card.tsx` : les deux
 * branches rendent une carte de hauteur comparable, et le vide ferait sauter la
 * page au moment de la bascule.
 */
export const ReplyArea = ({
  discussionDocumentId,
}: {
  discussionDocumentId: string;
}) => (
  <Suspense fallback={<ReplyBoxSkeleton />}>
    <ReplyAreaBody discussionDocumentId={discussionDocumentId} />
  </Suspense>
);
