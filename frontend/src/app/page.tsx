import GameBoard from "@/components/GameBoard";

export default function Home() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>League-of-Legends-Esports-Player-Guessing-Gamedle</h1>
      </header>
      <GameBoard />
    </div>
  );
}
