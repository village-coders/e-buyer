(function (window, undefined) {
    "use strict";

    var originalContext;

    function setQuickViewProductContext(productSKU) {
        if (window.DY) {
            window.DY.recommendationContext = { type: "PRODUCT", lng: originalContext.lng, data: [productSKU] };
        }
    }

    function setOriginalContext() {
        if (window.DY && originalContext) {
            window.DY.recommendationContext = originalContext;
        }
    }

    function updateProductContext(selectedColourVarId) {
        if (
            window.DY &&
            window.DY.recommendationContext &&
            window.DY.recommendationContext.data &&
            window.DY.recommendationContext.data[0]
        ) {
            var skuParts = window.DY.recommendationContext.data[0].split("-");
            if (skuParts.length == 2) {
                //replace the productId and keep the sequence number
                window.DY.recommendationContext = {
                    type: "PRODUCT",
                    lng: originalContext.lng,
                    data: [selectedColourVarId + "-" + skuParts[1]],
                };
            }
        }
    }

    $(function () {
        if (window.DY && window.DY.recommendationContext) {
            originalContext = window.DY.recommendationContext;
        }
    });

    // Expose globals
    window.dyUtil = {
        setQuickViewProductContext: setQuickViewProductContext,
        setOriginalContext: setOriginalContext,
        updateProductContext: updateProductContext,
    };
})(window);
