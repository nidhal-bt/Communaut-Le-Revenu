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

/**
 * La carte réduite à une ligne : « rien cette semaine » comme « ce bloc n'a pas
 * pu être chargé ».
 *
 * Les deux cartes du haut portent chacune ces deux états ; les réunir ici évite
 * d'en écrire quatre fois le même paragraphe. Le texte reste le mot de
 * l'appelant : c'est lui qui sait s'il parle d'une question ou d'une discussion,
 * et d'un vide ou d'une panne.
 */
export const RailCardMessage = ({
  title,
  icon,
  children,
}: Pick<RailCardProps, "title" | "icon" | "children">) => (
  <RailCard title={title} icon={icon}>
    <p className="text-sm text-foreground-secondary">{children}</p>
  </RailCard>
);
