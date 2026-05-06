(function (window, $) {
    "use strict";

    var sliderContainerIdPrefix = "divSlider_";
    var sliderElements = [];
    var activeContainer = null;
    var selectedColourId = 0;

    function initializeSlider(colourId) {
        var sliderInstanceExists = getSliderElement(colourId) != null;

        if (selectedColourId !== colourId) {
            $(".productRollOverPanel .slider-container").hide();
            var sliderContainerElementId = "#" + sliderContainerIdPrefix + colourId;
            activeContainer = $(sliderContainerElementId);
            activeContainer.show();
            $(".productRollOverPanel").removeClass("active");
            if (!$("#productRollOverPanel_" + colourId).hasClass("active"))
                $("#productRollOverPanel_" + colourId).addClass("active");

            if (!sliderInstanceExists) {
                sliderElements.push({
                    colourId: typeof colourId === "string" ? colourId : colourId.toString(),
                });
            }
            selectedColourId = colourId;
        }
    }

    function getVSliderImage(colourId) {
        return $("#" + sliderContainerIdPrefix + colourId).find("img:first");
    }

    function getSliderElement(colourVariantId) {
        if (sliderElements.length === 0) return null;
        if (!colourVariantId) return sliderElements[0];
        var matchedElement = sliderElements.filter(function (s) {
            var colourVariantIdStr = typeof colourVariantId === "string" ? colourVariantId : colourVariantId.toString();
            return s.colourId === colourVariantIdStr;
        });
        return matchedElement[0] && typeof matchedElement[0].colourId !== "undefined"
            ? matchedElement[0].colourId
            : null;
    }

    // Expose globals
    window.productVSlider = {
        initializeSlider: initializeSlider,
        getVSliderImage: getVSliderImage,
    };
})(window, window.jQuery);
