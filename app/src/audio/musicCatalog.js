function createTrack(track) {
  return Object.freeze(track);
}

export const MUSIC_PLAYLIST = Object.freeze([
  createTrack({
    genre: 'gothic',
    title: 'Gothic',
    artist: 'Ebunny',
    src: new URL(
      './music/phase-01-gothic.mp3',
      import.meta.url
    ).href,
    sourceUrl:
      'https://freemusicarchive.org/music/Origami_Repetika/2021-tracks/gothic-dance-floor/',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/'
  }),

  createTrack({
    genre: 'goth',
    artist: 'Depeche Mode',
    title: 'Depeche Mode - Occults',
    src: new URL(
      './music/phase-02-depeche-mode-occults.mp3',
      import.meta.url
    ).href,
    sourceUrl:
      'https://freemusicarchive.org/music/depeche-mode/2021-tracks/occults/',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/'
  }),
  createTrack({
    genre: 'darkwave',
    title: 'Darker Waves',
    artist: 'Zander Noriega',
    src: new URL(
      './music/phase-03-darker-waves.mp3',
      import.meta.url
    ).href,
    sourceUrl: 'https://opengameart.org/content/darker-waves',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/'
  })
]);

export function getPlaylistTrack(trackIndex) {
  if (
    !Number.isInteger(trackIndex) ||
    trackIndex < 0 ||
    trackIndex >= MUSIC_PLAYLIST.length
  ) {
    return null;
  }

  return MUSIC_PLAYLIST[trackIndex];
}

export function getNextTrackIndex(trackIndex) {
  if (getPlaylistTrack(trackIndex) === null) {
    return null;
  }

  return (trackIndex + 1) % MUSIC_PLAYLIST.length;
}
