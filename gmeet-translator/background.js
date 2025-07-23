// This script uses a modern, robust pattern for handling tab capture.
// It can be triggered by a message from a content script or by clicking
// the extension's toolbar icon.

// --- Listener for messages from the content script ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SET_LANGUAGE") {
    chrome.storage.sync.set({ targetLanguage: msg.targetLanguage });
    return;
  }

  if (msg.type === "GET_LANGUAGE") {
    chrome.storage.sync.get("targetLanguage", (data) => {
      sendResponse({ targetLanguage: data.targetLanguage || "es" });
    });
    return true;
  }

  if (msg.type === "START_CAPTURE") {
    setupOffscreenDocument(sender.tab.id);
    sendResponse({ success: true });
    return;
  }

  if (msg.type === "STOP_CAPTURE") {
    chrome.runtime.sendMessage({ type: 'stop-recording', target: 'offscreen' });
    sendResponse({ success: true });
    return;
  }

  if (msg.type === "TRANSLATION_RESULT") {
    if (msg.tabId) {
      chrome.tabs.sendMessage(msg.tabId, {
        type: "TRANSLATION_RESULT",
        translation: msg.translation
      });
    }
    return; // This is a one-way message, no response needed.
  }
});

// --- NEW: Listener for clicks on the extension's toolbar icon ---
chrome.action.onClicked.addListener((tab) => {
  // Call the same setup function as the message listener
  setupOffscreenDocument(tab.id);
});

// --- Main logic function, now reusable by both listeners ---
async function setupOffscreenDocument(tabId) {
  try {
    const existingContexts = await chrome.runtime.getContexts({});
    const offscreenDocument = existingContexts.find(
      (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
    );

    // If a document exists and is recording, send a stop message.
    if (offscreenDocument && offscreenDocument.documentUrl.endsWith('#recording')) {
      chrome.runtime.sendMessage({ type: 'stop-recording', target: 'offscreen' });
      chrome.action.setIcon({ path: 'icons/not-recording.png' }); // Update icon
      return;
    }

    // If no document exists, create one.
    if (!offscreenDocument) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA'],
        justification: 'Recording from chrome.tabCapture API'
      });
    }

    // Get the streamId for the target tab.
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });

    // Get the target language from storage.
    const { targetLanguage } = await chrome.storage.sync.get("targetLanguage");
    const lang = targetLanguage || "es";

    // Send all necessary data to the offscreen document to start recording.
    chrome.runtime.sendMessage({
      type: 'start-recording',
      target: 'offscreen',
      streamId: streamId,
      targetLanguage: lang,
      tabId: tabId
    });

    chrome.action.setIcon({ path: 'icons/recording.png' }); // Update icon

  } catch (error) {
    console.error(`[ERROR] Failed to start capture: ${error.message}`);
    console.warn("[WARN] Please ensure you are on a standard webpage (like google.com) and not a protected chrome:// page.");
  }
}