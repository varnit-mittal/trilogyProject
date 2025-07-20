document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("targetLang");

  chrome.storage.sync.get(['targetLanguage'], (data) => {
    if (data.targetLanguage) {
      langSelect.value = data.targetLanguage;
    }
  });

  langSelect.addEventListener("change", () => {
    const selected = langSelect.value;
    chrome.storage.sync.set({ targetLanguage: selected });
    chrome.runtime.sendMessage({ type: "SET_LANGUAGE", targetLanguage: selected });
  });
});
