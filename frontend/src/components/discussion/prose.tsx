import { Fragment } from "react";
import { cn } from "@/lib/utils";

const PARAGRAPH_BREAK = /\n\s*\n/;

/**
 * `content` est une colonne `text` : il n'y a ni blocs ni balisage à interpréter.
 * Un paragraphe par ligne vide, un `<br />` par retour simple, rien d'autre.
 *
 * `formatBody` de la maquette gère aussi `**gras**`, les listes, les mentions et
 * les liens. Aucun n'est repris, et c'est volontaire : rien dans l'application ne
 * peut les produire, et les rendre ferait disparaître des `**` tapés littéralement.
 *
 * Des éléments React, jamais `dangerouslySetInnerHTML` : React échappe par
 * construction.
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
