// waveform.js
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import RecordPlugin from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/record.esm.js'

export function createWaveform(container) {
  // Crear instancia de WaveSurfer con el plugin de grabación
  const wavesurfer = WaveSurfer.create({
    container,
    waveColor: '#6e6e6e',
    progressColor: '#4a4a4a',
    height: 100,
    responsive: true,
    normalize: true,
    plugins: [
      RecordPlugin.create({
        scrollingWaveform: true,
        renderRecordedAudio: false,
        audioBitsPerSecond: 128000,
      }),
    ],
  })

  // Variable para almacenar el audio grabado
  let recordedUrl = null

  return {
    startRecording: async () => {
      try {
        // Pedir permisos del micrófono primero
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        
        await wavesurfer.record.start(stream)
        return true
      } catch (error) {
        console.error('Error al iniciar grabación:', error)
        return false
      }
    },
    
    stopRecording: async () => {
      recordedUrl = await wavesurfer.record.stop()
      return recordedUrl
    },
    
    play: () => {
      if (recordedUrl) {
        wavesurfer.load(recordedUrl)
        wavesurfer.play()
      }
    },
    
    pause: () => wavesurfer.pause(),
    
    stop: () => {
      wavesurfer.stop()
      wavesurfer.empty()
    },
    
    isRecording: () => wavesurfer.record.isRecording(),
    
    getRecordedAudio: () => recordedUrl,
    
    getInstance: () => wavesurfer,
  }
}