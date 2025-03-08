import { useEffect, useRef, useState } from "react";
import axios from "axios";

import { IoMdSearch } from "react-icons/io";
import { FaRedditAlien } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaWikipediaW } from "react-icons/fa6";
import { IoMdLink } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import { GoShare } from "react-icons/go";

import "./Articles.css";
import "./Articles-mobile.css";

export default function Articles({ searchActive }) {
  const containerRef = useRef(null);
  const slidesRef = useRef([]);
  const sentinelRef = useRef(null);
  const [articles, setArticles] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchArticles = async () => {
    try {
      const response = await axios.get("/api/articles");
      setArticles((prev) => [...prev, ...response.data.articles]);
      setHasError(false);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setHasError(true);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchArticles();
        }
      },
      { threshold: 0, rootMargin: "400px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, []);

  useEffect(() => {
    const urlObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const titleEl = entry.target.querySelector(".description h2");
            if (titleEl) {
              const title = titleEl.textContent;
              const formattedTitle = title.replace(/\s+/g, "_");
              const newUrl = window.location.origin + "/" + formattedTitle;
              window.history.replaceState(null, "", newUrl);
            }
          }
        });
      },
      { threshold: 0.6 }
    );
    slidesRef.current.forEach((slide) => {
      if (slide) urlObserver.observe(slide);
    });
    return () => {
      slidesRef.current.forEach((slide) => {
        if (slide) urlObserver.unobserve(slide);
      });
    };
  }, [articles]);

  const createLink = (baseUrl, title, extra = "") =>
    `${baseUrl}${encodeURIComponent(title)}${extra}`;

  const handleCopyLink = (pageUrl) => {
    navigator.clipboard
      .writeText(pageUrl)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => {
          setCopiedLink(false);
        }, 7000);
      })
      .catch((error) => {
        console.error("Error copying to clipboard:", error);
      });
  };

  const handleShareLink = (pageUrl, title) => {
    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: title,
          url: pageUrl,
        })
        .catch((error) => console.error("Error sharing the link:", error));
    } else {
      console.log("the web Share API is not supported on this device.");
    }
  };

  const generateSeeMoreLink = (toc, pageUrl) => {
    let seeMoreLink = null;

    const furtherReadingSection = toc.find((section) =>
      section.line.toLowerCase().includes("further reading")
    );
    const referencesSection = toc.find((section) =>
      section.line.toLowerCase().includes("references")
    );
    const externalLinksSection = toc.find((section) =>
      section.line.toLowerCase().includes("external links")
    );
    const seeAlsoSection = toc.find((section) =>
      section.line.toLowerCase().includes("see also")
    );

    if (furtherReadingSection) {
      seeMoreLink = `${pageUrl}#${furtherReadingSection.anchor}`;
    } else if (referencesSection) {
      seeMoreLink = `${pageUrl}#${referencesSection.anchor}`;
    } else if (externalLinksSection) {
      seeMoreLink = `${pageUrl}#${externalLinksSection.anchor}`;
    } else if (seeAlsoSection) {
      seeMoreLink = `${pageUrl}#${seeAlsoSection.anchor}`;
    } else if (pageUrl) {
      seeMoreLink = `${pageUrl}?search=${encodeURIComponent(toc.title)}`;
    }

    return seeMoreLink;
  };

  const handleSeeMoreClick = (pageUrl, toc) => {
    const seeMoreLink = generateSeeMoreLink(toc, pageUrl);
    window.open(seeMoreLink, "_blank");
  };

  return (
    <>
      <div
        className="image-container"
        ref={containerRef}
        role="region"
        aria-label="Page container"
      >
        {articles.length === 0 ? (
          <div className="image-carousel-slide">
            <img src="/default-image.jpg" alt="Loading..." />
            <div className="description">
              <h2>{hasError ? "Uh Oh!" : "Please wait..."}</h2>
              <p>
                {hasError
                  ? "Looks like there's a problem with the server right now, please try again later."
                  : "Fetching articles..."}
              </p>
            </div>
            <div className="toc"></div>
            <div className="search"></div>
            <div className="article-link"></div>
            <div className="more-like-this" style={{ display: "none" }}></div>
            <div className="last-edited" style={{ display: "none" }}></div>
            <div className="view-count" style={{ display: "none" }}></div>
          </div>
        ) : (
          articles.map((article, index) => {
            const title = article.title;
            const pageUrl =
              article.content_urls?.desktop?.page ||
              `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
            const imageUrl = article.thumbnail?.source || "/default-image.jpg";
            return (
              <div
                className="image-carousel-slide"
                key={index}
                ref={(el) => (slidesRef.current[index] = el)}
              >
                <img src={imageUrl} alt={`Slide ${index + 1}`} />

                <div className="description">
                  <h2>{title}</h2>
                  <p>{article.extract}</p>
                </div>
                <a
                  href={pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open article page in Wikipedia"
                >
                  <div className="article-link">
                    <FaWikipediaW
                      size="2rem"
                      style={{ marginLeft: "10px" }}
                      aria-hidden="true"
                    />
                  </div>
                </a>
                <div className="toc" aria-label="Table of contents">
                  {article.toc && article.toc.length > 0 ? (
                    article.toc.map((section, idx) => {
                      let Tag = "h5";
                      if (section.toclevel == 1 || section.toclevel === "1") {
                        Tag = "h3";
                      } else if (
                        section.toclevel == 2 ||
                        section.toclevel === "2"
                      ) {
                        Tag = "h4";
                      } else if (
                        section.toclevel == 3 ||
                        section.toclevel === "3"
                      ) {
                        Tag = "h5";
                      }
                      return (
                        <Tag key={idx}>
                          <a
                            href={`${pageUrl}#${section.anchor}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${section.line} section in Wikipedia`}
                          >
                            {section.line}
                          </a>
                        </Tag>
                      );
                    })
                  ) : (
                    <h3>No sections available</h3>
                  )}
                </div>
                <div
                  className="search"
                  aria-label="Search options"
                  style={{
                    display:
                      searchActive && window.innerWidth < 900 ? "none" : "",
                  }}
                >
                  <h2>
                    <a
                      href={createLink(
                        "https://www.google.com/search?q=",
                        title
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "inherit" }}
                      aria-label={`Search ${title} online`}
                    >
                      <IoMdSearch
                        size="1.5rem"
                        style={{ marginRight: "15px" }}
                        aria-hidden="true"
                      />
                      <span className="search-text">Online</span>
                    </a>
                  </h2>
                  <h2>
                    <a
                      href={createLink(
                        "https://www.reddit.com/search/?q=",
                        title
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "inherit" }}
                      aria-label={`Search ${title} on Reddit`}
                    >
                      <FaRedditAlien
                        size="1.5rem"
                        style={{ marginRight: "15px" }}
                        aria-hidden="true"
                      />
                      <span className="search-text">Reddit</span>
                    </a>
                  </h2>
                  <h2>
                    <a
                      href={createLink(
                        "https://www.youtube.com/results?search_query=",
                        title
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "inherit" }}
                      aria-label={`Search ${title} on YouTube`}
                    >
                      <FaYoutube
                        size="1.5rem"
                        style={{ marginRight: "15px" }}
                        aria-hidden="true"
                      />
                      <span className="search-text">YouTube</span>
                    </a>
                  </h2>
                  <h2>
                    <a
                      onClick={() => {
                        if (window.innerWidth < 900) {
                          handleShareLink(pageUrl, title);
                        } else {
                          handleCopyLink(pageUrl);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          if (window.innerWidth < 900) {
                            handleShareLink(pageUrl, title);
                          } else {
                            handleCopyLink(pageUrl);
                          }
                        }
                      }}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                      role="button"
                      tabIndex="0"
                      aria-label={
                        window.innerWidth < 900
                          ? "Share article"
                          : copiedLink
                          ? "Copied link"
                          : "Copy article link"
                      }
                    >
                      {window.innerWidth < 900 ? (
                        <>
                          <GoShare
                            size="1.5rem"
                            style={{ marginRight: "15px" }}
                            aria-hidden="true"
                          />
                          <span className="search-text">Share</span>
                        </>
                      ) : copiedLink ? (
                        <>
                          <FaCheck
                            size="1.5rem"
                            style={{ marginRight: "15px", color: "green" }}
                            aria-hidden="true"
                          />
                          <span className="search-text">Copied!</span>
                        </>
                      ) : (
                        <>
                          <IoMdLink
                            size="1.5rem"
                            style={{ marginRight: "15px" }}
                            aria-hidden="true"
                          />
                          <span className="search-text">Link</span>
                        </>
                      )}
                    </a>
                  </h2>
                </div>

                <footer>
                  <div className="talk-more">
                    <a
                      href={`https://en.wikipedia.org/wiki/Talk:${encodeURIComponent(
                        title
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open article talk page"
                    >
                      Talk page
                    </a>
                    <span style={{ color: "white" }}> | </span>
                    <a
                      href="#"
                      onClick={() => handleSeeMoreClick(pageUrl, article.toc)}
                      aria-label="See more details about the article"
                    >
                      See More
                    </a>
                  </div>
                  <div className="last-edited">
                    <a
                      href={`https://en.wikipedia.org/w/index.php?title=${encodeURIComponent(
                        title
                      )}&action=history`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View article edit history"
                    >
                      Last edited on
                      {" " +
                        new Date(article.timestamp).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                    </a>
                  </div>
                  <div
                    className="view-count"
                    aria-label={`This article has ${article.viewCount} views`}
                  >
                    {article.viewCount} views
                  </div>
                </footer>
              </div>
            );
          })
        )}
      </div>
      <div ref={sentinelRef} style={{ height: "1px" }} aria-hidden="true"></div>
    </>
  );
}
