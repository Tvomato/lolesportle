import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import '../styles/DataComponent.css'

function DataComponent() {
    const [data, setData] = useState([]);
    const [playerData, setPlayerData] = useState(null);
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
        return new Map(data.map(player => [player['player'], player]));
    }, [data]);

    const findPlayer = useCallback(() => {
        if (!nameRef.current) {
            return;
        }
        const playerName = nameRef.current.value;
        const foundPlayer = playerMap[playerName];
        setPlayerData(foundPlayer || null);
    }, [playerMap]);

    if (data.length === 0) return <div>Loading...</div>;

    const columns = Object.keys(data[0]);

    return (
        <>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column}>{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((column) => (
                                    <td key={`${rowIndex}-${column}`}>{row[column]}</td>
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
