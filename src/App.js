import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("playlist");
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingId, setPlayingId] = useState(null);
  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState(false);
  const audioRef = useRef(null);

  const [playlist, setPlaylist] = useState(() => {
    const saved = localStorage.getItem("playlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("playlist", JSON.stringify(playlist));
  }, [playlist]);

  useEffect(() => {
    if (keyword.trim() === "") {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchMusic(keyword);
    }, 400);

    return () => clearTimeout(timer);
  }, [keyword]);

  const searchMusic = async (query) => {
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          query
        )}&media=music&entity=song&limit=12&country=KR`
      );

      const data = await response.json();

      const songs = data.results.map((item) => ({
        id: item.trackId,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName,
        cover: item.artworkUrl100.replace("100x100", "300x300"),
        previewUrl: item.previewUrl,
      }));

      setSearchResults(songs);
    } catch (error) {
      console.error(error);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  const addToPlaylist = (song) => {
    const alreadyAdded = playlist.some((item) => item.id === song.id);

    if (alreadyAdded) {
      alert("이미 추가된 노래입니다.");
      return;
    }

    setPlaylist([...playlist, song]);
    setPage("playlist");
    setKeyword("");
  };

  const removeFromPlaylist = (id) => {
    setPlaylist(playlist.filter((song) => song.id !== id));

    if (playingId === id) {
      stopPreview();
    }
  };

  const clearPlaylist = () => {
    if (window.confirm("플레이리스트를 전부 비울까요?")) {
      setPlaylist([]);
      stopPreview();
    }
  };

  const playPreview = (song) => {
    if (!song.previewUrl) {
      alert("미리듣기를 지원하지 않는 곡입니다.");
      return;
    }

    if (playingId === song.id) {
      stopPreview();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(song.previewUrl);
    audioRef.current = audio;
    setPlayingId(song.id);
    setIsPlayingPlaylist(false);

    audio.play();

    audio.onended = () => {
      setPlayingId(null);
    };
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setPlayingId(null);
    setIsPlayingPlaylist(false);
  };

  const playPlaylist = (startIndex = 0) => {
    if (playlist.length === 0) {
      alert("재생할 노래가 없습니다.");
      return;
    }

    if (isPlayingPlaylist) {
      stopPreview();
      return;
    }

    const song = playlist[startIndex];

    if (!song || !song.previewUrl) {
      setPlayingId(null);
      setIsPlayingPlaylist(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(song.previewUrl);
    audioRef.current = audio;
    setPlayingId(song.id);
    setIsPlayingPlaylist(true);

    audio.play();

    audio.onended = () => {
      const nextIndex = startIndex + 1;

      if (nextIndex < playlist.length) {
        playPlaylist(nextIndex);
      } else {
        setPlayingId(null);
        setIsPlayingPlaylist(false);
      }
    };
  };

  return (
    <div className="app">
      {page === "playlist" ? (
        <main className="page">
          <header className="header">
            <div>
              <p className="sub-title">My music diary</p>
              <h1>Playlist</h1>
            </div>

            <button className="main-button" onClick={() => setPage("search")}>
              + 노래 추가
            </button>
          </header>

          {playlist.length === 0 ? (
            <section className="empty-box">
              <h2>아직 노래가 없어요</h2>
              <p>노래 추가 버튼을 눌러 플레이리스트를 채워보세요.</p>
            </section>
          ) : (
            <>
              <section className="playlist-grid">
                {playlist.map((song, index) => (
                  <article
                    className={`song-card rotate-${index % 4}`}
                    key={song.id}
                  >
                    <img
                      className="album-cover"
                      src={song.cover}
                      alt={song.title}
                    />

                    <div className="song-detail">
                      <h2>{song.title}</h2>
                      <p>{song.artist}</p>
                      <span>{song.album}</span>

                      <div className="card-bottom">
                        <button
                          className="preview-button"
                          onClick={() => playPreview(song)}
                        >
                          {playingId === song.id ? "❚❚" : "▶"}
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => removeFromPlaylist(song.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              <div className="playlist-actions">
                <button className="clear-button" onClick={() => playPlaylist()}>
                  {isPlayingPlaylist ? "미리듣기 정지" : "전체 미리듣기"}
                </button>

                <button className="clear-button" onClick={clearPlaylist}>
                  전체 삭제
                </button>
              </div>
            </>
          )}
        </main>
      ) : (
        <main className="page">
          <button className="back-button" onClick={() => setPage("playlist")}>
            ← Playlist
          </button>

          <header className="search-header">
            <p className="sub-title">Find your song</p>
            <h1>Search</h1>
          </header>

          <input
            className="search-input"
            placeholder="노래 제목, 가수, 앨범을 검색하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            autoFocus
          />

          <section className="search-list">
            {keyword.trim() === "" ? (
              <p className="empty-text">검색어를 입력해 주세요.</p>
            ) : searchResults.length === 0 ? (
              <p className="empty-text">검색 결과가 없습니다.</p>
            ) : (
              searchResults.map((song) => (
                <article className="search-item" key={song.id}>
                  <img
                    className="album-cover small"
                    src={song.cover}
                    alt={song.title}
                  />

                  <div className="song-info">
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                    <span>{song.album}</span>
                  </div>

                  <button
                    className="preview-button small-preview"
                    onClick={() => playPreview(song)}
                  >
                    {playingId === song.id ? "❚❚" : "▶"}
                  </button>

                  <button
                    className="plus-button"
                    onClick={() => addToPlaylist(song)}
                  >
                    +
                  </button>
                </article>
              ))
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default App;