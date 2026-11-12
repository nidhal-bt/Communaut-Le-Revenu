"use client";

import { Plus } from "lucide-react";
import { ComposerTrigger } from "@/components/composer/composer-trigger";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/models";

type PublishButtonProps = {
  categories: Category[];
  label: string;
  /** `documentId` de l'espace à présélectionner. Sinon déduit de l'URL. */
  defaultCategory?: string;
  className?: string;
};

export const PublishButton = ({
  categories,
  label,
  defaultCategory,
  className,
}: PublishButtonProps) => (
  <ComposerTrigger categories={categories} defaultCategory={defaultCategory}>
    {(openComposer) => (
      <Button size="lg" className={className} onClick={() => openComposer()}>
        <Plus />
        {label}
      </Button>
    )}
  </ComposerTrigger>
);

export const PublishButtonSkeleton = () => (
  <span aria-hidden className="h-9 w-[132px] flex-none rounded-lg bg-accent" />
);
