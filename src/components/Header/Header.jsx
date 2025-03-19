import { useState, useRef, useEffect } from "react";
import axios from "axios";

import { VscGithubInverted } from "react-icons/vsc";
import { IoSearch } from "react-icons/io5";
import { TbFileLike } from "react-icons/tb";
import { RxCross1 } from "react-icons/rx";
import { CgSpinnerTwo } from "react-icons/cg";

import "./Header.css";
import "./Header-mobile.css";

export default function Header() {
  const [showInput, setShowInput] = useState(false);
  const [showLikedArticles, setShowLikedArticles] = useState(false);
  const [likedArticles, setLikedArticles] = useState([]);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const likedArticlesContainerRef = useRef(null);
  const likedArticlesIconRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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
          resultsContainerRef.current.contains(activeElement)) ||
        (likedArticlesContainerRef.current &&
          likedArticlesContainerRef.current.contains(activeElement))
      ) {
        return;
      }
      setSearchResults([]);
      setShowInput(false);
      setShowLikedArticles(false);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleSearchClick();
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async () => {
    if (searchTerm.trim() !== "") {
      setIsSearching(true);
      setSearchResults([]);
      try {
        const res = await axios.get(
          `/api/search?searchTerm=${encodeURIComponent(searchTerm)}`
        );

        const data = res.data;
        const titles = data[1];
        const links = data[3];
        const summary = data[4];

        const searchResultsFormatted = titles.map((title, index) => ({
          title,
          link: links[index],
          summary: summary[index],
        }));

        setSearchResults(searchResultsFormatted);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      }
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleLikedArticlesClick = () => {
    if (!showLikedArticles) {
      const liked = JSON.parse(localStorage.getItem("likedArticles") || "[]");
      setLikedArticles(liked);
    }
    setShowLikedArticles(!showLikedArticles);
  };

  const handleDownloadLikedArticles = () => {
    const liked = localStorage.getItem("likedArticles") || "[]";
    const blob = new Blob([liked], { type: "application/json" });
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showLikedArticles &&
        likedArticlesContainerRef.current &&
        !likedArticlesContainerRef.current.contains(event.target) &&
        likedArticlesIconRef.current &&
        !likedArticlesIconRef.current.contains(event.target)
      ) {
        setShowLikedArticles(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLikedArticles]);

  const handleRemoveLikedArticle = (articleToRemove) => {
    const updatedArticles = likedArticles.filter(
      (article) => article.link !== articleToRemove.link
    );

    setLikedArticles(updatedArticles);
    localStorage.setItem("likedArticles", JSON.stringify(updatedArticles));
  };

  return (
    <header role="banner">
      {showInput && (
        <>
          <input
            type="text"
            className="search-input"
            maxLength="255"
            placeholder="Search articles..."
            title="Search for an article on Wikipedia"
            aria-label="Search for an article on Wikipedia"
            ref={inputRef}
            autoFocus
            onBlur={() => {
              setSearchResults([]);
              setShowInput(false);
              setSearchTerm("");
            }}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            value={searchTerm}
            disabled={isSearching}
            style={{
              width: isSearching && window.innerWidth > 900 ? "210px" : "",
              padding:
                isSearching && window.innerWidth > 900 ? "0 55px 0 18px" : "",
            }}
          />
          {isSearching && (
            <CgSpinnerTwo
              color="#F8F8FF"
              className="search-icon-animated"
              size={window.innerWidth < 900 ? 19 : 24}
            />
          )}
        </>
      )}

      {!showInput ? (
        <>
          <div
            className="header-logo-dim"
            onClick={handleSearchClick}
            onKeyDown={handleKeyDown}
            role="button"
            title="Open article search"
            aria-label="Open article search input field"
            tabIndex="0"
          />
          <div className="header-logo" aria-label="wikiarticles logo">
            <span>wiki</span>articles
          </div>
          <IoSearch
            color="#F8F8FF"
            size={window.innerWidth < 900 ? 19 : 23}
            className="search-icon"
            aria-hidden="true"
            onClick={handleSearchClick}
          />
        </>
      ) : (
        <></>
      )}

      <button
        ref={likedArticlesIconRef}
        onClick={handleLikedArticlesClick}
        title="View liked articles"
        aria-label="Toggle liked articles popup"
        className="header-icon liked-articles-icon"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <TbFileLike
          color="#F8F8FF"
          size={window.innerWidth < 900 ? 27.5 : 43.2}
          style={{
            position: "relative",
            bottom: window.innerWidth < 900 ? "0" : "5px",
          }}
          aria-hidden="true"
        />
      </button>
      <a
        href="https://github.com/badhri-hari/wikiarticles"
        target="_blank"
        rel="noreferrer noopener"
        title="View source code on GitHub"
        aria-label="View source code on GitHub"
      >
        <VscGithubInverted
          color="#F8F8FF"
          size={window.innerWidth < 900 ? 27.5 : 43.2}
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
          aria-label="List of search results"
        >
          {searchResults.map((searchResult, index) => (
            <div key={index} className="search-result">
              <a
                href={searchResult.link}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${searchResult.title} on Wikipedia`}
                aria-label={`Search result number ${index}: ${searchResult.title}. Click to open it on Wikipedia`}
              >
                <div className="gray-border" style={{ marginLeft: "-10px" }}>
                  <h2
                    style={{
                      width: window.innerWidth > 900 ? "67%" : "40%",
                      marginLeft: "5px",
                    }}
                  >
                    {searchResult.title}
                  </h2>
                  <h3
                    style={{
                      textAlign: "right",
                      width: window.innerWidth > 900 ? "" : "28%",
                      right: window.innerWidth > 900 ? "10px" : "150px",
                    }}
                  >
                    {searchResult.summary}
                  </h3>
                </div>
              </a>
            </div>
          ))}
        </div>
      )}

      {showLikedArticles && (
        <div
          className="liked-articles-container"
          ref={likedArticlesContainerRef}
          onBlur={handleBlur}
          aria-label="List of liked articles"
        >
          {likedArticles.length > 0 ? (
            <>
              <button
                onClick={handleDownloadLikedArticles}
                title="Download your liked articles in a JSON file"
                aria-label="Click to download your liked articles in a JSON file"
                className="download-liked-articles-button"
              >
                Download List
              </button>
              {likedArticles.map((article, index) => (
                <div key={index} className="search-result">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open Wikipedia page for ${article.title}`}
                    aria-label={`Click to open Wikipedia page for liked article number ${index}: ${article.title}`}
                  >
                    <div className="gray-border">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveLikedArticle(article);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                        aria-label="Remove article from liked list"
                      >
                        <RxCross1 />
                      </button>
                      <h2>{article.title}</h2>
                      <h3>{article.dateLiked} (UTC)</h3>
                    </div>
                  </a>
                </div>
              ))}
            </>
          ) : (
            <div className="search-result no-liked-articles-text">
              {window.innerWidth < 900 ? (
                <h2>Double tap to like/unlike an article!</h2>
              ) : (
                <h2>No liked articles.</h2>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
