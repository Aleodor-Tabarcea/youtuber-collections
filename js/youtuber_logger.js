var ExtensionLogger = ExtensionLogger || {};

ExtensionLogger = function() {

    var storageCSS = 'color: red;';
    var extensionCSS = 'color: blue';
    var enabled = false;

    /**
     *
     * Function for logging from youtuber_storage.js
     *
     */

    var storageLogger = function() {
        if (enabled) {
            console.log('%c[StorageCommunication] ', storageCSS, Array.from(arguments));
        }
    };

    /**
     *
     * Functionn form logging from youtuber_main.js
     *
     */

    var mainLogger = function() {
        if (enabled) {
            console.log('%c[ExtensionThread] ', extensionCSS, Array.from(arguments));
        }
    };

    /**
     *
     * Function that allows setting the extension logger state
     *
     */

    var setState = function(state) {
        if (state === false || state === true) {
            enabled = state;
        }
    };

    return {
        storageLogger: storageLogger,
        mainLogger: mainLogger,
        setState: setState
    };
}();
