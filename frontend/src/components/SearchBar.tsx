import React, { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import { decode } from 'html-entities';
import '../styles/SearchBar.css'

export default function SearchBar({ data, onSelect }: { data: Map<string, any>, onSelect: (value: any) => void }) {
    const [filteredKeys, setFilteredKeys] = useState<string[]>([]);
    const [inputWord, setInputWord] = useState<string>('');

    const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchWord = event.target.value.toLowerCase();
        setInputWord(searchWord);

        const newFilteredKeys = Array.from(data.keys()).filter(key =>
            key.toLowerCase().startsWith(searchWord)
        );

        setFilteredKeys(searchWord === "" ? [] : newFilteredKeys);
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onSelect(data.get(filteredKeys[0]));
            clearInput();
        }
    }

    const handleSelect = (player: any) => {
        onSelect(data.get(player));
        clearInput();
    }

    const clearInput = () => {
        setFilteredKeys([]);
        setInputWord('');
    }

    return (
        <div className="search">
            <div className="searchInputs">
                <input 
                    type="text" 
                    placeholder="Start typing to guess..." 
                    value={inputWord} 
                    onChange={handleFilter} 
                    onKeyDown={handleKeyDown} 
                />
                <div className="searchIcon">
                    {inputWord.length > 0 && (
                        <CloseIcon id="clearBtn" onClick={clearInput} />
                    )}
                </div>
            </div>
            {(filteredKeys.length > 0 && inputWord.length > 0) ? (
                <div className="dataResult">
                    {filteredKeys.map((key, index) => (
                        <div key={index} className="dataItem" onClick={() => handleSelect(key)}>
                            {decode(key)}
                        </div>
                    ))}
                </div>
            ) : (inputWord.length > 0) ? (
                <div className="dataResult">
                    <div className="noData">
                        No players found.
                    </div>
                </div>
            ) : null
            }
        </div>
    )
}
