import { useEffect, useState } from "react";

import Header from "./components/Header/Header";
import Arrow from "./components/Arrow/Arrow";
import Articles from "./components/Articles/Articles";

export default function Home() {
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowArrow(true);

      const hideTimer = setTimeout(() => {
        setShowArrow(false);
      }, 7000);

      return () => clearTimeout(hideTimer);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, []);

  return (
    <>
      <Header />
      <Articles />
      {showArrow && <Arrow />}
    </>
  );
}
