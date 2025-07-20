chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SET_LANGUAGE") {
    chrome.storage.sync.set({ targetLanguage: message.targetLanguage });
  }

  if (message.type === "GET_LANGUAGE") {
    chrome.storage.sync.get("targetLanguage", (data) => {
      sendResponse({ targetLanguage: data.targetLanguage || "es" });
    });
    return true; // keep channel open for async
  }
});