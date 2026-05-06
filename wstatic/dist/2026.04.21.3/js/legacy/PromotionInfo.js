$(function () {
    var enableModal = true;

    if (typeof promotionalDetailsPopupEnabled !== "undefined" && !promotionalDetailsPopupEnabled) {
        enableModal = false;
    }

    if (enableModal) {
        var gwpPromotionModal = modalHelper.setupModal({
            modalName: "GwpPromotionDetailModal",
            bodyDiv: "gwp-promotion-modal",
        });

        var freeSamplesPromotionModal = modalHelper.setupModal({
            modalName: "FsPromotionDetailModal",
            bodyDiv: "fs-promotion-modal",
        });

        var showPromotionDetail = function (e) {
            e.preventDefault();

            var parentDiv = e.currentTarget.parentElement;
            var promoType = $(parentDiv).data("promo-type");

            if (promoType == "FreeSamples") {
                modalHelper.showModal(freeSamplesPromotionModal);
            }

            if (promoType == "GiftWithPurchase") {
                modalHelper.showModal(gwpPromotionModal);
            }
        };

        $(".promotionInfo").on("click", showPromotionDetail);

        $(".promotionInfo a").click(function (evt) {
            evt.stopPropagation();
        });
    }
});
