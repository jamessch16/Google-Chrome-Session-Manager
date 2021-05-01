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

// TODO HANDLE null LOAD: IE WHEN NO QUICKSAVES YET. ALSO WHEN QUICKSAVE WAS DELETED ************
// TODO BUTTON ON CLICK USER NOTIFICATION
// TODO RECONCILE VARIABLE NAMING CONVENTIONS
// TODO EDIT SESSION DETAILS AT SAVE TIME

let selectedRowID = null;
const timezone = "America/Edmonton";

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

            // TODO WHAT IF CLICK HITS ROW INSTEAD OF CELL? CAN THIS HAPPEN?

            newRow.id = "TABLE_ROW_" + saved_sessions[i]["id"];
            newRow.addEventListener("click", event => {
                if (selectedRowID != null)  document.getElementById(selectedRowID).style = "background-color: white";
                else                        document.getElementById("delete_button").style = "background-color: darkmagenta";
                
                selectedRowID = event.target.parentElement.id;
                document.getElementById(selectedRowID).style = "background-color: lightblue";

                console.log("SELECTED ROW ID: " + selectedRowID);
            });

            const options = {"year": "numeric", "month": "short", "day": "2-digit", "hour": "2-digit", "minute": "2-digit", "timeZoneName": "short", "hourCycle": "h24", "timeZone": timezone};

            nameCell.innerHTML = saved_sessions[i]["name"];
            dateCell.innerHTML = (new Date(JSON.parse(saved_sessions[i]["save_date"]))).toLocaleDateString("en-CA", options);
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

    console.log("CREATE SESSION DATE: " + time);
    console.log("TYPE DATE: " + typeof(time));


    return current_session = {
        "id": time.getTime(),
        "name": "untitled",
        "save_date": JSON.stringify(time),
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

            populateSessionTable();
        });
    });
}

// Loads session
function onLoadButtonPressed() {

    console.log("SELECTED ROW ID " + selectedRowID);

    if (selectedRowID == null) {

        let getSessionPromise = new Promise(
            (resolve, reject) => {
                chrome.storage.local.get("quicksave", (result) => {
                    resolve(result);
                });
            }
        );

        getSessionPromise.then(values => {

            console.log("QUICKSAVE RETRIEVE DONE\n" + JSON.stringify(values));

            let urls = values["quicksave"]["windows"];

            for (let i = 0; i < urls.length; i++) {
                chrome.windows.create({
                    "url": urls[i]
                });
            }
        });
    }
    else {
        
        let getSessionPromise = new Promise(
            (resolve, reject) => {
                chrome.storage.local.get("saved_sessions", (result) => {
                    resolve(result);
                });
            }
        );

        getSessionPromise.then(values => {

            console.log("STORED RETRIEVE DONE\n" + JSON.stringify(values));

            let rowIndex = document.getElementById(selectedRowID).rowIndex - 1;
            console.log("ACCESS SESSION INDEX " + rowIndex);

            let urls = values["saved_sessions"][rowIndex]["windows"];

            for (let i = 0; i < urls.length; i++) {
                chrome.windows.create({
                    "url": urls[i]
                });
            }
        });
    }
}

function onDeleteButtonPressed() {
    if (selectedRowID == null) return;

    let rowIndex = document.getElementById(selectedRowID).rowIndex - 1;

    document.getElementById("session_list_table").deleteRow(rowIndex);
    document.getElementById("delete_button").style = "background-color: lightgray";
    selectedRowID = null;

    let getSessionsPromise = new Promise(
        (resolve, reject) => {
            chrome.storage.local.get(null, (result) => {
                resolve(result);
            });
        }
    );

    // Remove session from storage
    getSessionsPromise.then(values => {

        console.log("STORED RETRIEVE DONE\n" + JSON.stringify(values));
        console.log("REMOVE SESSION INDEX " + rowIndex);

        if (selectedRowID == values["saved_sessions"][rowIndex]["id"]) {
            values["quicksave"] = null;
        }

        values["saved_sessions"].splice(rowIndex, 1);
        chrome.storage.local.set({"saved_sessions": values["saved_sessions"]}, () => {});
    });
}


document.addEventListener("DOMContentLoaded", () => {
    populateSessionTable();
    document.getElementById("save_button").addEventListener("click", onSaveButtonPressed);
    document.getElementById("load_button").addEventListener("click", onLoadButtonPressed);
    document.getElementById("delete_button").addEventListener("click", onDeleteButtonPressed);
});
