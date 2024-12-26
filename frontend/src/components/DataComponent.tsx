import React, { useRef, useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import axios from 'axios';
import { decode } from 'html-entities';
import '../styles/DataComponent.css';

function DataComponent() {
    const [data, setData] = useState<any[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<any>(null);
    const [guessedPlayers, setGuessedPlayers] = useState<any[]>([]);
    const nameRef = useRef<HTMLInputElement>(null);

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

    const playerMap = useMemo(() => {
        return new Map(data.map(player => [player.player, player]));
    }, [data]);

    const getPlayer = useCallback(() => {
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
        player: decode(`${p.player.split(" (")[0]} (${p.name})`),
        native_name: p.native_name,
        nationality: p.nationality,
        birthdate: calculateAge(p.birthdate),
        role: p.role,
        is_retired: p.is_retired ? 'True' : 'False',
        trophies: p.trophies,
        worlds_appearances: p.worlds_appearances,
        team_name: p.team_name,
        team_last: p.team_last,
        tournaments_played: p.tournaments_played,
    });

    // [TODO]: Create new column for player image (after finish extraction)
    // [TODO]: Change Team column to just the logo and have it show more info on hover (maybe also for Player)
    const columnMapping = {
        player: {
            header: 'Player',
            render: (value: string, player: any) => (
                <div className="player-cell">
                    <img src='https://media.trackingthepros.com/profile/p585.png' alt={value} className="player-image" />
                    <span>{decode(value)}</span>
                    {player.native_name && (<span>[{player.native_name}]</span>)}
                </div>
            )
        },
        nationality: {
            header: 'Nationality',
            render: (value: string) => (
                <div className="nationality-cell">
                    <span>{value}</span>
                </div>
            )
        },
        birthdate: { header: 'Age', render: (value: number) => <span className="age-cell">{value}</span> },
        role: { header: 'Role', render: (value: string) => <span className={`role-cell role-${value.toLowerCase()}`}>{value}</span> },
        trophies: { header: 'Trophies', render: (value: number) => <span className="trophies-cell">{value}</span> },
        worlds_appearances: { header: 'Worlds Appearances', render: (value: number) => <span className="worlds-cell">{value}</span> },
        team_name: {
            header: "Team",
            render: (value: string, player: any) => (
                <div className="team-cell">
                    <img src='https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/9/9a/Team_Liquidlogo_square_Dark.png' alt={value} className="team-image" />
                    {player.team_name ? (
                        <span>{value}</span>
                    ) : (
                        <>
                            <span>NO TEAM, prev:</span>
                            <span>{player.team_last}</span>
                        </>
                    )}
                </div>
            )
        },
        is_retired: { header: 'Retired', render: (value: string) => <span className={`retired-cell ${value === 'True' ? 'retired' : 'active'}`}>{value}</span> },
        tournaments_played: {
            header: "Tournaments",
            render: (value: string) => (
                <div className="tournaments-cell">
                    <button onClick={() => console.log(value)}>Info</button>
                    <div>Total: {value.split(",").length}</div>
                </div>
            )
        },
    };

    const getCellStyle = (column, value) => {
        if (!currentPlayer) return {};
        
        if (currentPlayer[column] === value) {
            return { color: 'green' };
        } else {
            return { color: 'red' };
        }
    };

    const columns = Object.keys(columnMapping);

    if (data.length === 0) return <div>Loading...</div>;

    return (
        <>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column}>{columnMapping[column].header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentPlayer && (
                            <tr>
                                {columns.map((column) => (
                                    <td key={`current-${column}`}>
                                        {columnMapping[column].render(currentPlayer[column], currentPlayer)}
                                    </td>
                                ))}
                            </tr>
                        )}
                    </tbody>
                    <tbody>
                        {guessedPlayers.map((player, index) => (
                            <tr key={index}>
                                {columns.map((column) => (
                                    <td key={`${index}-${column}`} style={getCellStyle(column, player[column])}>
                                        {columnMapping[column].render(player[column], player)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {guessedPlayers.some(item => JSON.stringify(item) === JSON.stringify(currentPlayer)) && (<div>YOU WIN YAY</div>)}
            <button onClick={() => setCurrentPlayer(transformData(data[Math.floor(Math.random() * data.length)]))}>Random</button>
            {currentPlayer && (
                <>
                    <input ref={nameRef} type="text" />
                    <button onClick={getPlayer}>Find Player</button>
                    <button onClick={() => setGuessedPlayers([])}>Clear</button>
                </>
            )}
        </>
    );
}

export default DataComponent;
