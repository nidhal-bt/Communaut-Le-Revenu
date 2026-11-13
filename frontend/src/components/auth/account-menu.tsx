"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { LogOut, User as UserIcon } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { logoutAction } from "@/lib/auth/actions";
import { useSetUser } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import type { User } from "@/types/models";

/**
 * Un seul article : le `meMenu()` de la maquette en porte six autres qui n'ont
 * aucun écran derrière eux, et un article qui ne mène nulle part est une régression
 * d'accessibilité.
 *
 * `Menu` de Base UI, déjà la dépendance de `ui/dialog.tsx`, plutôt qu'un `useState`
 * et un écouteur de clic : la fermeture sur `Échap` et au clic dehors, le focus
 * rendu au déclencheur et la navigation aux flèches viennent avec.
 */
const LogoutMenu = ({
  side,
  align,
  trigger,
  children,
}: {
  side: "top" | "bottom";
  align: "center" | "end";
  trigger: React.ReactElement<Record<string, unknown>>;
  children: React.ReactNode;
}) => {
  const setUser = useSetUser();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  /* Le dire au contexte fait rebasculer l'en-tête et le fil en visiteur sans
     recharger ; `refresh()` redemande au serveur ce qui dépendait de la session. */
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setUser(null);
      router.refresh();
    });
  };

  return (
    <Menu.Root>
      <Menu.Trigger render={trigger}>{children}</Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side={side} align={align} sideOffset={8}>
          <Menu.Popup className="w-[270px] rounded-md border bg-popover p-1.5 shadow-float outline-none">
            {/* `closeOnClick={false}` : le menu porte l'attente, puis disparaît
                avec son déclencheur. `data-highlighted` et non `hover:` — Base UI
                pose cet attribut au survol comme au clavier. */}
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

/** Le pseudo tombe sous `md` : à 360px la pastille n'est plus que le monogramme. */
export const AccountMenu = ({ user }: { user: User }) => (
  <LogoutMenu
    side="bottom"
    align="end"
    trigger={
      <button
        type="button"
        aria-label="Mon compte"
        className="flex items-center gap-2 rounded-full border bg-card p-[3px] shadow-lift hover:bg-secondary md:pr-2.5"
      />
    }
  >
    <Avatar username={user.username} size="sm" />
    <span className="hidden text-[12.5px] font-semibold text-foreground-secondary md:inline">
      {user.username}
    </span>
  </LogoutMenu>
);

/**
 * La même sortie de session pour la barre du bas, qui ne porte pas la pastille :
 * sans elle, un membre sur mobile n'a aucun moyen de se déconnecter.
 */
export const AccountMenuCell = ({ className }: { className: string }) => (
  <LogoutMenu
    side="top"
    align="center"
    trigger={
      <button
        type="button"
        className={cn(
          className,
          "aria-expanded:font-semibold aria-expanded:text-primary-text",
        )}
      />
    }
  >
    <UserIcon className="size-[18px] flex-none" />
    Profil
  </LogoutMenu>
);
