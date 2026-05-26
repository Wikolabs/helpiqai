import type { Metadata } from "next";
import { Raleway, Karla } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HelpiqAI — SAV e-commerce résolu en 30 secondes",
  description:
    "Agent RAG qui répond aux clients e-commerce 24h/24 avec vos données produits, commandes et politiques.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${raleway.variable} ${karla.variable}`}>
      <body
        style={{
          background: "#f0fdfa",
          fontFamily: "var(--font-body)",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
