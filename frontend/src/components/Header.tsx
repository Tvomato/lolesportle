"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdHome } from "react-icons/md";
import styles from "@/styles/Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className={isHome ? styles.header : `${styles.header} ${styles.headerCompact}`}>
      <div className={styles.headerInner}>
        {!isHome && (
          <Link href="/" className={styles.homeButton} aria-label="Home">
            <MdHome className={styles.homeIcon} />
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
