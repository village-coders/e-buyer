(function (window, undefined) {
    "use strict";

    const storageProductQueries = "FG_PlpSelections";
    const itemMaxLimit = 10;

    window.addEventListener("ordercomplete", sendGTMPurchaseEvents);

    function getSearchProducts() {
        var result;
        try {
            result = JSON.parse(localStorage.getItem(storageProductQueries));
        } catch (e) {
            // Do nothing
        }
        return result;
    }

    function addOrUpdateSearchItemDetails(productId, searchIndex, searchQueryId, objectId, objectIndex) {
        if (productId && searchIndex && searchQueryId && objectId && objectIndex && isLocalStorageAvailable()) {
            var queries = getSearchProducts() || [];
            var newQuery = {
                id: productId,
                index: searchIndex,
                query: searchQueryId,
                object: objectId,
                order: objectIndex,
            };
            for (var i = 0; i < queries.length; i++) {
                if (queries[i].id === productId) {
                    queries.splice(i, 1);
                    break;
                }
            }
            if (queries.length >= itemMaxLimit) {
                queries.shift();
            }
            queries.push(newQuery);
            localStorage.setItem(storageProductQueries, JSON.stringify(queries));
        }
    }

    function getSearchedProductDetails(productId) {
        try {
            if (isLocalStorageAvailable()) {
                var queries = getSearchProducts();
                if (queries) {
                    var searchItem = findObjectByKey(queries, "id", productId);
                    if (searchItem) {
                        return searchItem;
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
        return null;
    }

    function findObjectByKey(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return array[i];
            }
        }
        return null;
    }

    function isLocalStorageAvailable() {
        var test = "test";
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    function getAttributeValue(clickedElement, attributeName) {
        return $(clickedElement)
            .closest("[" + attributeName + "]")
            .attr(attributeName);
    }

    function saveSearchAttributes(element, productId) {
        try {
            if (algoliaIsActive(element)) {
                const index =
                    getAttributeValue(element, "data-insights-index") ||
                    $("#ProductContainer").attr("data-insights-index");
                const queryId =
                    getAttributeValue(element, "data-insights-query-id") ||
                    $("#ProductContainer").attr("data-insights-query-id");
                addOrUpdateSearchItemDetails(
                    productId,
                    index,
                    queryId,
                    getAttributeValue(element, "data-insights-object-id"),
                    getAttributeValue(element, "data-insights-position"),
                );
            }
        } catch (e) {
            console.log(e);
        }
    }

    function bindAlgloliaDataAttributes(selector, productId) {
        var searchItemDetails = getSearchedProductDetails(productId);
        if (searchItemDetails) {
            $(selector)
                .attr("data-insights-index", searchItemDetails.index)
                .attr("data-insights-query-id", searchItemDetails.query)
                .attr("data-insights-object-id", searchItemDetails.object)
                .attr("data-insights-position", searchItemDetails.order);
        } else {
            $(selector)
                .removeAttr("data-insights-index")
                .removeAttr("data-insights-query-id")
                .removeAttr("data-insights-object-id")
                .removeAttr("data-insights-position");
        }
    }

    function setRootSearchDataAttributes(queryId, searchIndex) {
        if (algoliaIsActive()) {
            $("#ProductContainer").attr("data-insights-index", searchIndex);
            $("#ProductContainer").attr("data-insights-query-id", queryId);
        }
    }

    function algoliaIsActive(element) {
        if (element)
            return (
                getAttributeValue(element, "data-insights-index") &&
                getAttributeValue(element, "data-insights-query-id")
            );

        return (
            $("#ProductContainer").attr("data-insights-index") && $("#ProductContainer").attr("data-insights-query-id")
        );
    }

    // Sends one purchase event to GTM for each product in the order
    function sendGTMPurchaseEvents(orderCompleteEvent) {
        try {
            const orderItems = orderCompleteEvent.detail;
            orderItems.forEach((item) => {
                const plpSelection = getSearchedProductDetails(item.productid);
                if (plpSelection) {
                    window.parent.dataLayer.push({
                        event: "algolia_purchase",
                        algolia_purchase_index: plpSelection.index,
                        algolia_purchase_query: plpSelection.query,
                        algolia_purchase_objectid: [item.productid],
                        algolia_purchase_price: item.productprice,
                        algolia_purchase_quantity: item.productqty,
                    });
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    // Expose globals
    window.algoliaUtil = {
        saveSearchAttributes: saveSearchAttributes,
        bindAlgloliaDataAttributes: bindAlgloliaDataAttributes,
        setRootSearchDataAttributes: setRootSearchDataAttributes,
    };
})(window);
