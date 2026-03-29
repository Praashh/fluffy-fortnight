// Position-to-note mapping per scale

import { SCALES, BASE_MIDI } from './constants.js';

export class NoteMapper {
  constructor() {
    this._scale = SCALES.major;
  }

  setScale(name) {
    const scale = SCALES[name];
    if (!scale) return;
    this._scale = scale;
  }

  get scale() {
    return this._scale;
  }

  get noteCount() {
    return this._scale.intervals.length;
  }

  // Map normalized x position (0–1) to { midi, frequency, label, octave, index }
  mapPosition(xNormalized) {
    const clamped = Math.max(0, Math.min(1, xNormalized));
    const intervals = this._scale.intervals;
    const labels = this._scale.labels;

    const index = Math.min(
      Math.floor(clamped * intervals.length),
      intervals.length - 1
    );

    const semitones = intervals[index];
    const midi = BASE_MIDI + semitones;
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    const octave = Math.floor(midi / 12) - 1;
    const label = labels[index];

    return { midi, frequency, label, octave, index };
  }

  // Get all note segments for rendering the strip
  getSegments() {
    const intervals = this._scale.intervals;
    const labels = this._scale.labels;
    const count = intervals.length;

    return intervals.map((semitones, i) => {
      const midi = BASE_MIDI + semitones;
      const octave = Math.floor(midi / 12) - 1;
      return {
        index: i,
        label: labels[i],
        octave,
        startFraction: i / count,
        endFraction: (i + 1) / count,
        isBlack: [1, 3, 6, 8, 10].includes(semitones % 12),
      };
    });
  }
}
