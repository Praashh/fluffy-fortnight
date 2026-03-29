// Pointer events on note strip — x for note, y for pitch bend

import { PITCH_BEND_RANGE } from './constants.js';

export class TrackpadController {
  constructor(element) {
    this._el = element;
    this._active = false;
    this._onNoteChange = null;
    this._onPitchBend = null;
    this._onPointerDown = null;
    this._onPointerUp = null;
    this._currentX = 0.5;
    this._currentY = 0.5;

    this._handlePointerDown = this._handlePointerDown.bind(this);
    this._handlePointerMove = this._handlePointerMove.bind(this);
    this._handlePointerUp = this._handlePointerUp.bind(this);
    this._handlePointerLeave = this._handlePointerLeave.bind(this);

    element.addEventListener('pointerdown', this._handlePointerDown);
    element.addEventListener('pointermove', this._handlePointerMove);
    element.addEventListener('pointerup', this._handlePointerUp);
    element.addEventListener('pointerleave', this._handlePointerLeave);
    element.style.touchAction = 'none';
  }

  set onNoteChange(fn) { this._onNoteChange = fn; }
  set onPitchBend(fn) { this._onPitchBend = fn; }
  set onPointerDown(fn) { this._onPointerDown = fn; }
  set onPointerUp(fn) { this._onPointerUp = fn; }

  get isActive() { return this._active; }
  get normalizedX() { return this._currentX; }

  _getPosition(e) {
    const rect = this._el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y };
  }

  _handlePointerDown(e) {
    this._active = true;
    this._el.setPointerCapture(e.pointerId);
    const { x, y } = this._getPosition(e);
    this._currentX = x;
    this._currentY = y;
    if (this._onPointerDown) this._onPointerDown();
    this._emitChanges(x, y);
  }

  _handlePointerMove(e) {
    if (!this._active) return;
    const { x, y } = this._getPosition(e);
    this._currentX = x;
    this._currentY = y;
    this._emitChanges(x, y);
  }

  _handlePointerUp(e) {
    if (!this._active) return;
    this._active = false;
    this._el.releasePointerCapture(e.pointerId);
    if (this._onPointerUp) this._onPointerUp();
  }

  _handlePointerLeave(e) {
    if (!this._active) return;
    this._active = false;
    try { this._el.releasePointerCapture(e.pointerId); } catch { /* ok */ }
    if (this._onPointerUp) this._onPointerUp();
  }

  _emitChanges(x, y) {
    if (this._onNoteChange) this._onNoteChange(x);
    if (this._onPitchBend) {
      // y: 0 = top = bend up, 1 = bottom = bend down
      const bend = (0.5 - y) * 2 * PITCH_BEND_RANGE;
      this._onPitchBend(bend);
    }
  }

  destroy() {
    this._el.removeEventListener('pointerdown', this._handlePointerDown);
    this._el.removeEventListener('pointermove', this._handlePointerMove);
    this._el.removeEventListener('pointerup', this._handlePointerUp);
    this._el.removeEventListener('pointerleave', this._handlePointerLeave);
  }
}
