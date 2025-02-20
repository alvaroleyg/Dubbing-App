// main.js
import { createVideoPlayer } from './videoPlayer.js';
import { createTimeCodeUpdater } from './timeCode.js';
import { createWaveform } from './waveform.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // DOM references
    const sceneSelect = document.getElementById('scene-select');
    const sceneVideo = document.getElementById('scene-video');
    const playBtn = document.getElementById('play-btn');
    const recordBtn = document.getElementById('record-btn');
    const stopBtn = document.getElementById('stop-btn');
    const themeBtn = document.getElementById('theme-btn');
    const bodyElement = document.body;
    const timeCodeElement = document.getElementById('time-code');
    const waveformContainer = document.getElementById('waveform');

    // Initialize modules
    const videoPlayer = createVideoPlayer(sceneVideo);
    const timeCodeUpdater = createTimeCodeUpdater(sceneVideo, timeCodeElement);
    const waveform = createWaveform(waveformContainer);

    // Theme switch
    themeBtn.addEventListener('click', () => {
      bodyElement.classList.toggle('dark-theme');
    });

    // Load scene logic
    const loadScene = async () => {
      const selectedScene = sceneSelect.value;
      const videoSrc = `../src/videos/${selectedScene}.mp4`;
      const scriptSrc = `../src/scripts/${selectedScene}_script.txt`;

      if (sceneVideo.src !== videoSrc) {
        await videoPlayer.setSource(videoSrc);
      }

      try {
        const response = await fetch(scriptSrc);
        const data = await response.text();
        document.getElementById('scene-script').textContent = data;
      } catch (error) {
        console.error('Error loading script:', error);
      }
    };

    sceneSelect.addEventListener('change', loadScene);
    loadScene();

    // Record button handler
    recordBtn.addEventListener('click', async () => {
      if (!waveform.isRecording()) {
        await waveform.startRecording();
        recordBtn.classList.add('recording');
        videoPlayer.play();
        timeCodeUpdater.start();
      } else {
        await waveform.stopRecording();
        recordBtn.classList.remove('recording');
        videoPlayer.pause();
        timeCodeUpdater.stop();
      }
    });

    // Play button handler
    playBtn.addEventListener('click', () => {
      if (sceneVideo.paused) {
        videoPlayer.play();
        waveform.getWaveform().play();
        playBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
        playBtn.classList.add('pause-btn');
        timeCodeUpdater.start();
      } else {
        videoPlayer.pause();
        waveform.getWaveform().pause();
        playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
        playBtn.classList.remove('pause-btn');
        timeCodeUpdater.stop();
      }
    });

    // Stop button handler
    stopBtn.addEventListener('click', async () => {
      videoPlayer.stop();
      waveform.getWaveform().pause();
      playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
      playBtn.classList.remove('pause-btn');
      timeCodeElement.textContent = '00:00:00:00';
      timeCodeUpdater.stop();

      if (waveform.isRecording()) {
        await waveform.stopRecording();
        recordBtn.classList.remove('recording');
      }
    });

    // Video end handler
    sceneVideo.addEventListener('ended', () => {
      videoPlayer.pause();
      waveform.getWaveform().pause();
      playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
      playBtn.classList.remove('pause-btn');
      timeCodeElement.textContent = '00:00:00:00';
      timeCodeUpdater.stop();
    });

    // Waveform update on recording end
    waveform.getWaveform().on('record-stop', () => {
      console.log('Recording stopped');
    });

    waveform.getWaveform().on('record-pause', () => {
      console.log('Recording paused');
    });

    waveform.getWaveform().on('record-resume', () => {
      console.log('Recording resumed');
    });

    // Handle microphone access
    waveform.getWaveform().on('device-ready', () => {
      console.log('Audio device ready');
    });

    waveform.getWaveform().on('error', (error) => {
      console.error('WaveSurfer error:', error);
    });
  } catch (error) {
    console.error('Initialization error:', error);
  }
});