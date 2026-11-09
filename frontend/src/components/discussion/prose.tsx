import { Fragment } from "react";
import { cn } from "@/lib/utils";

const PARAGRAPH_BREAK = /\n\s*\n/;

/**
 * Le corps d'une discussion ou d'une réponse.
 *
 * `content` est une colonne `text` : il n'y a ni blocs ni balisage à
 * interpréter. On rend donc un paragraphe par ligne vide, un `<br />` par
 * retour simple, et rien d'autre.
 *
 * `formatBody` de la maquette gère aussi `**gras**`, les listes `- `, les
 * mentions `@` et les liens. Aucun n'est repris, et c'est volontaire : rien
 * dans l'application ne peut les produire — le composer n'offre aucun outil de
 * mise en forme, et les 89 contenus de `backend/data/` n'en portent pas un
 * seul. Les rendre ferait disparaître des `**` tapés littéralement, ou
 * réordonnerait les lignes de l'auteur ; une mention demanderait en plus une
 * recherche de pseudo que le backend refuse d'exposer.
 *
 * Des éléments React, jamais `dangerouslySetInnerHTML` : React échappe par
 * construction, l'`esc()` de la maquette n'a donc pas d'équivalent ici.
 */
export const Prose = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const paragraphs = text
    .split(PARAGRAPH_BREAK)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "");

  return (
    <div
      className={cn(
        "max-w-[68ch] text-[15.5px] leading-[1.65] [overflow-wrap:anywhere] [&>p+p]:mt-[0.8em]",
        className,
      )}
    >
      {paragraphs.map((paragraph, index) => (
        <p key={index}>
          {paragraph.split("\n").map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {lineIndex > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
};
