"use client";

import { useState, useEffect, useCallback } from "react";

export function useModalAnimation(onClose: () => void) {
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

  return { closing, handleClose, handleAnimationEnd };
}
