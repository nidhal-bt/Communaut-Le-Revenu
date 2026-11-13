"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, House, LayoutGrid, Plus, User, type LucideIcon } from "lucide-react";
import { AccountMenuCell } from "@/components/auth/account-menu";
import { LoginModal } from "@/components/auth/login-modal";
import { ComposerTrigger } from "@/components/composer/composer-trigger";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/models";

/**
 * Affichée seulement sur mobile ; le `pb-24` de la grille du layout dégage sa
 * hauteur. La maquette bascule à 760px, on garde `md:` (768px) comme
 * `side-nav.tsx` pour que les deux navigations s'échangent au même point.
 */
const LINKS = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/espaces", label: "Espaces", icon: LayoutGrid },
];

const CELL =
  "flex min-w-[56px] flex-col items-center gap-0.5 px-2 py-1 text-[11px] text-muted-foreground";

const FAB =
  "-mt-[18px] grid size-12 flex-none place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-brand cursor-pointer";

type CellLink = { href: string; label: string; icon: LucideIcon };

const NavCellShell = ({
  href,
  label,
  icon: Icon,
  active,
}: CellLink & { active: boolean }) => (
  <Link
    href={href}
    aria-current={active ? "page" : undefined}
    className={cn(CELL, active && "font-semibold text-primary-text")}
  >
    <Icon className="size-[18px] flex-none" />
    {label}
  </Link>
);

const ActiveNavCell = (props: CellLink) => (
  <NavCellShell {...props} active={usePathname() === props.href} />
);

/**
 * Comme `nav-link.tsx` : `usePathname` est une donnée de requête, qui bloque le
 * pré-rendu si elle n'est pas isolée. Le repli est la cellule non surlignée.
 */
const NavCell = (props: CellLink) => (
  <Suspense fallback={<NavCellShell {...props} active={false} />}>
    <ActiveNavCell {...props} />
  </Suspense>
);

/**
 * Ce bouton porte la publication sous `md`, où les raccourcis de la barre de
 * l'accueil disparaissent.
 */
const PublishCell = ({ categories }: { categories: Promise<Category[]> }) => (
  <ComposerTrigger categories={use(categories)}>
    {(openComposer) => (
      <button
        type="button"
        aria-label="Publier"
        onClick={() => openComposer()}
        className={FAB}
      >
        <Plus className="size-6" />
      </button>
    )}
  </ComposerTrigger>
);

const PublishCellSkeleton = () => <span aria-hidden className={FAB} />;

/** Les isoler évite que `useAuth` retienne les liens et le bouton de publication. */
const AccountCells = () => {
  const { isAuth } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const openLogin = () => setLoginOpen(true);

  return (
    <>
      {/* Emplacement : aucune source de notifications n'existe encore. */}
      <button
        type="button"
        className={CELL}
        onClick={isAuth ? undefined : openLogin}
      >
        <Bell className="size-[18px] flex-none" />
        Activité
      </button>

      {/* Aucune route `/profil` n'existe : la cellule ouvre le menu de compte au
          lieu de naviguer. C'est la seule sortie de session sous `md`, l'en-tête
          qui porte la pastille étant masqué. */}
      {isAuth ? (
        <AccountMenuCell className={CELL} />
      ) : (
        <button type="button" className={CELL} onClick={openLogin}>
          <User className="size-[18px] flex-none" />
          Connexion
        </button>
      )}

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
};

const AccountCellsSkeleton = () => (
  <>
    {[0, 1].map((index) => (
      <span key={index} aria-hidden className={CELL}>
        <span className="size-[18px] rounded-full bg-accent" />
        <span className="my-[3px] h-2 w-11 rounded-full bg-accent" />
      </span>
    ))}
  </>
);

export const BottomNav = ({
  categories,
}: {
  categories: Promise<Category[]>;
}) => (
  <nav
    aria-label="Navigation mobile"
    className="fixed inset-x-0 bottom-0 z-[45] flex items-center justify-around border-t bg-glass px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] backdrop-blur-xl backdrop-saturate-[1.8] md:hidden"
  >
    {LINKS.map((link) => (
      <NavCell key={link.label} {...link} />
    ))}

    <Suspense fallback={<PublishCellSkeleton />}>
      <PublishCell categories={categories} />
    </Suspense>

    <Suspense fallback={<AccountCellsSkeleton />}>
      <AccountCells />
    </Suspense>
  </nav>
);
