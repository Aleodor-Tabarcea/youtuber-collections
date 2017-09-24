/* Make sure to keep the same instance of YoutuberCollections */
var YoutuberCollections = YoutuberCollections || {};

/* Defined logger for this page */
var Logger = ExtensionLogger.mainLogger;


/* Define the type of interface the user is currently using */
if(document.querySelector('[name="desktop_polymer/desktop_polymer"]') === null){
    DomManipulation = OldVersionDomManipulation;
}
else{
    DomManipulation = NewVersionDomManipulation;
}

/**
 *
 * Namespace used for main interaction with the extension
 * Please avoid dom manipulation in this area and add it to DomManipulation namespace
 *
 */

YoutuberCollections = function() {

    /**
     *
     * Function used to initialize the web page part of extension
     * @param bool $firstTime - whether listeners and dom elements should
     *                          or not be injected in the page
     *
     */

    var initialize = function(firstTime) {

        
        if(DomManipulation.determineInitializationType()){
            _dispatchEvent('localCommunication', 'syncCollections');            
        }
        else{
            var menuButton = DomManipulation.getMenuButton();
            menuButton.addEventListener('click', _lateInitialization);
        }

        _dispatchListeners();
    };

    var _lateInitialization = function(){
        if(DomManipulation.determineInitializationType()){
            YoutuberCollections.sendMessageToContentScript('syncCollections', null);
        }
        else{
            setTimeout(_lateInitialization, 500);
        }
    }

    /**
     *
     * Function to attach events listeners for the extension
     *
     */

    var _dispatchListeners = function() {
        window.addEventListener("pageCommunication", function() {

            var action = event.detail.action;
            var data = event.detail.data;

            Logger(event.type, action, data);

            _pageCommunicationInterpreter(action, data);
        }, false);

        window.addEventListener('click', DomManipulation.clearCollectionDropdown);

        document.addEventListener("dragstart", DomManipulation.dragStartBehaviour, false);

        document.addEventListener("dragenter", DomManipulation.dragEnterBehaviour, false);

        document.addEventListener("dragleave", DomManipulation.dragLeaveBehaviour, false);

        document.addEventListener("drop", DomManipulation.dragDropBehaviour, false);

        document.addEventListener("dragend", DomManipulation.dragEndBehaviour, false);

        document.addEventListener("dragover", function(event) {
            event.preventDefault();
        }, false);

        document.addEventListener('mouseover', DomManipulation.resetSelectionBehaviour);
    };

    /**
     *
     * Function for interpreting content script communication
     * @param string $action - action to be taken
     * @param Object $data - associated event data object
     *
     */

    var _pageCommunicationInterpreter = function(action, data) {
        switch (action) {
            case 'generateCollections':
                DomManipulation.initialSetup(data);
                break;
            case 'deleteCollection':
                DomManipulation.deleteCollection(data);
                break;
            case 'resetChannelToUngrouped':
                DomManipulation.resetChannelToUngrouped(data);
                break;
            case 'updateMyCollections':
                DomManipulation.updateMyCollections(data);
                break;
            case 'appendCollection':
                DomManipulation.appendCollection(data);
                break;
        }
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
     * Interface for dispaching an event to the content script
     *
     */

    var sendMessageToContentScript = function(action, data) {
        _dispatchEvent('localCommunication', action, data);
    };

    return {
        initialize: initialize,
        sendMessageToContentScript: sendMessageToContentScript
    };
}();


YoutuberCollections.initialize(true);
