(function (window, $, undefined) {
    "use strict";

    var config = {
        advertPopupOnIdle: true,
        advertPopupTimeWaitInSeconds: 60,
        advertPopupCookieAgeInDays: 30,
        advertCookieName: "AdvertCookie",
        advertPopupPageUrl: "",
        timeoutHandler: null,
        advertPopupSelector: "#advertPopup",
        popupMode: "inline",
    };

    function advertPopupClose() {
        setPopupShownCookie();
        $(config.advertPopupSelector).unbind("hidden.bs.modal", advertPopupClose);
        window.parent.dataLayer.push({
            event: "advertPopup",
            advertPopupAction: "dismissed",
        });
    }

    function advertPopupOpen() {
        setPopupShownCookie();
        $(config.advertPopupSelector).unbind("shown.bs.modal", advertPopupOpen);
        window.parent.dataLayer.push({
            event: "advertPopup",
            advertPopupAction: "displayed",
        });
    }

    function setupAdvertPopupIdle() {
        $(document).unbind("mousemove keypress mousewheel touchmove", timeoutBindingFunction);
        $(config.advertPopupSelector).attr("data-label", "OpenedOnIdle");
        $(config.advertPopupSelector).addClass("OpenedOnIdle");
        if (config.popupMode == "inline") {
            setUpAdvertPopup();
        } else {
            setUpAdvertPopupIframe();
        }
    }

    function setupAdvertPopupTime() {
        $(config.advertPopupSelector).attr("data-label", "OpenedByTime");
        $(config.advertPopupSelector).addClass("OpenedByTime");
        if (config.popupMode == "inline") {
            setUpAdvertPopup();
        } else {
            setUpAdvertPopupIframe();
        }
    }

    function setUpAdvertPopup() {
        var advertModal = $(config.advertPopupSelector);
        advertModal.bind("hidden.bs.modal", advertPopupClose);
        advertModal.bind("shown.bs.modal", advertPopupOpen);
        modalHelper.showModal(advertModal);
    }

    function setUpAdvertPopupIframe() {
        var advertModal = $(config.advertPopupSelector);
        advertModal.bind("hidden.bs.modal", advertPopupClose);
        advertModal.bind("shown.bs.modal", advertPopupOpen);
        modalHelper.OpenIFrameModal(advertModal, {}, config.advertPopupPageUrl, true);
    }

    function setPopupShownCookie() {
        setCookieValue(config.advertCookieName, "true", config.advertPopupCookieAgeInDays, "/");
    }

    function timeoutBindingFunction() {
        var myTimeoutHandle = config.timeoutHandler;
        clearTimeout(myTimeoutHandle);
        myTimeoutHandle = window.setTimeout(setupAdvertPopupIdle, config.advertPopupTimeWaitInSeconds * 1000);
        config.timeoutHandler = myTimeoutHandle;
    }

    function start() {
        if (!getCookie(config.advertCookieName)) {
            if (config.advertPopupOnIdle === true) {
                config.timeoutHandler = window.setTimeout(
                    setupAdvertPopupIdle,
                    config.advertPopupTimeWaitInSeconds * 1000,
                );
                $(document).bind("mousemove keypress mousewheel touchmove", timeoutBindingFunction);
            } else {
                window.setTimeout(setupAdvertPopupTime, config.advertPopupTimeWaitInSeconds * 1000);
            }
        }
    }

    function isSupressedForAmp(attributesEl) {
        var search = window.location.search;
        var supressQueries = attributesEl.data("advertsupressqueries") || "";
        if (search === "" || supressQueries === "") {
            return false;
        }

        var supressFor = supressQueries.split(",");
        var isSupressed = false;
        for (var i = 0; i < supressFor.length; i++) {
            if (search.indexOf(supressFor[i]) > -1) {
                isSupressed = true;
            }
        }
        return isSupressed;
    }

    function isSuppressed(attributesEl) {
        try {
            if (window.location.search.indexOf("disablepopups") != -1 || isSupressedForAmp(attributesEl)) return true;
            if (typeof window.suppressAdvertPopup == "boolean") return window.suppressAdvertPopup;
            return false;
        } catch (e) {
            console.error("AdvertPopup error");
            console.error(e);
            return false;
        }
    }

    function popupMode(dataAttributes) {
        try {
            var queryString = window.location.search.slice(1);
            if (queryString) {
                // split query string into its component parts
                var arr = queryString.split("&");
                for (var i = 0; i < arr.length; i++) {
                    // separate the keys and the values
                    var queryStringParameter = arr[i].split("=");
                    var paramName = queryStringParameter[0];
                    var paramValue = queryStringParameter[1];
                    if (paramName === "advertpopupmode") {
                        return paramValue;
                    }
                }
            }

            if (typeof window.advertPopupMode !== "undefined") {
                return window.advertPopupMode;
            }

            return dataAttributes.data("advertpopupmode");
        } catch (e) {
            console.error("AdvertPopup error");
            console.error(e);
            return false;
        }
    }

    function init() {
        var $advertPopupAttributes = $("#AdvertPopupAttributes");
        if ($advertPopupAttributes.data("advertpopupenabled") === true && !isSuppressed($advertPopupAttributes)) {
            config.popupMode = popupMode($advertPopupAttributes);
            // Do not proceed if popup mode value is not valid.
            if (config.popupMode === "inline" || config.popupMode === "iframe") {
                var addPopupDiv = false;
                if (config.popupMode == "iframe") {
                    $(config.advertPopupSelector).remove();
                    addPopupDiv = true;
                }

                var advertModal = modalHelper.setupModal({
                    modalName: "advertPopup",
                    attributeObject: $advertPopupAttributes.data(),
                    cssClass: "advertPopup",
                    addPopupDiv: addPopupDiv,
                });

                config.advertPopupTimeWaitInSeconds = advertModal.data("advertpopuptimetowaitinseconds");
                config.advertPopupOnIdle = advertModal.data("advertpopfireonidle");
                config.advertPopupCookieAgeInDays = advertModal.data("advertpopupcookieageindays");
                config.advertPopupPageUrl = advertModal.data("advertpopuppageurl");
                config.advertCookieName = advertModal.data("advertcookiename");
                start();
            }
        }
    }

    $(init);
})(window, window.jQuery);
