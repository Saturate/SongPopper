

chrome.browserAction.onClicked.addListener(function() {
	chrome.windows.getCurrent(function(win) {
		chrome.tabs.getSelected(win.id, actionClicked);
	});
});

var version = "1.0";
function actionClicked(tab) {
	console.log(tab);
	var tabUrl = tab.url;;
	if( tabUrl.indexOf("apps.facebook.com/songpop") != -1){
		chrome.debugger.attach({
			tabId: tab.id
		}, version, onAttach.bind(null, tab.id));
	} else {
		console.log('Not the correct tab, create one.');
		chrome.tabs.create({'url': 'https://apps.facebook.com/songpop/'}, function(tab) {
			// Tab opened.
			chrome.debugger.attach({
				tabId: tab.id
			}, version, onAttach.bind(null, tab.id));
		});
	}
}


	

function onAttach(tabId) {
	if (chrome.extension.lastError) {
		alert(chrome.extension.lastError.message);
		return;
	}

	chrome.windows.create({
		url: "songpopper.html?" + tabId,
		type: "popup",
		width: 460,
		height: 310
	});
}

// Intercept guess POST request
chrome.webRequest.onSendHeaders.addListener(function(details) { 
	console.log('test from main.js', details);
	// TODO, change the guess POST data to a better time

},{
	//urls: ["*://wam-mobile.appspot.com/quiz/get/*"]
	urls: ["*://wam-mobile.appspot.com/user/flags/get/"]
});