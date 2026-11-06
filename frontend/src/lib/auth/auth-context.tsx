"use client";

import { createContext, use, useContext, useState } from "react";
import type { User } from "@/types/models";

/**
 * Qui est connecté, pour les composants client.
 *
 * La session vit dans un cookie `httpOnly` : seul le serveur sait la lire. Le
 * layout crée donc la promesse (`getSessionUser()`) et la passe telle quelle,
 * sans l'attendre — un `await` dans le layout retiendrait toute l'application
 * derrière la requête. `useAuth` la dénoue avec `use()`, ce qui suspend
 * l'appelant : **tout composant qui appelle `useAuth` doit vivre sous une
 * frontière `<Suspense>`**, sinon c'est la page entière qui attend.
 *
 * C'est le motif décrit par
 * `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.
 */
type AuthContextValue = {
  /** Résolue par le serveur à chaque requête, à partir du cookie de session. */
  sessionUser: Promise<User | null>;
  /**
   * Ce que le client sait de plus que le serveur. `undefined` signifie « rien
   * à signaler, garde la session du serveur » — à distinguer de `null`, qui
   * veut dire « visiteur ».
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

/**
 * Déclarer la session sans la lire, donc sans suspendre. C'est ce dont la
 * modale de connexion a besoin : `loginAction` vient de poser le cookie côté
 * serveur et renvoie le membre, l'interface doit basculer sans recharger.
 */
export const useSetUser = () => useAuthContext().setUser;
