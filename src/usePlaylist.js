import { useCallback, useEffect, useRef, useState } from "react";
import { decodePlaylist, STORAGE_KEY } from "./playlist.js";

function readInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { songs: decodePlaylist(raw), raw, error: "" };
  } catch {
    return { songs: [], raw: undefined, error: "저장된 목록을 읽지 못했습니다. 기존 데이터는 변경하지 않았습니다. 저장소 설정을 확인하거나 초기화해 주세요." };
  }
}

export function usePlaylist() {
  const [initial] = useState(readInitial);
  const [playlist, setPlaylist] = useState(initial.songs);
  const [storageError, setError] = useState(initial.error);
  const rawRef = useRef(initial.raw);

  const applyRaw = useCallback(raw => {
    const songs = decodePlaylist(raw);
    rawRef.current = raw;
    setPlaylist(songs);
    return songs;
  }, []);

  useEffect(() => {
    const sync = event => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try {
        if (event.storageArea && event.storageArea !== localStorage) return;
        applyRaw(localStorage.getItem(STORAGE_KEY));
        setError("");
      } catch { setError("다른 탭의 저장 데이터를 읽지 못했습니다. 현재 화면의 목록은 유지했습니다."); }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [applyRaw]);

  const update = useCallback(transform => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const current = decodePlaylist(raw);
      if (raw !== rawRef.current) {
        applyRaw(raw);
        setError("다른 탭에서 변경된 최신 목록을 불러왔습니다. 내용을 확인한 뒤 다시 시도해 주세요.");
        return false;
      }
      const next = transform(current);
      const encoded = JSON.stringify(next);
      localStorage.setItem(STORAGE_KEY, encoded);
      rawRef.current = encoded;
      setPlaylist(next);
      setError("");
      return true;
    } catch {
      setError("목록을 저장하지 못했습니다. 변경은 적용하지 않았습니다. 저장 공간·브라우저 설정 또는 저장 데이터 상태를 확인해 주세요.");
      return false;
    }
  }, [applyRaw]);

  const resetStorage = useCallback(() => {
    if (!window.confirm("이 브라우저에 저장된 플레이리스트를 삭제하고 초기화할까요?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      applyRaw(null);
      setError("");
    } catch { setError("저장소 초기화에 실패했습니다. 브라우저의 저장소 접근 설정을 확인해 주세요."); }
  }, [applyRaw]);

  return { playlist, update, storageError, resetStorage };
}
