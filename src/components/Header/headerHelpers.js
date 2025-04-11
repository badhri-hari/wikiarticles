export const handleLikedArticlesClick = (
  showLikedArticles,
  setLikedArticles,
  setAnimateLikedArticles,
  setShowLikedArticles
) => {
  if (!showLikedArticles) {
    const liked = JSON.parse(localStorage.getItem("likedArticles") || "[]");
    setLikedArticles(liked);
    setAnimateLikedArticles("expand-down");
    setShowLikedArticles(true);
  } else {
    setAnimateLikedArticles("collapse-up");
    setTimeout(() => setShowLikedArticles(false), 300);
  }
};

export const handleDownloadLikedArticles = () => {
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

export const handleRemoveLikedArticle = (
  articleToRemove,
  likedArticles,
  setLikedArticles
) => {
  const updatedArticles = likedArticles.filter(
    (article) => article.link !== articleToRemove.link
  );
  setLikedArticles(updatedArticles);
  localStorage.setItem("likedArticles", JSON.stringify(updatedArticles));
};

export const hexToRgbString = (hex) => {
  if (!hex.startsWith("#") || hex.length !== 7) return "0, 0, 0";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

export const handleClickOutsideHeader = ({ event, refs, states, actions }) => {
  const {
    likedArticlesContainerRef,
    likedArticlesIconRef,
    sourceResultsContainerRef,
    changeSourceIconRef,
    colorPickerRef,
    colorPickerIconRef,
    langResultsContainerRef,
    changeLangIconRef,
  } = refs;

  const {
    showLikedArticles,
    showSourceSelectionBox,
    showColorPicker,
    showLangSelectionBox,
  } = states;

  const {
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
  } = actions;

  if (
    showLikedArticles &&
    likedArticlesContainerRef.current &&
    !likedArticlesContainerRef.current.contains(event.target) &&
    likedArticlesIconRef.current &&
    !likedArticlesIconRef.current.contains(event.target)
  ) {
    setAnimateLikedArticles("collapse-up");
    setTimeout(() => setShowLikedArticles(false), 300);
  }

  if (
    showSourceSelectionBox &&
    sourceResultsContainerRef.current &&
    !sourceResultsContainerRef.current.contains(event.target) &&
    changeSourceIconRef.current &&
    !changeSourceIconRef.current.contains(event.target)
  ) {
    setAnimateSourceBox("collapse-up");
    setTimeout(() => {
      setShowSourceSelectionBox(false);
      setExpandedGroups({});
      if (fandomInputRef.current) fandomInputRef.current.value = "";
    }, 300);
  }

  if (
    showColorPicker &&
    colorPickerRef.current &&
    !colorPickerRef.current.contains(event.target) &&
    colorPickerIconRef.current &&
    !colorPickerIconRef.current.contains(event.target)
  ) {
    setAnimateColorPicker("collapse-up");
    setTimeout(() => setShowColorPicker(false), 300);
  }

  if (
    showLangSelectionBox &&
    langResultsContainerRef.current &&
    !langResultsContainerRef.current.contains(event.target) &&
    changeLangIconRef.current &&
    !changeLangIconRef.current.contains(event.target)
  ) {
    setAnimateLangBox("collapse-up");
    setTimeout(() => {
      setShowLangSelectionBox(false);
      setExpandedLangGroups({});
    }, 300);
  }
};
