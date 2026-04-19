"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Team } from "@/types";
import { fetchPlayerNames, fetchPlayerDetails, fetchTeams } from "@/utils/api";
import { transformData } from "@/utils/transformData";
import { recordResult } from "@/utils/storage";
import { NewGameButton, GiveUpButton } from "@/components/shared/GameControls";
import SearchBar, { SearchBarHandle } from "@/components/shared/SearchBar";
import GuessTable from "./GuessTable";
import ClueButtons from "./ClueButtons";
import styles from "@/styles/game-classic/GameBoard.module.css";
import { useGameState } from "@/hooks/useGameState";

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
  const {
    currentPlayer,
    guessedPlayers,
    guessedRawNames,
    showPlayer,
    hasLost,
    revealedPlayers,
    setCurrentPlayer,
    setGuessedPlayers,
    setGuessedRawNames,
    setShowPlayer,
    setHasLost,
    setRevealedPlayers,
    resetGame,
  } = useGameState("classic");
  const [loading, setLoading] = useState(true);
  const [guessRevealId, setGuessRevealId] = useState(0);
  const pendingGuessesRef = useRef(new Set<string>());
  const searchBarRef = useRef<SearchBarHandle>(null);

  const ANIMATION_DURATION = 3000;

  const hasWon = currentPlayer
    ? guessedPlayers.some(
        (p) => p.player === currentPlayer.player && revealedPlayers.has(p.player)
      )
    : false;

  // Starts true if restoring an already-finished game — prevents double-counting on reload
  const statsRecordedRef = useRef(hasWon || hasLost);

  useEffect(() => {
    if (statsRecordedRef.current) return;
    if (hasWon) {
      recordResult("classic", true, guessedPlayers.length);
      statsRecordedRef.current = true;
    } else if (hasLost) {
      recordResult("classic", false, guessedPlayers.length);
      statsRecordedRef.current = true;
    }
  }, [hasWon, hasLost, guessedPlayers.length]);

  useEffect(() => {
    if (hasWon) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [hasWon]);

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

      statsRecordedRef.current = false;
      resetGame();
      setCurrentPlayer(player);
      setGuessRevealId(0);
    } catch (error) {
      console.error("Error fetching player:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (name: string) => {
    if (guessedRawNames.has(name) || pendingGuessesRef.current.has(name)) return;
    pendingGuessesRef.current.add(name);
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

      const revealedName = player.player;

      setGuessedPlayers((prev) => [player, ...prev]);
      setGuessedRawNames((prev) => new Set(prev).add(name));
      setGuessRevealId((prev) => prev + 1);

      setTimeout(() => {
        setRevealedPlayers((prev) => new Set(prev).add(revealedName));
        setLoading(false);
      }, ANIMATION_DURATION);
    } catch (error) {
      console.error("Error fetching player details:", error);
    } finally {
      pendingGuessesRef.current.delete(name);
      setLoading(false);
    }
  };

  if (loading && playerNames.length === 0) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <div className={styles.loadingText}>Loading</div>
      </div>
    );
  }

  return (
    <div className={styles.gameContainer}>
      {/* Top section: start button, clues, search, victory */}
      <div className={styles.topSection}>
        {!currentPlayer && (
          <button className={styles.startButton} onClick={getNewPlayer}>
            START GAME
          </button>
        )}

        {currentPlayer && (
          <ClueButtons key={currentPlayer.player} guessCount={guessedPlayers.length} currentPlayer={currentPlayer} gameOver={!!hasWon || showPlayer} onClueClose={() => searchBarRef.current?.focus()} />
        )}

        {hasWon && <div className={styles.victoryText}>YOU WIN!</div>}
        {hasLost && !hasWon && <div className={styles.defeatText}>YOU LOSE!</div>}
        {(hasWon || hasLost) && <div className={styles.attemptsText}>Total guesses: {guessedPlayers.length}</div>}

        {currentPlayer && !hasWon && !showPlayer && (
          <SearchBar ref={searchBarRef} playerNames={availableNames} onSelect={handleAddPlayer} />
        )}
      </div>

      {currentPlayer && guessedPlayers.length >= 1 && (hasLost || hasWon) && (
        <NewGameButton onNewGame={getNewPlayer} />
      )}

      {/* Scrollable table section */}
      {currentPlayer && (
        <div className={styles.tableSection}>
          <GuessTable
            currentPlayer={currentPlayer}
            guessedPlayers={guessedPlayers}
            showPlayer={showPlayer}
            teamMap={teamMap}
            guessRevealId={guessRevealId}
          />
        </div>
      )}

      {currentPlayer && guessedPlayers.length >= 1 && !(hasLost || hasWon) && (
        <GiveUpButton
          onGiveUp={() => {
            if (currentPlayer && guessedPlayers.some((p) => p.player === currentPlayer.player)) return;
            window.scrollTo({ top: 0, behavior: "smooth" });
            setShowPlayer(true);
            setHasLost(true);
          }}
        />
      )}
    </div>
  );
}
