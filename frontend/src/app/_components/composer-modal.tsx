"use client";

import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DISCUSSION_TYPES, findDiscussionType } from "@/lib/discussion-types";
import { cn } from "@/lib/utils";
import type { Category, DiscussionType } from "@/types/models";

/**
 * « Nouvelle publication » : la modale du composer de la maquette
 * (`openComposer()`), réduite à ce que le backend sait recevoir.
 *
 * Écarté faute de support : la recherche de discussions similaires, l'outil de
 * mention, les réponses de sondage, le bloc « Lier un article du Revenu » et
 * l'enregistrement automatique du brouillon.
 *
 * La modale ne garde aucun état : le type vient de la barre, qui sait lequel a
 * été cliqué, et les autres champs restent non contrôlés comme dans
 * `login-modal.tsx`. Seul le type est réactif — il décide du titre d'exemple.
 */

/** Recette `.input` de la maquette, pour les contrôles natifs sans équivalent `ui/`. */
const FIELD =
  "w-full rounded-sm border bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50";

type ComposerModalProps = {
  open: boolean;
  type: DiscussionType;
  onTypeChange: (type: DiscussionType) => void;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
};

export const ComposerModal = ({
  open,
  type,
  onTypeChange,
  onOpenChange,
  categories,
}: ComposerModalProps) => {
  const selected = findDiscussionType(type);
  const hasCategories = categories.length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    /* Présentationnel : `POST /api/discussions` exige un JWT, et la connexion
       n'est pas encore branchée (`auth-context` n'en conserve aucun). L'appel
       viendra ici, une fois `login-modal.tsx` relié à `/api/auth/local`.
       En attendant, publier vide le formulaire et ferme la modale. */
    event.currentTarget.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Largeur de la maquette : min(640px, 100%) dans une gouttière de 16px. */}
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-32px)] max-w-[min(640px,calc(100%-2rem))] gap-0 overflow-auto p-0 sm:max-w-[min(640px,calc(100%-2rem))]"
      >
        <div className="flex items-start justify-between gap-3 px-[22px] pt-[18px]">
          <DialogTitle className="text-[23px] leading-tight font-bold tracking-[-0.01em]">
            Nouvelle publication
          </DialogTitle>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Fermer"
                className="-mr-1 flex-none text-foreground-secondary"
              />
            }
          >
            <X />
          </DialogClose>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 px-[22px] pt-4 pb-[22px]">
            {/* Des radios natives : le groupement par `name` et la navigation aux
                flèches viennent du navigateur. Elles restent focusables — d'où
                `opacity-0` plutôt que `hidden` — pour que `:has()` puisse porter
                l'anneau de focus sur la carte. */}
            <div
              role="radiogroup"
              aria-label="Type de publication"
              className="grid grid-cols-2 gap-2.5"
            >
              {DISCUSSION_TYPES.map(
                ({ value, icon: Icon, cardTitle, cardHint }) => (
                  <label
                    key={value}
                    className="relative flex cursor-pointer flex-col gap-1 rounded-md border-[1.5px] p-[14px_12px] hover:border-border-strong has-[input:checked]:border-primary has-[input:checked]:bg-primary-soft has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-primary has-[input:focus-visible]:outline-offset-2"
                  >
                    <input
                      type="radio"
                      name="type"
                      value={value}
                      checked={value === type}
                      onChange={() => onTypeChange(value)}
                      className="pointer-events-none absolute opacity-0"
                    />
                    <Icon className="mb-1 size-[22px] text-primary-text" />
                    <b className="text-[14.5px] font-semibold">{cardTitle}</b>
                    <small className="text-[12.5px] leading-[1.35] text-muted-foreground">
                      {cardHint}
                    </small>
                  </label>
                ),
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="composer-title" className="text-sm font-semibold">
                Titre
              </label>
              {/* 10–150 caractères : les bornes du schéma Strapi. */}
              <Input
                id="composer-title"
                name="title"
                required
                minLength={10}
                maxLength={150}
                autoComplete="off"
                autoFocus
                placeholder={selected.titlePlaceholder}
                aria-describedby="composer-title-hint"
                className="h-10 rounded-sm px-3"
              />
              <span
                id="composer-title-hint"
                className="text-[12.5px] text-muted-foreground"
              >
                Un titre clair, formulé comme une question, obtient plus vite
                des réponses.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="composer-category"
                className="text-sm font-semibold"
              >
                Espace
              </label>
              {/* Un select désactivé n'est pas validé : `required` reste sûr. */}
              <select
                id="composer-category"
                name="category"
                required
                defaultValue=""
                disabled={!hasCategories}
                className={cn(FIELD, "h-10")}
              >
                <option value="">Choisissez un espace…</option>
                {categories.map((category) => (
                  <option key={category.documentId} value={category.documentId}>
                    {category.name}
                  </option>
                ))}
              </select>
              {/* Le backend peut être éteint : on le dit, plutôt que de laisser
                  un select vide et inexpliqué. */}
              {!hasCategories && (
                <span className="text-[12.5px] text-muted-foreground">
                  Les espaces ne sont pas disponibles pour le moment.
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="composer-content"
                className="text-sm font-semibold"
              >
                Détails{" "}
                <span className="font-normal text-muted-foreground">
                  (facultatif)
                </span>
              </label>
              <textarea
                id="composer-content"
                name="content"
                rows={5}
                placeholder="Votre situation, ce que vous avez déjà envisagé… Plus le contexte est précis, meilleures sont les réponses."
                className={cn(FIELD, "resize-y py-2.5 leading-normal")}
              />
            </div>

            {/* « Lire la charte » reste du texte : la charte n'a pas de route,
                et un lien vers nulle part est une régression d'accessibilité. */}
            <p className="flex items-start gap-2.5 rounded-sm bg-muted px-3 py-2.5 text-[13px] text-foreground-secondary">
              <Shield className="mt-px size-4 flex-none text-muted-foreground" />
              <span>
                Partagez votre expérience : pas de conseil personnalisé ni de
                sollicitation.{" "}
                <span className="font-semibold text-primary-text">
                  Lire la charte
                </span>
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t px-[22px] py-3.5">
            <Button type="submit" size="lg" className="h-10 px-4">
              Publier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
