var browserPrefs = require('sdk/preferences/service');
var addonPrefs = require("sdk/simple-prefs");
var tabs = require("sdk/tabs");

var { ToggleButton } = require('sdk/ui/button/toggle');
var { URL } = require("sdk/url");

// Global constants
const [PLUGIN_DISABLED, PLUGIN_ASK, PLUGIN_ENABLED] = [0, 1, 2];

// Global functions
const getFlashState = () => browserPrefs.get("plugin.state.flash");

let whitelist = addonPrefs.prefs["whitelist"].replace(/ /g, '').split(',');
let button = ToggleButton({
    id: "flash-toggle-button",
    label: "Toggle Adobe Flash",
    icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
    },
    checked: !getFlashState(),
    onChange: state => {
        browserPrefs.set("plugin.state.flash", state.checked ? PLUGIN_DISABLED : PLUGIN_ENABLED);
    }
});

addonPrefs.on("whitelist", function () {
    // Whitelist can be really big, so we parse and save it beforehand
    whitelist = addonPrefs.prefs["whitelist"].replace(/ /g, '').split(',');
});

tabs.on("ready", tab => {
    //TODO: Enable Flash support when Flash-enabled page renders new part of themselves
    // Check Flash is already enable
    if (getFlashState() == PLUGIN_ENABLED)
        return;

    // Check the domain is whitelisted
    if (whitelist.indexOf(URL(tab.url).host) == -1)
        return;

    // Return initial Flash state when the reload is complete
    let userFlashState = getFlashState();
    tab.once("load", () => {
        browserPrefs.set("plugin.state.flash", userFlashState);
    });

    browserPrefs.set("plugin.state.flash", PLUGIN_ENABLED);
    tab.reload();
});

// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
    callback(text);
}

exports.dummy = dummy;
