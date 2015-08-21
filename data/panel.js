var current_page;
var modhash = "";
var asset_upvote_grey = "";
var asset_upvote_orange = "";
var asset_downvote_grey = "";
var asset_downvote_blue = "";

var asset_arrow_right = "";
var asset_arrow_down = "";
var asset_arrow_up = "";

var hideOpenOptions = false;

self.port.on("show", function onShow(init_data) {
    reset();
    
    modhash = init_data.modhash;
    current_page = init_data.url;
    hideOpenOptions = init_data.hideOpenOptions;
    asset_upvote_grey = init_data.asset_upvote_grey;
    asset_upvote_orange = init_data.asset_upvote_orange;
    asset_downvote_grey = init_data.asset_downvote_grey;
    asset_downvote_blue = init_data.asset_downvote_blue;
    
    asset_arrow_right = init_data.asset_arrow_right;
    asset_arrow_down = init_data.asset_arrow_down;
    asset_arrow_up = init_data.asset_arrow_up;
});

self.port.on("hide", function onHide() {
    reset();
});

function reset(){
    var e_links = document.getElementById("links");
    while (e_links.firstChild) {
        e_links.removeChild(e_links.firstChild);
    }

    current_page = "";
    modhash = "";
    document.getElementById("loading").style.display = "block";
    document.getElementById("header").style.display = "none";
    document.getElementById("links").style.top = "0px";
    document.getElementById("footer").style.display = "none";
    hideOpenOptions = false;
}

self.port.on("display-submissions", function putSubmissionsIntoUI(submissions) {
    document.getElementById("loading").style.display = "none";
    document.getElementById("footer").style.display = "block";
    if (submissions.length === 0) {
        var t_nonefound = document.createTextNode("It seems like this page hasn't been submitted to reddit, yet.");

        var e_nonefound = document.createElement("div");
        e_nonefound.setAttribute("align", "center");
        e_nonefound.setAttribute("style", "font-size: 95% !important");
        e_nonefound.appendChild(document.createElement("br"));
        e_nonefound.appendChild(t_nonefound);
        
        document.getElementById("links").appendChild(e_nonefound);
    } else {
        if (modhash === "") {
            document.getElementById("header").style.display = "block";
            document.getElementById("links").style.top = "27px";
        }
        for (var i = 0; submission = submissions[i]; i++) {

            var t_score = document.createTextNode(submission.score);
            var t_title = document.createTextNode(submission.title);
            var t_time = document.createTextNode(formatAge(submission.age));
            var t_user = document.createTextNode(submission.user);
            var t_subreddit = document.createTextNode("/r/" + submission.subreddit);
            var t_comments = document.createTextNode(submission.comments + " comments");

            var e_submission = document.createElement("div");
            e_submission.setAttribute("class", "submission");

            var e_submission_table = document.createElement("table");
            e_submission.appendChild(e_submission_table);
            var e_column_scorecontainer = document.createElement("td");
            e_submission_table.appendChild(e_column_scorecontainer);
            var e_column_rightpanel = document.createElement("td");
            e_submission_table.appendChild(e_column_rightpanel);

            var e_scorecontainer = document.createElement("div");
            e_scorecontainer.setAttribute("class", "scorecontainer");
            e_scorecontainer.setAttribute("align", "center");
            e_column_scorecontainer.appendChild(e_scorecontainer);

            var e_rightpanel = document.createElement("div");
            e_rightpanel.setAttribute("class", "rightpanel");
            e_submission_table.appendChild(e_rightpanel);

            var e_contentcontainer = document.createElement("div");
            e_contentcontainer.setAttribute("class", "contentcontainer");
            e_rightpanel.appendChild(e_contentcontainer);

            if (modhash !== "") {
                var e_upvote = document.createElement("img");
                e_upvote.setAttribute("class", "upvote");
                e_upvote.setAttribute("src", asset_upvote_grey);
                e_upvote.setAttribute("id", "upvote" + submission.fullname);
                e_scorecontainer.appendChild(e_upvote);
                if (submission.likes === true) {
                    e_upvote.setAttribute("src", asset_upvote_orange);
                }
            }
            var e_score = document.createElement("div");
            e_score.setAttribute("class", "score");
            e_score.appendChild(t_score);
            e_scorecontainer.appendChild(e_score);

            if (modhash !== "") {
                var e_downvote = document.createElement("img");
                e_downvote.setAttribute("class", "downvote");
                e_downvote.setAttribute("src", asset_downvote_grey);
                e_downvote.setAttribute("id", "downvote" + submission.fullname);
                e_scorecontainer.appendChild(e_downvote);
                if (submission.likes === false) {
                    e_downvote.setAttribute("src", asset_downvote_blue);
                }
            }
            if (!hideOpenOptions) {
                var e_options = document.createElement("div");
                e_options.setAttribute("class", "options");
                e_contentcontainer.appendChild(e_options);
                
                var e_currenttab_img = document.createElement("img");
                e_currenttab_img.setAttribute("src", asset_arrow_down);

                var e_currenttab = document.createElement("div");
                e_currenttab.setAttribute("class", "currenttab");
                e_currenttab.appendChild(e_currenttab_img);
                e_options.appendChild(e_currenttab);
                
                var e_foregroundtab_img = document.createElement("img");
                e_foregroundtab_img.setAttribute("src", asset_arrow_right);

                var e_foregroundtab = document.createElement("div");
                e_foregroundtab.setAttribute("class", "foregroundtab");
                e_foregroundtab.appendChild(e_foregroundtab_img);
                e_options.appendChild(e_foregroundtab);

                var e_backgroundtab_img = document.createElement("img");
                e_backgroundtab_img.setAttribute("src", asset_arrow_up);

                var e_backgroundtab = document.createElement("div");
                e_backgroundtab.setAttribute("class", "backgroundtab");
                e_backgroundtab.appendChild(e_backgroundtab_img);
                e_options.appendChild(e_backgroundtab);
            }

            var e_title = document.createElement("div");
            e_title.setAttribute("class", "title");
            e_title.appendChild(t_title);
            e_contentcontainer.appendChild(e_title);

            var e_infobox = document.createElement("div");
            e_infobox.setAttribute("class", "infobox");
            e_contentcontainer.appendChild(e_infobox);

            var e_time = document.createElement("div");
            e_time.setAttribute("class", "time");
            e_time.appendChild(t_time);

            var e_user = document.createElement("div");
            e_user.setAttribute("class", "user");
            e_user.appendChild(t_user);

            var e_subreddit = document.createElement("div");
            e_subreddit.setAttribute("class", "subreddit");
            e_subreddit.appendChild(t_subreddit);

            var e_comments = document.createElement("div");
            e_comments.setAttribute("class", "comment");
            e_comments.appendChild(t_comments);



            e_infobox.appendChild(document.createTextNode(" submitted "));
            e_infobox.appendChild(e_time);
            e_infobox.appendChild(document.createTextNode(" by "));
            e_infobox.appendChild(e_user);
            e_infobox.appendChild(document.createTextNode(" to "));
            e_infobox.appendChild(e_subreddit);
            e_infobox.appendChild(e_comments);

            e_contentcontainer.onclick = function (submission_link) {
                return function (event) {
                    openLink(submission_link, "default");
                }
            }(submission.link);

            if (!hideOpenOptions) {
                e_currenttab.onclick = function (submission_link) {
                    return function (event) {
                        openLink(submission_link, "currenttab");
                        event.stopPropagation();
                    }
                }(submission.link);

                e_foregroundtab.onclick = function (submission_link) {
                    return function (event) {
                        openLink(submission_link, "foregroundtab");
                        event.stopPropagation();
                    }
                }(submission.link);

                e_backgroundtab.onclick = function (submission_link) {
                    return function (event) {
                        openLink(submission_link, "backgroundtab");
                        event.stopPropagation();
                    }
                }(submission.link);
            }

            document.getElementById("links").appendChild(e_submission);

            if (modhash !== "") {
                e_upvote.onclick = function (submission_local, t_score) {
                    return function (event) {
                        if (submission_local.likes === true) {
                            castVote(submission_local.fullname, 0);
                            t_score.textContent = parseInt(t_score.textContent) - 1;
                            // -1
                            submission_local.likes = null;
                        } else {
                            castVote(submission_local.fullname, 1);
                            if (submission_local.likes === null) {
                                t_score.textContent = parseInt(t_score.textContent) + 1;
                                // +1
                            } else {
                                t_score.textContent = parseInt(t_score.textContent) + 2;
                                // + 2
                            }
                            submission_local.likes = true;
                        }
                        event.stopPropagation();
                    }
                }(submission, t_score);

                e_downvote.onclick = function (submission_local, t_score) {
                    return function (event) {
                        if (submission_local.likes === false) {
                            castVote(submission_local.fullname, 0);
                            t_score.textContent = parseInt(t_score.textContent) + 1;
                            // +1
                            submission_local.likes = null;
                        } else {
                            castVote(submission_local.fullname, -1);
                            if (submission_local.likes === null) {
                                t_score.textContent = parseInt(t_score.textContent) - 1;
                                // -1
                            } else {
                                t_score.textContent = parseInt(t_score.textContent) - 2;
                                // - 2
                            }
                            submission_local.likes = false;
                        }
                        event.stopPropagation();
                    }
                }(submission, t_score);
            }
        }
    }

    document.getElementById("submitbutton").onclick = function () {
        openLink("http://www.reddit.com/submit?resubmit=true&url=" + encodeURIComponent(current_page), "foregroundtab");
    };
    document.getElementById("reportproblembutton").onclick = function () {
        var username = "ntv1000";
        var subject = "Bug report: submission not found";
        var message = "Page that was searched for: " + current_page + "\n\nMissing submission: [Insert a link to the submission you thing is missing here]\n\nAdditional info: [optional]";
        var template_url = "http://www.reddit.com/message/compose/?to=" + encodeURIComponent(username) + "&subject=" + encodeURIComponent(subject) + "&message=" + encodeURIComponent(message);
        openLink(template_url, "foregroundtab");
    };
});

function formatAge(age) {
    var result = "";
    var value = 0;
    var MINUTE = 60 * 1000;
    var HOUR = MINUTE * 60;
    var DAY = HOUR * 24;
    var WEEK = DAY * 7;
    var YEAR = WEEK * 52;
    var MONTH = YEAR / 12;
    if (age < MINUTE) {
        result = age + " second";
    } else if (age < HOUR) {
        value = Math.floor(age / MINUTE);
        result = value + " minute";
    } else if (age < DAY) {
        value = Math.floor(age / HOUR);
        result = value + " hour";
    } else if (age < WEEK) {
        value = Math.floor(age / DAY);
        result = value + " day";
    } else if (age < MONTH) {
        value = Math.floor(age / WEEK);
        result = value + " week";
    } else if (age < YEAR) {
        value = Math.floor(age / MONTH);
        result = value + " month";
    } else {
        value = Math.floor(age / YEAR);
        result = value + " year";
    }

    if (value !== 1) {
        result += "s";
    }
    result += " ago";
    return result;
}

function openLink(url, where) {
    self.port.emit("open-link", {
        url: url,
        where: where
    });
}

function castVote(fullname, direction) {
    var url = "http://www.reddit.com/api/vote?dir=" + direction + "&id=" + fullname;
    
    // var xhr = new XMLHttpRequest();
    // xhr.open("POST", url, true);
    // xhr.setRequestHeader("X-Modhash", modhash);
    // xhr.send();
    self.port.emit("vote-submission", url);

    // update UI accordingly
    if (direction === 1) {
        document.getElementById("upvote" + fullname).setAttribute("src", asset_upvote_orange);
        document.getElementById("downvote" + fullname).setAttribute("src", asset_downvote_grey);
    } else if (direction === 0) {
        document.getElementById("upvote" + fullname).setAttribute("src", asset_upvote_grey);
        document.getElementById("downvote" + fullname).setAttribute("src", asset_downvote_grey);
    } else if (direction === -1) {
        document.getElementById("upvote" + fullname).setAttribute("src", asset_upvote_grey);
        document.getElementById("downvote" + fullname).setAttribute("src", asset_downvote_blue);
    }
}