/* Make sure to keep the same instance of ExtensionThread */

var ExtensionThread = ExtensionThread || {};

/* Logger for main thread */

var Logger = ExtensionLogger.mainLogger;

/**
 *
 * Namespace for generic extension related functions
 * DOM affecting functions should be preffixed with dom
 *
 */

ExtensionThread = function() {

    /**
     *
     * Initialize function for the extension
     * Provides loading capabilities for CSS and JS files
     * @param Array[] $cssFiles - array of strings with paths to css files
     * @param Array[] $jsFiles - array of strings with paths to js files
     *
     * @note dom manipulation occurs
     */
    var domInitialize = function(cssFiles, jsFiles) {

        for (var i = cssFiles.length - 1; i >= 0; i--) {
            var tempLink = document.createElement('link');
            tempLink.href = chrome.extension.getURL(cssFiles[i]);
            tempLink.rel = 'stylesheet';
            tempLink.type = 'text/css';
            (document.head || document.documentElement).appendChild(tempLink);
        }

        for (var i = jsFiles.length - 1; i >= 0; i--) {
            var tempScript = document.createElement('script');
            tempScript.src = chrome.extension.getURL(jsFiles[i]);
            tempScript.onload = function() {
                this.remove();
            };
            (document.head || document.documentElement).appendChild(tempScript);
        }

    };

    /**
     *
     * Initializers for background and local communication events
     * @param bool background - whether this extension comunicates with background scripts or not
     * @param bool local - whether this extension should interpret events coming from the web page
     *
     */

    var listenersInitialize = function(background, local) {
        if (background) {
            window.addEventListener("backgroundCommunication", function(event) {

                var action = event.detail.action;
                var data = event.detail.data;

                Logger(event.type, action, data);

                _backgroundCommunicationInterpreter(action, data);
            }, false);
        }
        if (local) {
            window.addEventListener("localCommunication", function(event) {

                var action = event.detail.action;
                var data = event.detail.data;

                Logger(event.type, action, data);

                _localCommunicationInterpreter(action, data);
            }, false);
        }

    };

    /**
     *
     * Function used for interpreting web page events
     * @param string $action - action to be taken
     * @param Object $data - associated event data object
     *
     */
    var _localCommunicationInterpreter = function(action, data) {
        switch (action) {
            case 'syncCollections':
                StorageCommunication.syncCollections();
                break;
            case 'changeLoggerState':
                ExtensionLogger.setState(
                    data.enabled
                );
                break;
            case 'updateCollectionItems':
                StorageCommunication.updateCollectionItems(
                    data.collectionId,
                    data.leavingCollection,
                    data.items
                );
                break;
            case 'removeCollection':
                StorageCommunication.removeCollection(
                    data.collectionId
                );
                break;
            case 'createNewCollection':
                StorageCommunication.createNewCollection(
                    data
                );
                break;
            case 'purge':
                StorageCommunication.purge();
                break;
        }
    };

    /**
     *
     * Function used for interpreting and forwarding data to background script
     * @param string $action - action to be taken
     * @param Object $data - associated event data object
     *
     */

    var _backgroundCommunicationInterpreter = function(action, data) {
        switch (action) {}
    };

    /**
     *
     * Function used to dispatch custom events in the page
     * @param string name - event name to be dispatched
     * @param string action - action to be identified by receiver
     * [optional]@param Object data - json meant to transmit data associated with the event
     *
     * @note This function should remain private
     */

    var _dispatchEvent = function(name, action, data) {
        data = data || {};

        var event = new CustomEvent(name, {
            detail: {
                action: action,
                data: data
            }

        });
        window.dispatchEvent(event);
    };

    /**
     *
     * Function used to interface _dispatchEvent for pageCmmunication
     * @param string action - action to be identified by receiver
     * [optional]@param Object data - json meant to transmit data associated with the event
     *
     */

    var sendMessageToWebPage = function(action, data) {
        _dispatchEvent('pageCommunication', action, data);
    };

    return {
        domInitialize: domInitialize,
        listenersInitialize: listenersInitialize,
        sendMessageToWebPage: sendMessageToWebPage
    };
}();

/**
 *
 * Initialization of the extension with CSS and JS files
 * Scripts: 'js/youtuber_inpage.js'
 * Styles: 'css/youtuber_collection.css'
 *
 */

var cssFiles = [
    'css/youtuber_collection.css'
];
var jsFiles = [
    'js/webpage/youtuber_inpage.js',
    'js/webpage/youtuber_logger.js',
    'js/webpage/youtuber_dom.js',
    'js/webpage/youtuber_dom_v2.js'
];
ExtensionThread.domInitialize(cssFiles, jsFiles);
ExtensionThread.listenersInitialize(true, true);
