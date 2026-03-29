// Brass synthesis: oscillators + formants + ADSR envelope

import { INSTRUMENTS, NOTE_RAMP_TIME } from './constants.js';

export class AudioEngine {
  constructor(audioContext) {
    this._ctx = audioContext;
    this._preset = INSTRUMENTS.trumpet;
    this._voice = null;
    this._masterGain = audioContext.createGain();
    this._masterGain.gain.value = 0.35;
    this._masterGain.connect(audioContext.destination);
  }

  setInstrument(name) {
    const preset = INSTRUMENTS[name];
    if (!preset) return;
    this._preset = preset;

    // If currently playing, rebuild the voice with the new preset
    if (this._voice) {
      const freq = this._voice.currentFreq;
      const intensity = this._voice.currentIntensity;
      this._destroyVoice();
      this._createVoice(freq);
      this._applyIntensity(intensity);
    }
  }

  noteOn(frequency) {
    if (this._voice) {
      // Ramp to new frequency instead of rebuilding
      this._rampFrequency(frequency);
      return;
    }
    this._createVoice(frequency);
  }

  noteOff() {
    if (!this._voice) return;

    const now = this._ctx.currentTime;
    const release = this._preset.envelope.release;
    const envGain = this._voice.envelopeGain;

    envGain.gain.cancelScheduledValues(now);
    envGain.gain.setValueAtTime(envGain.gain.value, now);
    envGain.gain.linearRampToValueAtTime(0, now + release);

    const voice = this._voice;
    this._voice = null;

    setTimeout(() => {
      this._cleanupVoiceNodes(voice);
    }, release * 1000 + 50);
  }

  setIntensity(intensity) {
    if (!this._voice) return;
    this._applyIntensity(intensity);
  }

  setPitchBend(cents) {
    if (!this._voice) return;
    for (const osc of this._voice.oscillators) {
      osc.detune.setTargetAtTime(
        (osc._baseDetune || 0) + cents,
        this._ctx.currentTime,
        0.01
      );
    }
  }

  _createVoice(frequency) {
    const preset = this._preset;
    const now = this._ctx.currentTime;
    const env = preset.envelope;

    // Envelope gain
    const envelopeGain = this._ctx.createGain();
    envelopeGain.gain.setValueAtTime(0, now);
    envelopeGain.gain.linearRampToValueAtTime(1, now + env.attack);
    envelopeGain.gain.linearRampToValueAtTime(env.sustain, now + env.attack + env.decay);

    // Mix gain (before filter)
    const mixGain = this._ctx.createGain();
    mixGain.gain.value = 1;

    // Lowpass filter
    const filter = this._ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = preset.filter.baseFreq;
    filter.Q.value = preset.filter.Q;

    // Build chain: mixGain → filter → formants → envelopeGain → master
    let lastNode = filter;

    // Formant filters
    const formantNodes = [];
    for (const f of preset.formants) {
      const formant = this._ctx.createBiquadFilter();
      formant.type = 'peaking';
      formant.frequency.value = f.freq;
      formant.Q.value = f.Q;
      formant.gain.value = f.gain;
      lastNode.connect(formant);
      lastNode = formant;
      formantNodes.push(formant);
    }

    lastNode.connect(envelopeGain);
    envelopeGain.connect(this._masterGain);
    mixGain.connect(filter);

    // Oscillators
    const oscillators = [];
    for (const oscDef of preset.oscillators) {
      const osc = this._ctx.createOscillator();
      osc.type = oscDef.type;
      osc.frequency.setValueAtTime(frequency, now);
      osc._baseDetune = oscDef.detune || 0;
      osc.detune.setValueAtTime(osc._baseDetune, now);

      const oscGain = this._ctx.createGain();
      oscGain.gain.value = oscDef.gain;

      osc.connect(oscGain);
      oscGain.connect(mixGain);
      osc.start(now);
      oscillators.push(osc);
    }

    // LFO for vibrato
    const lfo = this._ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = preset.vibrato.rate;
    const lfoGain = this._ctx.createGain();
    lfoGain.gain.value = preset.vibrato.depth;
    lfo.connect(lfoGain);
    for (const osc of oscillators) {
      lfoGain.connect(osc.detune);
    }
    lfo.start(now);

    // Optional noise (flute breath)
    let noiseSource = null;
    let noiseGainNode = null;
    if (preset.useNoise) {
      const bufferSize = this._ctx.sampleRate * 2;
      const noiseBuffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseSource = this._ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      noiseGainNode = this._ctx.createGain();
      noiseGainNode.gain.value = preset.noiseGain || 0.03;
      noiseSource.connect(noiseGainNode);
      noiseGainNode.connect(mixGain);
      noiseSource.start(now);
    }

    this._voice = {
      oscillators,
      mixGain,
      filter,
      formantNodes,
      envelopeGain,
      lfo,
      lfoGain,
      noiseSource,
      noiseGainNode,
      currentFreq: frequency,
      currentIntensity: 0.5,
    };
  }

  _rampFrequency(frequency) {
    const now = this._ctx.currentTime;
    for (const osc of this._voice.oscillators) {
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.setValueAtTime(osc.frequency.value, now);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(frequency, 20),
        now + NOTE_RAMP_TIME
      );
    }
    this._voice.currentFreq = frequency;
  }

  _applyIntensity(intensity) {
    if (!this._voice) return;
    this._voice.currentIntensity = intensity;

    const preset = this._preset;
    const cutoff = preset.filter.baseFreq + intensity * preset.filter.intensityRange;
    this._voice.filter.frequency.setTargetAtTime(cutoff, this._ctx.currentTime, 0.01);

    // Scale envelope sustain with intensity
    const gain = preset.envelope.sustain * (0.3 + 0.7 * intensity);
    this._voice.envelopeGain.gain.setTargetAtTime(gain, this._ctx.currentTime, 0.02);
  }

  _destroyVoice() {
    if (!this._voice) return;
    this._cleanupVoiceNodes(this._voice);
    this._voice = null;
  }

  _cleanupVoiceNodes(voice) {
    for (const osc of voice.oscillators) {
      try { osc.stop(); } catch { /* already stopped */ }
      osc.disconnect();
    }
    voice.lfo.stop();
    voice.lfo.disconnect();
    voice.lfoGain.disconnect();
    voice.mixGain.disconnect();
    voice.filter.disconnect();
    for (const f of voice.formantNodes) f.disconnect();
    voice.envelopeGain.disconnect();
    if (voice.noiseSource) {
      try { voice.noiseSource.stop(); } catch { /* already stopped */ }
      voice.noiseSource.disconnect();
    }
    if (voice.noiseGainNode) voice.noiseGainNode.disconnect();
  }

  destroy() {
    this._destroyVoice();
    this._masterGain.disconnect();
  }
}
