chrome.runtime.onInstalled.addListener((details) => {

    chrome.action.onClicked.addListener((tab) => {

        chrome.windows.create({
            url: chrome.runtime.getURL("src/session_manager.html"),
            type: "popup"
        })
    })
});