var current_page;
var responses_expected = 0;
var response_counter = 0;
var total_submission_list = [];

self.port.on("show", function onShow(url) {
	reset();
	current_page = url;
	getAllSubmissions(url);
});

self.port.on("hide", function onHide() {
	var e_links = document.getElementById("links");
	while (e_links.firstChild) {
		e_links.removeChild(e_links.firstChild);
	}
});

function reset(){
	current_page = "";
	responses_expected = 0;
	response_counter = 0;
	total_submission_list = [];
	document.getElementById("loading").style.display = "block";
}

function getAllSubmissions(url){
	var reddit_urls = getAllURLVersions(url);
	responses_expected = reddit_urls.length;
	for(var i=0; reddit_url = reddit_urls[i]; i++) {
		getJSON(reddit_url, handleResponse);
	}
}

function getAllURLVersions(url){
	var host = url.split("/")[2];
	var result = [];
	if ((host === 'youtube.com' || host === 'www.youtube.com') && url.split("/")[3].indexOf('watch?') === 0) {
		youtubeID = function () {
			var query = url.substring(url.indexOf('?') + 1);
			var parameters = query.split('&');
			for (var i=0;i<parameters.length;i++) {
				var pair = parameters[i].split('=');
				if (pair[0] === 'v') {
					return pair[1];
				}
			} 
			return '';
		} ();
		result.push('http://api.reddit.com/search.json?q=' + encodeURIComponent('(url:' + youtubeID + ') (site:youtube.com OR site:youtu.be)'))
	} else {
		var without_http = "";
		if(url.slice(-1) === "/") {
			url = url.substring(0, url.length - 1);
		}
		result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent(url));
		result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent(url + "/"));
		if (url.indexOf('https') === 0) {
			without_http = url.substring(8);
			result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent(without_http));
			result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent(without_http + "/"));
		}
		else{
			if (url.indexOf('http') === 0) {
				without_http = url.substring(7);
				result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent("https://" + without_http));
				result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent("https://" + without_http + "/"));
			}
			else{
				without_http = url;
				result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent("https://" + without_http));
				result.push('http://www.reddit.com/api/info.json?url=' + encodeURIComponent("https://" + without_http + "/"));
			}
		}
	}
	return result;
}

function handleResponse(jsonData){
	var now = new Date();
	var now_timestamp = now.getTime();// = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	var submissions = [];
	for(var i=0; entry = jsonData.data.children[i]; i++) {
		submission_timestamp = entry.data.created_utc*1000;
		submissions[i] = {
			link: "http://reddit.com" + entry.data.permalink,
			title: entry.data.title,
			score: entry.data.score+"",
			age: (now_timestamp - submission_timestamp),
			comments: entry.data.num_comments+"",
			subreddit: entry.data.subreddit,
		};
	}
	total_submission_list.push.apply(total_submission_list, submissions);
	
	response_counter++;
	if(response_counter === responses_expected){
		document.getElementById("loading").style.display = "none";
		putSubmissionsIntoUI(total_submission_list);
	}
}

function putSubmissionsIntoUI(submissions){
	if(submissions.length === 0){
		var t_nonefound = document.createTextNode("This page hasn't been submitted to reddit, yet.");
		var t_submit = document.createTextNode("Create submission");
		
		var e_nonefound = document.createElement("div");
		e_nonefound.setAttribute("align", "center");
		e_nonefound.setAttribute("style", "font-size: 140% !important");
		e_nonefound.appendChild(t_nonefound);
		
		var e_submit = document.createElement("div");
		e_submit.setAttribute("class", "submitbutton");
		e_submit.appendChild(t_submit);
		
		e_submit.onclick = function() { 
			openLink("http://www.reddit.com/submit?url=" + encodeURIComponent(current_page));
		};
		
		document.getElementById("links").appendChild(e_nonefound);
		document.getElementById("links").appendChild(e_submit);
	}
	else{
		for(var i=0; submission = submissions[i]; i++) {
			var t_score = document.createTextNode(submission.score);
			var t_title = document.createTextNode(submission.title);
			var t_subreddit = document.createTextNode("/r/" + submission.subreddit);
			var t_comments = document.createTextNode(submission.comments + " comments");
			var t_time = document.createTextNode(formatAge(submission.age));
		
			var e_submission = document.createElement("div");
			e_submission.setAttribute("class", "submission");
			
			var e_score = document.createElement("div");
			e_score.setAttribute("class", "score");
			e_score.setAttribute("align", "center");
			e_score.appendChild(t_score);
			
			var e_title = document.createElement("div");
			e_title.setAttribute("class", "title");
			e_title.appendChild(t_title);
			
			var e_infocontainer = document.createElement("div");
			
			var e_subreddit = document.createElement("div");
			e_subreddit.setAttribute("class", "subreddit");
			e_subreddit.appendChild(t_subreddit);
			
			var e_comments = document.createElement("div");
			e_comments.setAttribute("class", "comment");
			e_comments.appendChild(t_comments);
			
			var e_time = document.createElement("div");
			e_time.setAttribute("class", "time");
			e_time.appendChild(t_time);
			
			e_infocontainer.appendChild(e_subreddit);
			e_infocontainer.appendChild(e_comments);
			e_infocontainer.appendChild(e_time);
			
			e_submission.appendChild(e_score);
			e_submission.appendChild(e_title);
			e_submission.appendChild(e_infocontainer);
			
			e_submission.onclick = function(submission_link) { 
				return function(){
					openLink(submission_link);
				}
			}(submission.link);
			
			document.getElementById("links").appendChild(e_submission);
		}
	}
}

function formatAge(age){
	var MINUTE = 60 * 1000;
	var HOUR = MINUTE * 60;
	var DAY = HOUR * 24;
	var WEEK = DAY * 7;
	var YEAR = WEEK * 52;
	var MONTH = YEAR / 12;
	if (age < MINUTE) {
		return age + " seconds ago";
	} else if(age < HOUR) {
		return Math.floor(age / MINUTE) + " minutes ago";
	} else if(age < DAY) {
		return Math.floor(age / HOUR) + " hours ago";
	} else if(age < WEEK) {
		return Math.floor(age / DAY) + " days ago";
	} else if(age < MONTH) {
		return Math.floor(age / WEEK) + " weeks ago";
	} else if(age < YEAR) {
		return Math.floor(age / MONTH) + " months ago";
	} else {
		return Math.floor(age / YEAR) + " years ago";
	}
}

function openLink(url){
	self.port.emit("open-link", url);
}

function getJSON(path, success)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}











