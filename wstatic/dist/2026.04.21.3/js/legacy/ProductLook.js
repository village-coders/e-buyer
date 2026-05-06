(function (window, $, productDetailsShared, Handlebars, productDetailSwiper) {
    "use strict";

    var currentGetProductLookXhr = null;
    var prdTemplate = $("#products-template").html();
    var productApiRequestUrl = "/productdetail/productlook/";

    function updateLook() {
        if (currentGetProductLookXhr != null) currentGetProductLookXhr.abort();

        var selectedVariant = productDetailsShared.getCurrentColourVariant();
        if (selectedVariant == null) {
            return;
        }

        var lookId = selectedVariant.ProductLookId;

        if (lookId == null) {
            clearLook();
            return;
        }

        currentGetProductLookXhr = $.ajax({
            cache: true,
            type: "GET",
            url: productApiRequestUrl,
            data: { lookId: lookId },
            dataType: "json",
            success: function (data) {
                if (data != null) {
                    bindProductLookData(data);
                } else {
                    logError("Product look data endpoint returned null");
                    clearLook();
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                if (textStatus != "abort") {
                    logError(textStatus + errorThrown);
                    clearLook();
                }
            },
            complete: function (data) {
                currentGetProductLookXhr = null;
            },
        });
    }

    function clearLook() {
        $(".ShopTheLook").addClass("ShopTheLook-hide");
    }

    function bindProductLookData(data) {
        var hasProducts = data != null && data.productListingModel.products.length > 0;
        var noProductsText = $("#productlistcontainer").data("noproductstext");
        var template = Handlebars.compile(prdTemplate);
        var html = hasProducts ? template(data.productListingModel) : "<li>" + noProductsText + "</li>";

        $("#productlistcontainer").addClass("swiper-container").addClass("swiper-container-shop-the-look");
        $(".ShopTheLook .LookProducts ul").addClass("swiper-wrapper");
        $(".ShopTheLook .LookProducts ul").html(html);
        $(".ShopTheLook .LookProducts ul li").addClass("swiper-slide");

        $(".ShopTheLook h2.LookHeader").html(data.lookDisplayName);
        $(".ShopTheLook .LookImage img").attr("src", data.lookImageUrl);

        if (
            !$(".ShopTheLook .shopLookImg")
                ?.css("background-image")
                ?.replace(/^url\(['"](.+)['"]\)/, "$1")
                .includes(data.lookImageUrl)
        )
            $(".ShopTheLook .shopLookImg").css("background-image", "url('" + data.lookImageUrl + "')");

        var currentCssClass = $(".ShopTheLook").attr("class").split(" ").pop();
        $(".ShopTheLook").removeClass(currentCssClass);
        $(".ShopTheLook").addClass(data.cssClass);

        initializeLook();

        $(".ShopTheLook").show();
    }

    function initializeLook() {
        if ($(".ShopTheLook").length > 0) {
            productDetailSwiper.initializeShopTheLookSwiper();
            InitializeQuickBuyAndWishListEvents();
        }
    }

    function logError(error) {
        if (typeof window.logClientScriptException === "function") {
            window.logClientScriptException(error);
        } else {
            if (console) {
                console.error(error);
            }
        }
    }

    function InitializeQuickBuyAndWishListEvents() {
        if (typeof window.initializeHotspotsQuickBuyAndWishListEvents == "function") {
            window.initializeHotspotsQuickBuyAndWishListEvents("div.productimage.s-productthumbimage");
        }
    }

    // expose globals
    window.productLook = {
        updateLook: updateLook,
        initializeLook: initializeLook,
    };
})(window, window.jQuery, window.productDetailsShared, window.Handlebars, window.productDetailSwiper);
