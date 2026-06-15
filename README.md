# Playlist Diary

A music playlist web application built with React and the iTunes Search API.

## Features

* Music search using the iTunes Search API
* Display of album artwork, song titles, artists, and album information
* 30-second song preview playback
* Playlist creation and management
* Add and remove songs from the playlist
* Sequential preview playback for the entire playlist
* Local storage persistence to retain playlists after page refresh

## Tech Stack

* React
* JavaScript
* CSS
* iTunes Search API
* LocalStorage
* Git / GitHub

## Project Structure

```text
src
├─ App.js
├─ App.css
├─ index.js
├─ index.css
├─ reportWebVitals.js
└─ ...
```

## Core Functionalities

### Search

* Search songs by title, artist, or album name
* Retrieve music data through the iTunes Search API
* Display search results dynamically

### Playlist

* Add songs to a custom playlist
* Prevent duplicate songs from being added
* Remove individual songs
* Clear the entire playlist

### Playback

* Preview individual songs (30 seconds)
* Sequential preview playback for all songs in the playlist
* Stop currently playing previews

### Persistence

* Save playlists using LocalStorage
* Automatically restore saved playlists on page reload

## Screenshots

* Playlist Page
* Search Page
* Music Search Results
* Playlist with Preview Playback

## Future Improvements

* Shuffle playback mode
* Playlist reordering with drag-and-drop
* Responsive UI enhancements
* Dark mode support
* Playlist export/import functionality
