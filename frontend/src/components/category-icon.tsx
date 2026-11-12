import {
  Armchair,
  Building,
  CandlestickChart,
  Coffee,
  Gem,
  Globe,
  MessagesSquare,
  PiggyBank,
  Receipt,
  Umbrella,
  Users,
  Wallet,
} from "lucide-react";

type CategoryIconProps = {
  icon: string;
  className?: string;
};

/**
 * Le `switch` est explicite plutôt qu'une table de composants : React Compiler
 * interdit de fabriquer un composant pendant le rendu, et le bundler ne garde que
 * les icônes réellement citées.
 *
 * Les espaces semés portent les noms Lucide ; les cinq autres de la maquette la
 * désignent par des clés courtes. Les deux orthographes sont donc acceptées là où
 * elles diffèrent, et `family` n'existant pas chez Lucide, c'est `Users` qui le rend.
 */
export const CategoryIcon = ({ icon, className }: CategoryIconProps) => {
  const props = { className, strokeWidth: 2.2 };

  switch (icon) {
    case "candlestick-chart":
    case "candles":
      return <CandlestickChart {...props} />;
    case "globe":
      return <Globe {...props} />;
    case "piggy-bank":
    case "piggy":
      return <PiggyBank {...props} />;
    case "umbrella":
      return <Umbrella {...props} />;
    case "building":
      return <Building {...props} />;
    case "receipt":
      return <Receipt {...props} />;
    case "armchair":
      return <Armchair {...props} />;
    case "users":
    case "family":
      return <Users {...props} />;
    case "gem":
      return <Gem {...props} />;
    case "wallet":
      return <Wallet {...props} />;
    case "coffee":
      return <Coffee {...props} />;
    default:
      return <MessagesSquare {...props} />;
  }
};
