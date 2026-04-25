"use client";

import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import styles from "@/styles/game-classic/ClueModal.module.css";

interface ClueModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function ClueModal({ title, onClose, children }: ClueModalProps) {
  const { closing, handleClose, handleAnimationEnd } = useModalAnimation(onClose);

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
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeButton} onClick={handleClose}>
            <MdClose size={18} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
