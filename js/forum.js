// Load settings
gaiarch.loadSettings();

// Save time the user has last been to gaiaonline
chrome.extension.sendRequest({call: 'lastvist'}, function(response){});