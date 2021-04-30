// TODO STORAGE GET/SET DOESN'T HAVE PROMISES
//      STANDARDIZE TO CALLBACKS OR FIND NEW STORAGE

function onSaveButtonPressed() {

    chrome.windows.getAll({"populate": true}).then(windows => {

        // Isolate urls
        let urls = [];

        console.log(JSON.stringify(windows));

        for (let i = 0; i < windows.length; i++) {
            if (windows[i]["type"] === "normal") {

                let tabs = windows[i]["tabs"];
                let win_urls = []

                for (let i = 0; i < tabs.length; i++) {
                    win_urls.push(tabs[i]["url"]);
                }
                urls.push(win_urls);
            }
        }

        // Write to file
        chrome.storage.local.set({"session-manager": urls}, () => {
            console.log("STORE DONE\n" + JSON.stringify(urls));
        });
    });
}

function onLoadButtonPressed() {

    chrome.storage.local.get("session-manager", onURLsRetrievedCallback);
}

function onURLsRetrievedCallback(values) {

    let urls = values["session-manager"];

    console.log("RETRIEVE DONE\n" + JSON.stringify(urls));

    for (let i = 0; i < urls.length; i++) {
        chrome.windows.create({
            "url": urls[i]
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("save_button").addEventListener("click", onSaveButtonPressed);
    document.getElementById("load_button").addEventListener("click", onLoadButtonPressed);
});