function storeSession() {}

function onSaveButtonPressed() {}

function onLoadButtonPressed() {

}

// Session is a list of lists of strings
function loadSession(session) {}

function getSession() {}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("save_button").addEventListener("click", onSaveButtonPressed);
    document.getElementById("load_button").addEventListener("click", onLoadButtonPressed);
});