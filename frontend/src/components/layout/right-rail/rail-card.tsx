import { cn } from "@/lib/utils";

type RailCardProps = {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

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
 * « Rien cette semaine » comme « ce bloc n'a pas pu être chargé » : le texte reste
 * le mot de l'appelant, lui seul sait s'il parle d'un vide ou d'une panne.
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
