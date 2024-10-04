chrome.runtime.onMessage.addListener((message) => {
    if (message === "reload") {
        chrome.runtime.reload();
    }
});