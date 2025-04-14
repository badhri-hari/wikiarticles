import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import DOMPurify from "dompurify";

import useAppState from "../hooks/App/useAppState";

import "./App.css";

import Header from "./components/Header/Header";
import Articles from "./components/Articles/Articles";
import Arrow from "./components/Arrow/Arrow";
import CursorImage from "./components/Cursor/CursorImage";

import cursorImage from "../assets/cursorImage.png";
import cursorHoverImage from "../assets/cursorHoverImage.png";

DOMPurify.addHook("uponSanitizeElement", (node) => {
  if (node.tagName === "A" && node.hasAttribute("href")) {
    const href = node.getAttribute("href");
    node.setAttribute("class", "description-link");
    node.setAttribute("title", href);
    node.setAttribute("aria-label", `Click on this link to open ${href}`);
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

function App() {
  const {
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
  } = useAppState();

  return (
    <>
      {selectedSource.toLowerCase().includes("ball") && (
        <CursorImage defaultSrc={cursorImage} hoverSrc={cursorHoverImage} />
      )}
      {deferredPrompt && (
        <div
          className="install-button"
          style={{ opacity: isPWA && "0" }}
          title="do it. do it now."
          aria-label="Click to install this website as a Progressive Web Application (PWA)"
        >
          <button
            ref={installRef}
            onClick={() => {
              triggerInstall();
              handleInstallClick();
            }}
          >
            Install
          </button>
        </div>
      )}
      <Header
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        fandomQuery={fandomQuery}
        setFandomQuery={setFandomQuery}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
      />
      <Articles
        selectedSource={selectedSource}
        fandomQuery={fandomQuery}
        selectedLang={selectedLang}
      />
      {showArrow && <Arrow />}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="*" element={<App />} />
    </Routes>
    <Analytics />
  </Router>
);
