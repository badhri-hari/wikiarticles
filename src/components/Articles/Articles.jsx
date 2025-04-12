import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";

const API_URL = import.meta.env.VITE_BACKEND_API;

import { renderLogo } from "../../../data/sourceOptions.jsx";

import {
  isArticleLiked,
  handleLikeArticle,
  handleLikeOverlayClick,
  handleShareLink,
  fixRelativeLinks,
  getTimeAgo,
} from "./articleHelpers.js";

import useFetchArticles from "../../../hooks/Articles/useFetchArticles.js";
import useWindowSize from "../../../hooks/useWindowSize.js";
import useLazyLoadArticles from "../../../hooks/Articles/useLazyLoadArticles.js";

import { FiExternalLink } from "react-icons/fi";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { TbRobot } from "react-icons/tb";
import { RxCross1 } from "react-icons/rx";
import { GiShare } from "react-icons/gi";

import Chat from "../Chat/Chat";
import ViewCountAnimator from "./ViewCountAnimator";

import "./Articles.css";
import "./Articles-mobile.css";

export default function Articles({
  selectedSource,
  fandomQuery,
  selectedLang,
}) {
  const { width } = useWindowSize();

  const containerRef = useRef(null);
  const slidesRef = useRef([]);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isFirstTap, setIsFirstTap] = useState(false);
  const [articleLiked, setArticleLiked] = useState(false);
  const [lastLikeAction, setLastLikeAction] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const [showToc, setShowToc] = useState(true);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentArticleTitle, setCurrentArticleTitle] = useState("");
  const [currentArticleDescription, setCurrentArticleDescription] =
    useState("");
  const [currentArticleImage, setCurrentArticleImage] = useState("");
  const [currentArticleToc, setCurrentArticleToc] = useState([]);
  const [currentArticleUrl, setCurrentArticleUrl] = useState("");
  const [currentArticleSource, setCurrentArticleSource] = useState("");
  const [currentArticleLang, setCurrentArticleLang] = useState("");

  const {
    articles,
    totalArticles,
    isLoading,
    isLoadingMore,
    hasError,
    fetchArticles,
  } = useFetchArticles(API_URL, selectedSource, fandomQuery, selectedLang);

  useEffect(() => {
    fetchArticles();
    setIsChatOpen(false);
    setShowIframe(false);
    setShowToc(true);

    return () => {};
  }, [selectedSource, selectedLang]);

  useLazyLoadArticles({
    slidesRef,
    articles,
    isLoading,
    isLoadingMore,
    totalArticles,
    fetchArticles,
  });

  return (
    <>
      <div className="image-container" ref={containerRef} role="region">
        <div
          className={
            isLoading || hasError ? "loading-overlay" : "loading-overlay hidden"
          }
          style={{ cursor: hasError && "auto" }}
        >
          <div style={{ animation: hasError && "none" }}>
            {renderLogo(selectedSource, isLoading || hasError)}
          </div>
          <h2>{hasError ? "Uh Oh!" : "Please wait..."}</h2>
          <p>
            {hasError && !navigator.onLine
              ? "You need an internet connection to continue!"
              : hasError
              ? "Looks like there's a problem with the server right now, please try again later."
              : `Getting content from ${selectedSource}... (${articles.length}/${totalArticles})`}
          </p>
        </div>

        {isLoading ? (
          <div className="image-carousel-slide"></div>
        ) : (
          articles.map((article, index) => {
            return (
              <div
                className="image-carousel-slide"
                key={index}
                ref={(el) => (slidesRef.current[index] = el)}
                data-baseurl={article.pageUrl}
              >
                {article.thumbnail?.source && (
                  <div
                    className={`image-carousel-slide ${
                      isImageLoaded ? "" : "loading"
                    }`}
                  >
                    <img
                      src={`${API_URL}/image?url=${encodeURIComponent(
                        article.thumbnail?.source
                      )}`}
                      alt={`Image for ${article.title}`}
                      loading="lazy"
                      className={`fade-in ${isImageLoaded ? "loaded" : ""}`}
                      onLoad={() => setIsImageLoaded(true)}
                    />
                  </div>
                )}

                <div
                  className={index >= 3 ? "iframe-button-wrapper" : undefined}
                  style={{
                    display:
                      (selectedSource.startsWith("Wikihow") ||
                        selectedSource.startsWith("Know") ||
                        selectedSource.startsWith("MickeyWiki") ||
                        selectedSource.startsWith("Minecraft") ||
                        selectedSource.startsWith("SCP") ||
                        selectedSource.startsWith("Poland")) &&
                      "none",
                  }}
                >
                  <button
                    onClick={() => {
                      if (!showIframe && !isChatOpen) {
                        setShowIframe(true);
                      } else if (showIframe && !isChatOpen) {
                        setShowIframe(false);
                      } else if (showIframe && isChatOpen) {
                        setIsChatOpen(false);
                      } else if (!showIframe && isChatOpen) {
                        setIsChatOpen(false);
                        setShowIframe(true);
                      }
                    }}
                    className="iframe-toggle-button"
                    style={{
                      bottom:
                        width > 900
                          ? undefined
                          : showIframe
                          ? "80.71%"
                          : "56.5%",
                    }}
                    aria-label="Toggle article iframe"
                  >
                    <span>Toggle article frame</span>
                  </button>
                  {showIframe && width > 900 && (
                    <button
                      onClick={() => setShowToc((prev) => !prev)}
                      className="iframe-toggle-button"
                      style={{ left: "12.5%" }}
                      aria-label="Toggle table of contents"
                    >
                      <span>Toggle Table of Contents</span>
                    </button>
                  )}
                </div>
                <div
                  className={
                    showIframe && !isChatOpen ? "iframe" : "iframe hidden"
                  }
                  style={
                    width > 900
                      ? {
                          left: !showToc && "2%",
                          width: !showToc && "61.5vw",
                        }
                      : { zIndex: "650" }
                  }
                >
                  <iframe
                    src={article.pageUrl}
                    loading="lazy"
                    sandbox="allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
                    title={`Page for ${article.title} (using the iframe element)`}
                  >
                    upgrade your browser dawg
                  </iframe>
                </div>

                {!isChatOpen && (
                  <div
                    className={
                      showIframe ? "description hidden" : "description"
                    }
                    style={{ zIndex: width < 900 && !showIframe && "650" }}
                  >
                    <h2>{article.title}</h2>
                    {article.extractDataType === "array" ? (
                      Array.isArray(article.extract) &&
                      article.extract.map((text, idx) => {
                        const fixedHtml = fixRelativeLinks(
                          text,
                          article.pageUrl
                        );
                        const htmlString = DOMPurify.sanitize(fixedHtml, {
                          ADD_ATTR: ["target"],
                        });

                        return (
                          <p
                            key={idx}
                            dangerouslySetInnerHTML={{
                              __html:
                                idx === 0 &&
                                selectedSource.startsWith("Wikinews")
                                  ? `<i>${htmlString}</i>`
                                  : htmlString,
                            }}
                          />
                        );
                      })
                    ) : (
                      <p>{article.extract}</p>
                    )}
                  </div>
                )}

                <div
                  className={
                    showIframe ? (showToc ? "toc" : "toc hidden") : "toc"
                  }
                  aria-label={
                    selectedSource.startsWith("Wikimedia")
                      ? "Metadata of the media file (if available)"
                      : selectedSource.startsWith("Wikidata")
                      ? "Data item information"
                      : "Table of contents"
                  }
                  style={{
                    paddingTop:
                      selectedSource.startsWith("Wikimedia") &&
                      article.toc.length > 0 &&
                      "10px",
                    height:
                      selectedSource.startsWith("Wikimedia") &&
                      article.toc.length > 0 &&
                      "calc(14px + 55%)",
                    paddingLeft:
                      selectedSource.startsWith("Wikimedia") &&
                      article.toc.length > 0 &&
                      "0px",
                    width:
                      selectedSource.startsWith("Wikimedia") &&
                      article.toc.length > 0 &&
                      "calc(12.5vw + 25px)",
                    overflowX:
                      selectedSource.startsWith("Wikimedia") ||
                      (selectedSource.startsWith("Wikidata") && "scroll"),
                  }}
                >
                  {article.toc.length > 0 ? (
                    article.toc.map((section, idx) => {
                      let Tag = "h3";
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
                            href={
                              !(
                                selectedSource.startsWith("Wikimedia") ||
                                selectedSource.startsWith("Wikidata")
                              )
                                ? `${article.pageUrl}#${section.anchor}`
                                : undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            title={
                              !(
                                selectedSource.startsWith("Wikimedia") ||
                                selectedSource.startsWith("Wikidata")
                              )
                                ? `Open section "${section.line}" on ${
                                    selectedSource.split(" ")[0]
                                  }`
                                : `${section.anchor}`
                            }
                            aria-label={
                              !(
                                selectedSource.startsWith("Wikimedia") ||
                                selectedSource.startsWith("Wikidata")
                              )
                                ? `Click to open ${section.line} section in ${
                                    selectedSource.split(" ")[0]
                                  }`
                                : undefined
                            }
                            style={{
                              opacity:
                                selectedSource.startsWith("Wikimedia") ||
                                selectedSource.startsWith("Wikidata")
                                  ? "1"
                                  : undefined,
                              cursor:
                                selectedSource.startsWith("Wikimedia") ||
                                selectedSource.startsWith("Wikidata")
                                  ? "default"
                                  : undefined,
                            }}
                          >
                            {section.line}
                          </a>
                        </Tag>
                      );
                    })
                  ) : (
                    <h3 style={{ cursor: "default" }}>No sections available</h3>
                  )}
                </div>

                <div className="search">
                  <h2>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        article.title
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Search ${article.title} online`}
                      aria-label={`Click to search ${article.title} online`}
                    >
                      <FiExternalLink
                        size="1.65rem"
                        className="search-box-icons"
                        aria-hidden
                      />
                      <span className="search-text search-online-text">
                        Online
                      </span>
                    </a>
                  </h2>
                  <h2>
                    <button
                      onClick={() => {
                        setCurrentArticleTitle(article.title);
                        setCurrentArticleDescription(article.extract);
                        setCurrentArticleImage(article.thumbnail?.source);
                        setCurrentArticleToc(article.toc);
                        setCurrentArticleUrl(article.pageUrl);
                        setCurrentArticleSource(selectedSource);
                        setCurrentArticleLang(selectedLang);
                        setIsChatOpen((prev) => !prev);
                      }}
                      className="like-button"
                    >
                      {isChatOpen ? (
                        <div
                          title="Close chat"
                          aria-label="Click to close chat"
                        >
                          <RxCross1
                            size={width < 900 ? 21.5 : 24}
                            className="close-chat-icon"
                            aria-hidden
                          />
                          <span className="search-text search-liked-text">
                            Close Chat
                          </span>
                        </div>
                      ) : (
                        <div
                          title={`Talk with a chatbot about ${article.title}`}
                          aria-label={`Click to talk with a chatbot about ${article.title}`}
                        >
                          <TbRobot
                            size="1.7rem"
                            className="search-box-icons"
                            aria-hidden
                          />
                          <span className="search-text search-liked-text">
                            Chat
                          </span>
                        </div>
                      )}
                    </button>
                  </h2>
                  <h2>
                    <button
                      className="like-button"
                      onClick={() =>
                        handleLikeArticle(
                          {
                            title: article.title,
                            pageUrl: article.pageUrl,
                          },
                          setArticleLiked,
                          setLastLikeAction
                        )
                      }
                      title={
                        isArticleLiked(article.pageUrl)
                          ? "This article has been liked!"
                          : "Like this article"
                      }
                      aria-label={
                        isArticleLiked(article.pageUrl)
                          ? "This article has been liked!"
                          : "Like this article"
                      }
                    >
                      {isArticleLiked(article.pageUrl) ? (
                        <>
                          <BiSolidLike
                            size="1.5rem"
                            className="search-box-icons"
                            aria-hidden
                          />
                          <span className="search-text search-liked-text">
                            Liked!
                          </span>
                        </>
                      ) : (
                        <>
                          <BiLike
                            size="1.5rem"
                            className="search-box-icons"
                            aria-hidden
                          />
                          <span className="search-text search-liked-text">
                            Like
                          </span>
                        </>
                      )}
                    </button>
                  </h2>

                  {width < 900 && (
                    <h2>
                      <a
                        onClick={() => {
                          handleShareLink(
                            article.pageUrl,
                            article.title,
                            article.thumbnail?.source
                          );
                        }}
                        className="search-box-icons"
                      >
                        <GiShare size="1.55rem" />
                      </a>
                    </h2>
                  )}
                </div>
                {width < 900 && (
                  <>
                    <div
                      className="like-overlay"
                      onClick={() =>
                        handleLikeOverlayClick({
                          title: article.title,
                          pageUrl: article.pageUrl,
                        })
                      }
                      aria-hidden
                    ></div>
                    {articleLiked &&
                      (lastLikeAction === "like" ? (
                        <div
                          className="like-feedback"
                          aria-label="Article has been liked successfully"
                        >
                          <BiSolidLike
                            size="3rem"
                            aria-hidden
                            style={{ color: "white" }}
                          />
                        </div>
                      ) : (
                        <div
                          className="like-feedback"
                          aria-label="Article has been unliked successfully"
                        >
                          <BiLike
                            size="3rem"
                            aria-hidden
                            style={{ color: "white" }}
                          />
                        </div>
                      ))}
                  </>
                )}
                <div
                  className="sr-only"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  {articleLiked &&
                    (lastLikeAction === "like"
                      ? "Article has been liked successfully"
                      : "Article has been unliked successfully")}
                </div>

                <a
                  href={article.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Open page for ${article.title} on ${selectedSource}`}
                  aria-label={`Click to open page for ${article.title} on ${selectedSource}`}
                  style={{ opacity: 1 }}
                >
                  <div className="article-link">
                    {renderLogo(selectedSource, isLoading)}
                  </div>
                </a>

                <footer>
                  {article.viewCount && (
                    <div className="view-count">
                      <a
                        href={article.pageViewsLink || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          opacity: !article.pageViewsLink && 1,
                          cursor: article.pageViewsLink ? "pointer" : "default",
                        }}
                        title={
                          article.pageViewsLink
                            ? "View historical pageview data"
                            : undefined
                        }
                        aria-label={
                          article.pageViewsLink
                            ? "Click on this to see historical pageview data"
                            : undefined
                        }
                        aria-readonly={!article.pageViewsLink}
                      >
                        {selectedSource.startsWith("SCP") ? (
                          <div>
                            Rating: {article.viewCount.toLocaleString()}
                          </div>
                        ) : width < 900 ? (
                          <ViewCountAnimator
                            start={0}
                            end={article.viewCount}
                            duration={2}
                            separator=","
                            enableScrollSpy
                            scrollSpyOnce
                            style={{ fontWeight: "100" }}
                            aria-disabled
                          />
                        ) : (
                          <div>{article.viewCount.toLocaleString()} views</div>
                        )}
                      </a>
                    </div>
                  )}
                  {article.timestamp && (
                    <div className="last-edited">
                      <a
                        href={
                          selectedSource.startsWith("SCP") ||
                          selectedSource.startsWith("Know") ||
                          selectedSource.startsWith("Wikihow")
                            ? undefined
                            : selectedSource.startsWith("Wikimedia")
                            ? `${article.pageUrl}#Summary`
                            : (() => {
                                try {
                                  const url = new URL(article.pageUrl);

                                  if (selectedSource.startsWith("Fandom")) {
                                    return `${
                                      url.origin
                                    }/wiki/${encodeURIComponent(
                                      article.title
                                    )}?action=history`;
                                  }

                                  if (
                                    selectedSource.startsWith("Edramatica") ||
                                    selectedSource.startsWith("Incel") ||
                                    selectedSource.startsWith("Micronations")
                                  ) {
                                    return `${
                                      url.origin
                                    }/index.php?title=${encodeURIComponent(
                                      article.title
                                    )}&action=history`;
                                  }

                                  if (selectedSource.startsWith("Metapedia")) {
                                    return `${
                                      url.origin
                                    }/m/index.php?title=${encodeURIComponent(
                                      article.title
                                    )}&action=history`;
                                  }

                                  return `${
                                    url.origin
                                  }/w/index.php?action=history&title=${encodeURIComponent(
                                    article.title
                                  )}`;
                                } catch {
                                  return article.pageUrl;
                                }
                              })()
                        }
                        style={{
                          opacity:
                            (selectedSource.startsWith("SCP") ||
                              selectedSource.startsWith("Know") ||
                              selectedSource.startsWith("Wikihow")) &&
                            "1",
                          cursor:
                            (selectedSource.startsWith("SCP") ||
                              selectedSource.startsWith("Know") ||
                              selectedSource.startsWith("Wikihow")) &&
                            "default",
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={
                          selectedSource.startsWith("SCP") ||
                          selectedSource.startsWith("Know")
                            ? undefined
                            : "View article edit/upload history"
                        }
                        aria-label={
                          selectedSource.startsWith("SCP") ||
                          selectedSource.startsWith("Know")
                            ? undefined
                            : "Click to view article edit/upload history"
                        }
                      >
                        {(() => {
                          const isLastEditedSource = [
                            "Wikipedia",
                            "Wikivoyage",
                            "RationalWiki",
                            "Edramatica",
                            "Micronations",
                            "Every",
                            "Polandball",
                            "Polcompball",
                            "Wikispecies",
                            "Hetero",
                            "IncelWiki",
                            "MickeyWiki",
                            "Metapedia",
                            "Illogic",
                            "Minecraft",
                            "SCP",
                            "Uncyclo",
                            "UNOP",
                            "Pornopedia",
                            "Conservapedia",
                            "Fandom",
                          ].some((s) => selectedSource.includes(s));

                          const isPublishedSource = [
                            "Wikinews",
                            "Wikibooks",
                          ].some((s) => selectedSource.startsWith(s));

                          if (isLastEditedSource) return "Last edited";
                          if (isPublishedSource) return "Published";
                          if (selectedSource.startsWith("Wikidata"))
                            return "From";
                          return "Uploaded";
                        })()}{" "}
                        {getTimeAgo(article.timestamp)}
                      </a>
                    </div>
                  )}
                </footer>

                <div
                  className={
                    isLoadingMore && index === articles.length - 1
                      ? "more-loading-overlay"
                      : "more-loading-overlay hidden"
                  }
                >
                  Getting more content
                  <span>
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
      {isChatOpen && (
        <div
          className="description"
          style={{
            top: width < 900 && showIframe && "18.5%",
            height:
              width > 900
                ? showIframe && !showToc && "54.82%"
                : showIframe && "52%",
            width: showIframe && !showToc && "58.2vw",
            left: showIframe && !showToc && "2%",
            zIndex: width < 900 && "650",
          }}
        >
          <Chat
            articleTitle={currentArticleTitle}
            articleDescription={currentArticleDescription}
            articleImage={currentArticleImage}
            articleToc={currentArticleToc}
            articleUrl={currentArticleUrl}
            selectedSource={currentArticleSource}
            selectedLang={currentArticleLang}
          />
        </div>
      )}
    </>
  );
}
