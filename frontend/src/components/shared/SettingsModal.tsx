"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import styles from "@/styles/shared/SettingsModal.module.css";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    if (!closing) setClosing(true);
  }, [closing]);

  useEffect(() => {
    const onPopState = () => onClose();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, handleClose]);

  const handleAnimationEnd = () => {
    if (closing) {
      const scrollY = window.scrollY;
      onClose();
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
    }
  };

  return createPortal(
    <div
      className={`${styles.backdrop} ${closing ? styles.backdropOut : ""}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.modal} ${closing ? styles.flyOut : styles.flyIn}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>Settings</h3>
          <button className={styles.closeButton} onClick={handleClose}>
            <MdClose size={18} />
          </button>
        </div>

        <p className={styles.wip}>Work in progress</p>
      </div>
    </div>,
    document.body
  );
}
