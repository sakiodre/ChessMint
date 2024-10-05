import { onOptionsUpdated, requestOptions } from "@/options";
import App from "./app.vue"
import { createApp } from "vue"

/// #if DEBUG
const ws = new WebSocket(`ws://localhost:48152`);
ws.addEventListener("message", (event) => {
    if (event.data === "reload") {
        window.location.reload();
    }
});
/// #endif

requestOptions(() => {
    createApp(App).mount("#app");
});