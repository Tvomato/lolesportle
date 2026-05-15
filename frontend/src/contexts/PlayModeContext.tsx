"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PlayMode, loadPlayMode, savePlayMode } from "@/utils/storage";

interface PlayModeContextValue {
  playMode: PlayMode;
  setPlayMode: (mode: PlayMode) => void;
}

const PlayModeContext = createContext<PlayModeContextValue>({
  playMode: "daily",
  setPlayMode: () => {},
});

export function PlayModeProvider({ children }: { children: ReactNode }) {
  const [playMode, setPlayModeState] = useState<PlayMode>("daily");

  useEffect(() => {
    setPlayModeState(loadPlayMode());
  }, []);

  function setPlayMode(mode: PlayMode) {
    setPlayModeState(mode);
    savePlayMode(mode);
  }

  return (
    <PlayModeContext.Provider value={{ playMode, setPlayMode }}>
      {children}
    </PlayModeContext.Provider>
  );
}

export function usePlayMode(): PlayModeContextValue {
  return useContext(PlayModeContext);
}
