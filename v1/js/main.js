import { createVideoPlayer } from './videoPlayer.js';
import { createTimeCodeUpdater } from './timeCode.js';
import { createRecordWaveform } from './recordWaveform.js';
import { createVideoWaveform } from './videoWaveform.js';

document.addEventListener('DOMContentLoaded', () => {
  // Referencias al DOM
  const sceneSelect = document.getElementById('scene-select');
  const sceneVideo = document.getElementById('scene-video');
  const playBtn = document.getElementById('play-btn');
  const recordBtn = document.getElementById('record-btn');
  const stopBtn = document.getElementById('stop-btn');
  const themeBtn = document.getElementById('theme-btn');
  const bodyElement = document.body;
  const timeCodeElement = document.getElementById('time-code');
  const waveformContainer = document.getElementById('waveform-container');

  // Crear instancias de los módulos
  const videoPlayer = createVideoPlayer(sceneVideo);
  const timeCodeUpdater = createTimeCodeUpdater(sceneVideo, timeCodeElement);
  const recordWaveform = createRecordWaveform(waveformContainer);
  const videoWaveform = createVideoWaveform(waveformContainer);

  let isRecording = false;
  let recordedBlob = null;

  // Cambio de tema
  themeBtn.addEventListener('click', () => {
    bodyElement.classList.toggle('dark-theme');
  });

  // Función para cargar la escena y el guion
  function loadScene() {
    const selectedScene = sceneSelect.value;
    const videoSrc = `../src/videos/${selectedScene}.mp4`;
    videoPlayer.setSource(videoSrc);
    videoWaveform.load(videoSrc);
    fetch(`../src/scripts/${selectedScene}_script.txt`)
      .then(response => response.text())
      .then(data => {
        document.getElementById('scene-script').textContent = data;
      });
  }

  sceneSelect.addEventListener('change', loadScene);
  loadScene();

  // Manejo de grabación y forma de onda con el plugin Record
  recordBtn.addEventListener('click', async () => {
    if (!isRecording) {
      // Inicia la grabación
      await recordWaveform.start();
      isRecording = true;
      recordBtn.classList.add('recording');
      videoPlayer.play();
      timeCodeUpdater.start();
    } else {
      // Detiene la grabación y almacena el audio grabado
      recordedBlob = await recordWaveform.stop();
      isRecording = false;
      recordBtn.classList.remove('recording');
      videoPlayer.pause();
      timeCodeUpdater.stop();
    }
  });

  // Botón de reproducción: sincroniza video y audio grabado
  playBtn.addEventListener('click', () => {
    if (sceneVideo.paused) {
      videoPlayer.play();
      if (recordedBlob) {
        // Reproduce el audio grabado junto al video
        const audioUrl = URL.createObjectURL(recordedBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
      playBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
      playBtn.classList.add('pause-btn');
      timeCodeUpdater.start();
    } else {
      videoPlayer.pause();
      // Aquí podrías pausar también el audio reproducido (si guardas la referencia)
      playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
      playBtn.classList.remove('pause-btn');
      timeCodeUpdater.stop();
    }
  });

  // Botón de stop: reinicia video, forma de onda y time code
  stopBtn.addEventListener('click', async () => {
    videoPlayer.stop();
    playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    playBtn.classList.remove('pause-btn');
    timeCodeElement.textContent = '00:00:00:00';
    timeCodeUpdater.stop();
    if (isRecording) {
      await recordWaveform.stop();
      isRecording = false;
      recordBtn.classList.remove('recording');
    }
  });

  // Al finalizar el video, reinicia controles y time code
  sceneVideo.addEventListener('ended', () => {
    videoPlayer.pause();
    playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    playBtn.classList.remove('pause-btn');
    timeCodeElement.textContent = '00:00:00:00';
    timeCodeUpdater.stop();
  });
});