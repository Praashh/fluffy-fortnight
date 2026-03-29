// AudioWorklet processor — computes RMS per 128-sample quantum (~3ms at 48kHz)

class MicWorkletProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const samples = input[0];
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sum / samples.length);

    this.port.postMessage({ rms });
    return true;
  }
}

registerProcessor('mic-worklet-processor', MicWorkletProcessor);
