import { reactive, watch } from "vue";

// return true to stop listening for updates
type FuncOptsCallback = { (): boolean | void };

export interface IOptions {
    showArrows: boolean;
    showClassification: boolean;
    showEvalBar: boolean;
    showEvalLines: boolean;
    showFeedback: boolean;
    multiPv: number;

    engineDepth: number;
    engineThreads: number;
    engineHash: number;
    engineUseExternal: boolean;
    engineExternalPort: number;
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
    multiPv: 3,

    engineDepth: 15,
    engineThreads: 4,
    engineHash: 1024,
    engineUseExternal: false,
    engineExternalPort: 8000,
});

function setOptions(opts: IOptions) {
    // options = opts will make it lose the reactivity
    Object.assign(options, opts);
}

export function requestOptions(callback?: { (): void }) {

    if (hasChromeStorageAccess) {
        chrome.storage.sync.get<IOptions>(options, function (opts) {
            setOptions(opts);
            if (callback) callback();
        });

    } else {
        if (callback) {
            const listerner = () => {
                callback();
                window.removeEventListener("ChessMintUpdateOptions", listerner);
            };
            window.addEventListener("ChessMintUpdateOptions", listerner);
        }

        window.dispatchEvent(new CustomEvent("ChessMintRequestOptions"));
    }
}

// callback should return true to stop listening for updates
export function onOptionsUpdated(callback: FuncOptsCallback) {
    onUpdateCallbacks.push(callback);
}

// Must be called in the content script to handle options
// updates from the popup
export function optionsRegisterContentScript() {

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
export function optionsRegisterInjectedScript(callback?: { (): void }) {
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

    requestOptions(callback);
}

watch(options, (first, second) => {
    onUpdateCallbacks = onUpdateCallbacks.filter(
        (callback) => callback() !== true
    );

    // only update the storage from popup
    if (hasChromeTabsAccess) {
        chrome.storage.sync.set(options);
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(function (tab) {
                if (tab.id) {
                    chrome.tabs.sendMessage<IOptions>(
                        tab.id,
                        Object.assign({}, options)
                    ).catch(() => {})
                }
            });
        });
    }

});