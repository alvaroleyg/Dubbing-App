document.addEventListener('DOMContentLoaded', () => {
    const sceneSelect = document.getElementById('scene-select');
    const sceneVideo = document.getElementById('scene-video');
    const playBtn = document.getElementById('play-btn');
    const recordBtn = document.getElementById('record-btn');
    const stopBtn = document.getElementById('stop-btn');
    const recording = new Audio();
    const themeBtn = document.getElementById('theme-btn');
    const bodyElement = document.body;

    themeBtn.addEventListener('click', () => {
        bodyElement.classList.toggle('dark-theme');
    });

    sceneSelect.addEventListener('change', loadScene);

    function loadScene() {
        const selectedScene = sceneSelect.value;
        sceneVideo.src = `../src/videos/${selectedScene}.mp4`;
        fetch(`../src/scripts/${selectedScene}_script.txt`)
            .then(response => response.text())
            .then(data => {
                document.getElementById('scene-script').textContent = data;
            });
    }

    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

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
    }

    playBtn.addEventListener('click', () => {
        if (sceneVideo.paused) {
            sceneVideo.play();
            recording.play();
            playBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
            playBtn.classList.add('pause-btn');
        } else {
            sceneVideo.pause();
            recording.pause();
            playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
            playBtn.classList.remove('pause-btn');
        }
    });

    stopBtn.addEventListener('click', () => {
        sceneVideo.currentTime = 0;
        recording.currentTime = 0;
        sceneVideo.pause();
        recording.pause();
        playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
        playBtn.classList.remove('pause-btn');
        if (isRecording) {
            stopRecording();
        }
    });

    sceneVideo.addEventListener('ended', () => {
        sceneVideo.pause();
        recording.pause();
        playBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
        playBtn.classList.remove('pause-btn');
    });
});