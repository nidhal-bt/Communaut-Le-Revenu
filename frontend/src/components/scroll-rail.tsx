"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP = 0.8;

const ARROW =
  "grid size-[30px] flex-none place-items-center rounded-full border bg-card text-foreground-secondary shadow-lift hover:border-border-strong hover:text-foreground disabled:opacity-40 max-md:hidden";

type Edges = { overflowing: boolean; atStart: boolean; atEnd: boolean };

const AT_REST: Edges = { overflowing: false, atStart: true, atEnd: true };

/** Les largeurs sont fractionnaires : un pixel de tolérance sur chaque bord. */
const readEdges = (viewport: HTMLElement): Edges => {
  const max = viewport.scrollWidth - viewport.clientWidth;

  return {
    overflowing: max > 1,
    atStart: viewport.scrollLeft <= 1,
    atEnd: viewport.scrollLeft >= max - 1,
  };
};

type ScrollRailProps = {
  label: string;
  className?: string;
  trackClassName?: string;
  children: ReactNode;
};

/**
 * Un rail horizontal utilisable à la souris. Au doigt, `overflow-x-auto` suffit ;
 * sur un poste fixe les trois affordances manquent en même temps — la barre est
 * masquée, une molette n'émet que du `deltaY`, et il n'y a rien à cliquer. D'où
 * les deux flèches, réservées à `md` et au-delà.
 *
 * Les flèches apparaissent ensemble et se désactivent aux bouts : en démonter une
 * changerait la largeur du rail sous le curseur. Les afficher ne peut que réduire
 * la largeur visible, donc maintenir le dépassement — la décision est monotone et
 * ne peut pas osciller.
 */
export const ScrollRail = ({
  label,
  className,
  trackClassName,
  children,
}: ScrollRailProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState(AT_REST);

  /* Deux cibles observées : la largeur disponible change au redimensionnement, la
     largeur du contenu quand les onglets membres arrivent après leur frontière —
     et ce second cas ne redimensionne pas le conteneur. */
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const observer = new ResizeObserver(() => setEdges(readEdges(viewport)));
    observer.observe(viewport);
    observer.observe(track);

    return () => observer.disconnect();
  }, []);

  /* React écoute `wheel` en passif : dans un `onWheel`, `preventDefault` serait
     sans effet. Au bout du rail on ne fait rien, et la page reprend la main. */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaX !== 0) return;

      const room =
        event.deltaY > 0
          ? viewport.scrollWidth - viewport.clientWidth - viewport.scrollLeft
          : viewport.scrollLeft;
      if (room <= 0) return;

      event.preventDefault();
      viewport.scrollLeft += event.deltaY;
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => viewport.removeEventListener("wheel", handleWheel);
  }, []);

  const measure = () => {
    const viewport = viewportRef.current;
    if (viewport) setEdges(readEdges(viewport));
  };

  const scrollStep = (direction: 1 | -1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollBy({
      left: direction * viewport.clientWidth * STEP,
      behavior: "smooth",
    });
  };

  return (
    <nav aria-label={label} className={cn("flex items-center", className)}>
      {/* `aria-hidden` et hors tabulation : au clavier, `Tab` passe déjà sur
          chaque élément du rail et le navigateur le fait défiler dans le champ.
          Ces boutons ne rendent service qu'à la souris. */}
      {edges.overflowing && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          disabled={edges.atStart}
          onClick={() => scrollStep(-1)}
          className={ARROW}
        >
          <ChevronLeft className="size-[18px]" />
        </button>
      )}

      <div
        ref={viewportRef}
        onScroll={measure}
        className="no-scrollbar min-w-0 overflow-x-auto"
      >
        <div ref={trackRef} className={cn("flex", trackClassName)}>
          {children}
        </div>
      </div>

      {edges.overflowing && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          disabled={edges.atEnd}
          onClick={() => scrollStep(1)}
          className={ARROW}
        >
          <ChevronRight className="size-[18px]" />
        </button>
      )}
    </nav>
  );
};
