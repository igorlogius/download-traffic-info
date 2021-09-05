

function formatBytes(bytes, decimals = 0) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + '' + sizes[i];
}

let dl_total_bytes = 0;

function onBeforeRequest(details) {

	const filter = browser.webRequest.filterResponseData(details.requestId);
	//let encoder = new TextEncoder();
	let req_bytes = 0;
	filter.onstart = event => {
		req_bytes = 0;
	}
	filter.ondata = event => {
		req_bytes = req_bytes + event.data.byteLength;
		filter.write(event.data);
	};
	filter.onstop = event => {
		filter.close();
		//console.log(details.tabId, details.url, 'req_bytes:',formatBytes(req_bytes));
		dl_total_bytes = dl_total_bytes + req_bytes;
		req_bytes = 0;
//		console.log('dl_total_bytes:', formatBytes(dl_total_bytes));
		 browser.browserAction.setBadgeText({text: formatBytes(dl_total_bytes)});
	};
	filter.onerror = event => {
		req_bytes = 0;
	}
}

/*
browser.webRequest.onBeforeRequest.addListener(
  onBeforeRequest,
  {urls: ["<all_urls>"]},
  ["blocking", "requestBody"]
);
*/

browser.browserAction.onClicked.addListener((tab) => {

	dl_total_bytes = 0;
	browser.webRequest.onBeforeRequest.removeListener(onBeforeRequest);

	browser.webRequest.onBeforeRequest.addListener(
		onBeforeRequest,
		{urls: ["<all_urls>"]},
		["blocking", "requestBody"]
	);

});


