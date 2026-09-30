import React, { useState } from "react";
import "./App.css";
import { FALLBACK_COVER } from "./playlist.js";
import { usePlaylist } from "./usePlaylist.js";
import { usePlayer } from "./usePlayer.js";
import { useSearch } from "./useSearch.js";

function Cover({ song, small = false }) {
  return <img className={`album-cover${small ? " small" : ""}`}
    src={song.cover || FALLBACK_COVER} alt={`${song.title} 앨범 표지`}
    onError={event => {
      if (event.currentTarget.src !== FALLBACK_COVER) event.currentTarget.src = FALLBACK_COVER;
    }} />;
}

export default function App() {
  const [page, setPage] = useState("playlist");
  const [keyword, setKeyword] = useState("");
  const { playlist, update, storageError, resetStorage } = usePlaylist();
  const player = usePlayer(playlist);
  const search = useSearch(page === "search" ? keyword : "");

  const add = song => {
    if (playlist.some(item => item.id === song.id)) {
      window.alert("이미 추가된 노래입니다.");
      return;
    }
    if (update(songs => songs.some(item => item.id === song.id) ? songs : [...songs, song])) {
      setPage("playlist");
      setKeyword("");
    }
  };
  const remove = id => {
    if (update(songs => songs.filter(song => song.id !== id)) && player.playback.id === id) player.stop();
  };
  const clear = () => {
    if (window.confirm("플레이리스트를 전부 비울까요?") && update(() => [])) player.stop();
  };
  const previewButton = (song, small = false) => {
    const active = player.playback.id === song.id;
    return <button className={`preview-button${small ? " small-preview" : ""}`}
      disabled={!song.previewUrl}
      aria-label={`${song.title} ${!song.previewUrl ? "미리듣기 없음" : active ? "재생 정지" : "미리듣기 재생"}`}
      aria-pressed={active}
      title={!song.previewUrl ? "미리듣기를 지원하지 않는 곡입니다." : active ? "정지 (다시 재생하면 처음부터)" : "미리듣기"}
      onClick={() => player.toggleSong(song)}>
      {active ? "■" : "▶"}
    </button>;
  };
  return (
    <div className="app">
      <div className="page notices">
        {storageError && <div className="notice" role="alert">
          <p>{storageError}</p>
          <button onClick={resetStorage}>저장소 초기화</button>
        </div>}
        {player.playbackError && <p className="notice" role="alert">{player.playbackError}</p>}
        {player.playback.phase === "loading" && <p role="status">음원을 불러오는 중입니다…</p>}
      </div>
      {page === "playlist" ? (
        <main className="page">
          <header className="header">
            <div><p className="sub-title">My music diary</p><h1>Playlist</h1></div>
            <button className="main-button" onClick={() => setPage("search")}>+ 노래 추가</button>
          </header>
          {playlist.length === 0 ? (
            <section className="empty-box">
              <h2>아직 노래가 없어요</h2>
              <p>노래 추가 버튼을 눌러 플레이리스트를 채워보세요.</p>
            </section>
          ) : <>
            <section className="playlist-grid" aria-label="저장된 플레이리스트">
              {playlist.map((song, index) => (
                <article className={`song-card rotate-${index % 4}`} key={song.id}>
                  <Cover song={song} />
                  <div className="song-detail">
                    <h2>{song.title}</h2><p>{song.artist}</p><span>{song.album}</span>
                    {!song.previewUrl && <p className="unavailable">미리듣기 없음</p>}
                    <div className="card-bottom">
                      {previewButton(song)}
                      <button className="delete-button" aria-label={`${song.title} 삭제`}
                        onClick={() => remove(song.id)}>×</button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
            <div className="playlist-actions">
              <button className="clear-button" onClick={player.togglePlaylist}>
                {player.playback.mode === "playlist" ? "미리듣기 정지" : "전체 미리듣기"}
              </button>
              <button className="clear-button" onClick={clear}>전체 삭제</button>
            </div>
          </>}
          <p className="help-text">목록은 이 브라우저에 저장됩니다. 전체 미리듣기는 지원되는 곡만 순서대로 재생합니다.</p>
        </main>
      ) : (
        <main className="page">
          <button className="back-button" onClick={() => { setPage("playlist"); setKeyword(""); }}>← Playlist</button>
          <header className="search-header">
            <p className="sub-title">Find your song</p><h1>Search</h1>
          </header>
          <label className="visually-hidden" htmlFor="music-search">노래 제목, 가수, 앨범 검색</label>
          <input id="music-search" className="search-input"
            placeholder="노래 제목, 가수, 앨범을 검색하세요"
            value={keyword} onChange={event => setKeyword(event.target.value)} autoFocus />
          <section className="search-list" aria-label="음악 검색 결과" aria-busy={search.status === "loading"}>
            {search.status === "idle" && <p className="empty-text">검색어를 입력해 주세요.</p>}
            {search.status === "loading" && <p className="empty-text" role="status">검색 중입니다…</p>}
            {search.status === "error" && <p className="notice" role="alert">{search.error}</p>}
            {search.status === "success" && search.songs.length === 0 && <p className="empty-text" role="status">검색 결과가 없습니다.</p>}
            {search.songs.map(song => {
              const added = playlist.some(item => item.id === song.id);
              return <article className="search-item" key={song.id}>
                <Cover song={song} small />
                <div className="song-info">
                  <h3>{song.title}</h3><p>{song.artist}</p><span>{song.album}</span>
                  {!song.previewUrl && <p className="unavailable">미리듣기 없음</p>}
                </div>
                <div className="search-actions">
                  {previewButton(song, true)}
                  <button className="plus-button" disabled={added}
                    aria-label={`${song.title} ${added ? "추가됨" : "플레이리스트에 추가"}`}
                    onClick={() => add(song)}>{added ? "✓" : "+"}</button>
                </div>
              </article>;
            })}
          </section>
        </main>
      )}
    </div>
  );
}
