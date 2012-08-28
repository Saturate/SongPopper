// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// By Allan Kimmer Jensen with help from the example here:
// http://developer.chrome.com/trunk/extensions/samples.html#cc8563a6666add797264184a960c7b7c8bd3e64d

chrome.browserAction.onClicked.addListener(function() {
  chrome.windows.getCurrent(function(win) {
    chrome.tabs.getSelected(win.id, actionClicked);
  });
});

var version = "1.0";

function actionClicked(tab) {
	var tabUrl = tab.url;;
	if( tabUrl.indexOf("apps.facebook.com/songpop") != -1){
		chrome.debugger.attach({tabId:tab.id}, version, onAttach.bind(null, tab.id));
	} else {
		console.log('Not the correct tab, create one.');
		chrome.tabs.create({'url': 'https://apps.facebook.com/songpop/'}, function(tab) {
		  // Tab opened.
		  chrome.debugger.attach({tabId:tab.id}, version, onAttach.bind(null, tab.id));
		});
	}
}

function onAttach(tabId) {
  if (chrome.extension.lastError) {
    alert(chrome.extension.lastError.message);
    return;
  }

  
  chrome.windows.create(
      {url: "headers.html?" + tabId, type: "popup", width: 460, height: 310});
}