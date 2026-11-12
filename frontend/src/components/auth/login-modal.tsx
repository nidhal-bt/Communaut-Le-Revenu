"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/lib/auth/actions";
import { useSetUser } from "@/lib/auth/auth-context";

/** Partagés avec la carte du rail droit, pour que les deux ne divergent pas. */
export const BENEFITS = [
  "Posez vos questions d'argent aux lecteurs et à la rédaction",
  "Suivez les discussions qui vous concernent",
  "Gagnez des badges en aidant les autres",
];

type LoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const setUser = useSetUser();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  /**
   * Le formulaire n'est pas contrôlé : `loginAction` lit le `FormData`, pose le
   * cookie côté serveur et renvoie le membre — le mot de passe ne part donc jamais
   * du navigateur vers Strapi.
   *
   * Appel impératif plutôt que `action={...}` : on fait trois choses du résultat,
   * et aucune ne demande un effet.
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await loginAction(formData);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      /* Le serveur vient d'écrire le cookie ; le dire au contexte évite de
         recharger la page pour que l'en-tête et le fil basculent. */
      setUser(result.user);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-32px)] max-w-[min(440px,calc(100%-2rem))] gap-0 overflow-auto p-0 sm:max-w-[min(440px,calc(100%-2rem))]"
      >
        <div className="flex items-start justify-between gap-3 px-[22px] pt-[18px]">
          <DialogTitle className="text-[23px] leading-tight font-bold tracking-[-0.01em]">
            Rejoindre la communauté
          </DialogTitle>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Fermer"
                className="-mr-1 flex-none text-foreground-secondary"
              />
            }
          >
            <X />
          </DialogClose>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-[22px] pt-4 pb-[22px]"
        >
          {/* Étape 1 sur 2 : le choix des centres d'intérêt suivra. */}
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-1 flex-1 rounded-full bg-primary" />
            <span className="h-1 flex-1 rounded-full bg-accent-strong" />
          </div>

          <ul className="flex flex-col gap-[7px] text-sm text-foreground-secondary">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-2">
                <Check className="mt-0.5 size-4 flex-none text-success" />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 rounded-sm border border-border bg-muted px-3.5 py-3">
            <span
              aria-hidden
              className="grid size-[38px] flex-none place-items-center rounded-[9px] bg-primary text-[20px] leading-none font-black tracking-[-0.02em] text-primary-foreground shadow-gloss"
            >
              R
            </span>
            <span>
              <b className="text-sm font-semibold">Votre compte lerevenu.com</b>
              <small className="block text-[12.5px] text-muted-foreground">
                Le même identifiant que pour le site et le magazine
              </small>
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-sm font-semibold">
              Adresse e-mail
            </label>
            <Input
              id="login-email"
              name="identifier"
              type="email"
              autoComplete="email"
              autoFocus
              required
              className="h-10 rounded-sm px-3"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-sm font-semibold">
              Mot de passe
            </label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-10 rounded-sm px-3"
            />
          </div>

          {/* `role="alert"` : l'échec arrive après l'envoi, un lecteur d'écran
              doit l'entendre sans avoir à repartir en exploration. */}
          {error !== null && (
            <p
              role="alert"
              className="rounded-sm bg-destructive-soft px-3 py-2.5 text-[13px] font-medium text-destructive"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="h-10 w-full"
          >
            {pending ? "Connexion…" : "Continuer"}
          </Button>

          {/* L'inscription n'existe pas encore : simple libellé, pas de lien. */}
          <p className="text-center text-[12.5px] text-muted-foreground">
            Pas encore de compte ?{" "}
            <span className="font-semibold text-primary-text">
              Créer un compte gratuit
            </span>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
