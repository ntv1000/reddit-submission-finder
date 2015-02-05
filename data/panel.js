self.port.on("show", function onShow(url) {
	reset();
	getSubmissions(url);
});

self.port.on("hide", function onHide() {
	$.each($("#links").children(), function(index, child) {
		child.remove();
	});
});

function reset(){
	$.each($("#data").children(), function(index, child) {
		child.remove();
	});
	$("img#loading").show(0);
}

function getSubmissions(url){
	console.log('Submissions for ' + url);
	var redditPosts = [];
	var now = new Date();
	var now_timestamp = now.getTime();// = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	var redditUrl = 'http://www.reddit.com/api/info.json?url=' + encodeURIComponent(url);
	$.getJSON(redditUrl, function(jsonData) {
		$("img#loading").hide(0);
		var submissions = [];
		for(var i=0; entry = jsonData.data.children[i]; i++) {
			console.log(entry.data.score + " | " + entry.data.title)
			submission_timestamp = entry.data.created_utc*1000;
			submissions[i] = {
				link: "http://reddit.com" + entry.data.permalink,
				title: entry.data.title,
				score: entry.data.score+"",
				age: (now_timestamp - submission_timestamp) / (24 * 60 * 60 * 1000), // 24 * 60 * 60 * 1000 = milliseconds of 1 day
				comments: entry.data.num_comments+"",
				subreddit: entry.data.subreddit,
			};
		}
		putSubmissionsIntoUI(url, submissions);
	});
}

function putSubmissionsIntoUI(current_page, submissions){
	if(submissions.length === 0){
		$("#links").append("<div>This page hasn't been submitted to reddit, yet.</div>");
		var element = $(
			"<div class='submitbutton'>" +
				"Create submission" +
			"</div>"
			);
		element.click(function(){
			openLinkInNewTab("http://www.reddit.com/submit?url=" + encodeURIComponent(current_page));
		});
		$("#links").append(element);
	}
	else{
		$.each(submissions, function(index, submission) {
			var element = $(
				"<div class='submission'>" +
					"<div class='score' align='center'>" +
						submission.score +
					"</div>" +
					"<div class='title'>" +
						submission.title +
					"</div>" +
					"<div>" +
						"<div class='subreddit'>" +
							"/r/" + submission.subreddit +
						"</div>" +
						"<div class='comment'>" +
							submission.comments + " comments" +
						"</div>" +
						"<div class='time'>" +
							Math.round(submission.age) + " days ago" +
						"</div>" +
					"</div>" +
				"</div>"
				);
			element.click(function(){
				openLinkInNewTab(submission.link);
			});
			$("#links").append(element);
		});
	}
}

function openLinkInNewTab(url){
	self.port.emit("open-link", url);
}












