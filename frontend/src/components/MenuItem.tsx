"use client";

import Link from "next/link";
import { ReactNode } from "react";
import styles from "@/styles/MenuItem.module.css";

interface MenuItemProps {
  icon: ReactNode;
  title: string;
  href?: string;
  disabled?: boolean;
}

export default function MenuItem({ icon, title, href, disabled }: MenuItemProps) {
  const content = (
    <div className={`${styles.menuItem} ${disabled ? styles.disabled : ""}`}>
      <div className={styles.menuCircle}>{icon}</div>
      <div className={styles.menuRect}>
        <span className={styles.menuTitle}>{title}</span>
      </div>
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={styles.menuLink}>
        {content}
      </Link>
    );
  }

  return content;
}
