"use client";

import { useState, useEffect } from "react";
import { Team } from "@/types";
import { fetchPlayerNames, fetchTeams } from "@/utils/api";
import { loadSettings } from "@/utils/storage";

export function useInitialGameData(): {
  playerNames: string[];
  teamMap: Map<string, Team>;
  loading: boolean;
  noPlayers: boolean;
} {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [teamMap, setTeamMap] = useState<Map<string, Team>>(new Map());
  const [loading, setLoading] = useState(true);
  const [noPlayers, setNoPlayers] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [names, teams] = await Promise.all([
          fetchPlayerNames(loadSettings()),
          fetchTeams(),
        ]);
        setPlayerNames(names);
        setTeamMap(new Map(teams.map((t) => [t.name, t])));
        if (names.length === 0) setNoPlayers(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return { playerNames, teamMap, loading, noPlayers };
}
