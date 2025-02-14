// audioRecorder.js
export function createAudioRecorder() {
    let mediaRecorder;
    let audioChunks = [];
    const audioElement = new Audio();
    let isRecording = false;
  
    async function startRecording() {
      isRecording = true;
      audioChunks = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };
        mediaRecorder.start();
      } catch (error) {
        console.error("Error al acceder al micrófono:", error);
      }
    }
  
    function stopRecording() {
      return new Promise(resolve => {
        if (!mediaRecorder) {
          resolve(null);
          return;
        }
        isRecording = false;
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          audioElement.src = audioUrl;
          resolve(audioUrl);
        };
      });
    }
  
    function play() {
      audioElement.play();
    }
  
    function pause() {
      audioElement.pause();
    }
  
    function reset() {
      audioElement.src = '';
      audioChunks = [];
    }
  
    return {
      startRecording,
      stopRecording,
      play,
      pause,
      reset,
      isRecording: () => isRecording,
      getAudioElement: () => audioElement,
    };
  }
  