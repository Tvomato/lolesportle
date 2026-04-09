import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
