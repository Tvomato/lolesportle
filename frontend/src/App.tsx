import React from 'react';
import './App.css';
import DataComponent from './components/DataComponent.tsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>League-of-Legends-Esports-Player-Guessing-Gamedle</h1>
        <DataComponent/>
      </header>
    </div>
  );
}

export default App;