"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Bell, House, LayoutGrid, Plus, User } from "lucide-react";
import { LoginModal } from "@/components/auth/login-modal";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

/**
 * Barre de navigation basse de la maquette (`#bnav`), affichée seulement sur
 * mobile : le rail gauche la remplace à partir de `md`. Le `pb-24` de la
 * grille du layout dégage la hauteur qu'elle occupe.
 *
 * La maquette bascule à 760px, on garde `md:` (768px) comme `side-nav.tsx`
 * pour que les deux navigations s'échangent au même point de rupture.
 *
 * Seule la route « / » existe pour l'instant : les autres liens sont des
 * emplacements. À remplacer par les vraies routes, et `active` sera alors
 * déduit de `usePathname()` plutôt que codé en dur.
 */
const LINKS = [
  { href: "/", label: "Accueil", icon: House, active: true },
  { href: "#", label: "Espaces", icon: LayoutGrid, active: false },
];

/** Gabarit commun des cinq cellules de la barre. */
const CELL =
  "flex min-w-[56px] flex-col items-center gap-0.5 px-2 py-1 text-[11px] text-muted-foreground";

/**
 * Les deux cellules de droite sont les seules à dépendre de la session : les
 * isoler évite que `useAuth` retienne les liens et le bouton de publication.
 */
const AccountCells = () => {
  const { isAuth } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const openLogin = () => setLoginOpen(true);

  return (
    <>
      {/* Pas de badge de non-lus : aucune source de notifications. */}
      <button
        type="button"
        className={CELL}
        onClick={isAuth ? undefined : openLogin}
      >
        <Bell className="size-[18px] flex-none" />
        Activité
      </button>

      {isAuth ? (
        <Link href="#" className={CELL}>
          <User className="size-[18px] flex-none" />
          Profil
        </Link>
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

/** Deux cellules muettes, aux mêmes dimensions, le temps de lire le cookie. */
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

export const BottomNav = () => (
  <nav
    aria-label="Navigation mobile"
    className="fixed inset-x-0 bottom-0 z-[45] flex items-center justify-around border-t bg-glass px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] backdrop-blur-xl backdrop-saturate-[1.8] md:hidden"
  >
    {LINKS.map(({ href, label, icon: Icon, active }) => (
      <Link
        key={label}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(CELL, active && "font-semibold text-primary-text")}
      >
        <Icon className="size-[18px] flex-none" />
        {label}
      </Link>
    ))}

    {/* Présentationnel : aucun flux de publication n'existe encore, comme
        le bouton « Publier » de l'en-tête. */}
    <button
      type="button"
      aria-label="Publier"
      className="-mt-[18px] grid size-12 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-brand"
    >
      <Plus className="size-6" />
    </button>

    <Suspense fallback={<AccountCellsSkeleton />}>
      <AccountCells />
    </Suspense>
  </nav>
);
