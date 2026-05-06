(function (window, undefined) {
    "use strict";

    function closeAdvert() {
        this.parentElement.style.display = "none";
        var advertId = $(this).data("id");
        closeAdvertById(advertId);
    }

    function closeAdvertById(advertId) {
        if (advertId > -1) {
            var dismissedAdverts = sessionStorage.getItem("dismissedAdverts");
            if (dismissedAdverts != null) {
                var dismissedAdvertsItems = JSON.parse(dismissedAdverts);
                if (!dismissedAdvertsItems.indexOf(advertId) == -1) {
                    dismissedAdvertsItems.push(advertId);
                    sessionStorage.setItem("dismissedAdverts", JSON.stringify(dismissedAdvertsItems));
                }
            } else {
                dismissedAdverts = [advertId];
                sessionStorage.setItem("dismissedAdverts", JSON.stringify(dismissedAdverts));
            }
        }
    }

    function init() {
        //check if there are dissmissable adverts
        var banners = document.getElementsByClassName("dismissable-banner");
        if (banners) {
            if (isSessionStorageAvailable()) {
                //check local storage for dismissed advert ids
                var dismissedAdverts = sessionStorage.getItem("dismissedAdverts");
                if (dismissedAdverts != null) {
                    var dismissedAdvertsItems = JSON.parse(dismissedAdverts);
                    for (var i = 0; i < banners.length; i++) {
                        var advertId = $(banners[i]).data("id");
                        if (advertId.length > 0 && !dismissedAdvertsItems.indexOf(advertId) == -1) {
                            banners[i].style.display = "block";
                        }
                    }
                } else {
                    for (var i = 0; i < banners.length; i++) {
                        banners[i].style.display = "block";
                    }
                }
            }
        }

        var closeElement = document.getElementById("closeAdvert");
        if (closeElement) {
            closeElement.addEventListener("click", closeAdvert);
        }

        var elements = document.getElementsByClassName("closingIcon");

        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener(
                "click",
                function () {
                    var a = findUpClass(elements[i], "dismissable-banner"); // search <a ...>
                    if (a) {
                        var bannerId = a.getAttribute("data-id");
                        if (bannerId) {
                            closeAdvertById(bannerId);
                        }
                    }
                },
                false,
            );
        }
    }

    function findUpClass(el, className) {
        while (el.parentNode) {
            el = el.parentNode;
            if (el.classList.contains(className)) return el;
        }
        return null;
    }

    function isSessionStorageAvailable() {
        var test = "test";
        try {
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    (function ready() {
        if (document.readyState !== "loading") {
            init();
        } else {
            document.addEventListener("DOMContentLoaded", function () {
                init();
            });
        }
    })();
})(window);
