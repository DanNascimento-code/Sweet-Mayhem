function createTrack(track) {
  return Object.freeze(track);
}

export const MUSIC_CATALOG = Object.freeze([
  createTrack({
    phase: 1,
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
    phase: 2,
    genre: 'Goth',
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
    phase: 3,
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

export function getMusicForPhase(phase) {
  if (!Number.isInteger(phase)) {
    return null;
  }

  return MUSIC_CATALOG.find((track) => track.phase === phase) || null;
}
