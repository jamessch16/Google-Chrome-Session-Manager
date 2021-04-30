chrome.action.onClicked.addListener((tab) => {

    console.log("Session manager window created");
    chrome.windows.create({
        url: chrome.runtime.getURL("src/session_manager.html"),
        type: "popup"
    });
});
