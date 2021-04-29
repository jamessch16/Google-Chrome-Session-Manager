// TODO STORAGE GET/SET DOESN'T HAVE PROMISES
//      STANDARDIZE TO CALLBACKS OR FIND NEW STORAGE

function onSaveButtonPressed() {

    chrome.windows.getAll({"populate": true}).then(resolve => {

        // Isolate urls
        let urls = []

        for (let i = 0; i < resolve.length; i++) {
            
            let tabs = resolve[i]["tabs"];
            let win_urls = []

            for (let i = 0; i < tabs.length; i++) {
                win_urls.push(tabs[i]["url"]);
            }
            urls.push(win_urls);
        }

        // Write to file
        chrome.storage.local.set({"session-manager": urls}, () => {
            document.getElementById("test").innerHTML = "STORE DONE\n" + JSON.stringify(urls);
        });
    });
}

function onLoadButtonPressed() {

    // TODO TEST
    // TODO IMPLEMENT STORAGE

    chrome.storage.local.get("session-manager", onURLsRetrievedCallback);
}

function onURLsRetrievedCallback(values) {

    // TODO IGNORE SESSION MANAGER PAGE

    let urls = values["session-manager"];

    document.getElementById("test").innerHTML = "RETRIEVE DONE\n"
    document.getElementById("test").innerHTML = JSON.stringify(urls);

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