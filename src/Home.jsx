import { useEffect, useState } from "react";

import Header from "./components/Header/Header";
import Arrow from "./components/Arrow/Arrow";
import Images from "./components/Images/Images";

export default function Home() {
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowArrow(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />

      <Images />

      {showArrow && <Arrow />}
    </>
  );
}
