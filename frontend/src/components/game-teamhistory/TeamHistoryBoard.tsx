"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchPlayerDetails, fetchDailyPlayer } from "@/utils/api";
import { transformData } from "@/utils/transformData";
import { preloadImage, getFullSizeImageUrl } from "@/utils/playerImage";
import { useInitialGameData } from "@/hooks/useInitialGameData";
import { useGameState } from "@/hooks/useGameState";
import { loadSettings, DEFAULT_SETTINGS } from "@/utils/storage";
import { useStatsRecording } from "@/hooks/useStatsRecording";
import { usePlayMode } from "@/contexts/PlayModeContext";
import SearchBar, { SearchBarHandle } from "@/components/shared/SearchBar";
import { NewGameButton, GiveUpButton } from "@/components/shared/GameControls";
import GameLoadingSpinner from "@/components/shared/GameLoadingSpinner";
import NoPlayersMessage from "@/components/shared/NoPlayersMessage";
import GameOutcome from "@/components/shared/GameOutcome";
import DailyCountdown from "@/components/shared/DailyCountdown";
import PlayerGuessRow from "@/components/shared/PlayerGuessRow";
import TeamHistoryDisplay from "./TeamHistoryDisplay";
import TeamHistoryClueButtons from "./TeamHistoryClueButtons";
import styles from "@/styles/game-teamhistory/TeamHistoryBoard.module.css";

export default function TeamHistoryBoard() {
  const { playMode } = usePlayMode();
  const isDaily = playMode === "daily";

  const minTeams = isDaily ? DEFAULT_SETTINGS.min_teams : loadSettings().min_teams;
  const { playerNames, teamMap, loading, noPlayers } = useInitialGameData({ minTeams, isDaily });
  const {
    currentPlayer,
    guessedPlayers,
    guessedRawNames,
    showPlayer,
    hasLost,
    setCurrentPlayer,
    setGuessedPlayers,
    setGuessedRawNames,
    setShowPlayer,
    setHasLost,
    resetGame,
  } = useGameState("team-history", isDaily);
  const [guessRevealId, setGuessRevealId] = useState(0);
  const [gameId, setGameId] = useState(0);
  const [showYears, setShowYears] = useState(false);
  const [showLastTeam, setShowLastTeam] = useState(false);
  const [loadingNewGame, setLoadingNewGame] = useState(false);
  const pendingGuessesRef = useRef(new Set<string>());
  const searchBarRef = useRef<SearchBarHandle>(null);

  const hasWon = currentPlayer
    ? guessedPlayers.some((p) => p.player === currentPlayer.player)
    : false;

  const { resetStats } = useStatsRecording("team-history", hasWon, hasLost, guessedPlayers.length, isDaily);

  const availableNames = useMemo(() => {
    return playerNames
      .filter((name) => !guessedRawNames.has(name))
      .sort((a, b) => a.localeCompare(b));
  }, [playerNames, guessedRawNames]);

  const preloadTeamLogos = async (player: ReturnType<typeof transformData>) => {
    const logoUrls = player.team_history
      .map((entry) => teamMap.get(entry.team)?.logo_url)
      .filter((url): url is string => !!url);
    await Promise.all([
      preloadImage(player.image_url),
      ...logoUrls.map((url) => preloadImage(url)),
    ]);
  };

  const getNewPlayer = async () => {
    if (playerNames.length === 0) return;
    setLoadingNewGame(true);
    try {
      const randomName = playerNames[Math.floor(Math.random() * playerNames.length)];
      const raw = await fetchPlayerDetails(randomName);
      const player = transformData(raw);
      await preloadTeamLogos(player);
      resetStats();
      resetGame();
      setShowYears(false);
      setShowLastTeam(false);
      setCurrentPlayer(player);
      setGuessRevealId(0);
      setGameId((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching player:", error);
    } finally {
      setLoadingNewGame(false);
    }
  };

  const getDailyPlayer = async () => {
    try {
      const name = await fetchDailyPlayer("team-history");
      const raw = await fetchPlayerDetails(name);
      const player = transformData(raw);
      await preloadTeamLogos(player);
      setCurrentPlayer(player);
      setGuessRevealId(0);
      setGameId((prev) => prev + 1);
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
      await preloadImage(player.image_url);
      setGuessedPlayers((prev) => [player, ...prev]);
      setGuessedRawNames((prev) => new Set(prev).add(name));
      setGuessRevealId((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching player details:", error);
    } finally {
      pendingGuessesRef.current.delete(name);
    }
  };

  if (loading) return <GameLoadingSpinner />;
  if (noPlayers) return <NoPlayersMessage />;

  const revealed = hasWon || showPlayer;
  const guessCount = guessedPlayers.length;

  return (
    <div className={styles.gameContainer}>
      <div className={styles.topSection}>
        {!currentPlayer && !isDaily && (
          <button className={styles.startButton} onClick={getNewPlayer} disabled={loadingNewGame}>
            {loadingNewGame ? "LOADING..." : "START GAME"}
          </button>
        )}

        {currentPlayer && (
          <>
            <div key={`history-${gameId}`} className={styles.historyContainer}>
              <TeamHistoryDisplay
                teamHistory={currentPlayer.team_history}
                teamMap={teamMap}
                showYears={showYears || revealed}
                showLastTeam={showLastTeam || revealed}
                revealed={revealed}
              />
            </div>

            <TeamHistoryClueButtons
              key={currentPlayer.player}
              guessCount={guessCount}
              currentPlayer={currentPlayer}
              gameOver={revealed}
              onShowYears={() => setShowYears(true)}
              onShowLastTeam={async () => {
                const lastEntry = currentPlayer.team_history[currentPlayer.team_history.length - 1];
                const logoUrl = teamMap.get(lastEntry.team)?.logo_url;
                if (logoUrl) await preloadImage(getFullSizeImageUrl(logoUrl));
                setShowLastTeam(true);
              }}
              onClueClose={() => searchBarRef.current?.focus()}
            />

            <GameOutcome hasWon={hasWon} hasLost={hasLost} guessCount={guessedPlayers.length} compact />

            {!hasWon && !showPlayer && (
              <SearchBar
                ref={searchBarRef}
                playerNames={availableNames}
                onSelect={handleAddPlayer}
              />
            )}
          </>
        )}
      </div>

      {currentPlayer && guessedPlayers.length >= 1 && (hasLost || hasWon) && (
        isDaily ? <DailyCountdown /> : <NewGameButton onNewGame={getNewPlayer} loading={loadingNewGame} />
      )}

      {currentPlayer && (showPlayer || guessedPlayers.length > 0) && (
        <div className={styles.listSection}>
          <div className={styles.listInner}>
            {showPlayer && !hasWon && (
              <PlayerGuessRow
                key={`reveal-${currentPlayer.player}`}
                player={currentPlayer}
                variant="neutral"
                justGuessed={false}
              />
            )}
            {guessedPlayers.map((player, index) => (
              <PlayerGuessRow
                key={`${player.player}-${guessedPlayers.length - index}`}
                player={player}
                variant={
                  player.player === currentPlayer!.player ? "correct" : "incorrect"
                }
                justGuessed={index === 0 && guessRevealId > 0}
              />
            ))}
          </div>
        </div>
      )}

      {currentPlayer && guessedPlayers.length >= 1 && !(hasLost || hasWon) && (
        <GiveUpButton
          onGiveUp={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setShowPlayer(true);
            setHasLost(true);
          }}
        />
      )}
    </div>
  );
}
