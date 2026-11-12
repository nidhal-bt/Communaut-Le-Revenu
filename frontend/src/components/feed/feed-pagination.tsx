"use client";

import { Fragment } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { feedHref, resolveFeedPage } from "@/lib/feed-url";

/** Deux voisines de chaque côté de la page courante : cinq numéros au plus. */
const NEIGHBOURS = 2;

/**
 * Un `Set` plutôt qu'un assemblage de plages : les trois morceaux se chevauchent
 * dès qu'on approche d'un bord, et c'est lui qui dédoublonne.
 */
const pagesToShow = (current: number, pageCount: number): number[] => {
  const pages = new Set<number>([1, pageCount]);

  for (let page = current - NEIGHBOURS; page <= current + NEIGHBOURS; page++) {
    if (page >= 1 && page <= pageCount) pages.add(page);
  }

  return [...pages].sort((a, b) => a - b);
};

/**
 * La page courante est relue de l'URL au lieu de descendre en prop, comme
 * `FeedTabs` le fait pour l'onglet. Ni `usePathname` ni `useSearchParams` ne sont
 * pré-rendables, mais la page entoure déjà tout `FeedSection` d'une frontière.
 */
export const FeedPagination = ({ pageCount }: { pageCount: number }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = resolveFeedPage(searchParams.get("page") ?? undefined);

  if (pageCount <= 1) return null;

  const hrefFor = (page: number) => feedHref(pathname, searchParams, { page });
  const pages = pagesToShow(current, pageCount);

  return (
    <Pagination>
      <PaginationContent>
        {/* Omis aux deux bords plutôt que rendus inertes : ce sont des liens,
            et un lien désactivé n'existe pas. */}
        {current > 1 && (
          <PaginationItem>
            <PaginationPrevious href={hrefFor(current - 1)} />
          </PaginationItem>
        )}

        {pages.map((page, index) => (
          <Fragment key={page}>
            {index > 0 && page - pages[index - 1] > 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink href={hrefFor(page)} isActive={page === current}>
                {page}
              </PaginationLink>
            </PaginationItem>
          </Fragment>
        ))}

        {current < pageCount && (
          <PaginationItem>
            <PaginationNext href={hrefFor(current + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
