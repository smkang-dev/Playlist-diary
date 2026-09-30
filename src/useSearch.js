import { useEffect, useState } from "react";
import { mapResults } from "./playlist.js";

export function useSearch(keyword) {
  const query = keyword.trim();
  const [state, setState] = useState({ query: "", status: "idle", songs: [], error: "" });
  useEffect(() => {
    if (!query) {
      setState({ query, status: "idle", songs: [], error: "" });
      return;
    }
    let active = true;
    let timedOut = false;
    let timeout;
    const controller = new AbortController();
    setState({ query, status: "loading", songs: [], error: "" });
    const debounce = setTimeout(async () => {
      timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
        if (active) setState({ query, status: "error", songs: [], error: "검색 시간이 초과됐습니다. 검색어를 다시 입력해 주세요." });
      }, 12000);
      try {
        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=12&country=US`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Search failed");
        const songs = mapResults(await response.json());
        if (active && !timedOut) setState({ query, status: "success", songs, error: "" });
      } catch {
        if (active && !timedOut) setState({ query, status: "error", songs: [], error: "검색에 실패했습니다. 네트워크를 확인하고 검색어를 다시 입력해 주세요." });
      } finally { clearTimeout(timeout); }
    }, 400);
    return () => {
      active = false;
      clearTimeout(debounce);
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);
  return state.query === query ? state : { query, status: query ? "loading" : "idle", songs: [], error: "" };
}
