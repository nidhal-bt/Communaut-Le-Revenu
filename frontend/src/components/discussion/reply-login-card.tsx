"use client";

import { useState } from "react";
import { LoginModal } from "@/components/auth/login-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { POST_SHELL } from "./post-shell";

/**
 * `LoginModal` déclare le membre au contexte : le formulaire de réponse prend donc
 * la place de cette carte sans rechargement.
 */
export const ReplyLoginCard = () => {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          POST_SHELL,
          "flex flex-col items-center gap-2.5 p-[26px_20px] text-center",
        )}
      >
        <h3 className="font-heading text-[19px] font-bold tracking-[-0.01em]">
          Vous avez un avis ou une expérience à partager ?
        </h3>

        <p className="text-sm text-foreground-secondary">
          Rejoignez la communauté avec votre compte lerevenu.com.
        </p>

        <Button
          size="lg"
          className="h-10 px-4"
          onClick={() => setLoginOpen(true)}
        >
          Se connecter pour répondre
        </Button>
      </div>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
};
