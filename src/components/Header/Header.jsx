import { useState, useRef } from "react";
import axios from "axios";

import { VscSearch, VscGithubInverted } from "react-icons/vsc";

import "./Header.css";
import "./Header-mobile.css";

export default function Header() {
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchClick = () => {
    setShowInput(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (
        (inputRef.current && inputRef.current.contains(activeElement)) ||
        (resultsContainerRef.current &&
          resultsContainerRef.current.contains(activeElement))
      ) {
        return;
      }
      setSearchResults([]);
      setShowInput(false);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleSearchClick();
    }
  };

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(async () => {
      if (term.trim() !== "") {
        try {
          const res = await axios.get(
            `/api/search?searchTerm=${encodeURIComponent(term)}`
          );

          const data = res.data;
          const titles = data[1];
          const links = data[3];

          const searchsearchResults = titles.map((title, index) => ({
            title,
            link: links[index],
          }));
          setSearchResults(searchsearchResults);
        } catch (err) {
          console.error("Search error:", err);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    setTypingTimeout(newTimeout);
  };

  return (
    <header aria-label="Site header" role="banner">
      {showInput && (
        <input
          type="text"
          className="search-input"
          maxLength="255"
          placeholder="Search articles..."
          aria-label="Search for an article"
          ref={inputRef}
          autoFocus
          onBlur={handleBlur}
          onChange={handleInputChange}
        />
      )}

      <div
        className="header-logo-dim"
        onClick={handleSearchClick}
        onKeyDown={handleKeyDown}
        role="button"
        aria-label="Open search input field"
        tabIndex="0"
      />
      <div className="header-logo" aria-label="wikiarticles logo">
        <span>wiki</span>articles
      </div>

      <VscSearch
        color="#F8F8FF"
        size="1.3em"
        className="search-icon"
        aria-hidden="true"
        onClick={handleSearchClick}
      />
      <a
        href="https://github.com/badhri-hari/wikiarticles"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="View website source code on GitHub"
      >
        <VscGithubInverted
          color="#F8F8FF"
          size="2.7em"
          className="header-icon"
          aria-hidden="true"
        />
      </a>

      {searchResults.length > 0 && (
        <div
          className="search-result-container"
          ref={resultsContainerRef}
          tabIndex="0"
          onBlur={handleBlur}
          aria-label="Search results container"
        >
          {searchResults.map((searchResult, index) => (
            <div key={index} className="search-result">
              <a
                href={searchResult.link}
                target="_blank"
                aria-label={`Search result number ${index}: ${searchResult.title}`}
              >
                <h2>{searchResult.title}</h2>
              </a>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
