console.log(this);


chrome.runtime.sendMessage({
        message: "getSettings"
//        locationObj: this.window.location
    },
    function(settings) {
        console.log(settings);
    }
);
