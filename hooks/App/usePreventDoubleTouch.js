import { useEffect } from "react";

export default function usePreventDoubleTouch() {
  useEffect(() => {
    let lastTouchEnd = 0;
    const handler = (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };
    document.addEventListener("touchend", handler, false);
    return () => document.removeEventListener("touchend", handler, false);
  }, []);
}
