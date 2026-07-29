import test from 'node:test'
import assert from 'node:assert/strict'

import {
  MUSIC_PLAYLIST,
  getNextTrackIndex,
  getPlaylistTrack,
} from './musicCatalog.js'

test('music playlist preserves the intended track order', () => {
  assert.equal(MUSIC_PLAYLIST.length, 3)
  assert.equal(Object.isFrozen(MUSIC_PLAYLIST), true)

  assert.deepEqual(
    MUSIC_PLAYLIST.map(({ title }) => title),
    [
      'Gothic',
      'Depeche Mode - Occults',
      'Darker Waves',
    ],
  )

  for (const track of MUSIC_PLAYLIST) {
    assert.equal(Object.hasOwn(track, 'phase'), false)
  }
})

test('every playlist entry has an audio source and auditable licensing data', () => {
  for (const track of MUSIC_PLAYLIST) {
    assert.match(track.src, /\.mp3$/)
    assert.match(track.sourceUrl, /^https:\/\//)
    assert.match(track.licenseUrl, /^https:\/\//)
    assert.ok(track.title.length > 0)
    assert.ok(track.artist.length > 0)
    assert.equal(Object.isFrozen(track), true)
  }
})

test('getPlaylistTrack returns tracks by their playlist index', () => {
  assert.equal(getPlaylistTrack(0)?.title, 'Gothic')
  assert.equal(
    getPlaylistTrack(1)?.title,
    'Depeche Mode - Occults',
  )
  assert.equal(getPlaylistTrack(2)?.title, 'Darker Waves')
})

test('getPlaylistTrack rejects indices outside the playlist', () => {
  assert.equal(getPlaylistTrack(-1), null)
  assert.equal(getPlaylistTrack(3), null)
  assert.equal(getPlaylistTrack('0'), null)
})

test('getNextTrackIndex advances and returns to the first track at the end', () => {
  assert.equal(getNextTrackIndex(0), 1)
  assert.equal(getNextTrackIndex(1), 2)
  assert.equal(getNextTrackIndex(2), 0)
  assert.equal(getNextTrackIndex(3), null)
})
