// main.js
import { createVideoPlayer } from './videoPlayer.js'
import { createTimeCodeUpdater } from './timeCode.js'
import { createWaveform } from './waveform.js'

document.addEventListener('DOMContentLoaded', () => {
  // Referencias al DOM
  const sceneSelect = document.getElementById('scene-select')
  const sceneVideo = document.getElementById('scene-video')
  const playBtn = document.getElementById('play-btn')
  const recordBtn = document.getElementById('record-btn')
  const stopBtn = document.getElementById('stop-btn')
  const themeBtn = document.getElementById('theme-btn')
  const bodyElement = document.body
  const timeCodeElement = document.getElementById('time-code')
  const waveformContainer = document.getElementById('waveform')

  // Crear instancias de los módulos
  const videoPlayer = createVideoPlayer(sceneVideo)
  const timeCodeUpdater = createTimeCodeUpdater(sceneVideo, timeCodeElement)
  const waveform = createWaveform(waveformContainer)

  // Variable para sincronización
  let startTime = 0
  let audioOffset = 0

  // Variable para almacenar el audio grabado
  let recordedAudio = null

  // Cambiar tema
  themeBtn.addEventListener('click', () => {
    bodyElement.classList.toggle('dark-theme')
  })

  // Función para cargar la escena y el guion
  function loadScene() {
    const selectedScene = sceneSelect.value
    const videoSrc = `../src/videos/${selectedScene}.mp4`
    videoPlayer.setSource(videoSrc)
    fetch(`../src/scripts/${selectedScene}_script.txt`)
      .then((response) => response.text())
      .then((data) => {
        document.getElementById('scene-script').textContent = data
      })
  }

  sceneSelect.addEventListener('change', loadScene)
  loadScene()

  // Manejo de grabación de audio
  recordBtn.addEventListener('click', async () => {
    if (!waveform.isRecording()) {
      // Iniciar grabación
      const success = await waveform.startRecording()
      if (success) {
        startTime = Date.now()
        audioOffset = sceneVideo.currentTime
        recordBtn.classList.add('recording')
        videoPlayer.play()
        timeCodeUpdater.start()
      }
    } else {
      // Detener grabación
      await waveform.stopRecording()
      recordBtn.classList.remove('recording')
      videoPlayer.pause()
      timeCodeUpdater.stop()
      
      // Sincronizar audio grabado con el video
      const recordedDuration = (Date.now() - startTime) / 1000
      sceneVideo.currentTime = audioOffset
    }
  })

  // Botón de reproducción
  playBtn.addEventListener('click', () => {
    if (sceneVideo.paused) {
      // Iniciar reproducción sincronizada
      sceneVideo.play()
      waveform.play()
      
      // Sincronizar audio con video
      if (waveform.getRecordedAudio()) {
        const audioElement = waveform.getInstance().getMediaElement()
        if (audioElement) {
          audioElement.currentTime = sceneVideo.currentTime - audioOffset
        }
      }
      
      playBtn.querySelector('i').classList.replace('fa-play', 'fa-pause')
      playBtn.classList.add('pause-btn')
      timeCodeUpdater.start()
    } else {
      sceneVideo.pause()
      waveform.pause()
      playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play')
      playBtn.classList.remove('pause-btn')
      timeCodeUpdater.stop()
    }
  })

  // Botón de stop
  stopBtn.addEventListener('click', () => {
    videoPlayer.stop()
    waveform.stop()
    playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play')
    playBtn.classList.remove('pause-btn')
    timeCodeElement.textContent = '00:00:00:00'
    timeCodeUpdater.stop()
    
    if (waveform.isRecording()) {
      waveform.stopRecording()
      recordBtn.classList.remove('recording')
    }
    
    recordedAudio = null
  })

  // Al finalizar el video
  sceneVideo.addEventListener('ended', () => {
    videoPlayer.pause()
    waveform.pause()
    playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play')
    playBtn.classList.remove('pause-btn')
    timeCodeElement.textContent = '00:00:00:00'
    timeCodeUpdater.stop()
  })
})