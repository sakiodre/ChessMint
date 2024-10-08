import { options, optionsRegisterContentScript } from "@/options";

/// #if DEVELOPMENT
const ws = new WebSocket(`ws://localhost:48152`);
ws.addEventListener("message", (event) => {
    if (event.data === "reload") {
        chrome.runtime.sendMessage("reload");
        window.location.reload();
    }
});
/// #endif
optionsRegisterContentScript();