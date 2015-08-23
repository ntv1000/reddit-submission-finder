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
        modhash: getModhash(),
        hideOpenOptions: require('sdk/simple-prefs').prefs['hideOpenOptions'],
        asset_upvote_grey: data.url("up_grey.png"),
        asset_upvote_orange: data.url("up_orange.png"),
        asset_downvote_grey: data.url("down_grey.png"),
        asset_downvote_blue: data.url("down_blue.png"),
        asset_arrow_right: data.url("arrow_right.png"),
        asset_arrow_down: data.url("arrow_down.png"),
        asset_arrow_up: data.url("arrow_up.png")
    }
    panel.port.emit("show", init_data);
    //getAllSubmissions("http://www.reddit.com");
    //getAllSubmissions("https://www.youtube.com/watch?v=XjmglwWS3xU");
    getAllSubmissions(tabs.activeTab.url);
});

panel.on("hide", function () {
    panel.port.emit("hide");
});

panel.port.on("open-link", function (params) {
    if (params.where === "default") {
        params.where = require('sdk/simple-prefs').prefs['openLinkDefaultLocation'];
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

panel.port.on("vote-submission", function (url) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("X-Modhash", getModhash());
    xhr.send();
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

var responses_expected = 0;
var response_counter = 0;
var total_submission_list = [];

function getAllSubmissions(url) {
    var reddit_urls = getAllURLVersions(url);
    responses_expected = reddit_urls.length;
    response_counter = 0;
    total_submission_list = [];
    for (var i = 0; reddit_url = reddit_urls[i]; i++) {
        getJSON(reddit_url, handleResponse);
    }
}

function handleResponse(jsonData) {
    var now = new Date();
    var now_timestamp = now.getTime(); // = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
    var submissions = [];
    for (var i = 0; entry = jsonData.data.children[i]; i++) {
        submission_timestamp = entry.data.created_utc * 1000;
        submissions[i] = {
            fullname: entry.data.name,
            link: "http://reddit.com" + entry.data.permalink,
            title: entry.data.title,
            score: entry.data.score + "",
            age: (now_timestamp - submission_timestamp),
            comments: entry.data.num_comments + "",
            subreddit: entry.data.subreddit,
            likes: entry.data.likes,
            user: entry.data.author
        };
    }
    total_submission_list.push.apply(total_submission_list, submissions);

    response_counter++;
    if (response_counter === responses_expected) {
        total_submission_list = distinctSubmissions(total_submission_list);
        panel.port.emit("display-submissions", total_submission_list);
    }
}

function getJSON(path, success) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function distinctSubmissions(submission_list) {
    var u = {},
        a = [];
    for (var i = 0, l = submission_list.length; i < l; ++i) {
        if (u.hasOwnProperty(submission_list[i].fullname)) {
            continue;
        }
        a.push(submission_list[i]);
        u[submission_list[i].fullname] = 1;
    }
    return a;
}

function getAllURLVersions(url) {
    if(url.indexOf("about:reader?url=") === 0) {
        url = decodeURIComponent(url.substring("about:reader?url=".length));
    }
    var host = url.split("/")[2];
    var result = [];
    if ((host === 'youtube.com' || host === 'www.youtube.com') && url.split("/")[3].indexOf('watch?') === 0) {
        youtubeID = function () {
            var query = url.substring(url.indexOf('?') + 1);
            var parameters = query.split('&');
            for (var i = 0; i < parameters.length; i++) {
                var pair = parameters[i].split('=');
                if (pair[0] === 'v') {
                    return pair[1];
                }
            }
            return '';
        }();

        // some youtube id's contain a dash at the start and reddit search interprets that as NOT
        // workaround is to search without the dash in the id
        if (youtubeID.indexOf('-') === 0) {
            youtubeID = youtubeID.substring(1);
        }

        result.push('http://api.reddit.com/search.json?q=' + encodeURIComponent('(url:' + youtubeID + ') (site:youtube.com OR site:youtu.be)'))
    } else {
        var without_http = "";
        if (url.slice(-1) === "/") {
            url = url.substring(0, url.length - 1);
        }
        result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent(url));
        result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent(url + "/"));
        if (url.indexOf('https') === 0) {
            without_http = url.substring(8);
            result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent(without_http));
            result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent(without_http + "/"));
        } else {
            if (url.indexOf('http') === 0) {
                without_http = url.substring(7);
                result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent("https://" + without_http));
                result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent("https://" + without_http + "/"));
            } else {
                without_http = url;
                result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent("https://" + without_http));
                result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent("https://" + without_http + "/"));
            }
        }
    }
    return result;
}

tabs.activeTab.url = "reddit.com";