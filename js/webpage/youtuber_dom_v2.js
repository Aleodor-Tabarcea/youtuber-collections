/* Make sure to keep the same instance of DomManipulation */
var NewVersionDomManipulation = NewVersionDomManipulation || {};

/**
 *
 * Namespace used mainly for dom manipulation
 *
 */

NewVersionDomManipulation = function() {

    var _isInitialized = false;

    /**
     *
     * Function used for creating the initial setup of the extension requirements
     * @param bool $firstTime - marks if initial dom elements should or should not be populated
     *
     */

    initialSetup = function(data) {

        ExtensionLogger.domLogger('Let\'s do this shit');

        if(!_isInitialized){
            _injectCollectionsControl();
            _setSubscriptionsAsDraggable();
            _handleCollectionsInDOM(data);
            _injectCollectionsGenerator();
            _createCollectionRemoval();
        }

        _isInitialized = true;

    };

    /**
     *
     * Function to generate input for collection creation
     *
     */

    var _injectCollectionsGenerator = function() {
        var tempYoutubeSubscription = document.querySelector('h3.ytd-guide-subscriptions-section-renderer').parentElement;

        var tempHolder = document.createElement('div');
        tempHolder.className = 'inputHolder';

        var tempInput = document.createElement('input');
        tempInput.id = 'newCollection';
        tempInput.placeholder = 'New collection...';
        tempInput.addEventListener('keydown', function(event) {
            event = event || window.event;

            if (event.keyCode == '13') {
                var tempValue = document.getElementById('newCollection').value;
                YoutuberCollections.sendMessageToContentScript(
                    'createNewCollection',
                    tempValue
                );
                document.getElementById('newCollection').value = '';
            }
        });

        tempHolder.appendChild(tempInput);

        tempYoutubeSubscription.insertBefore(tempHolder, document.querySelector('#sections #container'));
    };

    /**
     *
     * Function to generate dom element for removal zone
     *
     */

    var _createCollectionRemoval = function() {
        var tempHolder = document.createElement('div');
        tempHolder.className = 'collectionRemoval';
        tempHolder.id = 'collectionRemoval';
        tempHolder.appendChild(document.createTextNode('Drop here to ungroup'));

        var tempYoutubeSubscription = document.querySelector('#sections #container');
        var tempCollections = tempYoutubeSubscription.getElementsByClassName('dom_collection');
        tempYoutubeSubscription.insertBefore(tempHolder, tempCollections[0]);
    };

    /**
     *
     * Function to set draggable attribute on subscriptions
     *
     */

    var _setSubscriptionsAsDraggable = function() {
        var nodes = document.getElementsByClassName('guide-notification-item');
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].setAttribute('draggable', true);
            if (nodes[i].getElementsByTagName('a')[0]) {
                nodes[i].getElementsByTagName('a')[0].setAttribute('draggable', false);
            }
        }
    };

    /**
     *
     * Function used for creating the "send to" button on each collection
     * @param DOMElement item - dom item to be inserted in
     *
     */

    var _injectCollectionsControl = function() {
        var channelHolder = document.querySelector('#sections #container');
        var channels = channelHolder.children;
        for (var i = 0; i < channels.length; i++) {
            var button = document.createElement('button');
            var id = channels[i].$.endpoint.data.browseEndpoint.browseId;
            channels[i].setAttribute('data-external-id', id);
            button.setAttribute('data-external-id', id);
            button.className = 'liButton';
            button.addEventListener('click', _showDropdown);
            channels[i].appendChild(button);
        }
    };

    /**
     *
     * Function to clear collection dropdown from viewport
     *
     */

    var clearCollectionDropdown = function() {
        var drop = document.getElementById('collections');
        if (drop) {
            drop.style.top = '-400px';
            drop.style.left = '-400px';
        }
    };

    /**
     *
     * Function to show collections dropdown from 'send to' button
     * @param Event event - dom event
     *
     */

    var _showDropdown = function(event) {
        var drop = document.getElementById('collections');
        var pos = event.target.getBoundingClientRect();
        drop.style.top = pos.top + 'px';
        drop.style.left = pos.left + 'px';
        drop.setAttribute('data-external-id', event.target.getAttribute('data-external-id'));
        drop.setAttribute('data-collection-id', event.target.getAttribute('data-collection-id'));
        event.preventDefault();
        event.stopPropagation();
    };


    /*-------------------- Manipulation functions -----------------*/

    /**
     *
     * Handles modifications in collections
     * @param Array[String] $data - array of collections
     *
     */

    var updateMyCollections = function(data) {
        _createCollectionDropdown(data);
        _populateCollections(data);
    };

    /**
     *
     * Creates the collections dropdown with all collections
     * @param Array[String] $collections - array of collections to be added
     *
     */

    var _createCollectionDropdown = function(collections) {
        if (collections === "Empty") {
            return;
        }
        var holder = document.createElement('div');
        holder.id = 'collections';
        holder.className = 'domCollections';

        for (var i = 0; i < collections.length; i++) {

            var colHolder = document.createElement('div');
            colHolder.className = 'collection guide-item';
            colHolder.addEventListener('click', _moveItemToCollection);
            var text = document.createElement('span');
            text.className = 'collection_name display-name';
            text.textContent = collections[i].name;

            var removeButton = document.createElement('button');
            removeButton.setAttribute('data-id', i);
            removeButton.className = 'collection_remove';

            colHolder.appendChild(text);
            colHolder.appendChild(removeButton);
            holder.appendChild(colHolder);

            holder.addEventListener('mouseover', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
            holder.addEventListener('mouseleave', clearCollectionDropdown);
        }

        var currentDrop = document.getElementById('collections');
        if (currentDrop) {
            currentDrop.parentNode.removeChild(currentDrop);
        }

        document.getElementsByTagName('body')[0].appendChild(holder);
    };

    /**
     *
     * Function to send an item to a certain collection from the dom
     * @param Event e - click event on the button on each collection
     */

    var _moveItemToCollection = function(e) {
        debugger;
        var item = '';
        var id = 0;
        var leavingId = undefined;
        if (e.target.tagName == 'SPAN') {
            id = e.target.nextSibling.getAttribute('data-id');
            leavingId = e.target.parentNode.parentNode.getAttribute('data-collection-id');
            item = e.target.parentNode.parentNode.getAttribute('data-external-id');
        } else {
            id = e.target.getElementsByTagName('button')[0].getAttribute('data-id');
            leavingId = e.target.parentNode.getAttribute('data-collection-id');
            item = e.target.parentNode.getAttribute('data-external-id');
        }
        YoutuberCollections.sendMessageToContentScript('updateCollectionItems', {
            collectionId: id,
            leavingCollection: leavingId,
            items: item
        });
    };

    /**
     *
     * Function to remove a subscription from it's place and add it to ungrouped
     * @param string id - id of subscription to be reset
     *
     */

    var resetChannelToUngrouped = function(id) {
        var elem = document.getElementById(id + '-guide-item');
        elem.style.opacity = 1;

        var placeholder = document.getElementById('guide-channels');
        placeholder.insertBefore(elem, placeholder.firstChild);
    };

    /**
     *
     * Function to create collection in the DOM
     * @param Array[Objects] $data - array of collection to be created in the DOM
     *
     */

    var _handleCollectionsInDOM = function(data) {
        if (data === "Empty") {
            return;
        }
        for (var i = data.length - 1; i >= 0; i--) {

            var holder = _createCollectionHTML(i, data[i].name);

            var youtubeSubscription = document.querySelector('#sections #container');
            youtubeSubscription.insertBefore(holder, youtubeSubscription.childNodes[0]);
        }
        updateMyCollections(data);
    };

    /**
     *
     * Function to create a new collection in the list
     * @param Object $item - storage last added object
     *
     */

    var appendCollection = function(item) {

        var holder = _createCollectionHTML(item.collectionId, item.collectionName);

        var youtubeSubscription = document.querySelector('#sections #container');
        var currentCollection = youtubeSubscription.getElementsByClassName('dom_collection');
        if (currentCollection.length) {
            youtubeSubscription.insertBefore(holder, currentCollection[currentCollection.length - 1].nextSibling);
        } else {
            youtubeSubscription.insertBefore(holder, youtubeSubscription.childNodes[1]);
        }

    };

    /**
     *
     * Adjuvant function to create a html collection body for appending
     * @param string $id - id of collection to be added
     * @param string $coll - collection name
     *
     */

    var _createCollectionHTML = function(id, coll) {
        var holder = document.createElement('div');
        holder.className = 'dom_collection';
        holder.setAttribute('draggable', true);
        holder.id = 'dom_collection_' + id;

        var header = document.createElement('div');
        header.className = 'dom_collection_header';

        var icon = document.createElement('div');
        icon.className = 'collection_icon';
        header.appendChild(icon);

        var name = document.createElement('span');
        name.textContent = coll;
        name.className = 'collectionName';
        name.title = coll;
        header.appendChild(name);

        var arrow = document.createElement('span');
        arrow.textContent = '›';
        arrow.className = 'arrow';
        header.appendChild(arrow);

        header.addEventListener('mouseover', function(e) {

            resetSelectionBehaviour.call(this);

            e.preventDefault();
            e.stopPropagation();

            this.classList.add('hover');

            var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            this.nextSibling.classList.toggle('visible');
            var position = e.target.getBoundingClientRect().top - this.nextSibling.clientHeight / 2 + 10;
            this.nextSibling.style.top = position + 'px';

            this.nextSibling.childNodes[0].style.maxHeight = h - position - 50 + 'px';
        });

        var bodyWrapper = document.createElement('div');
        bodyWrapper.className = 'dom_collection_body_wrapper';

        var body = document.createElement('ul');
        body.className = 'dom_collection_body';

        bodyWrapper.appendChild(body);

        body.addEventListener('mouseover', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        bodyWrapper.addEventListener('mouseleave', resetSelectionBehaviour);
        bodyWrapper.addEventListener('mouseover', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        holder.appendChild(header);
        holder.appendChild(bodyWrapper);

        return holder;
    };

    /**
     *
     * Function that parses connection items and puts them in their rightfull place
     * @param Array[Objects] $data - collection array with subscriptions in them
     *
     */

    var _populateCollections = function(data) {

        for (var i = 0; i < data.length; i++) {
            var collection = document.getElementById('dom_collection_' + i);
            if (collection) {
                for (var j = 0; j < data[i].items.length; j++) {
                    if (Object.prototype.toString.call(data[i].items[j]) === '[object String]') {
                        var item = document.getElementById(data[i].items[j] + '-guide-item');
                        if (item) {
                            var img = item.getElementsByTagName('img')[0];
                            if (img.getAttribute('data-thumb')) {
                                img.src = img.getAttribute('data-thumb');
                            }
                            item.getElementsByTagName('button')[0].setAttribute('data-collection-id', i);
                            collection.getElementsByClassName('dom_collection_body')[0].appendChild(item);
                        }
                    }
                }
            }
        }
    };

    /**
     *
     * Function to remove a collection from page and pub back all subscription in ungrouped
     * @param number collectionId - id of collection to be removed
     *
     */

    var deleteCollection = function(collectionId) {
        var collection = document.getElementById('dom_collection_' + collectionId);
        if (collection) {
            var lis = collection.getElementsByTagName('li');
            var holder = document.querySelector('#sections #container');
            while (lis.length) {
                lis[0].getElementsByTagName('button')[0].removeAttribute('data-collection-id');
                holder.appendChild(lis[0]);
            }
            collection.parentNode.removeChild(collection);
        }

        setTimeout(_reorderCollections, 1000);
    };

    /**
     *
     * Function to correct collection order when a middle zone collection has been removed
     *
     */

    var _reorderCollections = function() {
        var collections = document.getElementsByClassName('dom_collection');
        for (var i = 0; i < collections.length; i++) {
            collections[i].id = 'dom_collection_' + i;
        }
    };

    /*-------------------- Behavioural functions ------------------*/

    /**
     *
     * Behavioural function for drag start on elements
     * Makes element transparent to 0.5
     * Activates removal space over the Collection creation space
     * @param Event $event - event parameter of dom
     *
     */

    var dragStartBehaviour = function(event) {
        dragged = event.target;

        //activate removal space
        setTimeout(function() {
            document.getElementById('collectionRemoval').classList.add('visible');
        }, 10);

        // make it half transparent
        event.target.style.opacity = 0.5;
    };

    /**
     *
     * Behavioural function for drag enter on elements
     * @param Event $event - event parameter of dom
     *
     */

    var dragEnterBehaviour = function(event) {
        if (event.target.classList.contains("dom_collection_header") ||
            event.target.classList.contains("dom_collection_body")) {
            event.target.classList.add('hover');
        }
    };

    /**
     *
     * Behavioural function for drag leave from elements
     * @param Event $event - event parameter of dom
     *
     */

    var dragLeaveBehaviour = function(event) {
        if (event.target.classList.contains("dom_collection_header") ||
            event.target.classList.contains("dom_collection_body")) {
            event.target.classList.remove('hover');
        }
    };

    /**
     *
     * Behavioural function for from at the destination elements
     * @param Event $event - event parameter of dom
     *
     */

    var dragDropBehaviour = function(event) {
        event.preventDefault();
        var tempSubscriptionItemDragged, tempDestinationCollectionId, tempLeavingCollectionID;
        // move dragged elem to the selected drop target
        if (event.target.classList.contains("dom_collection_header") ||
            event.target.classList.contains("dom_collection_body")) {
            if (dragged.classList.contains('dom_collection')) {

                var tempSubscriptionItemsDragged = dragged.getElementsByTagName('li');
                for (var i = 0; i < tempSubscriptionItemsDragged.length; i++) {
                    tempSubscriptionItemsDragged[i] = tempSubscriptionItemsDragged[i].id.split('-guide-item')[0];
                }

                tempDestinationCollectionId = event.target.parentNode.id.split('dom_collection_')[1];

                tempLeavingCollectionID = dragged.id.split('dom_collection_')[1];

                YoutuberCollections.sendMessageToContentScript('updateCollectionItems', {
                    collectionId: tempDestinationCollectionId,
                    leavingCollection: tempLeavingCollectionID,
                    items: tempSubscriptionItemsDragged
                });
            } else {
                event.target.style.opacity = "1";

                tempSubscriptionItemDragged = dragged.id.split('-guide-item')[0];
                tempDestinationCollectionId = event.target.parentNode.id.split('dom_collection_')[1];
                tempLeavingCollectionID = dragged.parentNode.parentNode.parentNode.id.split('dom_collection_')[1];

                YoutuberCollections.sendMessageToContentScript('updateCollectionItems', {
                    collectionId: tempDestinationCollectionId,
                    leavingCollection: tempLeavingCollectionID,
                    items: tempSubscriptionItemDragged
                });
            }
            return;
        }

        if (event.target.classList.contains('collectionRemoval')) {
            if (dragged.classList.contains('dom_collection')) {
                tempLeavingCollectionID = dragged.id.split('dom_collection_')[1];
                YoutuberCollections.sendMessageToContentScript('removeCollection', {
                    collectionId: tempLeavingCollectionID,
                });
            } else {
                tempSubscriptionItemDragged = dragged.id.split('-guide-item')[0];
                tempLeavingCollectionID = dragged.parentNode.parentNode.parentNode.id.split('dom_collection_')[1];

                YoutuberCollections.sendMessageToContentScript('updateCollectionItems', {
                    collectionId: null,
                    leavingCollection: tempLeavingCollectionID,
                    items: tempSubscriptionItemDragged
                });
            }
            document.getElementById('collectionRemoval').classList.remove('visible');
            return;
        }

        var shouldRemove = false;
        var parent = event.target;
        while (parent) {
            if (parent.classList && parent.classList.contains("dom_collection_body")) {
                shouldRemove = false;
                parent = false;
                event.target.style.opacity = "1";
            } else {
                parent = parent.parentNode;
            }
        }

        if (parent != null || parent != false) {
            tempSubscriptionItemDragged = dragged.id.split('-guide-item')[0];
            tempLeavingCollectionID = dragged.parentNode.parentNode.parentNode.id.split('dom_collection_')[1];

            YoutuberCollections.sendMessageToContentScript('updateCollectionItems', {
                collectionId: null,
                leavingCollection: tempLeavingCollectionID,
                items: tempSubscriptionItemDragged
            });
        }


    };

    /**
     *
     * Behavioural function for from at the destination elements
     * @param Event $event - event parameter of dom
     * Makes element opaque again and hides delete container
     *
     */

    var dragEndBehaviour = function(event) {
        event.target.style.opacity = 1;

        //deactivate removal space
        document.getElementById('collectionRemoval').classList.remove('visible');
    };

    /**
     *
     * Behavioural function for resetting state of collections
     *
     */

    var resetSelectionBehaviour = function(e) {
        if (e && e.toElement && (e.toElement.id === 'collections' || e.toElement.classList.contains('collection') || e.toElement.classList.contains('collection_name'))) {
            return;
        }
        var bodies = document.getElementsByClassName('dom_collection_body_wrapper visible');
        for (var i = 0; i < bodies.length; i++) {
            bodies[i].classList.toggle('visible');
        }

        var headers = document.getElementsByClassName('dom_collection_header');
        for (var i = 0; i < headers.length; i++) {
            headers[i].classList.remove('hover');
        }
    };

    var getMenuButton = function(){
        return document.getElementById('guide-button');
    };

    var determineInitializationType = function(){
        if(document.querySelector('#sections #container'))
            return true;

        return false;
    };

    return {
        initialSetup: initialSetup,
        clearCollectionDropdown: clearCollectionDropdown,
        getMenuButton: getMenuButton,
        determineInitializationType: determineInitializationType,

        updateMyCollections: updateMyCollections,
        resetChannelToUngrouped: resetChannelToUngrouped,
        appendCollection: appendCollection,
        deleteCollection: deleteCollection,

        dragStartBehaviour: dragStartBehaviour,
        dragEnterBehaviour: dragEnterBehaviour,
        dragLeaveBehaviour: dragLeaveBehaviour,
        dragDropBehaviour: dragDropBehaviour,
        dragEndBehaviour: dragEndBehaviour,
        resetSelectionBehaviour: resetSelectionBehaviour
    };
}();
