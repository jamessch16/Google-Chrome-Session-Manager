/*
saved_sessions layout:

{
    "quicksave": [Session saved after last save],
    "sessions": [
        A list of previous sessions
    ] 
}

session layout:
{
    "name": [user set name. Defaults as "Session X", X = number of sessions currently saved],
    "save_date": [The date saved. Also acts as UID?],
    "last_load": [Time of last load],   // THIS IS OPTIONAL. May or may not be implemented.
    "windows":[
        A list of windows
    ]
}

window layout:
[A list of urls]

NOTE: Window is subject to change. May be modified to take raw tab data from window.get()
TODO: Window is currently under the name "url". Resolve conflict between docs/code 


*/

// TODO IMPLEMENT SESSION ID = time.time() ????????. Hard to iterate/display, easy IO.
// TODO HANDLE null LOAD: IE WHEN NO SAVES YET
// TODO IMPLEMENT STORAGE AS DEFINED ABOVE

function populateSessionTable() {

    return;
}

// When saving session to list
function onSaveButtonPressed() {

    chrome.windows.getAll({"populate": true}).then(windows => {

        // Isolate urls
        let urls = [];

        console.log(JSON.stringify(windows));

        for (let i = 0; i < windows.length; i++) {
            if (windows[i]["type"] === "normal") {

                let tabs = windows[i]["tabs"];
                let win_urls = [];

                for (let i = 0; i < tabs.length; i++) {
                    win_urls.push(tabs[i]["url"]);
                }
                urls.push(win_urls);
            }
        }

        // Write to file
        chrome.storage.local.set({"saved_sessions": urls}, () => {
            console.log("STORE DONE\n" + JSON.stringify(urls));
        });
    });
}

function onLoadButtonPressed() {

    let getSessionsPromise = new Promise(
        (resolve, reject) => {
            chrome.storage.local.get("saved_sessions", (result) => {
                resolve(result);
            });
        }
    );

    getSessionsPromise.then(values => {

        console.log("RETRIEVE DONE\n" + JSON.stringify(values));

        let urls = values["saved_sessions"];

        for (let i = 0; i < urls.length; i++) {
            chrome.windows.create({
                "url": urls[i]
            });
        }
    });

    //chrome.storage.local.get("saved_sessions", onURLsRetrievedCallback);
}

//function onURLsRetrievedCallback(values) {
//
//    let urls = values["saved_sessions"];
//
//    console.log("RETRIEVE DONE\n" + JSON.stringify(urls));
//
//    for (let i = 0; i < urls.length; i++) {
//        chrome.windows.create({
//            "url": urls[i]
//        });
//    }
//}

document.addEventListener("DOMContentLoaded", () => {
    populateSessionTable();
    document.getElementById("save_button").addEventListener("click", onSaveButtonPressed);
    document.getElementById("load_button").addEventListener("click", onLoadButtonPressed);
});