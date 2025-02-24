// recordWaveform.js
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js?module';
import RecordPlugin from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/record.esm.js?module';

export function createRecordWaveform() {
  const wavesurfer = WaveSurfer.create({
    container: '#record-waveform',
    waveColor: '#6e6e6e',
    progressColor: '#333333',
    interact: true,
    cursorWidth: 1,
    hideScrollbar: true,
  });

  const record = wavesurfer.registerPlugin(
    RecordPlugin.create({
      renderRecordedAudio: false, // No se renderiza automáticamente el audio grabado
      continuousWaveform: true,
      continuousWaveformDuration: 30, // duración en segundos de la forma de onda continua
    })
  );

  let recordedBlob = null;
  let playbackAudio = null;

  // Al finalizar la grabación, se almacena el blob
  record.on('record-end', (blob) => {
    recordedBlob = blob;
  });

  return {
    start: async () => {
      // Inicia la grabación mediante el plugin Record
      await record.startRecording();
    },
    stop: async () => {
      // Detiene la grabación y retorna el blob grabado
      await record.stopRecording();
      return recordedBlob;
    },
    playRecording: () => {
      // Si existe una grabación, crea un elemento Audio y lo reproduce
      if (recordedBlob) {
        const audioUrl = URL.createObjectURL(recordedBlob);
        if (playbackAudio) {
          playbackAudio.pause();
        }
        playbackAudio = new Audio(audioUrl);
        playbackAudio.play();
      }
    },
    getWavesurferInstance: () => wavesurfer,
  };
}