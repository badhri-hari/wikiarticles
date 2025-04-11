import { useEffect } from "react";

export default function useLazyLoadArticles({
  slidesRef,
  articles,
  isLoading,
  isLoadingMore,
  totalArticles,
  fetchArticles,
  threshold = 0.5,
  rootMargin = "100px",
}) {
  useEffect(() => {
    if (!totalArticles || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting);
        if (isIntersecting) {
          setTimeout(() => fetchArticles(true), 200);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const thresholdIndices = [
      Math.max(articles.length - 4, 0),
      Math.max(articles.length - 3, 0),
      Math.max(articles.length - 2, 0),
      Math.max(articles.length - 1, 0),
    ];

    thresholdIndices.forEach((index) => {
      const target = slidesRef.current[index];
      if (target) observer.observe(target);
    });

    return () => {
      thresholdIndices.forEach((index) => {
        const target = slidesRef.current[index];
        if (target) observer.unobserve(target);
      });
      observer.disconnect();
    };
  }, [articles, isLoading, isLoadingMore, totalArticles]);
}
