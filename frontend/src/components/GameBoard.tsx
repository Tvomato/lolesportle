"use client";

import { useState, useEffect, useMemo } from "react";
import { Player, Team } from "@/types";
import { fetchPlayerNames, fetchPlayerDetails, fetchTeams } from "@/utils/api";
import { transformData } from "@/utils/transformData";
import GameControls from "./GameControls";
import SearchBar from "./SearchBar";
import GuessTable from "./GuessTable";
import styles from "@/styles/GameBoard.module.css";

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url.split("/revision")[0];
  });
}

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
  const [guessRevealId, setGuessRevealId] = useState(0);
  const [revealComplete, setRevealComplete] = useState(true);

  const ANIMATION_DURATION = 3000;

  const hasWon = 
    currentPlayer && revealComplete
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

      const player = transformData(raw);
      const teamLogoUrl = player.team_name
        ? teamMap.get(player.team_name)?.logo_url
        : undefined;

      await Promise.all([
        preloadImage(player.image_url), 
        teamLogoUrl ? preloadImage(teamLogoUrl) : Promise.resolve()
      ]);

      setCurrentPlayer(player);
      setGuessedPlayers([]);
      setGuessedRawNames(new Set());
      setShowPlayer(false);
      setGuessRevealId(0);
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
      const teamLogoUrl = player.team_name
        ? teamMap.get(player.team_name)?.logo_url
        : undefined;

      await Promise.all([
        preloadImage(player.image_url), 
        teamLogoUrl ? preloadImage(teamLogoUrl) : Promise.resolve()
      ]);

      setRevealComplete(false);

      setGuessedPlayers((prev) => [player, ...prev]);
      setGuessedRawNames((prev) => new Set(prev).add(name));
      setGuessRevealId((prev) => prev + 1);

      setTimeout(() => {
        setRevealComplete(true);
        setLoading(false);
      }, ANIMATION_DURATION);
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
          guessRevealId={guessRevealId}
        />
      )}
    </>
  );
}
