// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// https://wam-mobile.appspot.com/user/opponents/suggest/ - venner med email
// https://wam-mobile.appspot.com/quiz/get/

// I18N
$(function(){
	document.title = chrome.i18n.getMessage('chrome_extension_name');
	$('#intro>h1').html(chrome.i18n.getMessage('headers_start_title'));
	$('#intro>p').html(chrome.i18n.getMessage('headers_start_notice'));
	$('a.credit').html(chrome.i18n.getMessage('headers_author_credit'));
});

var tabId = parseInt(window.location.search.substring(1));

window.addEventListener("load", function() {
	chrome.debugger.sendCommand({ tabId: tabId }, "Network.enable");
	//chrome.debugger.sendCommand({ tabId: tabId }, "Network.getResponseBody");
	chrome.debugger.onEvent.addListener(onEvent);
});

window.addEventListener("unload", function() {
	chrome.debugger.detach({ tabId: tabId });
});

var requests = {};

function onEvent(debuggeeId, message, params) {
	if (tabId != debuggeeId.tabId) {
		return;
	}

	if (message == "Network.responseReceived") { //response return
		console.log(params.response.url);
		if(params.response.url === "https://wam-mobile.appspot.com/user/flags/get/") {

			chrome.debugger.sendCommand({
				tabId: tabId
			}, "Network.getResponseBody", {
				"requestId": params.requestId
			}, function(response) {
				var body = JSON.parse(response.body);
				console.log('ALLAN::::', body);
			});
		}

		if(params.response.url === "https://wam-mobile.appspot.com/quiz/get/") {

			chrome.debugger.sendCommand({
				tabId: tabId
			}, "Network.getResponseBody", {
				"requestId": params.requestId
			}, function(response) {
				
				var body = JSON.parse(response.body);

				//console.log('ResponseData ::::', body);

				if( body.hasOwnProperty("quiz") ) {
					$('#intro').hide();
					$('.prev-category').html(chrome.i18n.getMessage('headers_previous') + ': ' + $('.category').html());
					$('.category').html( body['quiz']['genreName'] );
					$('.answers li').appendTo('.prev-answers');
					
					$(body['quiz']['questions']).each(function(){
						var question = this,
						answerIndex = question['answerIndex'],
						answer = question['songs'][answerIndex];

						$listItem = $('<li></li>');
						$listItem.html(answer['artist'] + " - " + answer['title']);
						_gaq.push(['_trackEvent', 'Answers', 'Is', answer['artist'] + " - " + answer['title']]);
						$('.answers').append($listItem);
					});

					// Track when a list of answers is created
					_gaq.push(['_trackEvent', 'Answers', 'Loaded']);
				};


			});
		}
	}
}

/*
	Google Analytics for tracking use
	More infomation: https://developer.chrome.com/trunk/extensions/tut_analytics.html
	If you want access to the data just send me a message!
 */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-34374614-1']);
_gaq.push(['_trackPageview']);
(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();