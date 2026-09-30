import { useCallback, useEffect, useRef, useState } from "react";

export function usePlayer(playlist) {
  const latest = useRef(playlist);
  latest.current = playlist;
  const current = useRef(null);
  const [playback, setPlayback] = useState({ id: null, mode: null, phase: "idle" });
  const [playbackError, setError] = useState("");

  const dispose = useCallback(() => {
    const session = current.current;
    current.current = null;
    if (session) {
      session.audio.onended = null;
      session.audio.onerror = null;
      session.audio.pause();
    }
  }, []);
  const stop = useCallback(() => {
    dispose();
    setPlayback({ id: null, mode: null, phase: "idle" });
  }, [dispose]);

  const start = useCallback(function startSong(song, mode) {
    dispose();
    setError("");
    if (!song?.previewUrl) {
      setPlayback({ id: null, mode: null, phase: "idle" });
      setError("미리듣기를 지원하는 곡이 없습니다.");
      return;
    }
    let audio;
    try { audio = new Audio(song.previewUrl); }
    catch { stop(); setError("음원을 불러오지 못했습니다."); return; }
    const session = { audio, id: song.id, mode, fromPlaylist: latest.current.some(item => item.id === song.id) };
    current.current = session;
    setPlayback({ id: song.id, mode, phase: "loading" });
    const fail = () => {
      if (current.current !== session) return;
      stop();
      setError("음원을 재생하지 못했습니다. 네트워크를 확인하거나 다른 곡을 선택해 주세요.");
    };
    audio.onerror = fail;
    audio.onended = () => {
      if (current.current !== session) return;
      if (mode === "playlist") {
        const songs = latest.current;
        const index = songs.findIndex(item => item.id === song.id);
        const next = index >= 0 ? songs.slice(index + 1).find(item => item.previewUrl) : null;
        if (next) { startSong(next, mode); return; }
      }
      stop();
    };
    try {
      Promise.resolve(audio.play()).then(() => {
        if (current.current === session) setPlayback({ id: song.id, mode, phase: "playing" });
      }).catch(fail);
    } catch { fail(); }
  }, [dispose, stop]);

  const toggleSong = useCallback(song => {
    if (current.current?.id === song.id) { stop(); return; }
    start(song, "single");
  }, [start, stop]);
  const togglePlaylist = useCallback(() => {
    if (current.current?.mode === "playlist") { stop(); return; }
    start(latest.current.find(song => song.previewUrl), "playlist");
  }, [start, stop]);

  useEffect(() => {
    const session = current.current;
    if (session?.fromPlaylist && !playlist.some(song => song.id === session.id)) stop();
  }, [playlist, stop]);
  useEffect(() => dispose, [dispose]);
  return { playback, playbackError, toggleSong, togglePlaylist, stop };
}
