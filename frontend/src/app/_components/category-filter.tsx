"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ScrollRail } from "@/components/scroll-rail";
import { SpaceTile } from "@/components/space-tile";
import { feedHref } from "@/lib/feed-url";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/models";

const CHIP =
  "inline-flex flex-none items-center gap-2 rounded-full border bg-card px-[13px] py-1.5 text-[13.5px] font-medium whitespace-nowrap text-foreground-secondary shadow-lift hover:border-border-strong hover:text-foreground";

const CHIP_SELECTED =
  "border-primary bg-surface-brand font-semibold text-primary-text";

/** L'espace actif se lit dans l'URL : une adresse partagée rouvre le même fil. */
export const CategoryFilter = ({ categories }: { categories: Category[] }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";

  const hrefFor = (slug: string) =>
    feedHref(pathname, searchParams, { category: slug });

  return (
    <ScrollRail
      label="Filtrer par espace"
      className="gap-2"
      trackClassName="gap-2"
    >
      <Link
        href={hrefFor("")}
        aria-current={active === "" ? "page" : undefined}
        className={cn(CHIP, active === "" && CHIP_SELECTED)}
      >
        Tous les espaces
      </Link>

      {categories.map((category) => (
        <Link
          key={category.documentId}
          href={hrefFor(category.slug)}
          aria-current={active === category.slug ? "page" : undefined}
          className={cn(CHIP, active === category.slug && CHIP_SELECTED)}
        >
          <SpaceTile category={category} size={18} />
          {category.name}
        </Link>
      ))}
    </ScrollRail>
  );
};

export const CategoryFilterSkeleton = () => (
  <div aria-hidden className="no-scrollbar flex gap-2 overflow-x-auto">
    {[112, 148, 132, 96, 140].map((width, index) => (
      <span
        key={index}
        style={{ width: `${width}px` }}
        className="h-[34px] flex-none rounded-full bg-accent"
      />
    ))}
  </div>
);

