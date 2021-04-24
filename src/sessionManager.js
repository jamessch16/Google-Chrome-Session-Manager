function storeSession() {}

function buttonHandler() {
    document.getElementById("test").innerHTML = "Pressed";
}

// Session is a list of lists of strings
function loadSession(session) {}

function getSession() {}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("save_button").addEventListener("click", buttonHandler);
});