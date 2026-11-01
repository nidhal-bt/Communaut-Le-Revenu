"use client";

import { createContext, useContext, useState } from "react";

/** Shape of the Strapi users-permissions user returned by POST /api/auth/local. */
export type User = {
  id: number;
  documentId: string;
  username: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isAuth: boolean;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuth = user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuth, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};
