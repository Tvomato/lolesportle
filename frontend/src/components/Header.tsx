"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className={isHome ? styles.header : `${styles.header} ${styles.headerCompact}`}>
      <div className={styles.headerInner}>
        {!isHome && (
          <Link href="/" className={styles.homeButton} aria-label="Home">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={styles.homeIcon}
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </Link>
        )}
        <Link href="/" className={styles.logoLink}>
          <span className={styles.logo}>Lolesportle</span>
        </Link>
      </div>
      {isHome && (
        <p className={styles.subtitle}>The LoL Esports Player Guessing Game</p>
      )}
    </header>
  );
}
