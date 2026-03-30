import type { Metadata } from "next";
import { Montserrat, Lilita_One } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SponsorBackground } from "@/components/SponsorBackground";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-montserrat",
});

const lilita = Lilita_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lilita",
});

export const metadata: Metadata = {
  title: "Búsqueda del Tesoro 🏆",
  description: "Participa en la ruta del sushi y gana premios increíbles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${montserrat.variable} ${lilita.variable} font-sans antialiased bg-background text-white`}
      >
        <AuthProvider>
          <SponsorBackground />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
