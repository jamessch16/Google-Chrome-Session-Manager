/*
local storage:

{
    "quicksave": [Session saved after last save],
    "saved_sessions": [
        A list of previous sessions
    ] 
}

session layout:
{
    "name": [user set name. Defaults as "Session X", X = number of sessions currently saved],
    "save_date": [The date saved. Also acts as UID?],
    "windows":[
        A list of windows
    ]
}

window layout:
[A list of urls]

NOTE: Window is subject to change. May be modified to take raw tab data from window.get()
TODO: Window is currently under the name "url". Resolve conflict between docs/code 


*/

// TODO HANDLE null LOAD: IE WHEN NO SAVES YET
// TODO BUTTON ON CLICK USER NOTIFICATION
// TODO RECONCILE VARIABLE NAMING CONVENTIONS
// TODO IMPLEMENT JQUERY FOR ROW SELECTION

function populateSessionTable() {

    let getSavedSessionsPromise = new Promise(
        (resolve, reject) => {
            chrome.storage.local.get("saved_sessions", (result) => {
                resolve(result);
            });
        }
    );

    getSavedSessionsPromise.then(result => {

        let session_table = document.getElementById("session_list_table");
        saved_sessions = result["saved_sessions"];

        clearSessionTable()

        for (let i = 0; i < saved_sessions.length; i++) {
            
            let newRow = session_table.insertRow();
            let nameCell = newRow.insertCell(0);
            let dateCell = newRow.insertCell(1);

            nameCell.innerHTML = saved_sessions[i]["name"];
            dateCell.innerHTML = saved_sessions[i]["save_date"];
        }

    })
}

function clearSessionTable() {

    let session_table = document.getElementById("session_list_table");
    let numRows = session_table.rows.length; 

    for (let i = 0; i < numRows; i++) {
        session_table.deleteRow(0);
    }
}

function getCurrentSession(windows) {

    // Isolate urls
    let urls = [];

    console.log(JSON.stringify(windows));

    // Populate urls as a list of window url lists
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

    // Return session
    let time = new Date();
    return current_session = {
        "name": time.toUTCString(),
        "save_date": time.getTime(),
        "windows": urls
    };
}

// When saving session to list
function onSaveButtonPressed() {

    let getSavedSessionsPromise = new Promise(
        (resolve, reject) => {
            chrome.storage.local.get("saved_sessions", (result) => {
                resolve(result);
            });
        }
    );

    chrome.windows.getAll({"populate": true}).then(windows => {

        current_session = getCurrentSession(windows);

        // Store current session to quicksave
        chrome.storage.local.set({"quicksave": current_session}, () => {
            console.log("STORE DONE\n" + JSON.stringify(current_session));
        });

        // Add current session to sessions list
        getSavedSessionsPromise.then(result => {
            
            saved_sessions = result["saved_sessions"];

            saved_sessions.push(current_session);
            chrome.storage.local.set({"saved_sessions": saved_sessions}, () => {});
            
            console.log("Size of saved_sessions: " + saved_sessions.length);


            // TODO THIS IS A CRUDE METHOD OF UPDATING THE TABLE. FIND BETTER SOLUTION
            populateSessionTable();

        });
    });
}

// Loads quicksave
function onLoadButtonPressed() {

    let getSessionPromise = new Promise(
        (resolve, reject) => {
            chrome.storage.local.get("quicksave", (result) => {
                resolve(result);
            });
        }
    );

    getSessionPromise.then(values => {

        console.log("RETRIEVE DONE\n" + JSON.stringify(values));

        let urls = values["quicksave"]["windows"];

        for (let i = 0; i < urls.length; i++) {
            chrome.windows.create({
                "url": urls[i]
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    populateSessionTable();
    document.getElementById("save_button").addEventListener("click", onSaveButtonPressed);
    document.getElementById("load_button").addEventListener("click", onLoadButtonPressed);
});