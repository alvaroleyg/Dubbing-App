// waveform.js
import WaveSurfer from 'https://cdn.jsdelivr.net/npm/wavesurfer.js@7/dist/wavesurfer.esm.js';
import RecordPlugin from 'https://cdn.jsdelivr.net/npm/wavesurfer.js@7/dist/plugins/record.esm.js';

export function createWaveform(containerId) {
    const waveform = WaveSurfer.create({
      container: containerId,
      waveColor: '#6e6e6e',
      plugins: [
        RecordPlugin.create({
          bufferSize: 4096,
          renderRecordedAudio: true,
          continuousWaveform: true,
          scrollingWaveform: false
        })
      ]
    });
  
    return {
      startRecording: () => waveform.startRecording(),
      stopRecording: () => waveform.stopRecording(),
      isRecording: () => waveform.isRecording(),
      getWaveform: () => waveform,
      play: () => waveform.play(),
      pause: () => waveform.pause()
    };
  }