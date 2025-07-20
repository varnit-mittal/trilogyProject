console.log("CONTENT: Script loaded on Google Meet.");

let mediaRecorder;
let isRecording = false;
let stream;

// Create translation button
const recordButton = document.createElement('button');
recordButton.id = 'gmeet-translator-btn';
recordButton.innerText = 'Start Translation';
recordButton.style.position = 'fixed';
recordButton.style.bottom = '20px';
recordButton.style.right = '20px';
recordButton.style.zIndex = '999999';
recordButton.style.padding = '10px 20px';
recordButton.style.backgroundColor = '#1a73e8';
recordButton.style.color = 'white';
recordButton.style.fontSize = '14px';
recordButton.style.border = 'none';
recordButton.style.borderRadius = '6px';
recordButton.style.cursor = 'pointer';
recordButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
document.body.appendChild(recordButton);

recordButton.addEventListener('click', async () => {
  if (!isRecording) {
    await startRecording();
    recordButton.innerText = "Stop Translation";
    recordButton.style.backgroundColor = "red";
  } else {
    stopRecording();
    recordButton.innerText = "Start Translation";
    recordButton.style.backgroundColor = "#1a73e8";
  }
  isRecording = !isRecording;
});

async function startRecording() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("CONTENT: Microphone access granted.");

    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        console.log("CONTENT: Sending audio chunk to backend...");
        await sendChunkToBackend(event.data);
      }
    };

    mediaRecorder.start(); // full stream
setInterval(() => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.requestData();  // fires ondataavailable manually every 5s
  }
}, 5000);
    console.log("CONTENT: Real-time recording started.");
  } catch (err) {
    console.error("CONTENT: Microphone error", err);
    alert("Microphone permission denied.");
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    stream.getTracks().forEach(track => track.stop());
    console.log("CONTENT: Recording stopped.");
  }
}

async function sendChunkToBackend(audioBlob) {
  const targetLanguage = await new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_LANGUAGE" }, (response) => {
      resolve(response?.targetLanguage || "es");
    });
  });

  const formData = new FormData();
  formData.append('audio', audioBlob, 'chunk.webm');
  formData.append('target', targetLanguage);

  try {
    const response = await fetch("http://127.0.0.1:5000/api/translate-audio", {
      method: 'POST',
      body: formData
    });

    if (response.status === 204) {
      console.log("Chunk had no speech.");
      return;  // skip showing anything
    }

    if (!response.ok) {
      console.warn("Backend returned error:", response.status);
      return;
    }

    const text = await response.text();
    if (!text) {
      console.warn("Empty response from backend.");
      return;
    }

    const data = JSON.parse(text);
    if (data.translation) {
      displayTranslation(data.translation);
    }

  } catch (error) {
    console.error("CONTENT: Error sending chunk", error);
  }
}

function displayTranslation(text) {
  let translationBox = document.getElementById('translation-box');
  if (!translationBox) {
    translationBox = document.createElement('div');
    translationBox.id = 'translation-box';
    translationBox.style.position = 'fixed';
    translationBox.style.bottom = '70px';
    translationBox.style.right = '20px';
    translationBox.style.width = '300px';
    translationBox.style.backgroundColor = '#fff';
    translationBox.style.color = '#000';
    translationBox.style.border = '1px solid #ccc';
    translationBox.style.borderRadius = '5px';
    translationBox.style.padding = '10px';
    translationBox.style.zIndex = '999999';
    translationBox.style.fontSize = '14px';
    translationBox.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    translationBox.style.whiteSpace = 'pre-wrap';
    document.body.appendChild(translationBox);
  }

  // Append new line (optional: only show last N chunks)
  translationBox.innerText += "\n" + text;
}
