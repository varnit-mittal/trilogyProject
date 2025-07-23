console.log("[DEBUG] CONTENT SCRIPT LOADED");

let isRecording = false;

// Create floating translation button
const recordButton = document.createElement('button');
recordButton.id = 'gmeet-translator-btn';
recordButton.innerText = 'Start Translation';
Object.assign(recordButton.style, {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  zIndex: '999999',
  padding: '10px 20px',
  backgroundColor: '#1a73e8',
  color: 'white',
  fontSize: '14px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
});
document.body.appendChild(recordButton);

recordButton.addEventListener("click", () => {
  if (!isRecording) {
    chrome.runtime.sendMessage({ type: "START_CAPTURE" }, (res) => {
      if (res?.success) {
        console.log("[DEBUG] Started offscreen recording.");
        isRecording = true;
        recordButton.innerText = "Stop Translation";
        recordButton.style.backgroundColor = "red";
      } else {
        console.error("[ERROR] Failed to start recording.");
      }
    });
  } else {
    chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
    isRecording = false;
    recordButton.innerText = "Start Translation";
    recordButton.style.backgroundColor = "#1a73e8";
    console.log("[DEBUG] Stopped offscreen recording.");
  }
});

// Handle translation results sent back from offscreen.html
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "TRANSLATION_RESULT") {
    displayTranslation(msg.translation);
  }
});

function displayTranslation(text) {
  let box = document.getElementById('translation-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'translation-box';
    Object.assign(box.style, {
      position: 'fixed',
      bottom: '70px',
      right: '20px',
      width: '300px',
      backgroundColor: '#fff',
      color: '#000',
      border: '1px solid #ccc',
      borderRadius: '5px',
      padding: '10px',
      zIndex: '999999',
      fontSize: '14px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      whiteSpace: 'pre-wrap'
    });
    document.body.appendChild(box);
  }

  box.innerText += "\n" + text;
}
