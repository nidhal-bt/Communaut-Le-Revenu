"use client";

import { ErrorState } from "@/components/error-state";

/**
 * La frontière d'erreur de toutes les routes : une erreur non rattrapée remonte
 * à la plus proche, et aucune route n'en porte de plus proche que celle-ci. Le
 * texte est donc indépendant de la route.
 *
 * Elle rend *dans* le layout : l'en-tête et les rails restent en place, donc le
 * lecteur peut partir ailleurs même si la reprise échoue à son tour.
 *
 * `retry` et non `reset` : lui seul relit et refait le rendu du segment, là où
 * `reset` ne vide que l'état de la frontière. Les deux props sont celles de Next
 * 16 — `{ error: unknown, retry }`, et non le `{ error, reset }` d'avant
 * (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`).
 *
 * Pas de `console.error` ni de rapport : Next journalise déjà l'erreur serveur
 * avec son empreinte, et aucun service ne la recevrait ici.
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
