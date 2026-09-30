export const STORAGE_KEY = "playlist";
export const FALLBACK_COVER = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#f7f1e3"/><text x="50%" y="55%" text-anchor="middle" font-size="80">♪</text></svg>'
);

export function httpsUrl(value) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

export function normalizeSong(item) {
  if (!item || typeof item !== "object" || !Number.isSafeInteger(item.id) ||
      item.id <= 0 || typeof item.title !== "string" || !item.title.trim()) return null;
  return {
    id: item.id,
    title: item.title,
    artist: typeof item.artist === "string" ? item.artist : "",
    album: typeof item.album === "string" ? item.album : "",
    cover: httpsUrl(item.cover),
    previewUrl: httpsUrl(item.previewUrl),
  };
}

export function decodePlaylist(raw) {
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("Invalid playlist");
  const seen = new Set();
  return data.map(item => {
    const song = normalizeSong(item);
    if (!song || seen.has(song.id)) throw new Error("Invalid playlist item");
    seen.add(song.id);
    return song;
  });
}

export function mapResults(data) {
  if (!data || !Array.isArray(data.results)) throw new Error("Invalid search response");
  const seen = new Set();
  return data.results.flatMap(item => {
    if (!item || typeof item !== "object") return [];
    const song = normalizeSong({
      id: item.trackId, title: item.trackName, artist: item.artistName,
      album: item.collectionName,
      cover: typeof item.artworkUrl100 === "string"
        ? item.artworkUrl100.replace("100x100", "300x300") : "",
      previewUrl: item.previewUrl,
    });
    if (!song || seen.has(song.id)) return [];
    seen.add(song.id);
    return [song];
  });
}
