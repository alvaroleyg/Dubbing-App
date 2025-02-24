// videoWaveform.js
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js?module';

export function createVideoWaveform() {
  const wavesurfer = WaveSurfer.create({
    container: '#video-waveform',
    waveColor: '#a0a0a0',
    progressColor: '#606060',
    interact: false,
    cursorWidth: 1,
    hideScrollbar: true,
  });

  return {
    load: (url) => {
      wavesurfer.load(url);
    },
    getInstance: () => wavesurfer,
  };
}
