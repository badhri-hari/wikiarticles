import { useRef } from "react";

export default function usePressFeedback() {
  const ref = useRef(null);

  const trigger = () => {
    if (ref.current) {
      ref.current.classList.remove("press-feedback");
      void ref.current.offsetWidth;
      ref.current.classList.add("press-feedback");
    }
  };

  return [ref, trigger];
}
