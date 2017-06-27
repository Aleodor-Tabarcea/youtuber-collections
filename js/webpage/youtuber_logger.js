var ExtensionLogger = ExtensionLogger || {};

ExtensionLogger = function() {

    var mainCSS = 'color: green;';
    var domCSS = 'color: orange;';
    var enabled = false;

    /**
     *
     * Function for loggin from youtuber_inpage.js
     *
     */

    var mainLogger = function() {
        if (enabled) {
            console.log('%c[InPage] ', mainCSS, Array.from(arguments));
        }
    };

    /**
     *
     * Function for logging from youtuber_dom.js
     *
     */

    var domLogger = function() {
        if (enabled) {
            console.log('%c[DOM] ', domCSS, Array.from(arguments));
        }
    };

    /**
     *
     * Function for controlling the state of logging in the extension
     * @param bool state - state of logging in extension
     *
     */

    var enable = function(state) {
        if (state === true || state === false) {
            enabled = state;
            YoutuberCollections.sendMessageToContentScript('changeLoggerState', {
                enabled: state
            });
        }
    };

    return {
        mainLogger: mainLogger,
        domLogger: domLogger,
        enable: enable
    };
}();
