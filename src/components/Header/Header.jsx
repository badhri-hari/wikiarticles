import { VscGithubInverted } from "react-icons/vsc";

import "./Header.css";

export default function Header() {
  return (
    <header>
      <div className="header-logo">wikiarticles</div>
      <a href="https://github.com/badhri-hari/" target="_blank" rel="noreferrer noopener">
        <VscGithubInverted color="#F8F8FF" size="2.7em" className="header-icon" />
      </a>
      <div />
    </header>
  );
}
