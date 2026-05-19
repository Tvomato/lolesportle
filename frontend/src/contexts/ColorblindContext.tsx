"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loadColorblindMode, saveColorblindMode } from "@/utils/storage";

interface ColorblindContextValue {
  colorblindMode: boolean;
  setColorblindMode: (enabled: boolean) => void;
}

const ColorblindContext = createContext<ColorblindContextValue>({
  colorblindMode: false,
  setColorblindMode: () => {},
});

export function ColorblindProvider({ children }: { children: ReactNode }) {
  const [colorblindMode, setColorblindModeState] = useState(false);

  useEffect(() => {
    const enabled = loadColorblindMode();
    setColorblindModeState(enabled);
    document.body.classList.toggle("colorblind", enabled);
  }, []);

  function setColorblindMode(enabled: boolean) {
    setColorblindModeState(enabled);
    saveColorblindMode(enabled);
    document.body.classList.toggle("colorblind", enabled);
  }

  return (
    <ColorblindContext.Provider value={{ colorblindMode, setColorblindMode }}>
      {children}
    </ColorblindContext.Provider>
  );
}

export function useColorblind(): ColorblindContextValue {
  return useContext(ColorblindContext);
}
