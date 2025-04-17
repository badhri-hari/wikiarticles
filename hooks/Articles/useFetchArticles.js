import { useState, useEffect, useRef } from "react";
import { sourceOptionsImport } from "../../data/sourceOptions.jsx";

export default function useFetchArticles(
  apiUrl,
  selectedSource,
  fandomQuery,
  lang
) {
  const eventSourceRef = useRef(null);

  const [articles, setArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchArticles = (isLoadMore = false) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    if (!isLoadMore) {
      setArticles([]);
      setIsLoading(true);
      setIsLoadingMore(false);
      setHasError(false);
    } else {
      setIsLoadingMore(true);
    }

    const selectedOption = sourceOptionsImport.find(
      (option) =>
        option.name.toLowerCase() === selectedSource.toLowerCase()
    );

    if (!selectedOption) {
      console.error(
        "Selected source not found in sourceOptionsImport:",
        selectedSource
      );
      setHasError(true);
      return;
    }

    const path = selectedOption.path;
    let queryParams = [];

    queryParams.push(`lang=${encodeURIComponent(lang)}`);

    if (selectedSource.toLowerCase() === "fandom" && fandomQuery.trim()) {
      queryParams.push(`fandom=${encodeURIComponent(fandomQuery.trim())}`);
    }

    const connector = path.includes("?") ? "&" : "?";

    const newEventSource = new EventSource(
      `${apiUrl}${path}${connector}${queryParams.join("&")}`
    );
    eventSourceRef.current = newEventSource;

    newEventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.total) setTotalArticles(data.total);
        if (data.article) {
          setArticles((prev) => [...prev, data.article]);
        }
        if (data.done) {
          setIsLoading(false);
          setIsLoadingMore(false);
          newEventSource.close();
        }
        if (data.error) {
          if (!isLoadMore) setHasError(true);
          setIsLoading(false);
          setIsLoadingMore(false);
          newEventSource.close();
        }
      } catch (error) {
        if (!isLoadMore) setHasError(true);
        setIsLoading(false);
        setIsLoadingMore(false);
        newEventSource.close();
      }
    };

    newEventSource.onerror = () => {
      if (!isLoadMore) setHasError(true);
      setIsLoading(false);
      setIsLoadingMore(false);
      newEventSource.close();
    };
  };

  useEffect(() => {
    fetchArticles();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [apiUrl, selectedSource, lang]);

  return {
    articles,
    totalArticles,
    isLoading,
    isLoadingMore,
    hasError,
    fetchArticles,
  };
}
