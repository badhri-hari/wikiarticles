import { useRef, useState, useEffect } from "react";
import CountUp from "react-countup";

export default function ViewCountAnimator({ end, duration, ...rest }) {
  const [inView, setInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ textDecoration: "none", fontWeight: "400" }}
    >
      {inView && end !== null && (
        <CountUp start={0} end={end} duration={duration} {...rest}>
          {({ countUpRef }) => (
            <span
              ref={countUpRef}
              style={{ textDecoration: "none", fontWeight: "400" }}
            >
              {end}
            </span>
          )}
        </CountUp>
      )}{" "}
      views
    </div>
  );
}
