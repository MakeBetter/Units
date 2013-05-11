chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.message === 'searchExternalSite') {
            searchExternalSite(request.selection, request.keyCode);

        }
    }
);

/**
 * @param searchStr Search string
 * @param charCode Used to determine which site to search in, based on searchData
 */
function searchExternalSite(searchStr, charCode) {

    var searchKey = String.fromCharCode(charCode),
        url;

    if (searchKey && (url = searchData[searchKey.toLowerCase()])) {
        url = url.replace("<<_serach_str_>>", searchStr);
        chrome.tabs.create({url: url});
    }

}