var StorageCommunication = StorageCommunication || {};
var StorageLog = ExtensionLogger.storageLogger;

chrome.storage.onChanged.addListener(function(changes, areaName) {
    ExtensionThread.sendMessageToWebPage(
        'updateMyCollections',
        changes.collections.newValue
    );
    StorageLog(changes.collections.newValue);
});


StorageCommunication = function() {

    var lastInserted = {
        collectionName: null,
        collectionId: null
    };

    /**
     *
     * Function for creating a new collection
     * @param string collectionName - name of collection to be created
     * @param Array[String] $collectionItems - Array of items to be added in the collection
     *
     */

    var createNewCollection = function(collectionName, collectionItems = []) {
        chrome.storage.sync.get(null, function(result) {
            if (!result.collections) {
                result.collections = [];
            }
            var length = result.collections.push({
                name: collectionName,
                items: collectionItems
            });
            lastInserted.collectionName = collectionName;
            lastInserted.collectionId = length - 1;
            chrome.storage.sync.set({
                'collections': result.collections
            }, function() {
                ExtensionThread.sendMessageToWebPage(
                    'appendCollection',
                    lastInserted
                );
                StorageLog("Appending collection ", lastInserted);
            });
        });
    };

    /**
     *
     * Function for updating collections on the store
     * @param string $collectionId - destination collection for the new items
     * @param string $leavingCollection - collection from which the items are leaving if it's the case
     * @param string/Array items - items to be juggled around
     *
     */

    var updateCollectionItems = function(collectionId, leavingCollection, items) {
        collectionId = ExtensionSanitizer.sanitizeInteger(collectionId);
        leavingCollection = ExtensionSanitizer.sanitizeInteger(leavingCollection);
        if (!items) {
            StorageLog('updateCollectionItems should no be called with: ', collectionId, leavingCollection, items);
        }
        chrome.storage.sync.get(null, function(result) {
            if (!isNaN(collectionId)) {
                result.collections[collectionId].items.push(items);
                StorageLog('Appended items ', items, ' to colection ', result.collections[collectionId]);
            }
            if (!isNaN(leavingCollection)) {
                if (Object.prototype.toString.call(items) === '[object Array]') {
                    for (var i = 0; i < items.length; i++) {
                        var location = result.collections[leavingCollection].items.indexOf(items[i]);
                        result.collections[leavingCollection].items.splice(location, 1);
                    }
                } else {
                    var location = result.collections[leavingCollection].items.indexOf(items);
                    result.collections[leavingCollection].items.splice(location, 1);
                }
                StorageLog('Removed items ', items, ' from colection ', result.collections[leavingCollection]);
            }

            if (isNaN(collectionId) && !isNaN(leavingCollection)) {
                ExtensionThread.sendMessageToWebPage(
                    'resetChannelToUngrouped',
                    items
                );
            }
            chrome.storage.sync.set({
                'collections': result.collections
            });
        });
    };

    /**
     *
     * Function for removing a collection
     * @Event - sends event to put back all subscriptions in the ungruped state
     *
     */

    var removeCollection = function(collectionId) {
        collectionId = ExtensionSanitizer.sanitizeInteger(collectionId);
        if (!isNaN(collectionId)) {
            ExtensionThread.sendMessageToWebPage(
                'deleteCollection',
                collectionId
            );
            chrome.storage.sync.get(null, function(result) {
                result.collections.splice(collectionId, 1);
                StorageLog('Removal of ', collectionId, ' results in ', result.collections);
                chrome.storage.sync.set({
                    'collections': result.collections
                });
            });
        }
    };


    /**
     *
     * Function for sincronizing store with dom collections
     * @Event - sends generateCollection request to web page
     *
     */

    var syncCollections = function() {
        chrome.storage.sync.get(null, function(storage) {
            var data = storage.collections || "Empty";
            ExtensionThread.sendMessageToWebPage(
                'generateCollections',
                data
            );
        });
    };


    /**
     *
     * Function to clear all storage data
     *
     */

    var purge = function() {
        StorageLog('Purge initialized!');
        chrome.storage.sync.clear();
    };

    return {

        //variables exporting
        lastInserted: lastInserted,

        //functions exporting
        createNewCollection: createNewCollection,
        updateCollectionItems: updateCollectionItems,
        removeCollection: removeCollection,
        syncCollections: syncCollections,
        purge: purge
    };

}();
