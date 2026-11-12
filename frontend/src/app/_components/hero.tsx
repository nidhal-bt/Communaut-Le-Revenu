"use client";

import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/login-modal";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * Réservé aux visiteurs : connecté, la maquette remplace le hero par un « Bonjour
 * {prénom} » pas encore implémenté, la section disparaît donc.
 *
 * Compteurs de la maquette, en attendant que Strapi serve les totaux réels. Les
 * nombres portent une espace fine insécable (U+202F) : convention française, et
 * cela évite qu'un nombre soit coupé en fin de ligne.
 */
const STATS = [
  { value: "4 812", label: "membres" },
  { value: "1 808", label: "discussions" },
  { value: "13 700", label: "réponses" },
  { value: "94 %", label: "des questions résolues" },
];

const HeroBody = () => {
  const { isAuth } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  if (isAuth) {
    return null;
  }

  return (
    <>
      <section className="relative grid grid-cols-[minmax(0,1fr)] items-end gap-x-6 gap-y-[18px] overflow-hidden rounded-[16px] bg-gradient-hero px-5 py-[22px] text-hero-foreground shadow-float min-[761px]:grid-cols-[minmax(0,1fr)_auto] min-[761px]:rounded-[18px] min-[761px]:px-7 min-[761px]:pt-7 min-[761px]:pb-6">
        <div>
          <h1 className="max-w-[22ch] font-heading text-[25px] leading-[1.12] font-bold tracking-[-0.01em] min-[761px]:text-[32px]">
            La communauté des lecteurs du Revenu
          </h1>
          <p className="mt-2 max-w-[52ch] text-hero-foreground/78">
            Posez vos questions d’argent, partagez vos expériences et échangez
            avec la rédaction. Bourse, épargne, impôts, retraite, transmission.
          </p>
          <div className="mt-4 flex flex-wrap gap-[22px] text-[13px] opacity-90">
            {STATS.map(({ value, label }) => (
              <span key={label}>
                <b className="block text-[20px] font-bold tabular-nums">
                  {value}
                </b>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-2 min-[761px]:flex-col">
          <Button
            size="lg"
            className="px-4"
            onClick={() => setLoginOpen(true)}
          >
            Rejoindre gratuitement
          </Button>
          {/* « Explorer les espaces » reste présentationnel : aucun `href`. */}
          <Button
            variant="ghost"
            size="lg"
            className="border-hero-foreground/18 bg-hero-foreground/14 px-4 text-hero-foreground backdrop-blur-[10px] hover:bg-hero-foreground/24 hover:text-hero-foreground"
          >
            Explorer les espaces
          </Button>
        </div>
      </section>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
};

/**
 * Le hero n'existe que pour un visiteur : un repli vide est exactement ce qu'un
 * membre verra de toute façon.
 */
export const Hero = () => (
  <Suspense fallback={null}>
    <HeroBody />
  </Suspense>
);
