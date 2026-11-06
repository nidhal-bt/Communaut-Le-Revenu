import { Suspense } from "react";
import { Hero } from "./_components/hero";
import { QuickComposerSkeleton } from "./_components/quick-composer";
import { QuickComposerSection } from "./_components/quick-composer-section";

export default function Home() {
  return (
    /* Ordre de `viewHome()` dans la maquette : le hero (ou rien, une fois
       connecté), puis la barre de publication. Le fil et ses onglets suivront.
       `gap-[18px]` reprend le rythme vertical du rail droit. */
    <div className="flex flex-col gap-[18px]">
      <Hero />
      {/* La lecture des espaces n'est pas mise en cache — avec
          `cacheComponents`, le cache est opt-in — et un appel non mis en cache
          pendant le rendu doit vivre sous une frontière `<Suspense>`, sinon le
          build signale la route comme bloquante. */}
      <Suspense fallback={<QuickComposerSkeleton />}>
        <QuickComposerSection />
      </Suspense>
    </div>
  );
}
