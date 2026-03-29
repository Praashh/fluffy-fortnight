// Orchestration, state management, wiring

import { MicAnalyzer } from './mic-analyzer.js';
import { AudioEngine } from './audio-engine.js';
import { NoteMapper } from './note-mapper.js';
import { TrackpadController } from './trackpad-controller.js';
import { UI } from './ui.js';

class App {
  constructor() {
    this._ui = new UI();
    this._noteMapper = new NoteMapper();
    this._micAnalyzer = null;
    this._audioEngine = null;
    this._trackpad = null;
    this._audioContext = null;

    this._currentNote = null;
    this._isBlowing = false;
    this._pointerOnStrip = false;

    this._init();
  }

  _init() {
    this._ui.overlay.addEventListener('click', () => this._start());

    this._ui.scaleSelect.addEventListener('change', (e) => {
      this._noteMapper.setScale(e.target.value);
      this._ui.renderNoteStrip(this._noteMapper.getSegments());
      this._ui.clearHighlight();
    });

    this._ui.instrumentSelect.addEventListener('change', (e) => {
      if (this._audioEngine) {
        this._audioEngine.setInstrument(e.target.value);
      }
    });

    this._ui.sensitivitySlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this._ui.setSensitivityDisplay(val);
      if (this._micAnalyzer) {
        this._micAnalyzer.sensitivity = val;
      }
    });

    // Render initial note strip
    this._ui.renderNoteStrip(this._noteMapper.getSegments());
  }

  async _start() {
    try {
      this._audioContext = new (window.AudioContext || window.webkitAudioContext)();

      this._audioEngine = new AudioEngine(this._audioContext);
      this._audioEngine.setInstrument(this._ui.instrumentSelect.value);

      this._micAnalyzer = new MicAnalyzer();
      this._micAnalyzer.sensitivity = parseFloat(this._ui.sensitivitySlider.value);
      await this._micAnalyzer.init(this._audioContext);

      this._setupMicCallbacks();
      this._setupTrackpad();

      this._ui.hideOverlay();
    } catch (err) {
      alert('Could not start: ' + err.message);
    }
  }

  _setupMicCallbacks() {
    this._micAnalyzer.onLevelChange = (level) => {
      this._ui.setMicLevel(level);
    };

    this._micAnalyzer.onBlowStart = () => {
      this._isBlowing = true;
      this._ui.setBlowing(true);
      this._startSound();
    };

    this._micAnalyzer.onBlowEnd = () => {
      this._isBlowing = false;
      this._ui.setBlowing(false);
      this._audioEngine.noteOff();
    };

    this._micAnalyzer.onIntensityChange = (intensity) => {
      this._audioEngine.setIntensity(intensity);
    };
  }

  _setupTrackpad() {
    const stripEl = document.getElementById('note-strip-container');
    this._trackpad = new TrackpadController(stripEl);

    this._trackpad.onPointerDown = () => {
      this._pointerOnStrip = true;
    };

    this._trackpad.onPointerUp = () => {
      this._pointerOnStrip = false;
      this._ui.clearHighlight();
    };

    this._trackpad.onNoteChange = (xNormalized) => {
      const note = this._noteMapper.mapPosition(xNormalized);
      this._currentNote = note;

      this._ui.highlightNote(note.index, this._noteMapper.noteCount);

      if (this._isBlowing) {
        this._ui.setCurrentNote(note.label, note.octave);
        this._audioEngine.noteOn(note.frequency);
      }
    };

    this._trackpad.onPitchBend = (cents) => {
      if (this._isBlowing) {
        this._audioEngine.setPitchBend(cents);
      }
    };
  }

  _startSound() {
    if (this._currentNote) {
      this._ui.setCurrentNote(this._currentNote.label, this._currentNote.octave);
      this._audioEngine.noteOn(this._currentNote.frequency);
    } else {
      // Default to middle of strip if no pointer position
      const note = this._noteMapper.mapPosition(0.5);
      this._currentNote = note;
      this._ui.setCurrentNote(note.label, note.octave);
      this._audioEngine.noteOn(note.frequency);
    }
  }
}

new App();
