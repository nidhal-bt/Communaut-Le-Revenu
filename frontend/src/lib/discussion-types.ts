import {
  CircleQuestionMark,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import type { DiscussionType } from "@/types/models";

/**
 * La maquette affiche aussi un sondage, écarté ici : l'enum du backend ne connaît
 * que `question` et `discussion`, et un sondage demanderait en plus un type de
 * contenu « réponses / votes » qui n'existe pas.
 */
export type DiscussionTypeOption = {
  value: DiscussionType;
  icon: LucideIcon;
  shortLabel: string;
  cardTitle: string;
  cardHint: string;
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
