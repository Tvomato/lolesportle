"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchPlayerDetails, fetchDailyPlayer } from "@/utils/api";
import { transformData } from "@/utils/transformData";
import { preloadImage } from "@/utils/playerImage";
import { useInitialGameData } from "@/hooks/useInitialGameData";
import SearchBar, { SearchBarHandle } from "@/components/shared/SearchBar";
import { MdHistory } from "react-icons/md";
import { NewGameButton, GiveUpButton, DailyGameOverControls } from "@/components/shared/GameControls";
import GameLoadingSpinner from "@/components/shared/GameLoadingSpinner";
import NoPlayersMessage from "@/components/shared/NoPlayersMessage";
import GameOutcome from "@/components/shared/GameOutcome";
// import FaceImageBlurred from "./FaceImageBlurred";
import FaceImageZoom from "./FaceImageZoom";
import PlayerGuessRow from "@/components/shared/PlayerGuessRow";
import FaceClueButtons from "./FaceClueButtons";
import styles from "@/styles/game-face/FaceBoard.module.css";
import { useGameState } from "@/hooks/useGameState";
import { useStatsRecording } from "@/hooks/useStatsRecording";
import { useDailyAutoStart } from "@/hooks/useDailyAutoStart";

const GUESS_ANIMATION_MS = 600;

export default function FaceBoard({ isDaily }: { isDaily: boolean }) {
  const { playerNames, teamMap, loading, noPlayers } = useInitialGameData({ isDaily });
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
  } = useGameState("face", isDaily);
  const [guessRevealId, setGuessRevealId] = useState(0);
  const [gameId, setGameId] = useState(0);
  const [loadingNewGame, setLoadingNewGame] = useState(false);
  const [loadingDailyPlayer, setLoadingDailyPlayer] = useState(false);
  const [dailyError, setDailyError] = useState(false);
  const pendingGuessesRef = useRef(new Set<string>());
  const searchBarRef = useRef<SearchBarHandle>(null);

  const hasWon = currentPlayer
    ? guessedPlayers.some((p) => p.player === currentPlayer.player)
    : false;

  const { resetStats } = useStatsRecording("face", hasWon, hasLost, guessedPlayers.length, isDaily);

  useEffect(() => {
    if (!hasWon) return;
    const timer = setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), GUESS_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [hasWon]);

  const availableNames = useMemo(() => {
    return playerNames
      .filter((name) => !guessedRawNames.has(name))
      .sort((a, b) => a.localeCompare(b));
  }, [playerNames, guessedRawNames]);

  const getNewPlayer = async () => {
    if (playerNames.length === 0) return;
    setLoadingNewGame(true);
    try {
      const randomName = playerNames[Math.floor(Math.random() * playerNames.length)];
      const raw = await fetchPlayerDetails(randomName);
      const player = transformData(raw);
      await preloadImage(player.image_url);
      resetStats();
      resetGame();
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
    setLoadingDailyPlayer(true);
    setDailyError(false);
    try {
      const name = await fetchDailyPlayer("face");
      const raw = await fetchPlayerDetails(name);
      const player = transformData(raw);
      await preloadImage(player.image_url);
      setCurrentPlayer(player);
      setGuessRevealId(0);
      setGameId((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching daily player:", error);
      setDailyError(true);
    } finally {
      setLoadingDailyPlayer(false);
    }
  };

  useDailyAutoStart(isDaily, loading, noPlayers, !!currentPlayer, getDailyPlayer);

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
      setGuessedPlayers((prev) => [player, ...prev]);
      setGuessedRawNames((prev) => new Set(prev).add(name));
      setGuessRevealId((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching player details:", error);
    } finally {
      pendingGuessesRef.current.delete(name);
    }
  };

  if (loading || loadingDailyPlayer) return <GameLoadingSpinner />;
  if (noPlayers) return <NoPlayersMessage />;

  const revealed = hasWon || showPlayer;
  const guessCount = guessedPlayers.length;

  return (
    <div className={styles.gameContainer}>
      {/* Top section: images, clues, search, victory */}
      <div className={styles.topSection}>
        {!currentPlayer && !isDaily && (
          <button className={styles.startButton} onClick={getNewPlayer} disabled={loadingNewGame}>
            {loadingNewGame ? "LOADING..." : "START GAME"}
          </button>
        )}
        {isDaily && dailyError && !currentPlayer && (
          <>
            <p className={styles.errorText}>Failed to load today&apos;s player.</p>
            <button className={styles.retryButton} onClick={getDailyPlayer}>TRY AGAIN</button>
          </>
        )}

        {currentPlayer && (
          <>
            <div className={styles.imageRow}>
              {/* <FaceImageBlurred
                key={`blur-${gameId}`}
                imageUrl={currentPlayer.image_url}
                guessCount={guessCount}
                revealed={revealed}
              /> */}
              <FaceImageZoom
                key={`zoom-${gameId}`}
                imageUrl={currentPlayer.image_url}
                guessCount={guessCount}
                revealed={revealed}
              />
            </div>

            <FaceClueButtons
              key={currentPlayer.player}
              guessCount={guessCount}
              currentPlayer={currentPlayer}
              teamMap={teamMap}
              gameOver={hasWon || showPlayer}
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
        isDaily ? <DailyGameOverControls nextHref="/teamhistory" nextLabel="Team History" nextIcon={<MdHistory />} /> : <NewGameButton onNewGame={getNewPlayer} loading={loadingNewGame} />
      )}

      {/* Scrollable guess list */}
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
                  player.player === currentPlayer.player ? "correct" : "incorrect"
                }
                justGuessed={index === 0 && guessRevealId > 0}
              />
            ))}
          </div>
        </div>
      )}

      {currentPlayer && guessedPlayers.length >= 1 && !(hasLost || hasWon) && (
        <GiveUpButton onGiveUp={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setShowPlayer(true); setHasLost(true); }} />
      )}
    </div>
  );
}
