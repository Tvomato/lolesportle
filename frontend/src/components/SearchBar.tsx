"use client";

import { useState } from "react";
import { decode } from "html-entities";
import styles from "@/styles/SearchBar.module.css";

interface SearchBarProps {
  playerNames: string[];
  onSelect: (name: string) => void;
}

export default function SearchBar({ playerNames, onSelect }: SearchBarProps) {
  const [filteredNames, setFilteredNames] = useState<string[]>([]);
  const [inputWord, setInputWord] = useState("");

  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchWord = event.target.value.toLowerCase();
    setInputWord(searchWord);

    if (searchWord === "") {
      setFilteredNames([]);
      return;
    }

    setFilteredNames(
      playerNames.filter((name) => name.toLowerCase().startsWith(searchWord))
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && filteredNames.length > 0) {
      onSelect(filteredNames[0]);
      clearInput();
    }
  };

  const handleSelect = (name: string) => {
    onSelect(name);
    clearInput();
  };

  const clearInput = () => {
    setFilteredNames([]);
    setInputWord("");
  };

  return (
    <div className={styles.search}>
      <div className={styles.searchInputs}>
        <input
          type="text"
          placeholder="Start typing to guess..."
          value={inputWord}
          onChange={handleFilter}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.searchIcon}>
          {inputWord.length > 0 && (
            <svg
              onClick={clearInput}
              className={styles.clearBtn}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="currentColor"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          )}
        </div>
      </div>
      {filteredNames.length > 0 && inputWord.length > 0 ? (
        <div className={styles.dataResult}>
          {filteredNames.map((name, index) => (
            <div
              key={index}
              className={styles.dataItem}
              onClick={() => handleSelect(name)}
            >
              {decode(name)}
            </div>
          ))}
        </div>
      ) : inputWord.length > 0 ? (
        <div className={styles.dataResult}>
          <div className={styles.noData}>No players found.</div>
        </div>
      ) : null}
    </div>
  );
}
