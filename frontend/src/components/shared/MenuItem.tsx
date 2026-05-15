"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "@/styles/shared/MenuItem.module.css";

interface MenuItemProps {
  icon: ReactNode;
  title: string;
  href?: string;
  disabled?: boolean;
}

export default function MenuItem({ icon, title, href, disabled }: MenuItemProps) {
  const [navigating, setNavigating] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setNavigating(false); }, [pathname]);

  const content = (
    <div className={`${styles.menuItem} ${disabled ? styles.disabled : ""} ${navigating ? styles.navigating : ""}`}>
      <div className={styles.menuCircle}>{icon}</div>
      <div className={styles.menuRect}>
        <span className={styles.menuTitle}>{title}</span>
      </div>
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={styles.menuLink} onClick={() => setNavigating(true)}>
        {content}
      </Link>
    );
  }

  return content;
}
