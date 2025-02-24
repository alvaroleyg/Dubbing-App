// masterTransport.js
/**
 * Función auxiliar para formatear el tiempo (en segundos) a HH:MM:SS:FF,
 * donde FF son frames (usando fps, por defecto 30).
 */
function formatTime(seconds, fps = 30) {
  const totalFrames = Math.floor(seconds * fps);
  const hours = Math.floor(totalFrames / (3600 * fps));
  const minutes = Math.floor((totalFrames % (3600 * fps)) / (60 * fps));
  const secs = Math.floor((totalFrames % (60 * fps)) / fps);
  const frames = totalFrames % fps;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Crea un transporte maestro que sincroniza:
 * - El <video> (sceneVideo) (usando su reproducción nativa)
 * - La forma de onda del video (waveSurferVideo)
 * - La forma de onda de la grabación (waveSurferRecord)
 * - El time code (timeCodeElement)
 */
export function createMasterTransport(
  sceneVideo,
  waveSurferVideo,
  waveSurferRecord,
  timeCodeElement,
  fps = 30
) {
  let duration = 0;

  // Cada vez que el video actualice su tiempo, actualizamos las ondas y el time code
  function update() {
    const timeInSeconds = sceneVideo.currentTime;
    if (duration > 0) {
      const progressFraction = timeInSeconds / duration;
      waveSurferVideo.seekTo(progressFraction);
      waveSurferRecord.seekTo(progressFraction);
    }
    timeCodeElement.textContent = formatTime(timeInSeconds, fps);
  }

  // Escuchar el evento nativo timeupdate del video
  sceneVideo.addEventListener('timeupdate', update);

  function play() {
    sceneVideo.play();
  }

  function pause() {
    sceneVideo.pause();
  }

  function stop() {
    sceneVideo.pause();
    sceneVideo.currentTime = 0;
    waveSurferVideo.seekTo(0);
    waveSurferRecord.seekTo(0);
    timeCodeElement.textContent = formatTime(0, fps);
  }

  function setDuration(sec) {
    duration = sec;
  }

  return { play, pause, stop, setDuration, get currentTime() { return sceneVideo.currentTime; } };
}
