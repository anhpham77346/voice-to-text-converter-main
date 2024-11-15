if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    const startButton = document.getElementById('start-record');
    const statusDisplay = document.getElementById('status');
    const transcriptDisplay = document.getElementById('transcript-text');
    const audioPlayback = document.getElementById('audio-playback');

    let finalTranscript = '';
    let mediaRecorder;
    let audioChunks = [];
    let audioBlob;

    // Start recording and speech recognition
    startButton.addEventListener('click', async () => {
        recognition.start();
        statusDisplay.innerText = "Listening and recording...";

        // Start recording audio
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioChunks = [];

            // Display audio file for playback
            const audioURL = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioURL;
            statusDisplay.innerText = "Recording stopped. Sending data...";

            sendDataToESP32(finalTranscript, audioBlob);
        };

        mediaRecorder.start();
        startButton.disabled = false;

        // Stop automatically after 5 seconds
        setTimeout(() => {
            recognition.stop();
            mediaRecorder.stop();
        }, 5000);
    });

    // Process speech recognition result
    recognition.onresult = (event) => {
        finalTranscript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        transcriptDisplay.innerText = finalTranscript;
    };

    // Send audio and transcript data to ESP32
    function sendDataToESP32(transcript, audioBlob) {
        // Create FormData object to send the audio file
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        // Send audio file to ESP32
        fetch('http://192.168.31.239/post-audio', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.text())
        .then(data => {
            statusDisplay.innerText = "Audio sent successfully!";
            console.log('Response from ESP32 (audio):', data);
        })
        .catch(error => {
            statusDisplay.innerText = "Error sending audio.";
            console.error('Error:', error);
        });

        // Send transcript to ESP32
        fetch('http://192.168.31.239/post-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: transcript
        })
        .then(response => response.text())
        .then(data => {
            console.log('Response from ESP32 (text):', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // Handle Web Speech API errors
    recognition.onerror = (event) => {
        transcriptDisplay.innerText = `Error occurred in recognition: ${event.error}`;
    };
} else {
    alert('Web Speech API is not supported in this browser.');
}
