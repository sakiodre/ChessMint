import { reactive, watch } from "vue";

// return true to stop listening for updates
type FuncOptsCallback = { (): boolean | void };

export interface IOptions {
    showArrows: boolean;
    showClassification: boolean;
    showEvalBar: boolean;
    showEvalLines: boolean;
    showFeedback: boolean;
}

const hasChromeStorageAccess = chrome && chrome.storage && chrome.storage.sync;
const hasChromeTabsAccess = hasChromeStorageAccess && chrome.tabs;
let onUpdateCallbacks: FuncOptsCallback[] = [];

// default options
export const options = reactive<IOptions>({
    showArrows: true,
    showClassification: true,
    showEvalBar: true,
    showEvalLines: true,
    showFeedback: true,
});

function setOptions(opts: IOptions) {
    // options = opts will make it lose the reactivity
    Object.assign(options, opts);
}

// request the initial options, the result should be handled by onOptionsUpdated()
export function requestOptions(callback?: { (): void }) {
    if (callback) {
        onOptionsUpdated(() => {
            callback();
            return true;
        });
    }

    if (hasChromeStorageAccess) {
        chrome.storage.sync.get<IOptions>(options, function (opts) {
            setOptions(opts);
        });
    } else {
        window.dispatchEvent(new CustomEvent("ChessMintRequestOptions"));
    }
}

// callback should return true to stop listening for updates
export function onOptionsUpdated(callback: FuncOptsCallback) {
    onUpdateCallbacks.push(callback);
}

watch(options, (first, second) => {
    onUpdateCallbacks = onUpdateCallbacks.filter((callback) => callback() !== true);
    if (hasChromeStorageAccess) {
        chrome.storage.sync.set(options);
    }
    if (hasChromeTabsAccess) {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(function (tab) {
                if (tab.id) {
                    chrome.tabs.sendMessage<IOptions>(
                        tab.id,
                        Object.assign({}, options)
                    );
                }
            });
        });
    }
});

// Must be called in the content script to handle options
// updates from the popup
export function optionsRegisterContentScript() {

    console.log("content script", chrome.tabs);
    if (!hasChromeStorageAccess) {
        throw "method should only be called from content script";
    }

    requestOptions();

    // send options to injected script
    function dispatchOptions() {
        window.dispatchEvent(
            new CustomEvent("ChessMintUpdateOptions", {
                detail: Object.assign({}, options),
            })
        );
    }

    onOptionsUpdated(() => {
        dispatchOptions();
    })

    // from popup to content script
    chrome.runtime.onMessage.addListener((request: IOptions) => {
        setOptions(request);
    });

    // from injected script to content script
    window.addEventListener("ChessMintRequestOptions", dispatchOptions);
}

// Must be called in the inject script to handle options
// updates from the content script
export function optionsRegisterInjectedScript() {
    
    if (hasChromeStorageAccess) {
        throw "method should only be called from injected script";
    }

    // from content script to injected script
    window.addEventListener(
        "ChessMintUpdateOptions",
        (event: CustomEventInit<IOptions>) => {
            setOptions(event.detail!);
        }
    );

    requestOptions();
}