// Mic access, exponential smoothing, hysteresis blow detection

import { MIC_CONFIG } from './constants.js';

export class MicAnalyzer {
  constructor() {
    this._smoothedRms = 0;
    this._blowing = false;
    this._intensity = 0;
    this._onBlowStart = null;
    this._onBlowEnd = null;
    this._onIntensityChange = null;
    this._onLevelChange = null;
    this._sensitivity = 1.0;
    this._audioContext = null;
    this._workletNode = null;
    this._micStream = null;
  }

  set onBlowStart(fn) { this._onBlowStart = fn; }
  set onBlowEnd(fn) { this._onBlowEnd = fn; }
  set onIntensityChange(fn) { this._onIntensityChange = fn; }
  set onLevelChange(fn) { this._onLevelChange = fn; }

  set sensitivity(value) {
    this._sensitivity = value;
  }

  async init(audioContext) {
    this._audioContext = audioContext;

    try {
      this._micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch {
      throw new Error('Microphone access denied');
    }

    await audioContext.audioWorklet.addModule('js/mic-worklet.js');

    const source = audioContext.createMediaStreamSource(this._micStream);
    this._workletNode = new AudioWorkletNode(audioContext, 'mic-worklet-processor');

    this._workletNode.port.onmessage = (e) => {
      this._processRms(e.data.rms);
    };

    source.connect(this._workletNode);
    // Don't connect to destination — we only analyze, don't play back mic
  }

  _processRms(rawRms) {
    const alpha = MIC_CONFIG.smoothingFactor;
    this._smoothedRms = alpha * this._smoothedRms + (1 - alpha) * rawRms;

    const level = Math.min(this._smoothedRms / MIC_CONFIG.maxRms, 1);
    if (this._onLevelChange) this._onLevelChange(level);

    const onThresh = MIC_CONFIG.onThreshold / this._sensitivity;
    const offThresh = MIC_CONFIG.offThreshold / this._sensitivity;

    if (!this._blowing && this._smoothedRms > onThresh) {
      this._blowing = true;
      if (this._onBlowStart) this._onBlowStart();
    } else if (this._blowing && this._smoothedRms < offThresh) {
      this._blowing = false;
      this._intensity = 0;
      if (this._onBlowEnd) this._onBlowEnd();
    }

    if (this._blowing) {
      const normalized = Math.min(
        (this._smoothedRms - offThresh) / (MIC_CONFIG.maxRms - offThresh),
        1
      );
      this._intensity = Math.pow(Math.max(normalized, 0), MIC_CONFIG.intensityCurve);
      if (this._onIntensityChange) this._onIntensityChange(this._intensity);
    }
  }

  get isBlowing() { return this._blowing; }
  get intensity() { return this._intensity; }

  destroy() {
    if (this._workletNode) {
      this._workletNode.disconnect();
      this._workletNode = null;
    }
    if (this._micStream) {
      this._micStream.getTracks().forEach((t) => t.stop());
      this._micStream = null;
    }
  }
}
