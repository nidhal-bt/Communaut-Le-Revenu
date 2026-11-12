"use client";

import { ErrorState } from "@/components/error-state";

/**
 * La frontière d'erreur de toutes les routes : aucune route n'en porte de plus
 * proche, le texte est donc indépendant de la route. Elle rend *dans* le layout,
 * donc le lecteur peut partir ailleurs même si la reprise échoue à son tour.
 *
 * `retry` et non `reset` : lui seul relit et refait le rendu du segment. Les deux
 * props sont celles de Next 16 — `{ error: unknown, retry }`, et non le
 * `{ error, reset }` d'avant.
 *
 * Pas de `console.error` : Next journalise déjà l'erreur serveur avec son empreinte.
 */
export default function RouteError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <ErrorState
      title="Cette page n’a pas pu être chargée"
      description="Quelque chose s’est mal passé de notre côté. Réessayez dans un instant."
      onRetry={retry}
    />
  );
}
