import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/DataComponent.css'

function DataComponent() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/data');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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
            <button onClick={() => console.log(Object.values(data).find(entry => entry.player === "APA (Eain Stearns)"))}>aaaaa</button>
        </>
    );
}

export default DataComponent;
