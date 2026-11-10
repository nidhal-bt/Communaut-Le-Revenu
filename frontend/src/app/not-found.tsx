import type { Metadata } from "next";
import Link from "next/link";
import { StateCard } from "@/components/state-card";
import { Button } from "@/components/ui/button";

/**
 * Le 404 de toute l'application : ce fichier répond aussi bien aux `notFound()`
 * des pages d'espace et de discussion qu'à une URL que rien ne route.
 *
 * `global-not-found.tsx` est écarté : encore expérimental, il demande le drapeau
 * `experimental.globalNotFound` et contourne le layout — il faudrait y réimporter
 * styles et polices pour rien, l'application n'ayant qu'un seul layout racine.
 */
export const metadata: Metadata = {
  title: "Page introuvable",
};

export default function NotFound() {
  return (
    <StateCard
      title="Cette page n’existe pas"
      description="Le lien est peut-être ancien, ou l’adresse mal recopiée."
      action={
        <>
          <Button size="lg" className="h-10 px-4" render={<Link href="/" />}>
            Retour à l’accueil
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-10 px-4"
            render={<Link href="/espaces" />}
          >
            Voir les espaces
          </Button>
        </>
      }
    />
  );
}
