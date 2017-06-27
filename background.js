chrome.webRequest.onCompleted.addListener(function(tab) {

    if (tab.url.includes("a=guide-toggled")) {
    }
}, {
    urls: ["<all_urls>"]
}, ["responseHeaders"]);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    console.log("[Background] Sent " + request.action + " with " + request.data);
    chrome.tabs.sendMessage(sender.tab.id, {
        action: request.action,
        data: request.data
    }, function(response) {
        sendResponse(response);
    });

});
