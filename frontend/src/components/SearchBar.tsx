"use client";

import { useRef, useState } from "react";
import { decode } from "html-entities";
import { MdClose } from "react-icons/md";
import styles from "@/styles/SearchBar.module.css";

interface SearchBarProps {
  playerNames: string[];
  onSelect: (name: string) => void;
}

export default function SearchBar({ playerNames, onSelect }: SearchBarProps) {
  const [filteredNames, setFilteredNames] = useState<string[]>([]);
  const [inputWord, setInputWord] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
    inputRef.current?.focus();
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
          ref={inputRef}
          value={inputWord}
          onChange={handleFilter}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.searchIcon}>
          {inputWord.length > 0 && (
            <MdClose
              onClick={clearInput}
              className={styles.clearBtn}
              size={28}
            />
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
