"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { useSetUser } from "@/lib/auth/auth-context";
import type { User } from "@/types/models";

const initial = (username: string) => username.trim().charAt(0).toUpperCase();

/**
 * La pastille de compte de l'en-tête, et son menu : un seul article, « Se
 * déconnecter ».
 *
 * Le `meMenu()` de la maquette en porte six autres — profil, badges, photo,
 * classement… — qui n'ont aucun écran derrière eux pour l'instant. Un article
 * qui ne mène nulle part est une régression d'accessibilité, comme l'était
 * « Lire la charte » dans le composer : ils attendront leurs pages.
 *
 * `Menu` de Base UI, déjà la dépendance de `ui/dialog.tsx`, plutôt qu'un
 * `useState` et un écouteur de clic au document : la fermeture sur `Échap` et
 * au clic dehors, le focus rendu au déclencheur et la navigation aux flèches
 * viennent avec.
 */
export const AccountMenu = ({ user }: { user: User }) => {
  const setUser = useSetUser();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  /* L'action a vidé le cookie côté serveur ; le dire au contexte fait
     rebasculer l'en-tête et le fil en visiteur sans recharger, et `refresh()`
     redemande au serveur ce qui dépendait de la session. */
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setUser(null);
      router.refresh();
    });
  };

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <button
            type="button"
            aria-label="Mon compte"
            className="flex items-center gap-2 rounded-full border bg-card py-[3px] pr-2.5 pl-[3px] shadow-lift hover:bg-secondary"
          />
        }
      >
        <span className="grid size-[30px] place-items-center rounded-full bg-avatar-5 text-[11.5px] font-semibold text-primary-foreground">
          {initial(user.username)}
        </span>
        <span className="text-[12.5px] font-semibold text-foreground-secondary">
          {user.username}
        </span>
      </Menu.Trigger>

      <Menu.Portal>
        {/* Le `.dropdown` de la maquette : 8px sous la pastille, aligné sur son
            bord droit. */}
        <Menu.Positioner side="bottom" align="end" sideOffset={8}>
          <Menu.Popup className="w-[270px] rounded-md border bg-popover p-1.5 shadow-float outline-none">
            {/* `closeOnClick={false}` : le menu reste le temps de l'aller-retour
                et porte l'attente, puis disparaît avec la pastille quand
                l'en-tête repasse en visiteur.

                `data-highlighted` et non `hover:` — Base UI pose cet attribut
                au survol comme à la navigation au clavier, la flèche bas
                surligne donc exactement comme la souris. */}
            <Menu.Item
              closeOnClick={false}
              disabled={pending}
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-[7px] text-sm select-none data-disabled:opacity-50 data-highlighted:bg-primary data-highlighted:text-primary-foreground"
            >
              <LogOut className="size-[18px] flex-none" />
              {pending ? "Déconnexion…" : "Se déconnecter"}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
