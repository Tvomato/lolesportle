"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PlayMode, loadPlayMode, savePlayMode } from "@/utils/storage";

interface PlayModeContextValue {
  playMode: PlayMode;
  setPlayMode: (mode: PlayMode) => void;
  isMounted: boolean;
}

const PlayModeContext = createContext<PlayModeContextValue>({
  playMode: "endless",
  setPlayMode: () => {},
  isMounted: false,
});

export function PlayModeProvider({ children }: { children: ReactNode }) {
  const [playMode, setPlayModeState] = useState<PlayMode>("endless");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setPlayModeState(loadPlayMode());
    setIsMounted(true);
  }, []);

  function setPlayMode(mode: PlayMode) {
    setPlayModeState(mode);
    savePlayMode(mode);
  }

  return (
    <PlayModeContext.Provider value={{ playMode, setPlayMode, isMounted }}>
      {children}
    </PlayModeContext.Provider>
  );
}

export function usePlayMode(): PlayModeContextValue {
  return useContext(PlayModeContext);
}
