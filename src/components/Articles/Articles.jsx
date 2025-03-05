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

export default function Articles() {
  const containerRef = useRef(null);
  const slidesRef = useRef([]);
  const sentinelRef = useRef(null);
  const [articles, setArticles] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    const slides = slidesRef.current;
    slides.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => {
      slides.forEach((slide) => {
        if (slide) observer.unobserve(slide);
      });
    };
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get("/api/articles");
      setArticles((prev) => [...prev, ...response.data.articles]);
    } catch (error) {
      console.error("Error fetching articles:", error);
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

  return (
    <>
      <div className="image-container" ref={containerRef}>
        {articles.length === 0 ? (
          <div className="image-carousel-slide">
            <img src="/default-image.jpg" alt="Loading..." />
            <div className="description">
              <h2>Please wait...</h2>
              <p>Fetching articles...</p>
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

                <a href={pageUrl} target="_blank" rel="noopener noreferrer">
                  <div className="article-link">
                    <FaWikipediaW size="2rem" style={{ marginLeft: "10px" }} />
                  </div>
                </a>

                <div className="toc">
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

                <div className="search">
                  <h2>
                    <a
                      href={createLink(
                        "https://www.google.com/search?q=",
                        title
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <IoMdSearch
                        size="1.5rem"
                        style={{ marginRight: "15px" }}
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
                    >
                      <FaRedditAlien
                        size="1.5rem"
                        style={{ marginRight: "15px" }}
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
                    >
                      <FaYoutube
                        size="1.5rem"
                        style={{ marginRight: "15px" }}
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
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      {window.innerWidth < 900 ? (
                        <>
                          <GoShare
                            size="1.5rem"
                            style={{ marginRight: "15px" }}
                          />
                          <span className="search-text">Share</span>
                        </>
                      ) : copiedLink ? (
                        <>
                          <FaCheck
                            size="1.5rem"
                            style={{ marginRight: "15px", color: "green" }}
                          />
                          <span className="search-text">Copied!</span>
                        </>
                      ) : (
                        <>
                          <IoMdLink
                            size="1.5rem"
                            style={{ marginRight: "15px" }}
                          />
                          <span className="search-text">Link</span>
                        </>
                      )}
                    </a>
                  </h2>
                </div>

                <footer>
                  <div className="more-like-this">
                    <a
                      href={`https://en.wikipedia.org/wiki/Talk:${encodeURIComponent(
                        title
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Talk page
                    </a>
                    <span style={{ color: "white" }}> | </span>
                    <a
                      href={`https://en.wikipedia.org/w/index.php?fulltext=1&search=${encodeURIComponent(
                        title
                      )}&title=Special%3ASearch&ns0=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      More Like This
                    </a>
                  </div>
                  <div className="last-edited">
                    <a
                      href={`https://en.wikipedia.org/w/index.php?title=${encodeURIComponent(
                        title
                      )}&action=history`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {window.innerWidth < 900 ? (
                        <>
                          Edited:{" "}
                          {new Date(article.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </>
                      ) : (
                        <>
                          Last edited on{" "}
                          {new Date(article.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </>
                      )}
                    </a>
                  </div>
                  <div className="view-count">{article.viewCount} views</div>
                </footer>
              </div>
            );
          })
        )}
      </div>
      <div ref={sentinelRef} style={{ height: "1px" }}></div>
    </>
  );
}
