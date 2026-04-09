"use client";

import { useState, useEffect, useMemo } from "react";
import { Player, Team } from "@/types";
import { fetchPlayerNames, fetchPlayerDetails, fetchTeams } from "@/utils/api";
import { transformData } from "@/utils/transformData";
import GameControls from "./GameControls";
import SearchBar from "./SearchBar";
import GuessTable from "./GuessTable";
import styles from "@/styles/GameBoard.module.css";

export default function GameBoard() {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [teamMap, setTeamMap] = useState<Map<string, Team>>(new Map());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [guessedPlayers, setGuessedPlayers] = useState<Player[]>([]);
  const [guessedRawNames, setGuessedRawNames] = useState<Set<string>>(
    new Set()
  );
  const [showPlayer, setShowPlayer] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasWon = currentPlayer
    ? guessedPlayers.some((p) => p.player === currentPlayer.player)
    : false;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [names, teams] = await Promise.all([
          fetchPlayerNames(),
          fetchTeams(),
        ]);
        setPlayerNames(names);
        setTeamMap(new Map(teams.map((t) => [t.name, t])));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const availableNames = useMemo(() => {
    return playerNames
      .filter((name) => !guessedRawNames.has(name))
      .sort((a, b) => a.localeCompare(b));
  }, [playerNames, guessedRawNames]);

  const getNewPlayer = async () => {
    if (playerNames.length === 0) return;

    setLoading(true);
    try {
      const randomName =
        playerNames[Math.floor(Math.random() * playerNames.length)];
      const raw = await fetchPlayerDetails(randomName);
      setCurrentPlayer(transformData(raw));
      setGuessedPlayers([]);
      setGuessedRawNames(new Set());
      setShowPlayer(false);
    } catch (error) {
      console.error("Error fetching player:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (name: string) => {
    setLoading(true);
    try {
      const raw = await fetchPlayerDetails(name);
      const player = transformData(raw);
      setGuessedPlayers((prev) => [player, ...prev]);
      setGuessedRawNames((prev) => new Set(prev).add(name));
    } catch (error) {
      console.error("Error fetching player details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && playerNames.length === 0) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <>
      <GameControls
        onNewGame={getNewPlayer}
        onToggleReveal={() => setShowPlayer(!showPlayer)}
        showRevealButton={!!currentPlayer && !hasWon}
        revealLabel={showPlayer ? "HIDE PLAYER" : "REVEAL PLAYER"}
      />
      {hasWon && <div className={styles.victoryText}>YOU WIN!</div>}
      {currentPlayer && !hasWon && !showPlayer && (
        <SearchBar playerNames={availableNames} onSelect={handleAddPlayer} />
      )}
      {currentPlayer && (
        <GuessTable
          currentPlayer={currentPlayer}
          guessedPlayers={guessedPlayers}
          showPlayer={showPlayer}
          teamMap={teamMap}
        />
      )}
    </>
  );
}
