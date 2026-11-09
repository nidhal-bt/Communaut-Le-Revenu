import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-context";
import { getSessionUser } from "@/lib/auth/session";
import { fetchCategories } from "@/lib/strapi/categories";
import { SiteBar } from "@/components/layout/site-bar";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SideNav } from "@/components/layout/side-nav";
import { RightRail } from "@/components/layout/right-rail";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: "Communauté Le Revenu",
  description:
    "La communauté Le Revenu : posez vos questions d'argent et échangez avec les autres lecteurs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* La promesse n'est pas attendue ici : un `await` sur le cookie de
            session retiendrait tout le layout, `{children}` compris, derrière la
            requête. Chaque composant qui a besoin du membre la dénoue sous sa
            propre frontière `<Suspense>`. */}
        <AuthProvider sessionUser={getSessionUser()}>
          <SiteBar />
          {/* Même règle que la session : la promesse n'est pas attendue ici.
              La lecture est mise en cache sans argument, elle partage donc son
              entrée avec le rail gauche — l'en-tête ne coûte pas une requête
              de plus. */}
          <Navbar categories={fetchCategories()} />
          {/* Grille de la maquette : 212px / contenu / 304px, gouttière 28px.
              Trois paliers qui ne se recouvrent pas, pour qu'aucune règle n'en
              écrase une autre :
                < 768px   une colonne implicite, tout s'empile ;
                768-1180  deux colonnes, le rail passe sous le contenu ;
                >= 1181   trois colonnes, l'ordre du DOM suffit à les remplir. */}
          <div className="mx-auto grid w-full max-w-[1260px] flex-1 items-start gap-7 px-4 pt-6 pb-24 md:max-wide:grid-cols-[212px_minmax(0,1fr)] wide:grid-cols-[212px_minmax(0,1fr)_304px]">
            <SideNav />
            <main className="min-w-0 md:col-start-2">{children}</main>
            <RightRail className="md:max-wide:col-start-2" />
          </div>
          <BottomNav />
          {/* Monté une seule fois, hors de la grille : toute Server Action
              annonce son résultat ici.

              Les deux décalages portent la même valeur : la barre du bas est
              fixée au coin inférieur jusqu'à `md` (768px), alors que sonner
              bascule sur `mobileOffset` à 600px — un seul des deux laisserait
              la notification sous la barre entre les deux seuils. */}
          <Toaster
            position="bottom-right"
            offset={{ bottom: 84 }}
            mobileOffset={{ bottom: 84 }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
