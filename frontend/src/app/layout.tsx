import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { SideNav } from "@/components/layout/side-nav";
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
        <AuthProvider>
          <Navbar />
          <div className="mx-auto flex w-full max-w-[1260px] flex-1 gap-7 px-4 pt-6 pb-24">
            <SideNav />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
