import { useState, useRef, useEffect } from "react";
import { TbFileLike } from "react-icons/tb";
import { RxCross1 } from "react-icons/rx";
import { GrResources } from "react-icons/gr";
import { IoLanguage, IoColorFilterOutline } from "react-icons/io5";
import { HexColorPicker } from "react-colorful";
import { FaArrowLeftLong } from "react-icons/fa6";

import "./Header.css";
import "./Header-mobile.css";

const API_URL = import.meta.env.VITE_ARTICLES_API;

import { sourceOptionsImport } from "../../../data/sourceOptions.jsx";
import { langOptionsImport } from "../../../data/langOptions.jsx";
import presetThemes from "../../../data/themeOptions.jsx";

import {
  handleLikedArticlesClick,
  handleDownloadLikedArticles,
  handleRemoveLikedArticle,
  hexToRgbString,
  handleClickOutsideHeader,
} from "./headerHelpers.js";

import useWindowSize from "../../../hooks/useWindowSize.js";
import usePressFeedback from "../../../hooks/usePressFeedback.js";

export default function Header({
  selectedSource,
  setSelectedSource,
  fandomQuery,
  setFandomQuery,
  selectedLang,
  setSelectedLang,
}) {
  const { width } = useWindowSize();

  const likedArticlesContainerRef = useRef(null);
  const likedArticlesIconRef = useRef(null);
  const sourceResultsContainerRef = useRef(null);
  const changeSourceIconRef = useRef(null);
  const fandomInputRef = useRef(null);
  const colorPickerRef = useRef(null);
  const colorPickerIconRef = useRef(null);
  const langResultsContainerRef = useRef(null);
  const changeLangIconRef = useRef(null);

  const [likedButtonRef, triggerLikedButton] = usePressFeedback();
  const [changeSourceRef, triggerChangeSource] = usePressFeedback();
  const [changeBgColorRef, triggerChangeBgColor] = usePressFeedback();
  const [changeLangRef, triggerChangeLang] = usePressFeedback();
  const [downloadRef, triggerDownload] = usePressFeedback();

  const [showLegalNotice, setShowLegalNotice] = useState(false);

  const [showSourceSelectionBox, setShowSourceSelectionBox] = useState(false);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [animateSourceBox, setAnimateSourceBox] = useState("");

  const [showLikedArticles, setShowLikedArticles] = useState(false);
  const [likedArticles, setLikedArticles] = useState([]);
  const [animateLikedArticles, setAnimateLikedArticles] = useState("");

  const [showLangSelectionBox, setShowLangSelectionBox] = useState(false);
  const [langOptions, setLangOptions] = useState([]);
  const [animateLangBox, setAnimateLangBox] = useState("");

  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedLangGroups, setExpandedLangGroups] = useState({});

  const [isFandomSearching, setIsFandomSearching] = useState(false);
  const [isFandomInputValid, setIsFandomInputValid] = useState(true);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [animateColorPicker, setAnimateColorPicker] = useState("");

  const [userBgColor, setUserBgColor] = useState(
    localStorage.getItem("userBgColor") || "0, 0, 0"
  );
  const [initialBgColor, setInitialBgColor] = useState(userBgColor);
  const [colorInputValue, setColorInputValue] = useState(userBgColor);
  const [isColorInputValid, setIsColorInputValid] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    if (!hasVisited) {
      setShowLegalNotice(true);
      localStorage.setItem("hasVisitedBefore", "true");
      const timer = setTimeout(() => setShowLegalNotice(false), 30000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChangeSourceClick = () => {
    if (!showSourceSelectionBox) {
      setSourceOptions(sourceOptionsImport);
      setAnimateSourceBox("expand-down");
      setShowSourceSelectionBox(true);
    } else {
      setAnimateSourceBox("collapse-up");
      setTimeout(() => {
        setShowSourceSelectionBox(false);
        setExpandedGroups({});
      }, 300);
    }
  };

  const handleChangeLangClick = () => {
    if (!showLangSelectionBox) {
      setLangOptions(langOptionsImport);
      setAnimateLangBox("expand-down");
      setShowLangSelectionBox(true);
    } else {
      setAnimateLangBox("collapse-up");
      setTimeout(() => {
        setShowLangSelectionBox(false);
        setExpandedLangGroups({});
      }, 300);
    }
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const toggleLangGroup = (groupName) => {
    setExpandedLangGroups((prev) => {
      const newState = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});
      return {
        ...newState,
        [groupName]: !prev[groupName],
      };
    });
  };

  const triggerItemFeedback = (e) => {
    e.currentTarget.classList.remove("press-feedback");
    void e.currentTarget.offsetWidth;
    e.currentTarget.classList.add("press-feedback");
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--bg-color", userBgColor);
    localStorage.setItem("userBgColor", userBgColor);
  }, [userBgColor]);

  useEffect(() => {
    if (expandedGroups["Fandom"] && fandomInputRef.current) {
      fandomInputRef.current.focus();
    }
  }, [expandedGroups]);

  useEffect(() => {
    setColorInputValue(userBgColor);
  }, [userBgColor]);

  useEffect(() => {
    const handleClick = (event) =>
      handleClickOutsideHeader({
        event,
        refs: {
          likedArticlesContainerRef,
          likedArticlesIconRef,
          sourceResultsContainerRef,
          changeSourceIconRef,
          colorPickerRef,
          colorPickerIconRef,
          langResultsContainerRef,
          changeLangIconRef,
        },
        states: {
          showLikedArticles,
          showSourceSelectionBox,
          showColorPicker,
          showLangSelectionBox,
        },
        actions: {
          setAnimateLikedArticles,
          setShowLikedArticles,
          setAnimateSourceBox,
          setShowSourceSelectionBox,
          setExpandedGroups,
          fandomInputRef,
          setAnimateColorPicker,
          setShowColorPicker,
          setAnimateLangBox,
          setShowLangSelectionBox,
          setExpandedLangGroups,
        },
      });

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [
    showLikedArticles,
    showSourceSelectionBox,
    showColorPicker,
    showLangSelectionBox,
  ]);

  return (
    <header>
      <a
        href="https://github.com/badhri-hari/wikiarticles"
        target="_blank"
        rel="noreferrer noopener"
        className="header-logo"
        title="View source code on GitHub"
        aria-label="Click to view source code on GitHub"
      >
        <span>wiki</span>articles
      </a>

      {showLegalNotice && (
        <a
          href="https://github.com/badhri-hari/wikiarticles"
          target="_blank"
          rel="noreferrer noopener"
          title="View source code on GitHub"
          aria-label="Click to view source code on GitHub"
          className="legal-notice"
        >
          <FaArrowLeftLong
            color="#F8F8FF"
            size="15"
            aria-hidden
            className="legal-icon"
          />
          legal stuff
        </a>
      )}

      <button
        ref={(el) => {
          changeSourceIconRef.current = el;
          changeSourceRef.current = el;
        }}
        onClick={() => {
          triggerChangeSource();
          handleChangeSourceClick();
        }}
        title="Change source of articles"
        aria-label="Click to open box through which you can select different sources for random articles"
        aria-expanded={showSourceSelectionBox}
        className="header-icon change-source-button"
      >
        <GrResources
          color="#F8F8FF"
          size={width < 900 ? 27.5 : 42.5}
          aria-hidden
          className="change-source-icon"
        />
      </button>

      <button
        ref={(el) => {
          likedArticlesIconRef.current = el;
          likedButtonRef.current = el;
        }}
        onClick={() => {
          triggerLikedButton();
          handleLikedArticlesClick(
            showLikedArticles,
            setLikedArticles,
            setAnimateLikedArticles,
            setShowLikedArticles
          );
        }}
        title="View liked articles"
        aria-label="Click to toggle liked articles popup"
        aria-expanded={showLikedArticles}
        className="header-icon liked-articles-button"
      >
        <TbFileLike
          color="#F8F8FF"
          size={width < 900 ? 27.5 : 43.2}
          aria-hidden
          className="liked-articles-icon"
        />
      </button>

      <button
        ref={(el) => {
          colorPickerIconRef.current = el;
          changeBgColorRef.current = el;
        }}
        onClick={() => {
          setInitialBgColor(userBgColor);
          triggerChangeBgColor();

          if (!showColorPicker) {
            setAnimateColorPicker("expand-down");
            setShowColorPicker(true);
          } else {
            setAnimateColorPicker("collapse-up");
            setTimeout(() => setShowColorPicker(false), 300);
          }
        }}
        title="Change app color"
        aria-label="Click to change app color"
        aria-expanded={showColorPicker}
        className="header-icon change-bgcolor-button"
      >
        <IoColorFilterOutline
          color="#F8F8FF"
          size={width < 900 ? 27.5 : 42.5}
          aria-hidden
          className="change-bgcolor-icon"
        />
      </button>

      <button
        ref={(el) => {
          changeLangIconRef.current = el;
          changeLangRef.current = el;
        }}
        onClick={() => {
          triggerChangeLang();
          handleChangeLangClick();
        }}
        title="Change language of articles"
        aria-label="Click to change article language"
        aria-expanded={showLangSelectionBox}
        className="header-icon change-lang-button"
      >
        <IoLanguage
          color="#F8F8FF"
          size={width < 900 ? 27.5 : 42.5}
          aria-hidden
          className="change-lang-icon"
        />
      </button>

      {showSourceSelectionBox && (
        <div
          className={`list-box-container source-selection-container ${animateSourceBox}`}
          ref={sourceResultsContainerRef}
          aria-label="List of sources from which you can view random articles/files from"
          role="list"
        >
          <div>
            {sourceOptions.map((source, index) => {
              const isExpanded = expandedGroups[source.name];
              const isSubGroup = !source.isGroupStart;
              if (isSubGroup) {
                const parent = [...sourceOptions.slice(0, index)]
                  .reverse()
                  .find((opt) => opt.isGroupStart);
                if (!expandedGroups[parent?.name]) return null;
              }
              return (
                <section
                  key={index}
                  className={
                    !source.isGroupStart
                      ? "source-selection"
                      : "gray-border source-selection"
                  }
                  aria-labelledby={`source-group-${index}`}
                  role="listitem"
                >
                  {source.isGroupStart && (
                    <div id={`source-group-${index}`} hidden>
                      {source.name}
                    </div>
                  )}
                  <div
                    className="list-box"
                    title={`${source.name}: ${source.description}`}
                    style={{
                      fontStyle:
                        selectedSource === source.displayName && "italic",
                      opacity: selectedSource === source.displayName && "0.5",
                      cursor:
                        selectedSource === source.displayName && "default",
                    }}
                    onClick={(e) => {
                      triggerItemFeedback(e);

                      if (source.isGroupStart) {
                        if (source.displayName === "Fandom") {
                          setFandomQuery("");
                          setIsFandomInputValid(true);
                          toggleGroup(source.name);
                          return;
                        }

                        const nextGroupIndex = sourceOptions
                          .slice(index + 1)
                          .findIndex((opt) => opt.isGroupStart);
                        const children =
                          nextGroupIndex === -1
                            ? sourceOptions.slice(index + 1)
                            : sourceOptions.slice(
                                index + 1,
                                index + 1 + nextGroupIndex
                              );
                        const hasValidChildren =
                          children.length > 0 &&
                          children.every((child) => !child.isGroupStart);

                        if (!hasValidChildren) {
                          setSelectedSource(source.displayName);
                          setShowSourceSelectionBox(false);
                        } else {
                          if (expandedGroups[source.name]) {
                            setSelectedSource(source.displayName);
                            setShowSourceSelectionBox(false);
                          } else {
                            toggleGroup(source.name);
                          }
                        }

                        return;
                      }

                      if (selectedSource === source.displayName) return;

                      setSelectedSource(source.displayName);
                      setShowSourceSelectionBox(false);
                    }}
                    aria-label={`Click to ${
                      source.isGroupStart
                        ? "toggle/select group"
                        : "select source"
                    } ${source.name}`}
                    aria-disabled={selectedSource === source.displayName}
                  >
                    <div
                      className={
                        !source.isGroupStart ? "source-sub-group" : undefined
                      }
                    >
                      <h2>
                        {source.icon && <span>{source.icon}</span>}
                        {source.name}
                      </h2>
                      <h3>{source.description}</h3>
                      {source.displayName === "Fandom" &&
                        expandedGroups[source.name] && (
                          <div>
                            <input
                              type="text"
                              ref={fandomInputRef}
                              placeholder="Enter fandom (ex. 'Star Wars')"
                              aria-label="Type a fandom name"
                              autoFocus
                              spellCheck
                              required
                              disabled={isFandomSearching}
                              inputMode="text"
                              maxLength="30"
                              className="fandom-input"
                              style={
                                !isFandomInputValid
                                  ? {
                                      outline: "1px solid red",
                                      outlineOffset: "1px",
                                    }
                                  : {}
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  let userInput = e.target.value.trim();
                                  if (userInput === "") {
                                    userInput = "undefined";
                                  }
                                  setIsFandomSearching(true);
                                  fetch(
                                    `${API_URL}/fandom-search?q=${encodeURIComponent(
                                      userInput
                                    )}`
                                  )
                                    .then((res) => {
                                      if (!res.ok)
                                        throw new Error("Fandom not found.");
                                      return res.json();
                                    })
                                    .then((result) => {
                                      setFandomQuery(result.title);
                                      setSelectedSource("Fandom");
                                      setShowSourceSelectionBox(false);
                                    })
                                    .catch((err) => {
                                      console.error(err);
                                      setIsFandomInputValid(false);
                                    })
                                    .finally(() => {
                                      setIsFandomSearching(false);
                                    });
                                }
                              }}
                              onChange={(e) => {
                                setIsFandomInputValid(true);
                              }}
                            />
                          </div>
                        )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {showLikedArticles && (
        <div
          className={`list-box-container liked-articles-container ${animateLikedArticles}`}
          ref={likedArticlesContainerRef}
          aria-label="List of liked articles"
          role="list"
        >
          {likedArticles.length > 0 ? (
            <>
              <button
                ref={downloadRef}
                onClick={() => {
                  triggerDownload();
                  handleDownloadLikedArticles();
                }}
                title="Download your liked articles in a JSON file"
                aria-label="Click to download your liked articles in a JSON file"
                className="download-liked-articles-button"
              >
                Download List
              </button>
              {likedArticles.map((article, index) => (
                <div key={index} className="list-box" role="listitem">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={article.link}
                    aria-label={`Click to open Wikipedia page for liked article number ${index}: ${article.title}`}
                  >
                    <div className="gray-border liked-articles">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          triggerItemFeedback(e);
                          handleRemoveLikedArticle(
                            article,
                            likedArticles,
                            setLikedArticles
                          );
                        }}
                        aria-label="Click to remove article from liked list"
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
            <div className="list-box no-liked-articles-text" role="listitem">
              {width < 900 ? (
                <h2>Double tap to like/unlike an article!</h2>
              ) : (
                <h2>No liked articles.</h2>
              )}
            </div>
          )}
        </div>
      )}

      {showColorPicker && (
        <div
          className={`list-box-container color-picker-container ${animateColorPicker}`}
          ref={colorPickerRef}
          aria-label="Choose your preferred color for the app"
        >
          <HexColorPicker
            color={`#${userBgColor
              .split(",")
              .map((x) => (+x).toString(16).padStart(2, "0"))
              .join("")}`}
            onChange={(hex) => setUserBgColor(hexToRgbString(hex))}
          />

          <div className="color-input-row">
            <input
              className="color-input-manual"
              style={
                !isColorInputValid
                  ? {
                      outline: "1px solid red",
                      outlineOffset: "1px",
                    }
                  : {}
              }
              type="text"
              onChange={(e) => {
                const val = e.target.value;
                setColorInputValue(val);
                const isValid =
                  /^(\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})$/.test(val) &&
                  val.split(",").every((num) => +num >= 0 && +num <= 255);
                setIsColorInputValid(isValid);
                if (isValid) {
                  setUserBgColor(val);
                }
              }}
              placeholder="Any color in RGB format like 100,150,200"
              aria-label="Input a color in RGB format like 100,150,200"
            />

            <button
              className="reset-bgcolor-button"
              onClick={() => setUserBgColor(initialBgColor)}
              title={`Reset to color before opening picker: ${initialBgColor}`}
              aria-label={`Click to reset background color to previous color: ${initialBgColor}`}
            >
              Reset
            </button>
          </div>

          <div className="preset-theme-buttons">
            {presetThemes.map((theme, idx) => (
              <button
                key={idx}
                onClick={() => setUserBgColor(theme.value)}
                className="preset-theme-button"
                style={{ backgroundColor: `rgb(${theme.value})` }}
                title={theme.value}
                aria-label={`Click to apply the ${theme.name} background theme`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {showLangSelectionBox && (
        <div
          className={`list-box-container source-selection-container ${animateLangBox}`}
          style={{ right: "15px" }}
          ref={langResultsContainerRef}
          aria-label="List of languages you can view random articles/files in"
        >
          <div>
            {langOptions.map((lang, index) => {
              const isExpanded = expandedLangGroups[lang.name];
              const isSubGroup = !lang.isGroupStart;
              if (isSubGroup) {
                const parent = [...langOptions.slice(0, index)]
                  .reverse()
                  .find((opt) => opt.isGroupStart);
                if (!expandedLangGroups[parent?.name]) return null;
              }

              return (
                <div
                  key={index}
                  className={
                    !lang.isGroupStart
                      ? "source-selection"
                      : "gray-border source-selection"
                  }
                >
                  <div
                    className="list-box"
                    title={lang.name}
                    style={{
                      fontStyle: selectedLang === lang.code && "italic",
                      opacity: selectedLang === lang.code && "0.5",
                      cursor: selectedLang === lang.code && "default",
                    }}
                    onClick={(e) => {
                      triggerItemFeedback(e);

                      if (lang.isGroupStart) {
                        const hasSubGroups = langOptions
                          .slice(index + 1)
                          .some((opt) => !opt.isGroupStart);
                        const nextGroupIndex = langOptions
                          .slice(index + 1)
                          .findIndex((opt) => opt.isGroupStart);
                        const children =
                          nextGroupIndex === -1
                            ? langOptions.slice(index + 1)
                            : langOptions.slice(
                                index + 1,
                                index + 1 + nextGroupIndex
                              );
                        const hasValidChildren =
                          children.length > 0 &&
                          children.every((child) => !child.isGroupStart);
                        if (!hasValidChildren) {
                          setSelectedLang(lang.code || lang.name);
                          setShowLangSelectionBox(false);
                        } else {
                          if (expandedLangGroups[lang.name]) {
                            setSelectedLang(lang.code || lang.name);
                            setShowLangSelectionBox(false);
                          } else {
                            toggleLangGroup(lang.name);
                          }
                        }
                      } else {
                        setSelectedLang(lang.code);
                        setShowLangSelectionBox(false);
                      }
                    }}
                    aria-label={`Click to ${
                      lang.isGroupStart
                        ? "toggle/select group"
                        : "select language"
                    } ${lang.name}`}
                    aria-disabled={selectedLang === lang.code}
                  >
                    <div
                      className={
                        !lang.isGroupStart ? "source-sub-group" : undefined
                      }
                    >
                      <h2>
                        {lang.icon && <span>{lang.icon}</span>}
                        {lang.name}
                      </h2>
                      <h3>{lang.description}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
