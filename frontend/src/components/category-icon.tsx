import {
  Armchair,
  Building,
  CandlestickChart,
  MessagesSquare,
  PiggyBank,
  Receipt,
  Umbrella,
} from "lucide-react";

type CategoryIconProps = {
  /** `category.icon` : un *nom* d'icône Lucide, par exemple `piggy-bank`. */
  icon: string;
  className?: string;
};

/**
 * L'icône d'un espace, résolue depuis son nom.
 *
 * Le `switch` est explicite plutôt qu'une table de composants : React Compiler
 * interdit de fabriquer un composant pendant le rendu, et le bundler ne garde
 * que les icônes réellement citées.
 */
export const CategoryIcon = ({ icon, className }: CategoryIconProps) => {
  const props = { className, strokeWidth: 2.2 };

  switch (icon) {
    case "candlestick-chart":
      return <CandlestickChart {...props} />;
    case "piggy-bank":
      return <PiggyBank {...props} />;
    case "umbrella":
      return <Umbrella {...props} />;
    case "building":
      return <Building {...props} />;
    case "receipt":
      return <Receipt {...props} />;
    case "armchair":
      return <Armchair {...props} />;
    default:
      return <MessagesSquare {...props} />;
  }
};
