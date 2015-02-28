var current_page;
var responses_expected = 0;
var response_counter = 0;
var total_submission_list = [];
var modhash = "";

self.port.on("show", function onShow(init_data) {
    reset();
    current_page = init_data.url;
    //current_page = "http://www.reddit.com";
    modhash = init_data.modhash;
    getAllSubmissions(current_page);
});

self.port.on("hide", function onHide() {
    var e_links = document.getElementById("links");
    while (e_links.firstChild) {
        e_links.removeChild(e_links.firstChild);
    }
});

function reset() {
    current_page = "";
    modhash = "";
    responses_expected = 0;
    response_counter = 0;
    total_submission_list = [];
    document.getElementById("loading").style.display = "block";
}

function getAllSubmissions(url) {
    var reddit_urls = getAllURLVersions(url);
    responses_expected = reddit_urls.length;
    for (var i = 0; reddit_url = reddit_urls[i]; i++) {
        getJSON(reddit_url, handleResponse);
    }
}

function getAllURLVersions(url) {
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
        };
    }
    total_submission_list.push.apply(total_submission_list, submissions);

    response_counter++;
    if (response_counter === responses_expected) {
        total_submission_list = distinctSubmissions(total_submission_list);
        document.getElementById("loading").style.display = "none";
        putSubmissionsIntoUI(total_submission_list);
    }
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

function putSubmissionsIntoUI(submissions) {
    if (submissions.length === 0) {
        var t_nonefound = document.createTextNode("This page hasn't been submitted to reddit, yet.");

        var e_nonefound = document.createElement("div");
        e_nonefound.setAttribute("align", "center");
        e_nonefound.setAttribute("style", "font-size: 140% !important");
        e_nonefound.appendChild(t_nonefound);

        document.getElementById("links").appendChild(e_nonefound);
    } else {
        if (modhash === "") {
            var t_notloggedin = document.createTextNode("Login on reddit to vote on submissions");

            var e_notloggedin = document.createElement("div");
            e_notloggedin.setAttribute("align", "center");
            e_notloggedin.setAttribute("style", "font-size: 100% !important");
            e_notloggedin.appendChild(t_notloggedin);

            document.getElementById("links").appendChild(e_notloggedin);
        }
        for (var i = 0; submission = submissions[i]; i++) {

            var t_score = document.createTextNode(submission.score);
            var t_title = document.createTextNode(submission.title);
            var t_subreddit = document.createTextNode("/r/" + submission.subreddit);
            var t_comments = document.createTextNode(submission.comments + " comments");
            var t_time = document.createTextNode(formatAge(submission.age));

            var e_submission = document.createElement("div");
            e_submission.setAttribute("class", "submission");

            var e_scorecontainer = document.createElement("div");
            e_scorecontainer.setAttribute("class", "scorecontainer");
            e_scorecontainer.setAttribute("align", "center");
            e_submission.appendChild(e_scorecontainer);

            var e_rightpanel = document.createElement("div");
            e_rightpanel.setAttribute("class", "rightpanel");
            e_submission.appendChild(e_rightpanel);


            if (modhash !== "") {
                var e_upvote = document.createElement("div");
                e_upvote.setAttribute("class", "upvote");
                e_upvote.setAttribute("id", "upvote" + submission.fullname);
                e_scorecontainer.appendChild(e_upvote);
                if (submission.likes === true) {
                    e_upvote.style.borderColor = "transparent transparent #ff8b60 transparent";
                }
            }
            var e_score = document.createElement("div");
            e_score.setAttribute("class", "score");
            e_score.appendChild(t_score);
            e_scorecontainer.appendChild(e_score);

            if (modhash !== "") {
                var e_downvote = document.createElement("div");
                e_downvote.setAttribute("class", "downvote");
                e_downvote.setAttribute("id", "downvote" + submission.fullname);
                e_scorecontainer.appendChild(e_downvote);
                if (submission.likes === false) {
                    e_downvote.style.borderColor = "#9494ff transparent transparent transparent";
                }
            }

            var e_title = document.createElement("div");
            e_title.setAttribute("class", "title");
            e_title.appendChild(t_title);
            e_rightpanel.appendChild(e_title);

            var e_subreddit = document.createElement("div");
            e_subreddit.setAttribute("class", "subreddit");
            e_subreddit.appendChild(t_subreddit);
            e_rightpanel.appendChild(e_subreddit);

            var e_comments = document.createElement("div");
            e_comments.setAttribute("class", "comment");
            e_comments.appendChild(t_comments);
            e_rightpanel.appendChild(e_comments);

            var e_time = document.createElement("div");
            e_time.setAttribute("class", "time");
            e_time.appendChild(t_time);
            e_rightpanel.appendChild(e_time);


            e_rightpanel.onclick = function (submission_link) {
                return function (event) {
                    openLink(submission_link);
                }
            }(submission.link);
            document.getElementById("links").appendChild(e_submission);

            if (modhash !== "") {
                e_upvote.onclick = function (submission_fullname, t_score) {
                    return function (event) {
                        var submission = total_submission_list.find(function (e, i, a) {
                            if (e.fullname === submission_fullname) {
                                return true;
                            }
                            return false;
                        });
                        if (submission.likes === true) {
                            castVote(submission_fullname, 0);
                            t_score.textContent = parseInt(t_score.textContent) - 1;
                            // -1
                            submission.likes = null;
                        } else {
                            castVote(submission_fullname, 1);
                            if (submission.likes === null) {
                                t_score.textContent = parseInt(t_score.textContent) + 1;
                                // +1
                            } else {
                                t_score.textContent = parseInt(t_score.textContent) + 2;
                                // + 2
                            }
                            submission.likes = true;
                        }
                        event.stopPropagation();
                    }
                }(submission.fullname, t_score);

                e_downvote.onclick = function (submission_fullname, t_score) {
                    return function (event) {
                        var submission = total_submission_list.find(function (e, i, a) {
                            if (e.fullname === submission_fullname) {
                                return true;
                            }
                            return false;
                        });
                        if (submission.likes === false) {
                            castVote(submission_fullname, 0);
                            t_score.textContent = parseInt(t_score.textContent) + 1;
                            // +1
                            submission.likes = null;
                        } else {
                            castVote(submission_fullname, -1);
                            if (submission.likes === null) {
                                t_score.textContent = parseInt(t_score.textContent) - 1;
                                // -1
                            } else {
                                t_score.textContent = parseInt(t_score.textContent) - 2;
                                // - 2
                            }
                            submission.likes = false;
                        }
                        event.stopPropagation();
                    }
                }(submission.fullname, t_score);
            }
        }
    }
    var t_submit = document.createTextNode("Create submission");
    var e_submit = document.createElement("div");
    e_submit.setAttribute("class", "submitbutton");
    e_submit.appendChild(t_submit);

    e_submit.onclick = function () {
        openLink("http://www.reddit.com/submit?resubmit=true&url=" + encodeURIComponent(current_page));
    };
    document.getElementById("links").appendChild(e_submit);
}

function formatAge(age) {
    var MINUTE = 60 * 1000;
    var HOUR = MINUTE * 60;
    var DAY = HOUR * 24;
    var WEEK = DAY * 7;
    var YEAR = WEEK * 52;
    var MONTH = YEAR / 12;
    if (age < MINUTE) {
        return age + " seconds ago";
    } else if (age < HOUR) {
        return Math.floor(age / MINUTE) + " minutes ago";
    } else if (age < DAY) {
        return Math.floor(age / HOUR) + " hours ago";
    } else if (age < WEEK) {
        return Math.floor(age / DAY) + " days ago";
    } else if (age < MONTH) {
        return Math.floor(age / WEEK) + " weeks ago";
    } else if (age < YEAR) {
        return Math.floor(age / MONTH) + " months ago";
    } else {
        return Math.floor(age / YEAR) + " years ago";
    }
}

function openLink(url) {
    self.port.emit("open-link", url);
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

function castVote(fullname, direction) {
    var url = "http://www.reddit.com/api/vote?dir=" + direction + "&id=" + fullname;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("X-Modhash", modhash);
    xhr.send();

    // update UI accordingly
    if (direction === 1) {
        document.getElementById("upvote" + fullname).style.borderColor = "transparent transparent #ff8b60 transparent";
        document.getElementById("downvote" + fullname).style.borderColor = "#c6c6c6 transparent transparent transparent";
    } else if (direction === 0) {
        document.getElementById("upvote" + fullname).style.borderColor = "transparent transparent #c6c6c6 transparent";
        document.getElementById("downvote" + fullname).style.borderColor = "#c6c6c6 transparent transparent transparent";
    } else if (direction === -1) {
        document.getElementById("upvote" + fullname).style.borderColor = "transparent transparent #c6c6c6 transparent";
        document.getElementById("downvote" + fullname).style.borderColor = "#9494ff transparent transparent transparent";
    }
}