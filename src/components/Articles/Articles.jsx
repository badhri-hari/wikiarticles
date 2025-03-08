import { useEffect, useRef, useState } from "react";
import axios from "axios";

import { TbWorldSearch } from "react-icons/tb";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { FaWikipediaW } from "react-icons/fa6";

import "./Articles.css";
import "./Articles-mobile.css";

export default function Articles({ searchActive }) {
  const containerRef = useRef(null);
  const slidesRef = useRef([]);
  const sentinelRef = useRef(null);
  const [articles, setArticles] = useState([]);
  const [likedArticlesUpdate, setLikedArticlesUpdate] = useState(0);
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

  const isArticleLiked = (pageUrl) => {
    const likedArticles =
      JSON.parse(localStorage.getItem("likedArticles")) || [];
    return likedArticles.some((item) => item.link === pageUrl);
  };

  const handleLikeArticle = (article) => {
    let likedArticles = JSON.parse(localStorage.getItem("likedArticles")) || [];
    const index = likedArticles.findIndex(
      (item) => item.link === article.pageUrl
    );
    if (index === -1) {
      likedArticles.push({ title: article.title, link: article.pageUrl });
    } else {
      likedArticles.splice(index, 1);
    }
    localStorage.setItem("likedArticles", JSON.stringify(likedArticles));
    setLikedArticlesUpdate(likedArticlesUpdate + 1);
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
                      <TbWorldSearch
                        size="1.5rem"
                        style={{ marginRight: "15px" }}
                        aria-hidden="true"
                      />
                      <span className="search-online-text">Online</span>
                    </a>
                  </h2>
                  <h2 style={{ marginLeft: "-6px" }}>
                    <button
                      onClick={() => handleLikeArticle({ title, pageUrl })}
                      style={{
                        background: "none",
                        border: "none",
                        textDecoration: "none",
                        color: "inherit",
                        cursor: "pointer",
                        fontSize: "2rem",
                        textDecoration: "bold",
                        marginTop: "8px",
                        marginBottom: "22px",
                      }}
                      aria-label={
                        isArticleLiked(pageUrl)
                          ? "This article has been liked!"
                          : "Like and save this article"
                      }
                    >
                      {isArticleLiked(pageUrl) ? (
                        <>
                          <BiSolidLike
                            size="1.5rem"
                            style={{
                              marginRight: "15px",
                              marginTop:
                                window.innerWidth < 900 ? "27px" : "0px",
                            }}
                            aria-hidden="true"
                          />
                          <span className="search-liked-text">Liked!</span>
                        </>
                      ) : (
                        <>
                          <BiLike
                            size="1.5rem"
                            style={{
                              marginRight: "15px",
                              marginTop:
                                window.innerWidth < 900 ? "27px" : "0px",
                            }}
                            aria-hidden="true"
                          />
                          <span className="search-liked-text">Like</span>
                        </>
                      )}
                    </button>
                  </h2>
                </div>

                <footer>
                  <div className="view-count">
                    <a
                      href={`https://pageviews.wmcloud.org/?project=en.wikipedia.org&platform=all-access&agent=user&redirects=1&range=all-time&pages=${article.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`This article has ${article.viewCount} views. Click on this to see historical pageview data`}
                    >
                      {article.viewCount} views
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
                      Last edited:
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
