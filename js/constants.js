// Instrument presets, scales, thresholds

export const SCALES = {
  chromatic: {
    name: 'Chromatic',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
                12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    labels: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
             'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  },
  major: {
    name: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23],
    labels: ['C', 'D', 'E', 'F', 'G', 'A', 'B',
             'C', 'D', 'E', 'F', 'G', 'A', 'B'],
  },
  minor: {
    name: 'Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 20, 22],
    labels: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb',
             'C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
  },
};

export const INSTRUMENTS = {
  trumpet: {
    name: 'Trumpet',
    oscillators: [
      { type: 'sawtooth', gain: 0.5 },
      { type: 'square', gain: 0.3 },
      { type: 'sawtooth', gain: 0.2, detune: 7 },
    ],
    filter: { baseFreq: 800, intensityRange: 3000, Q: 2.5 },
    formants: [
      { freq: 1200, Q: 8, gain: 6 },
      { freq: 2500, Q: 10, gain: 4 },
    ],
    envelope: { attack: 0.02, decay: 0.05, sustain: 0.8, release: 0.08 },
    vibrato: { rate: 5.5, depth: 4 },
  },
  trombone: {
    name: 'Trombone',
    oscillators: [
      { type: 'sawtooth', gain: 0.6 },
      { type: 'square', gain: 0.25 },
      { type: 'sawtooth', gain: 0.15, detune: 5 },
    ],
    filter: { baseFreq: 600, intensityRange: 2000, Q: 2.0 },
    formants: [
      { freq: 900, Q: 6, gain: 5 },
      { freq: 2200, Q: 8, gain: 3 },
    ],
    envelope: { attack: 0.04, decay: 0.06, sustain: 0.75, release: 0.12 },
    vibrato: { rate: 4.5, depth: 3 },
  },
  flute: {
    name: 'Flute',
    oscillators: [
      { type: 'sine', gain: 0.7 },
      { type: 'triangle', gain: 0.3 },
    ],
    filter: { baseFreq: 1200, intensityRange: 2000, Q: 1.5 },
    formants: [],
    envelope: { attack: 0.03, decay: 0.04, sustain: 0.85, release: 0.1 },
    vibrato: { rate: 6, depth: 6 },
    useNoise: true,
    noiseGain: 0.03,
  },
};

export const MIC_CONFIG = {
  smoothingFactor: 0.85,
  onThreshold: 0.04,
  offThreshold: 0.025,
  intensityCurve: 0.7,
  maxRms: 0.3,
};

export const BASE_OCTAVE = 4;
export const BASE_MIDI = 60; // C4

export const NOTE_RAMP_TIME = 0.015; // 15ms frequency ramp
export const PITCH_BEND_RANGE = 100; // cents
