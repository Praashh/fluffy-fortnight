# Fluffy-Fortnight

A browser-based brass instrument. Blow into your mic, click on the note strip to pick notes, and hear synthesized trumpet, trombone, or flute sounds. Pure HTML/JS/CSS — zero dependencies, zero build tools.

## How It Works

- **Blow detection**: AudioWorklet computes mic RMS every ~3ms. Hysteresis state machine triggers note-on/off with exponential smoothing.
- **Sound synthesis**: Multi-oscillator signal chain (sawtooth + square + detuned saw) through a dynamic lowpass filter, formant resonance peaks, and ADSR envelope with LFO vibrato. Harder blowing opens the filter for brighter tone.
- **Note control**: Click and drag on the note strip to select notes across 2 octaves. Y-axis controls pitch bend.
- **Scales**: Chromatic, major, minor.
- **Instruments**: Trumpet, trombone, flute — each with distinct oscillator mix, formant frequencies, and envelope shaping.

## Usage

1. Open `index.html` in Chrome or Safari.
2. Click "Start Playing" and grant mic permission.
3. Blow into your mic — sound plays.
4. Click/drag on the note strip to change pitch while blowing.
5. Use the controls to switch scales, instruments, and adjust mic sensitivity.

## File Structure

```
index.html              Entry point
css/styles.css          Dark theme, layout, visualizers
js/
  constants.js          Instrument presets, scales, thresholds
  mic-worklet.js        AudioWorklet RMS processor
  mic-analyzer.js       Mic access, smoothing, blow detection
  audio-engine.js       Brass synthesis chain
  note-mapper.js        Position-to-note mapping
  trackpad-controller.js  Pointer events on note strip
  ui.js                 DOM updates
  app.js                Orchestration and wiring
```

## Requirements

- A modern browser with AudioWorklet support (Chrome, Safari, Edge).
- Microphone access.
- No server required — open the HTML file directly.

## License

Apache-2.0 license
