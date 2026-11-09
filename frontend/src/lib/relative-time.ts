const FORMAT = new Intl.RelativeTimeFormat("fr", {
  numeric: "auto",
  style: "short",
});

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

/** « il y a 5 min », « il y a 2 h », « il y a 3 j » — le `ago()` de la maquette. */
export const formatRelativeTime = (iso: string): string => {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);

  if (seconds < MINUTE) return "à l'instant";
  if (seconds < HOUR) return FORMAT.format(-Math.floor(seconds / MINUTE), "minute");
  if (seconds < DAY) return FORMAT.format(-Math.floor(seconds / HOUR), "hour");
  if (seconds < MONTH) return FORMAT.format(-Math.floor(seconds / DAY), "day");

  return FORMAT.format(-Math.floor(seconds / MONTH), "month");
};

/** « Nouveau » dans le fil : la discussion a moins de `hours` heures. */
export const isWithinHours = (iso: string, hours: number): boolean =>
  Date.now() - new Date(iso).getTime() < hours * HOUR * 1000;
