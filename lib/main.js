var tabs = require("sdk/tabs");
var data = require("sdk/self").data;

const {
    XMLHttpRequest
} = require("sdk/net/xhr");

var panel = require("sdk/panel").Panel({
    contentURL: data.url("panel.html"),
    contentScriptFile: [
 data.url("panel.js"),
 ],
    onHide: handleHide
});

var button = require('sdk/ui/button/toggle').ToggleButton({
    id: "reddit-submission-finder-panel",
    label: "Reddit Submission Finder",
    icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
    },
    onChange: handleChange
});

panel.on("show", function () {
    var init_data = {
        url: tabs.activeTab.url,
        modhash: getModhash()
    }
    panel.port.emit("show", init_data);
});

panel.on("hide", function () {
    panel.port.emit("hide");
});

panel.port.on("open-link", function (params) {
    console.log(params.where);
    if (params.where === "default") {
        if (require('sdk/simple-prefs').prefs['openInNewTab']) {

            tabs.open(params.url);

        } else {
            tabs.activeTab.url = params.url;
        }
        panel.hide();
    }
    if (params.where === "currenttab") {
        tabs.activeTab.url = params.url;
        panel.hide();
    }
    if (params.where === "foregroundtab") {
        tabs.open({
            url: params.url,
            inBackground: false
        });
        panel.hide();
    }
    if (params.where === "backgroundtab") {
        tabs.open({
            url: params.url,
            inBackground: true
        });
    }
});

panel.port.on("close-panel", function (params) {
    panel.hide();
});

function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button,
            width: 400,
            height: 400
        });
    }
}

function handleHide() {
    button.state('window', {
        checked: false
    });
}

function getModhash() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://www.reddit.com/api/me.json", false);
    xhr.send();
    var json = JSON.parse(xhr.responseText);
    if (json.hasOwnProperty("data")) {
        return json.data.modhash;
    } else {
        return "";
    }
}