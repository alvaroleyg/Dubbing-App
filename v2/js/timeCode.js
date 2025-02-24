// timeCode.js
export function createTimeCodeUpdater(videoElement, timeCodeElement, fps = 24) {
    let intervalId = null;
  
    function update() {
      const currentTime = videoElement.currentTime;
      const hours = Math.floor(currentTime / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((currentTime % 3600) / 60).toString().padStart(2, '0');
      const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
      const frames = Math.floor((currentTime % 1) * fps).toString().padStart(2, '0');
      timeCodeElement.textContent = `${hours}:${minutes}:${seconds}:${frames}`;
    }
  
    function start() {
      if (!intervalId) {
        intervalId = setInterval(update, 100);
      }
    }
  
    function stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  
    return { start, stop, update };
  }
  