"use client";

import { TriangleAlert } from "lucide-react";
import { StateCard } from "@/components/state-card";
import { Button } from "@/components/ui/button";

/**
 * L'état d'erreur, avec son bouton de reprise. Deux appelants : la frontière
 * des routes (`app/error.tsx`) et celle du layout (`app/global-error.tsx`).
 */
export const ErrorState = ({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry: () => void;
}) => (
  <StateCard
    icon={<TriangleAlert className="size-5" />}
    title={title}
    description={description}
    action={
      <Button size="lg" className="h-10 px-4" onClick={onRetry}>
        Réessayer
      </Button>
    }
  />
);
