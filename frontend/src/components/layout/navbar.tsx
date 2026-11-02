"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/login-modal";
import { useAuth } from "@/lib/auth/auth-context";
import type { User } from "@/types/models";

/**
 * Logotype reconstitué d'après la home de lerevenu.com : un bloc rouge
 * contenant « LE » sur fond noir puis « REVENU ».
 * À remplacer par le SVG officiel à l'intégration.
 */
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

const initial = (username: string) => username.trim().charAt(0).toUpperCase();

const AccountPill = ({ user }: { user: User }) => (
  <button
    type="button"
    aria-label="Mon compte"
    className="flex items-center gap-2 rounded-full border bg-card py-[3px] pr-2.5 pl-[3px] shadow-lift hover:bg-secondary"
  >
    <span className="grid size-[30px] place-items-center rounded-full bg-avatar-5 text-[11.5px] font-semibold text-primary-foreground">
      {initial(user.username)}
    </span>
    <span className="text-[12.5px] font-semibold text-foreground-secondary">
      {user.username}
    </span>
  </button>
);

export const Navbar = () => {
  const { user, isAuth } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
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

          {/* Présentationnel : la recherche n'est pas encore branchée. */}
          <div className="hidden h-9 max-w-[420px] flex-1 items-center gap-2 rounded-[10px] border border-transparent bg-accent px-3 text-sm text-muted-foreground focus-within:border-primary focus-within:bg-card focus-within:ring-3 focus-within:ring-ring/25 min-[860px]:flex">
            <Search className="size-[18px] flex-none" />
            <input
              type="search"
              aria-label="Rechercher"
              placeholder="Rechercher une discussion, un sujet…"
              className="h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {isAuth && user ? (
              <>
                <Button size="lg">
                  <Plus />
                  Publier
                </Button>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="grid size-9 place-items-center rounded-[9px] text-foreground-secondary hover:bg-accent hover:text-foreground"
                >
                  <Bell className="size-[18px]" />
                </button>
                <AccountPill user={user} />
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setLoginOpen(true)}
                >
                  Se connecter
                </Button>
                <Button size="lg" className="px-4"  onClick={() => setLoginOpen(true)}>
                  Rejoindre
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
};
