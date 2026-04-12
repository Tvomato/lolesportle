import { MdPerson, MdImage, MdHistory, MdMoreHoriz, MdSettings, MdBarChart } from "react-icons/md";
import MenuItem from "@/components/MenuItem";
import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <p className={styles.modeLabel}>Select a mode to play:</p>
      <div className={styles.menuBox}>
        <MenuItem
          href="/classic"
          icon={<MdPerson size={24} />}
          title="Classic Mode"
        />
        <MenuItem
          disabled
          icon={<MdImage size={22} />}
          title="Guess by Face (WIP)"
        />
        {/* <MenuItem
          disabled
          icon={<MdHistory size={22} />}
          title="Team History (WIP)"
        /> */}
        <MenuItem
          disabled
          icon={<MdMoreHoriz size={22} />}
          title="Coming Soon"
        />
      </div>

      <div className={styles.utilityRow}>
        <button className={styles.utilityItem}>
          <MdSettings className={styles.utilityIcon} />
          Settings (WIP)
        </button>
        <button className={styles.utilityItem}>
          <MdBarChart className={styles.utilityIcon} />
          Statistics (WIP)
        </button>
      </div>
    </div>
  );
}
