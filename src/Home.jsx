import { useEffect, useState } from "react";

import Header from "./components/Header/Header";
import Arrow from "./components/Arrow/Arrow";
import Articles from "./components/Articles/Articles";

export default function Home() {
  const [showArrow, setShowArrow] = useState(true);
  const [searchActive, setSearchActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowArrow(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header setSearchActive={setSearchActive} />

      <Articles searchActive={searchActive} />

      {showArrow && <Arrow />}
    </>
  );
}
