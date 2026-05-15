"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { fetchPlayerDetails, fetchDailyPlayer } from "@/utils/api";
import { transformData } from "@/utils/transformData";
import { useInitialGameData } from "@/hooks/useInitialGameData";
import { NewGameButton, GiveUpButton } from "@/components/shared/GameControls";
import SearchBar, { SearchBarHandle } from "@/components/shared/SearchBar";
import GameLoadingSpinner from "@/components/shared/GameLoadingSpinner";
import NoPlayersMessage from "@/components/shared/NoPlayersMessage";
import GameOutcome from "@/components/shared/GameOutcome";
import DailyCountdown from "@/components/shared/DailyCountdown";
import GuessTable from "./GuessTable";
import ClueButtons from "./ClueButtons";
import styles from "@/styles/game-classic/GameBoard.module.css";
import { preloadImage } from "@/utils/playerImage";
import { useGameState } from "@/hooks/useGameState";
import { useStatsRecording } from "@/hooks/useStatsRecording";
import { usePlayMode } from "@/contexts/PlayModeContext";

export default function GameBoard() {
  const { playMode } = usePlayMode();
  const isDaily = playMode === "daily";

  const { playerNames, teamMap, loading, noPlayers } = useInitialGameData({ isDaily });
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
  } = useGameState("classic", isDaily);
  const [guessRevealId, setGuessRevealId] = useState(0);
  const pendingGuessesRef = useRef(new Set<string>());
  const searchBarRef = useRef<SearchBarHandle>(null);

  const ANIMATION_DURATION = 3000;

  const hasWon = currentPlayer
    ? guessedPlayers.some(
        (p) => p.player === currentPlayer.player && revealedPlayers.has(p.player)
      )
    : false;

  const { resetStats } = useStatsRecording("classic", hasWon, hasLost, guessedPlayers.length, isDaily);

  useEffect(() => {
    if (hasWon) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [hasWon]);

  const availableNames = useMemo(() => {
    return playerNames
      .filter((name) => !guessedRawNames.has(name))
      .sort((a, b) => a.localeCompare(b));
  }, [playerNames, guessedRawNames]);

  const loadPlayerByName = async (name: string) => {
    const raw = await fetchPlayerDetails(name);
    const player = transformData(raw);
    const teamLogoUrl = player.team_name ? teamMap.get(player.team_name)?.logo_url : undefined;
    await Promise.all([
      preloadImage(player.image_url),
      teamLogoUrl ? preloadImage(teamLogoUrl) : Promise.resolve(),
    ]);
    return player;
  };

  const getNewPlayer = async () => {
    if (playerNames.length === 0) return;
    try {
      const randomName = playerNames[Math.floor(Math.random() * playerNames.length)];
      const player = await loadPlayerByName(randomName);
      resetStats();
      resetGame();
      setCurrentPlayer(player);
      setGuessRevealId(0);
    } catch (error) {
      console.error("Error fetching player:", error);
    }
  };

  const getDailyPlayer = async () => {
    try {
      const name = await fetchDailyPlayer("classic");
      const player = await loadPlayerByName(name);
      setCurrentPlayer(player);
      setGuessRevealId(0);
    } catch (error) {
      console.error("Error fetching daily player:", error);
    }
  };

  // Auto-start daily game when there's no saved state
  useEffect(() => {
    if (isDaily && !loading && !noPlayers && !currentPlayer) {
      getDailyPlayer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDaily, loading, noPlayers]);

  const handleAddPlayer = async (name: string) => {
    if (guessedRawNames.has(name) || pendingGuessesRef.current.has(name)) return;
    pendingGuessesRef.current.add(name);
    try {
      const raw = await fetchPlayerDetails(name);
      const player = transformData(raw);
      const teamLogoUrl = player.team_name ? teamMap.get(player.team_name)?.logo_url : undefined;
      await Promise.all([
        preloadImage(player.image_url),
        teamLogoUrl ? preloadImage(teamLogoUrl) : Promise.resolve(),
      ]);
      const revealedName = player.player;
      setGuessedPlayers((prev) => [player, ...prev]);
      setGuessedRawNames((prev) => new Set(prev).add(name));
      setGuessRevealId((prev) => prev + 1);
      setTimeout(() => {
        setRevealedPlayers((prev) => new Set(prev).add(revealedName));
      }, ANIMATION_DURATION);
    } catch (error) {
      console.error("Error fetching player details:", error);
    } finally {
      pendingGuessesRef.current.delete(name);
    }
  };

  if (loading) return <GameLoadingSpinner />;
  if (noPlayers) return <NoPlayersMessage />;

  return (
    <div className={styles.gameContainer}>
      {/* Top section: start button, clues, search, victory */}
      <div className={styles.topSection}>
        {!currentPlayer && !isDaily && (
          <button className={styles.startButton} onClick={getNewPlayer}>
            START GAME
          </button>
        )}

        {currentPlayer && (
          <ClueButtons key={currentPlayer.player} guessCount={guessedPlayers.length} currentPlayer={currentPlayer} gameOver={!!hasWon || showPlayer} onClueClose={() => searchBarRef.current?.focus()} />
        )}

        <GameOutcome hasWon={hasWon} hasLost={hasLost} guessCount={guessedPlayers.length} />

        {currentPlayer && !hasWon && !showPlayer && (
          <SearchBar ref={searchBarRef} playerNames={availableNames} onSelect={handleAddPlayer} />
        )}
      </div>

      {currentPlayer && guessedPlayers.length >= 1 && (hasLost || hasWon) && (
        isDaily ? <DailyCountdown /> : <NewGameButton onNewGame={getNewPlayer} />
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
