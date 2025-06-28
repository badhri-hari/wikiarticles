import { useEffect, useState } from "react";

import useBeforeInstallPrompt from "./useBeforeInstallPrompt";
import usePreventDoubleTouch from "./usePreventDoubleTouch";
import usePressFeedback from "../usePressFeedback";

import { sourcesMap } from "../../data/sourceOptions";

function getInitialValues() {
  let source = "Wikipedia";
  let lang = localStorage.getItem("lang") || "en";
  let fandomQuery = "";

  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  if (pathSegments.length >= 2) {
    const rawSource = pathSegments[0].toLowerCase();
    lang = pathSegments[1].toLowerCase();

    if (rawSource.startsWith("fandom_")) {
      source = "Fandom";
      fandomQuery = decodeURIComponent(rawSource.replace("fandom_", ""));
    } else {
      source = sourcesMap[rawSource] || "Wikipedia";
    }
  } else {
    const storedSource = localStorage.getItem("source") || "Wikipedia";
    if (storedSource.toLowerCase().startsWith("fandom_")) {
      source = "Fandom";
      fandomQuery = storedSource.replace(/fandom_/i, "");
    } else {
      source = storedSource;
    }
  }

  return { source, lang, fandomQuery };
}

export default function useAppState() {
  const initialValues = getInitialValues();

  const deferredPrompt = useBeforeInstallPrompt();
  const [installRef, triggerInstall] = usePressFeedback();
  usePreventDoubleTouch();

  const [selectedSource, setSelectedSource] = useState(initialValues.source);
  const [fandomQuery, setFandomQuery] = useState(initialValues.fandomQuery);
  const [selectedLang, setSelectedLang] = useState(initialValues.lang);
  const [showArrow, setShowArrow] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    const displayMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      window.navigator.standalone === true;
    setIsPWA(displayMode);
  }, []);

  useEffect(() => {
    if (deferredPrompt && !isPWA) {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isChrome =
        /chrome/.test(userAgent) && !/edge|opr|brave/.test(userAgent);
      const isAppleDevice = /iphone|ipad|ipod|macintosh/.test(userAgent);

      if (!isChrome || isAppleDevice) {
        alert(
          "To install this app, open your browser’s share/more options menu and choose 'Add to Home Screen'."
        );
        return;
      }

      const timer = setTimeout(() => {
        const installBtn = document.querySelector(".install-button");
        if (installBtn) {
          installBtn.style.display = "none";
        }
      }, 25000);

      return () => clearTimeout(timer);
    }
  }, [deferredPrompt, isPWA]);

  useEffect(() => {
    if (selectedSource === "Fandom" && fandomQuery) {
      localStorage.setItem("source", `fandom_${fandomQuery}`);
    } else {
      localStorage.setItem("source", selectedSource);
    }
    localStorage.setItem("lang", selectedLang);
  }, [selectedSource, selectedLang, fandomQuery]);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowArrow(true);
      const hideTimer = setTimeout(() => setShowArrow(false), 6000);
      return () => clearTimeout(hideTimer);
    }, 5000);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    let newPath = "";
    if (selectedSource === "Fandom" && fandomQuery) {
      const encodedQuery = encodeURIComponent(fandomQuery);
      newPath = `/fandom_${encodedQuery}/${selectedLang}`;
    } else {
      const sourceKey =
        Object.keys(sourcesMap).find(
          (key) => sourcesMap[key] === selectedSource
        ) || "wikipedia";
      newPath = `/${sourceKey}/${selectedLang}`;
    }
    window.history.replaceState(null, "", newPath);
  }, [selectedSource, selectedLang, fandomQuery]);

  useEffect(() => {
    if (selectedSource !== "Fandom" && fandomQuery !== "") {
      setFandomQuery("");
    }
  }, [selectedSource]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
    }
  };

  return {
    selectedSource,
    setSelectedSource,
    fandomQuery,
    setFandomQuery,
    selectedLang,
    setSelectedLang,
    showArrow,
    isPWA,
    deferredPrompt,
    installRef,
    triggerInstall,
    handleInstallClick,
    hideHeader,
    setHideHeader,
  };
}
