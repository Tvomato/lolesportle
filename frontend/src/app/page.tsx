"use client";

import { useState } from "react";
import { MdPerson, MdImage, MdHistory, MdMoreHoriz, MdSettings, MdBarChart } from "react-icons/md";
import MenuItem from "@/components/shared/MenuItem";
import StatsModal from "@/components/shared/StatsModal";
import SettingsModal from "@/components/shared/SettingsModal";
import PlayModeToggle from "@/components/shared/PlayModeToggle";
import { usePlayMode } from "@/contexts/PlayModeContext";
import styles from "@/styles/shared/Home.module.css";

export default function Home() {
  const [statsOpen, setStatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { playMode } = usePlayMode();

  const suffix = playMode === "endless" ? "/endless" : "";

  return (
    <div className={styles.container}>
      <p className={styles.modeLabel}>Select a mode to play:</p>
      <PlayModeToggle />
      <div className={styles.menuBox}>
        <MenuItem
          href={`/classic${suffix}`}
          icon={<MdPerson size={24} />}
          title="Classic Mode"
        />
        <MenuItem
          href={`/face${suffix}`}
          icon={<MdImage size={22} />}
          title="Guess by Face"
        />
        <MenuItem
          href={`/teamhistory${suffix}`}
          icon={<MdHistory size={22} />}
          title="Team History"
        />
        <MenuItem
          disabled
          icon={<MdMoreHoriz size={22} />}
          title="Coming Soon"
        />
      </div>

      <div className={styles.utilityRow}>
        <button className={styles.utilityItem} onClick={() => setStatsOpen(true)}>
          <MdBarChart className={styles.utilityIcon} />
          Statistics
        </button>
        <button className={styles.utilityItem} onClick={() => setSettingsOpen(true)}>
          <MdSettings className={styles.utilityIcon} />
          Settings
        </button>
      </div>

      {statsOpen && <StatsModal onClose={() => setStatsOpen(false)} initialPlayMode={playMode} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
