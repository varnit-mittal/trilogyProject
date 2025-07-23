// This script is designed to work with a modern background script
// that passes a streamId for tab capture.

let recorder;
let data = [];
let targetLanguage = 'es';
let chunkingInterval;
let activeTabId;

console.log('[DEBUG] offscreen.js loaded and ready.');

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target !== 'offscreen') return;

  switch (message.type) {
    case 'start-recording':
      activeTabId = message.tabId;
      targetLanguage = message.targetLanguage;
      startRecording(message.streamId);
      break;
    case 'stop-recording':
      stopRecording();
      break;
    default:
      console.warn(`[WARN] Unrecognized message type: ${message.type}`);
  }
});

async function startRecording(streamId) {
  if (recorder?.state === 'recording') {
    console.warn('[WARN] startRecording called while already recording.');
    return;
  }

  console.log(`[DEBUG] Starting recording with streamId: ${streamId}`);
  const media = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
      },
    },
  });

  // Play audio to the user to confirm capture is working
  const output = new AudioContext();
  const source = output.createMediaStreamSource(media);
  source.connect(output.destination);

  recorder = new MediaRecorder(media, { mimeType: 'audio/webm' });
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) data.push(event.data);
  };

  // Set the onstop handler. This will be triggered by recorder.stop()
  recorder.onstop = handleData;

  recorder.start();
  window.location.hash = 'recording';
  console.log('[DEBUG] MediaRecorder started.');

  // Start chunking
  chunkingInterval = setInterval(() => {
    if (recorder?.state === 'recording') {
      console.log('[DEBUG] Stopping recorder for periodic 20-second chunk.');
      recorder.stop();
    }
  }, 10000);
}

async function handleData() {
  console.log('[DEBUG] onstop event triggered. Handling data.');
  if (data.length === 0) {
    console.warn('[WARN] No data in chunks to send.');
    // If we're in the middle of a recording, restart immediately.
    if (window.location.hash === 'recording') {
      recorder.start();
    }
    return;
  }

  const blob = new Blob(data, { type: 'audio/webm' });
  data = []; // Clear chunks for the next interval

  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');
  formData.append('target', targetLanguage);

  const backendUrl = 'http://127.0.0.1:5000/api/translate-audio';

  try {
    console.log('[DEBUG] Sending audio data to backend...');
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log('[DEBUG] Backend response received:', result);
      if (result.translation && activeTabId) {
        chrome.runtime.sendMessage({
          type: 'TRANSLATION_RESULT',
          translation: result.translation,
          tabId: activeTabId,
        });
        console.log('[DEBUG] Translation sent to background script.');
      }
    } else {
      console.error('[ERROR] Backend error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('[ERROR] Failed to send data to backend:', error);
  } finally {
    // This is the crucial part. After the fetch is done, decide whether to
    // restart the recording or perform the final cleanup.

    // If the hash is still '#recording', we're in the middle of a session. Restart.
    if (window.location.hash === '#recording' && recorder?.state === 'inactive') {
      console.log('[DEBUG] Restarting recorder after sending chunk.');
      recorder.start();
    } 
    // Otherwise, this was the final chunk. Clean up everything.
    else if (recorder?.state === 'inactive') {
      console.log('[DEBUG] Final run detected. Cleaning up media stream.');
      recorder.stream.getTracks().forEach((t) => t.stop());
      recorder = undefined;
      console.log('[DEBUG] Recording fully stopped and resources cleaned up.');
    }
  }
}

function stopRecording() {
  console.log('[DEBUG] Received stop command.');
  if (chunkingInterval) clearInterval(chunkingInterval);

  // Clear the hash. This signals to handleData() that this is the final run.
  window.location.hash = '';

  if (recorder?.state === 'recording') {
    recorder.stop(); // This triggers the final onstop event and the cleanup logic.
    console.log('[DEBUG] Final recorder.stop() called.');
  } else {
    // If not recording, there's nothing to do.
    console.log('[DEBUG] Stop called but recorder was not active.');
  }
}