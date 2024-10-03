
/// #if DEBUG
const ws = new WebSocket(`ws://localhost:48152`);
ws.addEventListener("message", (event) => {
    if (event.data === "reload") {
        chrome.runtime.sendMessage("reload");
        window.location.reload();
    }
});
/// #endif

window.addEventListener("ChessMintCommunicationRecv", function (event) {
    let request = (event as any).detail;
    let response = { requestId: request.id, data: "hello world" };
    window.dispatchEvent(
        new CustomEvent("ChessMintCommunicationSend", { detail: response })
    );
});