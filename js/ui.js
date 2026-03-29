// DOM updates: level bar, note display, note strip, controls

export class UI {
  constructor() {
    this._levelBar = document.getElementById('mic-level-fill');
    this._noteDisplay = document.getElementById('note-display');
    this._noteStrip = document.getElementById('note-strip');
    this._noteHighlight = document.getElementById('note-highlight');
    this._overlay = document.getElementById('start-overlay');
    this._scaleSelect = document.getElementById('scale-select');
    this._instrumentSelect = document.getElementById('instrument-select');
    this._sensitivitySlider = document.getElementById('sensitivity-slider');
    this._sensitivityValue = document.getElementById('sensitivity-value');
    this._blowIndicator = document.getElementById('blow-indicator');
  }

  get overlay() { return this._overlay; }
  get scaleSelect() { return this._scaleSelect; }
  get instrumentSelect() { return this._instrumentSelect; }
  get sensitivitySlider() { return this._sensitivitySlider; }

  hideOverlay() {
    this._overlay.classList.add('hidden');
  }

  setMicLevel(level) {
    const pct = Math.min(level * 100, 100);
    this._levelBar.style.width = `${pct}%`;

    if (level > 0.7) {
      this._levelBar.className = 'mic-level-fill level-red';
    } else if (level > 0.4) {
      this._levelBar.className = 'mic-level-fill level-amber';
    } else {
      this._levelBar.className = 'mic-level-fill level-green';
    }
  }

  setBlowing(isBlowing) {
    if (isBlowing) {
      this._blowIndicator.classList.add('active');
      this._noteDisplay.classList.add('glow');
    } else {
      this._blowIndicator.classList.remove('active');
      this._noteDisplay.classList.remove('glow');
      this._noteDisplay.textContent = '--';
    }
  }

  setCurrentNote(label, octave) {
    this._noteDisplay.textContent = `${label}${octave}`;
  }

  renderNoteStrip(segments) {
    this._noteStrip.innerHTML = '';
    for (const seg of segments) {
      const el = document.createElement('div');
      el.className = 'note-segment' + (seg.isBlack ? ' black' : '');
      el.style.left = `${seg.startFraction * 100}%`;
      el.style.width = `${(seg.endFraction - seg.startFraction) * 100}%`;
      el.dataset.index = seg.index;

      const labelEl = document.createElement('span');
      labelEl.className = 'note-label';
      labelEl.textContent = `${seg.label}${seg.octave}`;
      el.appendChild(labelEl);

      this._noteStrip.appendChild(el);
    }
  }

  highlightNote(index, totalNotes) {
    const fraction = index / totalNotes;
    const width = 1 / totalNotes;
    this._noteHighlight.style.left = `${fraction * 100}%`;
    this._noteHighlight.style.width = `${width * 100}%`;
    this._noteHighlight.style.opacity = '1';

    // Highlight corresponding segment
    const segments = this._noteStrip.querySelectorAll('.note-segment');
    segments.forEach((el) => {
      el.classList.toggle('active', Number(el.dataset.index) === index);
    });
  }

  clearHighlight() {
    this._noteHighlight.style.opacity = '0';
    const segments = this._noteStrip.querySelectorAll('.note-segment');
    segments.forEach((el) => el.classList.remove('active'));
  }

  setSensitivityDisplay(value) {
    this._sensitivityValue.textContent = value.toFixed(1);
  }
}
