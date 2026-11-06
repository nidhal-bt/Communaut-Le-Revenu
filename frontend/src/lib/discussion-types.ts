import {
  CircleQuestionMark,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import type { DiscussionType } from "@/types/models";

/**
 * Les types de publication proposés par le composer.
 *
 * La maquette en affiche trois — question, discussion, sondage. Le sondage est
 * écarté ici : l'enum du backend ne connaît que `question` et `discussion`, et
 * un sondage demanderait en plus un type de contenu « réponses / votes » qui
 * n'existe pas.
 *
 * Le libellé court alimente la barre, le titre et l'accroche alimentent les
 * cartes de la modale : une seule source, pour que les deux ne divergent pas.
 */
export type DiscussionTypeOption = {
  value: DiscussionType;
  icon: LucideIcon;
  /** Libellé du raccourci dans la barre. */
  shortLabel: string;
  cardTitle: string;
  cardHint: string;
  /** Exemple de titre, propre à chaque type. */
  titlePlaceholder: string;
};

export const DISCUSSION_TYPES: readonly DiscussionTypeOption[] = [
  {
    value: "question",
    icon: CircleQuestionMark,
    shortLabel: "Question",
    cardTitle: "Poser une question",
    cardHint: "Obtenez l’aide des membres et de la rédaction",
    titlePlaceholder: "Ex. : Faut-il ouvrir un PER à 45 ans ?",
  },
  {
    value: "discussion",
    icon: MessageCircle,
    shortLabel: "Discussion",
    cardTitle: "Lancer une discussion",
    cardHint: "Partagez une expérience, un avis, une actualité",
    titlePlaceholder:
      "Ex. : Mon retour d’expérience sur la renégociation de mon crédit",
  },
];

/** Le type ouvert quand on clique le champ plutôt qu'un raccourci. */
export const DEFAULT_DISCUSSION_TYPE: DiscussionType = "question";

export const findDiscussionType = (value: DiscussionType) =>
  DISCUSSION_TYPES.find((option) => option.value === value) ??
  DISCUSSION_TYPES[0];
