// Lấy các phần tử HTML
const startButton = document.getElementById('start-record');
const stopButton = document.getElementById('stop-record');
const sendButton = document.getElementById('send-file');
const statusDisplay = document.getElementById('status');
const audioPlayback = document.getElementById('audio-playback');

let mediaRecorder;
let audioChunks = [];
let audioBlob;

// Bắt đầu ghi âm
startButton.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        audioChunks = [];

        // Hiển thị âm thanh đã ghi
        const audioURL = URL.createObjectURL(audioBlob);
        audioPlayback.src = audioURL;
        sendButton.disabled = false;
    };

    mediaRecorder.start();
    statusDisplay.innerText = "Recording...";
    startButton.disabled = true;
    stopButton.disabled = false;
});

// Dừng ghi âm
stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    statusDisplay.innerText = "Recording stopped. You can play or send the file.";
    startButton.disabled = false;
    stopButton.disabled = true;
});

// Gửi file .wav đến ESP32
sendButton.addEventListener('click', () => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    fetch('http://192.168.122.175/post-audio', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(data => {
        statusDisplay.innerText = "Audio sent successfully!";
        console.log('Response from ESP32:', data);
    })
    .catch(error => {
        statusDisplay.innerText = "Error sending audio.";
        console.error('Error:', error);
    });
});

document.getElementById("upload-button").addEventListener("click", () => {
    const fileInput = document.getElementById("audio-file");
    const file = fileInput.files[0];
    
    if (file) {
      const formData = new FormData();
      formData.append("audio", file);
      
      fetch("http://localhost:3000/upload-audio", {  // Địa chỉ máy chủ của bạn
        method: "POST",
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        document.getElementById("result").innerText = "Converted Text: " + data.text;
      })
      .catch(error => console.error("Error uploading file: ", error));
    }
  });