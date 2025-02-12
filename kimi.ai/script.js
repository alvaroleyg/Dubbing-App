document.addEventListener('DOMContentLoaded', () => {
    const sceneSelect = document.getElementById('scene-select');
    const sceneVideo = document.getElementById('scene-video');
    const playBtn = document.getElementById('play-btn');
    const recordBtn = document.getElementById('record-btn');
    const stopBtn = document.getElementById('stop-btn');
    const recording = new Audio();
    const themeBtn = document.getElementById('theme-btn');
    const bodyElement = document.body;
    const timeCode = document.getElementById('time-code');

    // Función para cambiar el tema
    function toggleTheme() {
        bodyElement.classList.toggle('dark-theme');
    }

    // Asignar evento al botón de tema
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    function updateTimeCode() {
        const hours = Math.floor(sceneVideo.currentTime / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((sceneVideo.currentTime % 3600) / 60).toString().padStart(2, '0');
        const seconds = Math.floor(sceneVideo.currentTime % 60).toString().padStart(2, '0');
        const fps = 24; // Ajusta según la tasa de fotogramas del video
        const frames = Math.floor((sceneVideo.currentTime % 1) * fps).toString().padStart(2, '0');
        timeCode.textContent = `${hours}:${minutes}:${seconds}:${frames}`;
    }

    function loadScene() {
        const selectedScene = sceneSelect.value;
        sceneVideo.src = `../src/videos/${selectedScene}.mp4`;
        sceneVideo.load(); // Forzar la carga del nuevo video
        sceneVideo.currentTime = 0; // Reiniciar el tiempo del video
        sceneVideo.pause(); // Pausar el video
        fetch(`../src/scripts/${selectedScene}_script.txt`)
            .then(response => response.text())
            .then(data => {
                document.getElementById('scene-script').textContent = data;
            });
    }

    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    let timeUpdateInterval;

    recordBtn.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
            recordBtn.classList.add('recording');
        } else {
            stopRecording();
            recordBtn.classList.remove('recording');
        }
    });

    async function startRecording() {
        isRecording = true;
        audioChunks = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        mediaRecorder.start();
        sceneVideo.play();
        if (!timeUpdateInterval) {
            timeUpdateInterval = setInterval(updateTimeCode, 100);
        }
    }

    function stopRecording() {
        isRecording = false;
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            recording.src = audioUrl;
            recordBtn.classList.remove('recording');
        };
        sceneVideo.pause();
        clearInterval(timeUpdateInterval);
    }

    playBtn.addEventListener('click', () => {
        if (sceneVideo.paused) {
            sceneVideo.play();
            recording.play();
            playBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
            playBtn.classList.add('pause-btn');
            if (!timeUpdateInterval) {
                timeUpdateInterval = setInterval(updateTimeCode, 100);
            }
        } else {
            sceneVideo.pause();
            recording.pause();
            playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
            playBtn.classList.remove('pause-btn');
            clearInterval(timeUpdateInterval);
        }
    });

    stopBtn.addEventListener('click', () => {
        sceneVideo.currentTime = 0;
        recording.currentTime = 0;
        sceneVideo.pause();
        recording.pause();
        playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
        playBtn.classList.remove('pause-btn');
        timeCode.textContent = '00:00:00:00';
        clearInterval(timeUpdateInterval);
        if (isRecording) {
            stopRecording();
        }
    });

    sceneVideo.addEventListener('ended', () => {
        sceneVideo.pause();
        recording.pause();
        playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
        playBtn.classList.remove('pause-btn');
        timeCode.textContent = '00:00:00:00';
        clearInterval(timeUpdateInterval);
    });

    // Asegurarse de que se cargue la primera escena al inicio
    loadScene();

    // Evento para cambiar de escena
    sceneSelect.addEventListener('change', loadScene);
});