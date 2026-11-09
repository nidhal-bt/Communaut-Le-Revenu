"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Le `.toast` de la maquette, monté une seule fois dans `layout.tsx` : fond de
 * verre flouté, filet, ombre portée, 380px au plus.
 *
 * Deux écarts avec le composant généré par shadcn. `next-themes` en est
 * retiré : l'application n'a pas de mode sombre, donc pas de fournisseur de
 * thème, et `theme="system"` laissait sonner suivre `prefers-color-scheme` et
 * poser une notification sombre sur une page claire. Et la classe `cn-toast`
 * de son `toastOptions`, que rien ne définit dans `globals.css`, est tombée
 * avec.
 *
 * Le fond passe par les variables de sonner et non par une classe `bg-*` :
 * lui-même pose `background: var(--normal-bg)` sur la notification, et les
 * deux sélecteurs ont le même poids — la classe ne gagnerait que par l'ordre
 * des feuilles de style.
 */
const Toaster = ({ toastOptions, ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group"
    icons={{
      success: <CircleCheckIcon className="size-4 text-success" />,
      info: <InfoIcon className="size-4 text-primary-text" />,
      warning: <TriangleAlertIcon className="size-4 text-foreground-secondary" />,
      error: <OctagonXIcon className="size-4 text-destructive" />,
      loading: <Loader2Icon className="size-4 animate-spin" />,
    }}
    style={
      {
        "--normal-bg": "var(--glass-strong)",
        "--normal-text": "var(--foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
        "--width": "380px",
      } as React.CSSProperties
    }
    toastOptions={{
      ...toastOptions,
      classNames: {
        toast: cn(
          "text-sm shadow-float backdrop-blur-xl backdrop-saturate-[1.8]",
          toastOptions?.classNames?.toast,
        ),
        ...toastOptions?.classNames,
      },
    }}
    {...props}
  />
);

export { Toaster };
