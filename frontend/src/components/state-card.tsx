import { cn } from "@/lib/utils";

/**
 * La `.card.empty` de la maquette : une carte centrée qui annonce un état —
 * rien à afficher, page introuvable, lecture échouée.
 *
 * Sans directive : les pages serveur (`not-found.tsx`, un fil vide) comme les
 * frontières client (`error.tsx`) l'utilisent.
 */
type StateCardProps = {
  title: string;
  description: string;
  /** Pastille ronde au-dessus du titre. Absente sur un simple état vide. */
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export const StateCard = ({
  title,
  description,
  icon,
  action,
  className,
}: StateCardProps) => (
  <div
    className={cn(
      "rounded-lg border bg-card px-5 py-10 text-center shadow-card",
      className,
    )}
  >
    {icon && (
      <span
        aria-hidden
        className="mx-auto mb-3.5 grid size-11 place-items-center rounded-full bg-destructive-soft text-primary-text"
      >
        {icon}
      </span>
    )}

    <h2 className="mb-1.5 font-heading text-xl tracking-[-0.01em]">{title}</h2>
    <p className="text-sm text-foreground-secondary">{description}</p>

    {action && (
      <div className="mt-3.5 flex flex-wrap justify-center gap-2.5">
        {action}
      </div>
    )}
  </div>
);
