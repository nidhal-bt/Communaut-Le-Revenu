"use client";

import { ErrorState } from "@/components/error-state";
import "./globals.css";

/**
 * Le dernier recours : `error.tsx` n'entoure pas le layout de son propre segment,
 * donc un layout qui lève n'est rattrapé que par ce fichier. Il remplace le
 * document entier, d'où le `<html>` et le `<body>`.
 *
 * `globals.css` est importé ici parce que ce document n'hérite pas des styles de
 * l'application. Un fichier client ne peut pas exporter `metadata`, le titre passe
 * donc par l'élément `<title>`. Et pas de `next/font` : les variables de police
 * vivent sur le `<html>` du layout, que l'on vient de perdre.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="fr">
      <body className="grid min-h-screen place-items-center bg-background p-4 text-foreground antialiased">
        <title>Une erreur est survenue — Communauté Le Revenu</title>

        <div className="w-full max-w-[440px]">
          <ErrorState
            title="L’application n’a pas pu démarrer"
            description="Une erreur est survenue avant l’affichage de la page. Réessayez dans un instant."
            onRetry={retry}
          />
        </div>
      </body>
    </html>
  );
}
