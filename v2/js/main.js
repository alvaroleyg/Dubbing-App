// main.js
import { createVideoPlayer } from './videoPlayer.js';
import { createRecordWaveform } from './recordWaveform.js';
import { createVideoWaveform } from './videoWaveform.js';
import { createMasterTransport } from './masterTransport.js';

document.addEventListener('DOMContentLoaded', () => {
  // Referencias al DOM
  const sceneSelect = document.getElementById('scene-select');
  const sceneVideo = document.getElementById('scene-video');
  const playBtn = document.getElementById('play-btn');
  const stopBtn = document.getElementById('stop-btn');
  const recordBtn = document.getElementById('record-btn');
  const themeBtn = document.getElementById('theme-btn');
  const timeCodeElement = document.getElementById('time-code');

  // Crear instancias de los módulos
  const videoPlayer = createVideoPlayer(sceneVideo);
  const videoWaveform = createVideoWaveform(); // Usa el contenedor '#video-waveform'
  const recordWaveform = createRecordWaveform(); // Usa el contenedor '#record-waveform'
  const masterTransport = createMasterTransport(
    sceneVideo,
    videoWaveform.getInstance(),
    recordWaveform.getWavesurferInstance(),
    timeCodeElement
  );

  // Cambio de tema
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
  });

  // Función para cargar la escena, el video y el guion
  function loadScene() {
    const selectedScene = sceneSelect.value;
    const videoSrc = `../src/videos/${selectedScene}.mp4`;
    videoPlayer.setSource(videoSrc);
    videoWaveform.load(videoSrc);
    fetch(`../src/scripts/${selectedScene}_script.txt`)
      .then((response) => response.text())
      .then((data) => {
        document.getElementById('scene-script').textContent = data;
      });
  }

  sceneSelect.addEventListener('change', loadScene);
  loadScene();

  // Al cargar los metadatos del video, configura la duración para el transporte maestro
  sceneVideo.addEventListener('loadedmetadata', () => {
    masterTransport.setDuration(sceneVideo.duration);
  });

  // Controles de transporte:
  playBtn.addEventListener('click', () => {
    // Si el video está en pausa, lo reproducimos; de lo contrario, lo pausamos
    if (sceneVideo.paused) {
      masterTransport.play();
      playBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
      playBtn.classList.add('pause-btn');
    } else {
      masterTransport.pause();
      playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
      playBtn.classList.remove('pause-btn');
    }
  });

  stopBtn.addEventListener('click', () => {
    masterTransport.stop();
    playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    playBtn.classList.remove('pause-btn');
  });

  // Manejo de grabación
  let recordedAudio = null;

  recordBtn.addEventListener('click', async () => {
    if (!recordWaveform.isRecording) {
      // Inicia la grabación
      await recordWaveform.start();
      recordWaveform.isRecording = true;
      recordBtn.classList.add('recording');
      // Si el video está pausado, lo iniciamos
      if (sceneVideo.paused) {
        masterTransport.play();
        playBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
        playBtn.classList.add('pause-btn');
      }
    } else {
      // Se detiene la grabación
      const blob = await recordWaveform.stop();
      recordWaveform.isRecording = false;
      recordBtn.classList.remove('recording');

      // Cargamos el blob en la onda (para visualizar la forma de onda)
      const audioUrl = URL.createObjectURL(blob);
      recordWaveform.load(audioUrl);

      // Creamos un objeto Audio persistente para reproducir la grabación
      recordedAudio = new Audio(audioUrl);
      recordedAudio.preload = 'auto';

      // Ajustamos el playbackRate para que coincida con la duración del video
      recordedAudio.addEventListener('loadedmetadata', () => {
        if (sceneVideo.duration > 0) {
          recordedAudio.playbackRate = recordedAudio.duration / sceneVideo.duration;
        }
      });

      // Iniciamos la reproducción del audio grabado
      recordedAudio.play().catch(e => console.error('Error al reproducir el audio grabado:', e));
    }
  });

  // Sincronizar el audio grabado con el video en cada timeupdate
  sceneVideo.addEventListener('timeupdate', () => {
    if (recordedAudio) {
      // Sincronizamos el currentTime del audio grabado con el video
      recordedAudio.currentTime = sceneVideo.currentTime;
    }
  });
});
