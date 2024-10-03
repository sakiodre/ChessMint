// alert("ok");
// function injectScript(file: string) {
//     let script = document.createElement("script");
//     script.src = chrome.runtime.getURL(file);
//     script.onload = () => script.remove();

//     let doc = document.head || document.documentElement;
//     doc.insertBefore(script, doc.firstElementChild);
// }

window.addEventListener("ChessMintCommunicationRecv", function (event) {
    let request = (event as any).detail;
    let response = { requestId: request.id, data: "hello world" };
    window.dispatchEvent(
        new CustomEvent("ChessMintCommunicationSend", { detail: response })
    );
});
// injectScript("chessmint.js");
