// main.js
import { createVideoPlayer } from './videoPlayer.js';
import { createTimeCodeUpdater } from './timeCode.js';
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js?module';
import RecordPlugin from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/record.esm.js?module';

document.addEventListener('DOMContentLoaded', () => {
  // Referencias al DOM
  const sceneSelect = document.getElementById('scene-select');
  const sceneVideo = document.getElementById('scene-video');
  const playBtn = document.getElementById('play-btn');
  const stopBtn = document.getElementById('stop-btn');
  const themeBtn = document.getElementById('theme-btn');
  const bodyElement = document.body;
  const timeCodeElement = document.getElementById('time-code');
  const waveformContainer = document.getElementById('waveform');

  // Crear instancias de los módulos
  const videoPlayer = createVideoPlayer(sceneVideo);
  const timeCodeUpdater = createTimeCodeUpdater(sceneVideo, timeCodeElement);

  // Inicializar WaveSurfer con el plugin Record
  const wavesurfer = WaveSurfer.create({
    container: waveformContainer,
    waveColor: '#6e6e6e',
    progressColor: '#333',
    plugins: [
      RecordPlugin.create({
        renderRecordedAudio: false,
        scrollingWaveform: true,
        continuousWaveform: true,
        continuousWaveformDuration: 30, // Duración en segundos
      }),
    ],
  });

  const record = wavesurfer.getPlugin('record');

  // Cambiar tema
  themeBtn.addEventListener('click', () => {
    bodyElement.classList.toggle('dark-theme');
  });

  // Función para cargar la escena y el guion
  function loadScene() {
    const selectedScene = sceneSelect.value;
    const videoSrc = `../src/videos/${selectedScene}.mp4`;
    videoPlayer.setSource(videoSrc);
    fetch(`../src/scripts/${selectedScene}_script.txt`)
      .then(response => response.text())
      .then(data => {
        document.getElementById('scene-script').textContent = data;
      });
  }

  sceneSelect.addEventListener('change', loadScene);
  loadScene();

  // Botón de reproducción: sincroniza video y audio grabado
  playBtn.addEventListener('click', () => {
    if (sceneVideo.paused) {
      videoPlayer.play();
      record.play();
      playBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
      playBtn.classList.add('pause-btn');
      timeCodeUpdater.start();
    } else {
      videoPlayer.pause();
      record.pause();
      playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
      playBtn.classList.remove('pause-btn');
      timeCodeUpdater.stop();
    }
  });

  // Botón de stop: reinicia video, audio, forma de onda y time code
  stopBtn.addEventListener('click', () => {
    videoPlayer.stop();
    record.stop();
    playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    playBtn.classList.remove('pause-btn');
    timeCodeElement.textContent = '00:00:00:00';
    timeCodeUpdater.stop();
  });

  // Al finalizar el video, reinicia controles y forma de onda
  sceneVideo.addEventListener('ended', () => {
    videoPlayer.pause();
    record.pause();
    playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    playBtn.classList.remove('pause-btn');
    timeCodeElement.textContent = '00:00:00:00';
    timeCodeUpdater.stop();
  });
});