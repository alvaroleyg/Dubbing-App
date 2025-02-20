// main.js
import { createVideoPlayer } from './videoPlayer.js';
import { createAudioRecorder } from './audioRecorder.js';
import { createTimeCodeUpdater } from './timeCode.js';

document.addEventListener('DOMContentLoaded', () => {
  // Obtener referencias de los elementos del DOM
  const sceneSelect = document.getElementById('scene-select');
  const sceneVideo = document.getElementById('scene-video');
  const playBtn = document.getElementById('play-btn');
  const recordBtn = document.getElementById('record-btn');
  const stopBtn = document.getElementById('stop-btn');
  const themeBtn = document.getElementById('theme-btn');
  const bodyElement = document.body;
  const timeCodeElement = document.getElementById('time-code');

  // Crear instancias de los módulos
  const videoPlayer = createVideoPlayer(sceneVideo);
  const audioRecorder = createAudioRecorder();
  const timeCodeUpdater = createTimeCodeUpdater(sceneVideo, timeCodeElement);

  // Función para cambiar el tema
  themeBtn.addEventListener('click', () => {
    bodyElement.classList.toggle('dark-theme');
  });

  // Función para cargar la escena y el guion correspondiente
  function loadScene() {
    const selectedScene = sceneSelect.value;
    const videoSrc = `../src/videos/${selectedScene}.mp4`;
    videoPlayer.setSource(videoSrc);
    // Cargar el guion
    fetch(`../src/scripts/${selectedScene}_script.txt`)
      .then(response => response.text())
      .then(data => {
        document.getElementById('scene-script').textContent = data;
      });
  }

  // Cargar la primera escena al iniciar y actualizar al cambiar de selección
  sceneSelect.addEventListener('change', loadScene);
  loadScene();

  // Control de grabación de audio
  recordBtn.addEventListener('click', async () => {
    if (!audioRecorder.isRecording()) {
      await audioRecorder.startRecording();
      recordBtn.classList.add('recording');
      videoPlayer.play();
      timeCodeUpdater.start();
    } else {
      await audioRecorder.stopRecording();
      recordBtn.classList.remove('recording');
      videoPlayer.pause();
      timeCodeUpdater.stop();
    }
  });

  // Botón de reproducción: sincroniza video y audio grabado
  playBtn.addEventListener('click', () => {
    if (sceneVideo.paused) {
      videoPlayer.play();
      audioRecorder.play();
      playBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
      playBtn.classList.add('pause-btn');
      timeCodeUpdater.start();
    } else {
      videoPlayer.pause();
      audioRecorder.pause();
      playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
      playBtn.classList.remove('pause-btn');
      timeCodeUpdater.stop();
    }
  });

  // Botón de stop: reinicia video, audio y time code
  stopBtn.addEventListener('click', async () => {
    videoPlayer.stop();
    audioRecorder.pause();
    audioRecorder.reset();
    playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    playBtn.classList.remove('pause-btn');
    timeCodeElement.textContent = '00:00:00:00';
    timeCodeUpdater.stop();
    if (audioRecorder.isRecording()) {
      await audioRecorder.stopRecording();
      recordBtn.classList.remove('recording');
    }
  });

  // Cuando finaliza el video, se resetean los controles
  sceneVideo.addEventListener('ended', () => {
    videoPlayer.pause();
    audioRecorder.pause();
    playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    playBtn.classList.remove('pause-btn');
    timeCodeElement.textContent = '00:00:00:00';
    timeCodeUpdater.stop();
  });
});
