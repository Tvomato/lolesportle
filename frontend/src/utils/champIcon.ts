/**
 * Returns the path to a champion's icon in /public/champ_icons/.
*/

// Explicit overrides for champions whose Data Dragon ID can't be derived
// purely by stripping spaces and apostrophes from the display name.
const OVERRIDES: Record<string, string> = {
  "Cho'Gath": "Chogath",
  "Kha'Zix": "Khazix",
  "Vel'Koz": "Velkoz",
  "K'Sante": "KSante",
  "Rek'Sai": "RekSai",
  "Wukong": "Wukong",
  "MonkeyKing": "Wukong",
};

// Remove spaces, apostrophes, and periods.
function normalize(name: string): string {
  return (
    name
      .replace(/\./g, "")
      .replace(/'/g, "")
      .replace(/\s+/g, "")
  );
}

export function getChampIconPath(championName: string): string {
  const filename = OVERRIDES[championName] ?? normalize(championName);
  return `/champ_icons/${filename}.png`;
}
