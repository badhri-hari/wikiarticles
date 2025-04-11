import { useEffect, useState } from "react";

import useWindowSize from "../../../hooks/useWindowSize.js";

export default function CursorImage({ defaultSrc, hoverSrc }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const { width } = useWindowSize();

  useEffect(() => {
    setIsVisible(!(width < 900));
  }, [width]);

  useEffect(() => {
    if (!isVisible) return;

    const handleMove = (e) => {
      const style = getComputedStyle(e.target);
      const cursor = style.cursor;

      const interactiveCursors = ["pointer", "text", "move", "crosshair"];
      setIsHovering(interactiveCursors.includes(cursor));

      setPos({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener("mousemove", handleMove);
    return () => document.removeEventListener("mousemove", handleMove);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x + 10,
        top: pos.y + 10,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <img
        src={isHovering ? hoverSrc : defaultSrc}
        aria-hidden
        style={{ width: 48, height: 48 }}
      />
    </div>
  );
}
