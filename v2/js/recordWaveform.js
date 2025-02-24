// recordWaveform.js
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js?module';
import RecordPlugin from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/record.esm.js?module';

export function createRecordWaveform() {
  const wavesurfer = WaveSurfer.create({
    container: '#record-waveform',
    waveColor: '#6e6e6e',
    progressColor: '#333333',
    interact: false,
    cursorWidth: 1,
    hideScrollbar: true,
  });

  const record = wavesurfer.registerPlugin(
    RecordPlugin.create({
      renderRecordedAudio: false,
      continuousWaveform: true,
      continuousWaveformDuration: 30,
    })
  );

  let recordedBlob = null;
  let playbackAudio = null;
  // Bandera para indicar si se está grabando
  const isRecording = false;

  record.on('record-end', (blob) => {
    recordedBlob = blob;
  });

  return {
    start: async () => {
      await record.startRecording();
    },
    stop: async () => {
      await record.stopRecording();
      return recordedBlob;
    },
    playRecording: () => {
      if (recordedBlob) {
        const audioUrl = URL.createObjectURL(recordedBlob);
        if (playbackAudio) {
          playbackAudio.pause();
        }
        playbackAudio = new Audio(audioUrl);
        playbackAudio.play();
      }
    },
    load: (url) => {
      wavesurfer.load(url);
    },
    getWavesurferInstance: () => wavesurfer,
    // Propiedad para controlar el estado de grabación
    get isRecording() {
      return this._isRecording || false;
    },
    set isRecording(val) {
      this._isRecording = val;
    },
  };
}
