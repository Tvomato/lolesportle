import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import clm from 'country-locale-map';
import { decode } from 'html-entities';
import SearchBar from '../components/SearchBar.tsx';
import downArrow from '../assets/down_arrow.png'
import upArrow from '../assets/up_arrow.png'
import '../styles/GamePage.css';

function GamePage() {
    const [playerData, setPlayerData] = useState<any[]>([]);
    const [teamData, setTeamData] = useState<any[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<any>(null);
    const [guessedPlayers, setGuessedPlayers] = useState<any[]>([]);
    const [showPlayer, setShowPlayer] = useState<boolean>(false);
    const has_won = guessedPlayers.some(item => JSON.stringify(item) === JSON.stringify(currentPlayer))
    const reveal_button = (!showPlayer ? "REVEAL PLAYER" : "HIDE PLAYER")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const player_res = await axios.get('http://localhost:5000/api/players');
                setPlayerData(player_res.data);

                const team_res = await axios.get('http://localhost:5000/api/teams');
                setTeamData(team_res.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const getNewPlayer = () => {
        setCurrentPlayer(transformData(playerData[Math.floor(Math.random() * playerData.length)]));
        setGuessedPlayers([]);
    }

    const handleAddPlayer = (player: any) => {
        setGuessedPlayers(prev => [player, ...prev])
    }

    const calculateAge = (birthdate: string) => {
        const birthDateObj = new Date(birthdate);
        const ageDiff = Date.now() - birthDateObj.getTime();
        return Math.floor(ageDiff / 31536000000)
    };

    const transformData = (p: any) => ({
        player: decode(`${p.player.split(" (")[0]} (${p.name})`),
        native_name: p.native_name,
        nationality: p.nationality,
        image_url: p.image_url,
        birthdate: calculateAge(p.birthdate),
        role: p.role,
        is_retired: p.is_retired ? 'True' : 'False',
        trophies: p.trophies,
        tournaments_won: p.tournaments_won?.split(","),
        worlds_appearances: p.worlds_appearances,
        team_name: p.team_name,
        team_last: p.team_last,
        tournaments_played: p.tournaments_played.split(","),
    });

    const playerMap = useMemo(() => {
        const guessedPlayerNames = new Set(guessedPlayers.map(gp => gp.player));
        return new Map(
            playerData
                .filter(player => !guessedPlayerNames.has(decode(`${player.player.split(" (")[0]} (${player.name})`)))
                .sort((a, b) => a.player.localeCompare(b.player))
                .map(player => [decode(`${player.player.split(" (")[0]} (${player.name})`), transformData(player)])
        );
    }, [playerData, guessedPlayers]);

    const teamMap = useMemo(() => {
        return new Map(teamData.map(team => [team.name, team]));
    }, [teamData]);

    // [TODO]: Create new column for player image (after finish extraction)
    // [TODO]: Change Team column to just the logo and have it show more info on hover (maybe also for Player)
    const columnMapping = {
        player: {
            header: 'Player',
            render: (value: string, player: any) => (
                <div className="player-cell">
                    <img src={(player.image_url as string).split('/revision')[0]} alt={decode(value)} className="player-image" />
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
        birthdate: {
            header: 'Age',
            render: (value: number) => (
                <div className="age-cell">
                    <span>{value}</span>
                    {value !== currentPlayer.birthdate && (
                        <img
                            src={value < currentPlayer.birthdate ? upArrow : downArrow}
                            alt={value < currentPlayer.birthdate ? "Older" : "Younger"}
                            className="arrow-icon"
                        />
                    )}
                </div>
            )
        },
        role: { header: 'Role', render: (value: string) => <span className={`role-cell role-${value.toLowerCase()}`}>{value}</span> },
        team_name: {
            header: "Team",
            render: (value: string, player: any) => (
                <div className="team-cell">
                    {player.team_name ? (
                        <>
                            <img src={(teamMap.get(player.team_name).logo_url as string).split('/revision')[0]} alt={value} className="team-image" />
                            <span>{value}</span>
                        </>
                    ) : (
                        <>
                            <span>NO TEAM, prev:</span>
                            <span>{player.team_last}</span>
                        </>
                    )}
                </div>
            )
        },
        // is_retired: { header: 'Retired', render: (value: string) => <span className={`retired-cell ${value === 'True' ? 'retired' : 'active'}`}>{value}</span> },
        trophies: {
            header: 'Trophies',
            render: (value: number, player: any) => (
                <div className="trophies-cell">
                    <div>{value}</div>
                    {player.tournaments_won && (
                        <button onClick={() => console.log(player.tournaments_won)}>Info</button>
                    )}
                    {value !== currentPlayer.trophies && (
                        <img
                            src={value < currentPlayer.trophies ? upArrow : downArrow}
                            alt={value < currentPlayer.trophies ? "More" : "Fewer"}
                            className="arrow-icon"
                        />
                    )}
                </div>
            )
        },
        worlds_appearances: {
            header: 'Worlds Appearances',
            render: (value: number) => (
                <div className="worlds-cell">
                    <span>{value}</span>
                    {value !== currentPlayer.worlds_appearances && (
                        <img
                            src={value < currentPlayer.worlds_appearances ? upArrow : downArrow}
                            alt={value < currentPlayer.worlds_appearances ? "More" : "Fewer"}
                            className="arrow-icon"
                        />
                    )}
                </div>
            )
        },
        tournaments_played: {
            header: "Tournaments",
            render: (value: Array<string>) => (
                <div className="tournaments-cell">
                    <div>Total: {value.length}</div>
                    <button onClick={() => console.log(value.join(", "))}>Info</button>
                    {value.length !== currentPlayer.tournaments_played.length && (
                        <img
                            src={value.length < currentPlayer.tournaments_played.length ? upArrow : downArrow}
                            alt={value.length < currentPlayer.tournaments_played.length ? "More" : "Fewer"}
                            className="arrow-icon"
                        />
                    )}
                </div>
            )
        },
    };

    const getCellStyle = (column: string, player: any) => {
        if (!currentPlayer) return {};

        const blue = '#256ecd'
        const green = '#14bc1a'
        const orange = '#db8f13'
        const red = '#981e1e'

        if (column === "player") {
            if (currentPlayer.player === player.player) {
                return { backgroundColor: green }
            }
            return { backgroundColor: blue }
        }

        if (currentPlayer[column] === player[column] && (player[column] || player[column] === 0)) {
            return { backgroundColor: green };
        }

        if (column === "birthdate" && Math.abs(currentPlayer.birthdate - player.birthdate) <= 2) {
            return { backgroundColor: orange };
        }

        if (column === "nationality" && clm.getCountryByName(currentPlayer.nationality)?.region === clm.getCountryByName(player.nationality)?.region) {
            return { backgroundColor: orange };
        }

        if (column === "trophies" && Math.abs(currentPlayer.trophies - player.trophies) <= 2) {
            return { backgroundColor: orange };
        }

        if (column === "worlds_appearances" && Math.abs(currentPlayer.worlds_appearances - player.worlds_appearances) <= 2) {
            return { backgroundColor: orange };
        }

        if (column === "tournaments_played") {
            const diff = Math.abs(currentPlayer.tournaments_played.length - player.tournaments_played.length)
            if (diff === 0) {
                return { backgroundColor: green }
            } else if (diff <= 5) {
                return { backgroundColor: orange };
            }
        }

        if (column === "team_name") {
            const curr_team = currentPlayer.team_name
            const curr_team_last = currentPlayer.team_last
            const player_team = player.team_name
            const player_team_last = player.team_last
            if (!curr_team && !player_team && curr_team_last === player_team_last) {
                return { backgroundColor: green };
            }
            if (curr_team && player_team && teamMap.get(curr_team).region === teamMap.get(player_team).region) {
                return { backgroundColor: orange };
            }
            if (!curr_team && !player_team && teamMap.get(curr_team_last).region === teamMap.get(player_team_last).region) {
                return { backgroundColor: orange };
            }
        }

        return { backgroundColor: red };
    };

    const columns = Object.keys(columnMapping);

    if (playerData.length === 0 || teamData.length === 0 || playerMap.size === 0 || teamMap.size === 0) return <div>Loading...</div>;

    return (
        <>
            <div className="game-setup">
                <button className="display-button" onClick={getNewPlayer}>NEW GAME</button>
                {currentPlayer && !has_won && (<button className="display-button" onClick={() => setShowPlayer(!showPlayer)}>{reveal_button}</button>)}
            </div>
            {has_won && (<div className="victory-text">YOU WIN!</div>)}
            {currentPlayer && !has_won && !showPlayer && (
                <SearchBar data={playerMap} onSelect={handleAddPlayer} />
            )}
            {currentPlayer && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {columns.map((column) => (
                                    <th key={column}>{columnMapping[column].header}</th>
                                ))}
                            </tr>
                        </thead>
                        {showPlayer && (
                            <tbody>
                                <tr>
                                    {columns.map((column) => (
                                        <td key={`current-${column}`}>
                                            {columnMapping[column].render(currentPlayer[column], currentPlayer)}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        )}
                        <tbody>
                            {guessedPlayers.map((player, index) => (
                                <tr key={index}>
                                    {columns.map((column) => (
                                        <td key={`${index}-${column}`} style={getCellStyle(column, player)}>
                                            {columnMapping[column].render(player[column], player)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Debug Tools: */}
            {/* <div className="game-setup">
                <button onClick={() => setGuessedPlayers([])}>Clear</button>
                <button onClick={() => console.log(playerData)}>Logger</button>
            </div> */}
        </>
    );
}

export default GamePage;
