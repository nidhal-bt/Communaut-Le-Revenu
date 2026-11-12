"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/auth/account-menu";
import { LoginModal } from "@/components/auth/login-modal";
import { PublishButton } from "@/components/composer/publish-button";
import { useAuth } from "@/lib/auth/auth-context";
import type { Category } from "@/types/models";

/** Logotype reconstitué d'après lerevenu.com, à remplacer par le SVG officiel. */
const Wordmark = () => (
  <span
    aria-hidden
    className="inline-flex items-stretch bg-primary p-[0.1em] text-[22px]"
  >
    <span className="mr-[0.12em] bg-wordmark-ink px-[0.1em] pt-[0.1em] pb-[0.12em] font-sans text-[1em] leading-none font-black tracking-[-0.02em] text-primary-foreground">
      LE
    </span>
    <span className="px-[0.1em] pt-[0.1em] pb-[0.12em] font-sans text-[1em] leading-none font-black tracking-[-0.02em] text-primary-foreground">
      REVENU
    </span>
  </span>
);

/**
 * Le seul bloc de l'en-tête qui dépend de la session, isolé pour cette raison : le
 * logotype et la recherche n'ont aucune raison d'attendre le cookie. La liste des
 * espaces se dénoue sous la même frontière, pour ne pas attendre deux fois.
 */
const NavbarActions = ({
  categories,
}: {
  categories: Promise<Category[]>;
}) => {
  const { user, isAuth } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  if (isAuth && user) {
    return (
      <>
        <PublishButton label="Publier" categories={use(categories)} />
        {/* Emplacement : aucune source de notifications n'existe encore. */}
        <button
          type="button"
          aria-label="Notifications"
          className="grid size-9 place-items-center rounded-[9px] text-foreground-secondary hover:bg-accent hover:text-foreground"
        >
          <Bell className="size-[18px]" />
        </button>
        <AccountMenu user={user} />
      </>
    );
  }

  return (
    <>
      <Button variant="ghost" size="lg" onClick={() => setLoginOpen(true)}>
        Se connecter
      </Button>
      <Button size="lg" className="px-4" onClick={() => setLoginOpen(true)}>
        Rejoindre
      </Button>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
};

/** Deux pastilles de la hauteur des boutons, pour que rien ne saute. */
const NavbarActionsSkeleton = () => (
  <>
    <span aria-hidden className="h-9 w-[104px] rounded-[10px] bg-accent" />
    <span aria-hidden className="h-9 w-[88px] rounded-[10px] bg-accent" />
  </>
);

export const Navbar = ({
  categories,
}: {
  categories: Promise<Category[]>;
}) => (
  <header className="sticky top-0 z-40 border-b bg-glass backdrop-blur-xl backdrop-saturate-[1.8]">
    <div className="mx-auto flex h-[62px] max-w-[1260px] items-center gap-5 px-4">
      <Link
        href="/"
        aria-label="Le Revenu, accueil de la communauté"
        className="flex flex-none items-center gap-2.5"
      >
        <Wordmark />
        <span className="h-5 w-px bg-border-strong" />
        <span className="text-[15px] font-semibold text-foreground-secondary">
          Communauté
        </span>
      </Link>

      {/* Un `form` nu : la soumission native emmène `q` sur /recherche, sans
          `useRouter` ni gestionnaire. */}
      <form
        action="/recherche"
        role="search"
        className="hidden h-9 max-w-[420px] flex-1 items-center gap-2 rounded-[10px] border border-transparent bg-accent px-3 text-sm text-muted-foreground focus-within:border-primary focus-within:bg-card focus-within:ring-3 focus-within:ring-ring/25 min-[860px]:flex"
      >
        <Search className="size-[18px] flex-none" />
        <input
          type="search"
          name="q"
          aria-label="Rechercher"
          placeholder="Rechercher une discussion, un sujet…"
          className="h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
        />
      </form>

      <div className="ml-auto flex items-center gap-2.5">
        <Suspense fallback={<NavbarActionsSkeleton />}>
          <NavbarActions categories={categories} />
        </Suspense>
      </div>
    </div>
  </header>
);
