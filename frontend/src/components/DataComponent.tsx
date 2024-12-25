import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import '../styles/DataComponent.css';

function DataComponent() {
    const [data, setData] = useState<any[]>([]);
    const [playerData, setPlayerData] = useState<any | null>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    const playerMap = useMemo(() => {
        return new Map(data.map(player => [player.player, player]));
    }, [data]);

    const findPlayer = useCallback(() => {
        const playerName = nameRef.current?.value;
        const foundPlayer = playerMap.get(playerName);
        setPlayerData(foundPlayer || null);
    }, [playerMap]);

    const calculateAge = (birthdate: string) => {
        const birthDateObj = new Date(birthdate);
        const ageDiff = Date.now() - birthDateObj.getTime();
        return Math.floor(ageDiff / 31536000000)
    };

    const transformedData = data.map(row => ({
        player: `${row.player.split(" (")[0]} (${row.name})${row.native_name ? ` - ${row.native_name}` : ''}`,
        nationality: row.nationality,
        birthdate: calculateAge(row.birthdate),
        role: row.role,
        is_retired: row.is_retired ? 'True' : 'False',
        trophies: row.trophies,
        worlds_appearances: row.worlds_appearances,
        team_name: row.team_name || `NONE, prev: <br />${row.team_last}`,
        tournaments_played: row.tournaments_played,
    }));

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
                        {transformedData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((column) => (
                                    <td key={`${rowIndex}-${column}`} dangerouslySetInnerHTML={{ __html: row[column] }} />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <input ref={nameRef} type="text" />
            <button onClick={findPlayer}>Find Player</button>
            {playerData && (
                <div>
                    <h3>Player Found:</h3>
                    <pre className="table-container">{JSON.stringify(playerData, null, 2)}</pre>
                </div>
            )}
        </>
    );
}

export default DataComponent;
