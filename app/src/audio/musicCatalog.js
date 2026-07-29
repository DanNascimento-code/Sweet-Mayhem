function createTrack(track) {
  return Object.freeze(track);
}

export const MUSIC_PLAYLIST = Object.freeze([
  createTrack({
    genre: 'gothic',
    title: 'Animated Death Loop',
    artist: 'Ebunny',
    src: new URL(
      './music/track-01-animated-death-loop.mp3',
      import.meta.url
    ).href,
    sourceUrl:
      'https://pixabay.com/music/modern-classical-animated-death-loop-536568/',
    license: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license-summary/'
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
    genre: 'dark-metal',
    title: "Fight Them Until We Can't",
    artist: 'Zander Noriega',
    src: new URL(
      './music/track-03-fight-them-until-we-cant.mp3',
      import.meta.url
    ).href,
    sourceUrl:
      'https://opengameart.org/content/fight-them-until-we-cant',
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
