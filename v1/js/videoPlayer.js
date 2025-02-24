// videoPlayer.js
export function createVideoPlayer(videoElement) {
    return {
      play: () => {
        videoElement.play();
      },
      pause: () => {
        videoElement.pause();
      },
      stop: () => {
        videoElement.pause();
        videoElement.currentTime = 0;
      },
      setSource: (src) => {
        videoElement.src = src;
        videoElement.load();
        videoElement.currentTime = 0;
      },
      getCurrentTime: () => videoElement.currentTime,
      onEnded: (callback) => {
        videoElement.addEventListener('ended', callback);
      },
      getElement: () => videoElement
    };
  }
  