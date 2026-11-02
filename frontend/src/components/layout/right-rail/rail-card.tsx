import { cn } from "@/lib/utils";

type RailCardProps = {
  /** Libellé de l'en-tête. Omis, la carte n'a pas d'en-tête. */
  title?: string;
  /** Icône posée devant le titre ; la coquille la colore en rouge. */
  icon?: React.ReactNode;
  /** Zone alignée à droite du titre : lien « Tout voir », compteur… */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/** Coquille commune aux cartes du rail droit (la `.card` de la maquette). */
export const RailCard = ({
  title,
  icon,
  action,
  className,
  children,
}: RailCardProps) => (
  <section
    className={cn("rounded-lg border bg-card p-[18px] shadow-card", className)}
  >
    {title && (
      <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold [&>svg]:size-[15px] [&>svg]:flex-none [&>svg]:text-primary-text">
        {icon}
        {title}
        {action && <span className="ml-auto">{action}</span>}
      </h2>
    )}
    {children}
  </section>
);
