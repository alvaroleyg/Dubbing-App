// Define las escenas con rutas relativas a tus videos locales
const scenes = {
    scene1: {
      videoSrc: 'videos/escena1_Lost.mp4',  // Asegúrate de tener esta ruta correcta
      script: `Esta es la transcripción de la Escena 1.
Aquí se muestra el diálogo traducido de la película.`
    },
    scene2: {
      videoSrc: 'videos/escena2_ComoConociAVuestraMadre.mp4',
      script: `Esta es la transcripción de la Escena 2.
Aquí se muestra otro diálogo de la película, traducido al español.`
    }
  };

  const sceneSelect = document.getElementById('sceneSelect');
  const videoPlayer = document.getElementById('videoPlayer');
  const scriptText = document.getElementById('scriptText');
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const recordBtn = document.getElementById('recordBtn');
  const stopRecordBtn = document.getElementById('stopRecordBtn');
  const downloadContainer = document.getElementById('downloadContainer');

  let mediaRecorder;
  let recordedChunks = [];

  // Al seleccionar una escena, actualiza el video y el guión
  sceneSelect.addEventListener('change', () => {
    const selectedScene = sceneSelect.value;
    if (scenes[selectedScene]) {
      videoPlayer.src = scenes[selectedScene].videoSrc;
      scriptText.textContent = scenes[selectedScene].script;
    }
  });

  playBtn.addEventListener('click', () => {
    videoPlayer.play();
  });

  pauseBtn.addEventListener('click', () => {
    videoPlayer.pause();
  });

  // Funcionalidad para iniciar la grabación
  recordBtn.addEventListener('click', async () => {
    if (!videoPlayer.src) {
      alert("Primero selecciona una escena.");
      return;
    }
    // Se asegura que el video esté reproduciéndose para poder capturar el stream
    if (videoPlayer.paused) {
      await videoPlayer.play();
    }
    const stream = videoPlayer.captureStream();
    
    // Para grabar solo el audio del video. Si se quiere incluir el micrófono, se combinarían streams.
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'grabacion.webm';
      downloadLink.textContent = 'Descargar Grabación';
      downloadContainer.innerHTML = '';
      downloadContainer.appendChild(downloadLink);
    };

    mediaRecorder.start();
    recordBtn.disabled = true;
    stopRecordBtn.disabled = false;
  });

  stopRecordBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      recordBtn.disabled = false;
      stopRecordBtn.disabled = true;
    }
  });