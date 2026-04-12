import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Lolesportle",
  description:
    "A Wordle-inspired guessing game for League of Legends esports players",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
