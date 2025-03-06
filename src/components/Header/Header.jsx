import { VscGithubInverted } from "react-icons/vsc";

import "./Header.css";

export default function Header() {
  return (
    <header aria-label="Site header" role="banner">
      <div className="header-logo" aria-label="wikiarticles logo">
        <span>wiki</span>articles
      </div>
      <a
        href="https://github.com/badhri-hari/wikiarticles"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="View website source code on GitHub"
      >
        <VscGithubInverted
          color="#F8F8FF"
          size="2.7em"
          className="header-icon"
          aria-hidden="true"
        />
      </a>
    </header>
  );
}
