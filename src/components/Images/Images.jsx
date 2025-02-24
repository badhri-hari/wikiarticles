import { useEffect, useRef, useState } from "react";
import axios from "axios";

import { IoMdSearch } from "react-icons/io";
import { FaRedditAlien } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";

import "./Images.css";

export default function Images() {
  const containerRef = useRef(null);
  const slidesRef = useRef([]);
  const sentinelRef = useRef(null);
  const [articles, setArticles] = useState([]);

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
      const response = await axios.get("/api/wikipedia");
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
      { threshold: 0, rootMargin: "200px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, []);

  const createLink = (baseUrl, title, extra = "") =>
    `${baseUrl}${encodeURIComponent(title)}${extra}`;

  return (
    <>
      <div className="image-container" ref={containerRef}>
        {articles.map((article, index) => {
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

              <div className="more-like-this">
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
                  Last edited on{" "}
                  {new Date(article.timestamp).toLocaleDateString()}
                </a>
              </div>

              <div className="view-count">
                {article.viewCount} views |{" "}
                <a
                  href={`https://en.wikipedia.org/wiki/Talk:${encodeURIComponent(
                    title
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Talk page
                </a>
              </div>

              <div className="search">
                <h2>
                  <a
                    href={createLink("https://www.google.com/search?q=", title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <IoMdSearch size="1.5rem" style={{ marginRight: "15px" }} />
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
                    <FaYoutube size="1.5rem" style={{ marginRight: "15px" }} />
                    <span className="search-text">YouTube</span>
                  </a>
                </h2>
              </div>

              <div className="article-link">
                <a href={pageUrl} target="_blank" rel="noopener noreferrer">
                  Go to article
                  <FaArrowRightLong
                    size="1.3rem"
                    style={{ marginLeft: "14px" }}
                  />
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <div ref={sentinelRef} style={{ height: "1px" }}></div>
    </>
  );
}
