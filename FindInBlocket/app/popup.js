// This callback function is called when the content script has been 
// injected and returned its results
function onPageDetailsReceived(pageDetails) {
    $('#title').val(pageDetails.title);
    $('#url').val(pageDetails.url);
    $('#productToSearch').val(pageDetails.productToSearch);
    $('#summary').val(findInBlocket(pageDetails.productToSearch));
}

// Global reference to the status display SPAN
var statusDisplay = null;

// find the item in Blocket. User Google search API
function findInBlocket(item) {
    var item1 = "item1";
    var item2 = "item2";
    getWebUrl("Loftsängstomme Blocket", function (imageUrl) {
        var webResult = document.getElementById('summary');
        webResult.innerText = webUrl;
    }, function (errorMessage) {
        renderStatus('Cannot display url. ' + errorMessage);
    });
    var result = item1 + '\n' + item2;
    return result;
}

function getWebUrl(searchTerm, callback, errorCallback) {
    // Google web search - 1000 searches per day.
    var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=' + encodeURIComponent(searchTerm);
    var x = new XMLHttpRequest();
    x.open('GET', searchUrl);
    // The Google image search API responds with JSON, so let Chrome parse it.
    x.responseType = 'json';
    x.onload = function () {
        // Parse and process the response from Google Web Search.
        var response = x.response;
        if (!response || !response.responseData || !response.responseData.results ||
            response.responseData.results.length === 0) {
            errorCallback('No response from Google Web search!');
            return;
        }
        var firstResult = response.responseData.results[0];
        var webUrl = firstResult.url;
        callback(welUrl);
    };
    x.onerror = function () {
        errorCallback('Network error.');
    };
    x.send();
}

// POST the data to the server using XMLHttpRequest
function addBookmark() {
    // Cancel the form submit
    event.preventDefault();

    // The URL to POST our data to
    var postUrl = 'http://post-test.local.com';

    // Set up an asynchronous AJAX POST request
    var xhr = new XMLHttpRequest();
    xhr.open('POST', postUrl, true);

    // Prepare the data to be POSTed by URLEncoding each field's contents
    var title = encodeURIComponent(document.getElementById('title').value);
    var url = encodeURIComponent(document.getElementById('url').value);
    var summary = encodeURIComponent(document.getElementById('summary').value);
    var tags = encodeURIComponent(document.getElementById('tags').value);

    var params = 'title=' + title +
                 '&url=' + url +
                 '&summary=' + summary +
                 '&tags=' + tags;

    // Replace any instances of the URLEncoded space char with +
    params = params.replace(/%20/g, '+');

    // Set correct header for form data 
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    // Handle request state change events
    xhr.onreadystatechange = function () {
        // If the request completed
        if (xhr.readyState == 4) {
            statusDisplay.innerHTML = '';
            if (xhr.status == 200) {
                // If it was a success, close the popup after a short delay
                statusDisplay.innerHTML = 'Saved!';
                window.setTimeout(window.close, 1000);
            } else {
                // Show what went wrong
                statusDisplay.innerHTML = 'Error saving: ' + xhr.statusText;
            }
        }
    };

    // Send the request and set status
    xhr.send(params);
    statusDisplay.innerHTML = 'Saving...';
}

// When the popup HTML has loaded
window.addEventListener('load', function (evt) {
    // Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('status-display');
    // Handle the bookmark form submit event with our addBookmark function
    document.getElementById('addbookmark').addEventListener('submit', addBookmark);
    // Get the event page
    chrome.runtime.getBackgroundPage(function (eventPage) {
        // Call the getPageInfo function in the event page, passing in 
        // our onPageDetailsReceived function as the callback. This injects 
        // content.js into the current tab's HTML
        eventPage.getPageDetails(onPageDetailsReceived);
    });
});