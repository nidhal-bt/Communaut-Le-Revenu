"use client";

import { Suspense, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BENEFITS, LoginModal } from "@/components/auth/login-modal";
import { useAuth } from "@/lib/auth/auth-context";
import { RailCard } from "./rail-card";

/**
 * Carte d'inscription, réservée aux visiteurs. Connecté, la maquette met « Votre
 * progression » à cette place — pas encore implémenté, la carte disparaît donc
 * sans rien afficher à la place, comme le hero.
 *
 * Les avantages sont ceux de la modale de connexion : les deux vendent la même
 * chose, autant ne pas les laisser diverger.
 */
const JoinCardBody = () => {
  const { isAuth } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  if (isAuth) {
    return null;
  }

  return (
    <>
      <RailCard className="bg-gradient-join">
        <h3 className="font-heading text-[19px] leading-tight font-bold tracking-[-0.01em]">
          Rejoignez la communauté
        </h3>
        <p className="mt-1.5 text-sm text-foreground-secondary">
          Avec votre compte lerevenu.com, gratuitement.
        </p>

        <ul className="mt-2.5 mb-3.5 flex flex-col gap-1.5 text-sm text-foreground-secondary">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 flex-none text-primary-text" />
              {benefit}
            </li>
          ))}
        </ul>

        <Button
          size="lg"
          className="h-10 w-full"
          onClick={() => setLoginOpen(true)}
        >
          Rejoindre la communauté
        </Button>
      </RailCard>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
};

/**
 * Même raison que le hero : `useAuth` suspend, la carte ne s'affiche que pour
 * un visiteur, donc le repli vide est l'état final d'un membre.
 */
export const JoinCard = () => (
  <Suspense fallback={null}>
    <JoinCardBody />
  </Suspense>
);
