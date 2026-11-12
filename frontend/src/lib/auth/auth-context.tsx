"use client";

import { createContext, use, useContext, useState } from "react";
import type { User } from "@/types/models";

/**
 * La session vit dans un cookie `httpOnly` : seul le serveur sait la lire. Le
 * layout crée donc la promesse et la passe sans l'attendre — un `await` là-bas
 * retiendrait toute l'application derrière la requête.
 *
 * `useAuth` la dénoue avec `use()`, ce qui suspend l'appelant : **tout composant
 * qui appelle `useAuth` doit vivre sous une frontière `<Suspense>`**, sinon c'est
 * la page entière qui attend. `useSetUser` existe pour ne pas imposer cela aux
 * composants qui écrivent la session sans la lire.
 */
type AuthContextValue = {
  sessionUser: Promise<User | null>;
  /**
   * Ce que le client sait de plus que le serveur. `undefined` signifie « rien à
   * signaler, garde la session du serveur », à distinguer de `null` : « visiteur ».
   */
  override: User | null | undefined;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({
  sessionUser,
  children,
}: {
  sessionUser: Promise<User | null>;
  children: React.ReactNode;
}) => {
  const [override, setOverride] = useState<User | null | undefined>(undefined);

  return (
    <AuthContext.Provider value={{ sessionUser, override, setUser: setOverride }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};

/** Suspend jusqu'à la lecture du cookie : réservé aux composants sous `<Suspense>`. */
export const useAuth = () => {
  const { sessionUser, override } = useAuthContext();
  const user = override === undefined ? use(sessionUser) : override;

  return { user, isAuth: user !== null };
};

/** Déclarer la session sans la lire, donc sans suspendre : ce dont la modale a besoin. */
export const useSetUser = () => useAuthContext().setUser;
