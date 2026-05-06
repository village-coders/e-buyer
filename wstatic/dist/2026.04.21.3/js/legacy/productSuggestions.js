(function (window, $, undefined) {
    "use strict";

    $(document).ready(function () {
        var suggestions = null;
        var loadHandlerFired = false;
        var sliders = [];
        var sliderBound = false;

        if (typeof productSuggestData != "undefined" && productSuggestData != null) {
            var apiMethod = productSuggestData.apiMethod;
            var idParamName = productSuggestData.idParamName;
            var idParamValue = productSuggestData.idParamValue;

            var numPlacements = $("div.PSPlacementWrapper").length;

            if (apiMethod.length == 0 || numPlacements == 0) {
                return;
            }

            var apiUrl = "/api/productsuggestions/v1/" + apiMethod + "?";

            if (idParamName != null && idParamName.length > 0) {
                apiUrl = apiUrl + idParamName + "=" + idParamValue + "&";
            }

            apiUrl = apiUrl + "numPlacements=" + numPlacements + "&ItemType=product";

            $.ajax({
                url: apiUrl,
                dataType: "json",
                success: function (data) {
                    suggestions = data;
                    renderSuggestions();
                },
            });

            window.addEventListener("load", function () {
                loadHandlerFired = true;
                renderSuggestions();
            });
        }

        function renderSuggestions() {
            //Don't render until we have data and the load event has fired
            if (!loadHandlerFired || suggestions == null) return;

            var i = 0;
            $("div.PSPlacementWrapper").each(function () {
                var that = $(this),
                    templateName = that.data("templatename"),
                    templateClass = that.data("templateclass"),
                    from = that.data("from"),
                    maxProductsStr = that.data("maxproducts"),
                    quicklook = that.data("quicklook"),
                    quickBuyEnabled = that.data("quickbuyenabled"),
                    quickBuyText = that.data("quickbuytext"),
                    wishListEnabled = that.data("wishlistenabled"),
                    wishListText = that.data("wishlisttext"),
                    userIsLoggedIn = that.data("userisloggedin"),
                    maxProducts = parseInt(maxProductsStr),
                    template = psTemplates.getTemplate(
                        templateName,
                        templateClass,
                        from,
                        quicklook,
                        tpPrefix,
                        quickBuyEnabled,
                        quickBuyText,
                        wishListEnabled,
                        wishListText,
                        userIsLoggedIn,
                    ),
                    currentSuggestion = suggestions[i];
                i++;
                if (currentSuggestion == null) {
                    return;
                }
                if (currentSuggestion.products.length > maxProducts) {
                    currentSuggestion.products = currentSuggestion.products.slice(0, maxProducts);
                }
                var placementTemplate = window.Handlebars.compile(template);
                var html = placementTemplate(JSON.parse(JSON.stringify(currentSuggestion)));
                that.html(html);
            });

            var gtmProducts = [];
            $("div.SuggestedProduct").each(function () {
                try {
                    var placementPos = $(this).data("placementpos");
                    var productPos = $(this).data("productpos");
                    var productId = $(this).attr("data-productid"); // Use attr as we do not want it to be read as a number
                    var productName = $(this).data("productname");

                    gtmProducts[gtmProducts.length] = {
                        variantId: productId,
                        productName: productName,
                        placementPosition: placementPos.toString(),
                        productPosition: productPos.toString(),
                    };

                    // Add class for desktop; mobile and tablet handled by swipe plugin
                    var liClass = "swiper-slide col-md-2";

                    $(this).parent().addClass(liClass);
                } catch (e) {}
            });

            try {
                if (window.parent.dataLayer != null && gtmProducts.length > 0) {
                    window.parent.dataLayer.push({
                        event: catShortName + "_recommendedProducts",
                        recommendedProducts: gtmProducts,
                    });
                }
            } catch (e) {}

            $("div.SuggestedProduct").click(function () {
                try {
                    var placementPos = $(this).data("placementpos");
                    var productPos = $(this).data("productpos");
                    var productId = $(this).attr("data-productid"); // Use attr as we do not want it to be read as a number
                    var productName = $(this).data("productname");

                    if (window.parent.dataLayer != null) {
                        window.parent.dataLayer.push({
                            event: catShortName + "_recommendedClick",
                            clickedProduct: {
                                variantId: productId,
                                productName: productName,
                                placementPosition: placementPos.toString(),
                                productPosition: productPos.toString(),
                            },
                        });
                    }
                } catch (e) {}
            });

            InitializeSwipeEvent();

            if (typeof window.initializeHotspotsQuickBuyAndWishListEvents == "function") {
                window.initializeHotspotsQuickBuyAndWishListEvents("div.SuggestedProduct");
            }
        }

        function InitializeSwipeEvent() {
            if (inModileView()) {
                $(".ps-swiper-container").each(function () {
                    var direction = "horizontal";
                    if ($(this).parent().hasClass("PSPlacementVertical")) {
                        direction = "vertical";
                    }
                    if (direction == "horizontal") {
                        $(this).find(".swiper-slide").css({ width: "200px" });
                    }

                    // currently only add swipe to horizontal adds
                    if (direction == "horizontal") {
                        sliders.push(
                            new Swiper(".ps-swiper-container", {
                                mode: direction,
                                slidesPerView: "auto",
                                freeMode: true,
                                freeModeFluid: true,
                                navigation: {
                                    nextEl: ".ps-swiper-button-next",
                                    prevEl: ".ps-swiper-button-prev",
                                },
                            }),
                        );
                        sliderBound = true;
                    }
                });
            }
        }

        $(window).resize(function () {
            if (inModileView() && sliderBound == false) {
                InitializeSwipeEvent();
            } else if (!inModileView() && sliderBound == true) {
                $(sliders).each(function () {
                    $(this)[0].destroy();
                });
                $(".ps-swiper-container").find(".swiper-wrapper").removeAttr("style");
                $(".ps-swiper-container").find(".swiper-slide").removeAttr("style");
                $(".ps-swiper-container").removeData("swiper");
                sliders = [];
                sliderBound = false;
            }
        });

        function inModileView() {
            return $("div[id=InResponsive]:visible").length > 0;
        }
    });
})(window, window.jQuery);
