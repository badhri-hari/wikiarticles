import { useRef, useState, useEffect } from "react";
import CountUp from "react-countup";

const ViewCountAnimator = ({ end, duration, ...rest }) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.6 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {inView ? (
        <div style={{ textDecoration: "none" }}>
          <CountUp start={0} end={end} duration={duration} {...rest} /> views
        </div>
      ) : (
        <span>0</span>
      )}
    </div>
  );
};

export default ViewCountAnimator;
