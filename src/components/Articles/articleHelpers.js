export function getTimeAgo(timestamp) {
  const now = new Date();
  const pastDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - pastDate) / 1000);

  if (diffInSeconds < 60) {
    return `just now`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60 && diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24 && diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7 && diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4 && diffInWeeks > 0) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30.44);
  if (diffInMonths < 12 && diffInMonths > 0) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365.25);
  if (diffInYears > 0) {
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
  }

  return `¯\_(ツ)_/¯`;
}

export const isArticleLiked = (pageUrl) => {
  const likedArticles = JSON.parse(localStorage.getItem("likedArticles")) || [];
  return likedArticles.some((item) => item.link === pageUrl);
};

export const handleLikeArticle = (
  article,
  setArticleLiked,
  setLastLikeAction
) => {
  let likedArticles = JSON.parse(localStorage.getItem("likedArticles")) || [];
  const index = likedArticles.findIndex(
    (item) => item.link === article.pageUrl
  );

  let actionType = null;
  if (index === -1) {
    likedArticles.push({
      title: article.title,
      link: article.pageUrl,
      dateLiked: new Date().toLocaleString("en-US", {
        timeZone: "UTC",
        hour12: false,
      }),
    });
    actionType = "like";
  } else {
    likedArticles.splice(index, 1);
    actionType = "unlike";
  }

  localStorage.setItem("likedArticles", JSON.stringify(likedArticles));
  setArticleLiked(true);
  setLastLikeAction(actionType);

  if (navigator.vibrate) navigator.vibrate(50);

  setTimeout(() => setArticleLiked(false), 690);
};

export const handleLikeOverlayClick = (
  article,
  isFirstTapRef,
  handleLikeArticle
) => {
  if (isFirstTapRef.current) {
    handleLikeArticle(article);
    isFirstTapRef.current = false;
  } else {
    isFirstTapRef.current = true;
    setTimeout(() => {
      isFirstTapRef.current = false;
    }, 400);
  }
};

export const handleShareLink = async (pageUrl, title) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: pageUrl,
        url: pageUrl,
      });
    } catch (error) {
      console.error("Error sharing article link:", error);
    }
  } else {
    console.log("The Web Share API is not supported on this device.");
  }
};

export const fixRelativeLinks = (html, baseUrl) => {
  const container = document.createElement("div");
  container.innerHTML = html;

  const links = container.querySelectorAll("a[href]");
  for (const link of links) {
    const href = link.getAttribute("href");

    if (
      href &&
      !/^https?:\/\//i.test(href) &&
      !href.startsWith("mailto:") &&
      !href.startsWith("tel:") &&
      !href.startsWith("#")
    ) {
      try {
        const fixed = new URL(href, baseUrl).toString();
        link.setAttribute("href", fixed);
      } catch (e) {
        console.warn("Error fixing href:", href, e);
      }
    }

    link.className = `${link.className} description-link`.trim();
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.setAttribute("title", link.getAttribute("href"));
    link.setAttribute(
      "aria-label",
      `Click on this link to open ${link.getAttribute("href")}`
    );
  }

  return container.innerHTML;
};
