// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// https://wam-mobile.appspot.com/user/opponents/suggest/ - venner med email
// https://wam-mobile.appspot.com/quiz/get/

var tabId = parseInt(window.location.search.substring(1));

window.addEventListener("load", function() {
	chrome.debugger.sendCommand({ tabId: tabId }, "Network.enable");
	//chrome.debugger.sendCommand({ tabId: tabId }, "Network.getResponseBody");
	chrome.debugger.onEvent.addListener(onEvent);

	// I18N
	document.title = chrome.i18n.getMessage('chrome_extension_name');
	document.querySelectorAll('#intro>h1').innerHTML = chrome.i18n.getMessage('headers_start_title');
	document.querySelectorAll('#intro>p').innerHTML = chrome.i18n.getMessage('headers_start_notice');
	document.querySelectorAll('a.credit').innerHTML = chrome.i18n.getMessage('headers_author_credit');
});

window.addEventListener("unload", function() {
	chrome.debugger.detach({ tabId: tabId });
});

var requests = {};

function onEvent(debuggeeId, message, params) {
	
	// if the tab id is not correct we should just stop now.
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
				console.log('Debugging ::::', body);
			});
		}

		/*
			USER QUIZ

			/quiz/finish/
		*/
		if(params.response.url === "https://wam-mobile.appspot.com/quiz/get/") {

			chrome.debugger.sendCommand({
				tabId: tabId
			}, "Network.getResponseBody", {
				"requestId": params.requestId
			}, function(response) {
				var responseBody = JSON.parse(response.body);
				if( responseBody.hasOwnProperty("quiz") ) {
				
					var intro = document.querySelectorAll('#intro');
					intro.className = intro.className + " hidden";
					document.querySelectorAll('.category').innerHTML = responseBody['quiz']['genreName'];
					
					responseBody['quiz']['questions'].forEach(function(question, index, array){
						var answerIndex = question['answerIndex'],
						answer = question['songs'][answerIndex];

						$listItem = $('<li></li>');
						$listItem.html(answer['artist'] + " - " + answer['title']);
						$('.answers').append($listItem);
					});
				};
			});
		}

		/*
			EVENT QUIZ
			For the live event quiz!

			Notes:

			Posts when the game is finished to:

			/api/live-events/quiz/finish
			the parameter is answers and that is a array like this:

			[
			    {
			        "score": 73,
			        "powerups": [],
			        "isRight": true,
			        "time": 3215
			    }
			    ...
			]

			It's almomst too easy to correct this before sending it.

		*/
		if(params.response.url === "https://wam-mobile.appspot.com/api/live-events/quiz/get") {
			chrome.debugger.sendCommand({
				tabId: tabId
			}, "Network.getResponseBody", {
				"requestId": params.requestId
			}, function(response) {
				var body = JSON.parse(response.body);

				if( body.hasOwnProperty("quiz") ) {
					
					$('#intro').hide();
					$('.category').html( 'Event' );
					
					$(body['quiz']['questions']).each(function(){

						var question = this,
						answer = question['correctAnswer'];

						$listItem = $('<li></li>');
						$listItem.html(answer['artist'] + " - " + answer['title']);
						$('.answers').append($listItem);
					});
				};
			});
		}
	}
}