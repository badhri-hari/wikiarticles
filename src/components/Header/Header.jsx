import { useState, useRef } from "react";
import axios from "axios";

import { VscGithubInverted } from "react-icons/vsc";
import { IoSearch } from "react-icons/io5";
import { TbFileLike } from "react-icons/tb";

import "./Header.css";
import "./Header-mobile.css";

export default function Header({ setSearchActive }) {
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleInputChange = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() !== "") {
      try {
        const res = await axios.get(
          `/api/search?searchTerm=${encodeURIComponent(term)}`
        );

        const data = res.data;
        const titles = data[1];
        const links = data[3];

        const searchResultsFormatted = titles.map((title, index) => ({
          title,
          link: links[index],
        }));

        setSearchResults(searchResultsFormatted);
        setSearchActive(searchResultsFormatted.length > 0);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
        setSearchActive(false);
      }
    } else {
      setSearchResults([]);
      setSearchActive(false);
    }
  };

  const handleDownloadLikedArticles = () => {
    const likedArticles = localStorage.getItem("likedArticles") || "[]";
    const blob = new Blob([likedArticles], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    a.href = url;
    a.download = `wikiarticles_liked_${formattedDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          value={searchTerm}
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

      <IoSearch
        color="#F8F8FF"
        size="1.45em"
        className="search-icon"
        aria-hidden="true"
        onClick={handleSearchClick}
      />
      <button
        onClick={handleDownloadLikedArticles}
        aria-label="Download liked articles JSON file"
        className="header-icon liked-articles-icon"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <TbFileLike color="#F8F8FF" size="2.7em" aria-hidden="true" />
      </button>
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
