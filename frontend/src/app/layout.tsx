import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Header from "@/components/shared/Header";
import { PlayModeProvider } from "@/contexts/PlayModeContext";
import { ColorblindProvider } from "@/contexts/ColorblindContext";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Lolesportle",
  description: "The League of Legends esports player guessing game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <ColorblindProvider>
          <PlayModeProvider>
            <Header />
            <main>{children}</main>
          </PlayModeProvider>
        </ColorblindProvider>
      </body>
    </html>
  );
}
