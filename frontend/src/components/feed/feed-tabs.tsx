"use client";

import { Suspense } from "react";
import Link from "next/link";
import { redirect, usePathname, useSearchParams } from "next/navigation";
import { ScrollRail } from "@/components/scroll-rail";
import { useAuth } from "@/lib/auth/auth-context";
import {
  DEFAULT_FEED_TAB,
  FEED_TABS,
  isMemberFeedTab,
  resolveFeedTab,
  type FeedTab,
  type FeedTabKey,
} from "@/lib/feed-tabs";
import { feedHref } from "@/lib/feed-url";
import { cn } from "@/lib/utils";

/** Le `seg` de la maquette, partagé avec le sélecteur de densité. */
export const SEGMENT_RAIL = "gap-0.5 rounded-md bg-accent p-[3px]";
export const SEGMENT_SELECTED = "bg-card text-foreground shadow-thumb";

const PUBLIC_TABS = FEED_TABS.filter((tab) => !tab.memberOnly);
const MEMBER_TABS = FEED_TABS.filter((tab) => tab.memberOnly);

type TabLinkProps = {
  tab: FeedTab;
  href: string;
  selected: boolean;
};

const TabLink = ({ tab, href, selected }: TabLinkProps) => {
  const { label, icon: Icon } = tab;

  return (
    <Link
      href={href}
      aria-current={selected ? "page" : undefined}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center gap-[7px] rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap text-foreground-secondary transition-[background-color,box-shadow,color] hover:text-foreground sm:px-3.5",
        selected && cn(SEGMENT_SELECTED, "font-semibold"),
      )}
    >
      <Icon className="size-[18px] flex-none" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
};

type MemberTabsProps = {
  category?: string;
  activeTab: FeedTabKey;
  hrefFor: (key: FeedTabKey) => string;
};

/**
 * Le garde-fou double celui de `FeedSection`, et pour une autre raison : là-bas
 * c'est l'URL tapée à la main qui est rattrapée, ici c'est `isAuth` qui retombe à
 * faux après coup — une déconnexion ne redemande rien au serveur, et le fil du
 * membre resterait à l'écran sous une URL devenue invalide.
 */
const MemberTabs = ({ category, activeTab, hrefFor }: MemberTabsProps) => {
  const { isAuth } = useAuth();

  if (!isAuth && isMemberFeedTab(activeTab)) redirect(hrefFor(DEFAULT_FEED_TAB));
  if (!isAuth || category) return null;

  return (
    <>
      {MEMBER_TABS.map((tab) => (
        <TabLink
          key={tab.key}
          tab={tab}
          href={hrefFor(tab.key)}
          selected={tab.key === activeTab}
        />
      ))}
    </>
  );
};

/**
 * `useAuth` suspend : la frontière n'entoure donc que l'onglet membre, et les
 * onglets publics s'hydratent sans l'attendre. Son repli est vide — un visiteur,
 * cas le plus courant, ne verra jamais rien apparaître, là où un gabarit de largeur
 * fixe ferait sauter la barre à chaque visite.
 */
export const FeedTabs = ({ category }: { category?: string }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = resolveFeedTab(searchParams.get("tab") ?? undefined);

  /* `feedHref` tient les deux règles de l'adresse : l'onglet par défaut ne porte
     pas de query, et changer d'onglet repart de la première page. */
  const hrefFor = (key: FeedTabKey) =>
    feedHref(pathname, searchParams, { tab: key });

  return (
    <ScrollRail
      label="Tri du fil"
      className={cn("inline-flex max-w-full self-start", SEGMENT_RAIL)}
      trackClassName="gap-0.5"
    >
      <Suspense fallback={null}>
        <MemberTabs
          category={category}
          activeTab={activeTab}
          hrefFor={hrefFor}
        />
      </Suspense>

      {PUBLIC_TABS.map((tab) => (
        <TabLink
          key={tab.key}
          tab={tab}
          href={hrefFor(tab.key)}
          selected={tab.key === activeTab}
        />
      ))}
    </ScrollRail>
  );
};

export const FeedTabsSkeleton = () => (
  <span
    aria-hidden
    className="h-[38px] w-[170px] max-w-full rounded-md bg-accent sm:w-[340px]"
  />
);
