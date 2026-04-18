"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Player, Team } from "@/types";
import { fetchPlayerNames, fetchPlayerDetails, fetchTeams } from "@/utils/api";
import { transformData } from "@/utils/transformData";
import { getFullSizeImageUrl } from "@/utils/playerImage";
import SearchBar, { SearchBarHandle } from "@/components/shared/SearchBar";
import GameControls from "@/components/shared/GameControls";
// import FaceImageBlurred from "./FaceImageBlurred";
import FaceImageZoom from "./FaceImageZoom";
import FaceGuessRow from "./FaceGuessRow";
import FaceClueButtons from "./FaceClueButtons";
import styles from "@/styles/game-face/FaceBoard.module.css";

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = getFullSizeImageUrl(url);
  });
}

const GUESS_ANIMATION_MS = 600;

export default function FaceBoard() {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [teamMap, setTeamMap] = useState<Map<string, Team>>(new Map());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [guessedPlayers, setGuessedPlayers] = useState<Player[]>([]);
  const [guessedRawNames, setGuessedRawNames] = useState<Set<string>>(new Set());
  const [showPlayer, setShowPlayer] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guessRevealId, setGuessRevealId] = useState(0);
  const [gameId, setGameId] = useState(0);
  const pendingGuessesRef = useRef(new Set<string>());
  const searchBarRef = useRef<SearchBarHandle>(null);

  const hasWon = currentPlayer
    ? guessedPlayers.some((p) => p.player === currentPlayer.player)
    : false;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [names, teams] = await Promise.all([
          fetchPlayerNames(),
          fetchTeams(),
        ])
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

      await preloadImage(player.image_url);

      setCurrentPlayer(player);
      setGuessedPlayers([]);
      setGuessedRawNames(new Set());
      setShowPlayer(false);
      setHasLost(false);
      setGuessRevealId(0);
      setGameId((prev) => prev + 1);
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
        teamLogoUrl ? preloadImage(teamLogoUrl) : Promise.resolve(),
      ]);

      setGuessedPlayers((prev) => [player, ...prev]);
      setGuessedRawNames((prev) => new Set(prev).add(name));
      setGuessRevealId((prev) => prev + 1);

      setTimeout(() => setLoading(false), GUESS_ANIMATION_MS);
    } catch (error) {
      console.error("Error fetching player details:", error);
      setLoading(false);
    } finally {
      pendingGuessesRef.current.delete(name);
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

  const revealed = hasWon || showPlayer;
  const guessCount = guessedPlayers.length;

  return (
    <div className={styles.gameContainer}>
      {/* Top section: images, clues, search, victory */}
      <div className={styles.topSection}>
        {!currentPlayer && (
          <button className={styles.startButton} onClick={getNewPlayer}>
            START GAME
          </button>
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

            {hasWon && <div className={styles.victoryText}>YOU WIN!</div>}
            {hasLost && !hasWon && <div className={styles.defeatText}>YOU LOSE!</div>}
            {(hasWon || hasLost) && <div className={styles.attemptsText}>Total guesses: {guessedPlayers.length}</div>}

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

      {/* Scrollable guess list */}
      {currentPlayer && (showPlayer || guessedPlayers.length > 0) && (
        <div className={styles.listSection}>
          <div className={styles.listInner}>
            {showPlayer && !hasWon && (
              <FaceGuessRow
                key={`reveal-${currentPlayer.player}`}
                player={currentPlayer}
                variant="neutral"
                justGuessed={false}
              />
            )}
            {guessedPlayers.map((player, index) => (
              <FaceGuessRow
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

      {currentPlayer && guessedPlayers.length >= 1 && (
        <GameControls
          onNewGame={getNewPlayer}
          onGiveUp={() => { setShowPlayer(true); setHasLost(true); }}
          hasLost={hasLost || hasWon}
        />
      )}
    </div>
  );
}
