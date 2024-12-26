import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import '../styles/DataComponent.css';

function DataComponent() {
    const [data, setData] = useState<any[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<any>(null);
    const [guessedPlayers, setGuessedPlayers] = useState<any[]>([]);
    const nameRef = useRef<HTMLInputElement>(null);

    const playerMap = useMemo(() => {
        return new Map(data.map(player => [player.player, player]));
    }, [data]);

    const findPlayer = useCallback(() => {
        const playerName = nameRef.current?.value;
        const foundPlayer = playerMap.get(playerName);
        if (foundPlayer) {
            setGuessedPlayers(prev => [...prev, transformData(foundPlayer)])
        }
        if (nameRef.current) nameRef.current.value = ''; 
    }, [playerMap]);

    const calculateAge = (birthdate: string) => {
        const birthDateObj = new Date(birthdate);
        const ageDiff = Date.now() - birthDateObj.getTime();
        return Math.floor(ageDiff / 31536000000)
    };

    const transformData = (p) => ({
        player: `${p.player.split(" (")[0]} (${p.name})${p.native_name ? ` - ${p.native_name}` : ''}`,
        nationality: p.nationality,
        birthdate: calculateAge(p.birthdate),
        role: p.role,
        is_retired: p.is_retired ? 'True' : 'False',
        trophies: p.trophies,
        worlds_appearances: p.worlds_appearances,
        team_name: p.team_name || `NONE, prev: <br />${p.team_last}`,
        tournaments_played: p.tournaments_played,
    });

    const columnMapping = {
        player: 'Player ID',
        nationality: 'Nationality',
        birthdate: 'Age',
        role: 'Role',
        is_retired: 'Retired',
        trophies: 'Trophies',
        worlds_appearances: 'Worlds Appearances',
        team_name: "Team",
        tournaments_played: "Tournaments",
    }

    const columns = Object.keys(columnMapping);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/players');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    if (data.length === 0) return <div>Loading...</div>;

    return (
        <>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column}>{columnMapping[column]}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentPlayer && (
                            <tr>
                                {columns.map((column) => (
                                    <td key={`current-${column}`} dangerouslySetInnerHTML={{ __html: currentPlayer[column] }} />
                                ))}
                            </tr>
                        )}
                    </tbody>
                    <tbody>
                        {guessedPlayers.map((player, index) => (
                            <tr key={index}>
                                {columns.map((column) => (
                                    <td key={`${index}-${column}`} dangerouslySetInnerHTML={{ __html: player[column] }} />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <input ref={nameRef} type="text" />
            <button onClick={findPlayer}>Find Player</button>
            <button onClick={() => setGuessedPlayers([])}>Clear</button>
            <button onClick={() => setCurrentPlayer(transformData(data[Math.floor(Math.random() * data.length)]))}>Random</button>
        </>
    );
}

export default DataComponent;
