(function (window, $, undefined) {
    "use strict";
    $(document).ready(function () {
        if (dynamicYieldHybridEnabledForPDP) {
            var productId = dataLayerData.colourVariantId;
            var sequenceId = dataLayerData.productSequenceNumber;
            var productsku = productId + "-" + sequenceId;

            if ($(".dy-hybrid-campaign").length > 0) {
                $(".dy-hybrid-campaign").each(function () {
                    var target = $(this);
                    var dyCampaignSelector = target.attr("dy-campaign-selector");
                    var templateId = "#" + target.attr("template-id");

                    showDyCampaign("PRODUCT", [productsku], dyCampaignSelector, target, templateId);
                });
            }
        }
    });
})(window, window.jQuery);
