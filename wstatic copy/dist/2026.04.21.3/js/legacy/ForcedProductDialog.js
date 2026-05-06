(function (window, $, undefined) {
    "use strict";

    var dialog = null;
    var isInitiated = false;

    function init() {
        if (isInitiated) {
            return;
        }
        var modalBodyContent =
            '<div id="workarea" class="text-center"> </div> <div class="buttoncontainer" role="group"> ' +
            '<span class="ImgButWrap"><a href="#" class="btn btn-default btnYes" role="button"></a></span> ' +
            '<span class ="ImgButWrap"><a href="#" class="btn btn-default btnNo" role="button"></a></span>' +
            " </div>";

        var options = {
            contentHtml: modalBodyContent,
            modalName: "BasketModal",
        };
        dialog = modalHelper.setupModal(options);

        dialog.find("#workarea").append($('div[id$="divForcedProductDialog"]'));

        $('div[id$="divForcedProductDialog"]').css("text-align", "center");

        isInitiated = true;
    }

    function isAvailable() {
        return $("#hdnForceProductText").val() && $("#hdnForceItemsToBasketPromptButtonStyle").val() && !IsMobileView();
    }

    function show(onClose) {
        init();
        var promptButtonStyleValue = $("#hdnForceItemsToBasketPromptButtonStyle").val();
        var hasOkBtnOnly = promptButtonStyleValue.length > 0 && promptButtonStyleValue.toUpperCase() == "OK";
        var additionalCssClass = $("#hdnForceItemsToBasketPromptClass").val();

        if (typeof additionalCssClass != "undefined" && additionalCssClass.length > 0) {
            dialog.addClass(additionalCssClass);
        }

        var divForcedProductDialog = $('div[id$="divForcedProductDialog"]');
        divForcedProductDialog.css("display", "block");

        modalHelper.showModal(dialog);
        dialog.find(".header-text").text(divForcedProductDialog.data("messagetext"));

        var btnYes = dialog.find(".btnYes");
        var btnNo = dialog.find(".btnNo");
        var btnClose = dialog.find(".close");

        btnYes.text(divForcedProductDialog.data("forcedproductdialogtextyes"));
        btnNo.text(divForcedProductDialog.data("forcedproductdialogtextno"));

        if (hasOkBtnOnly) {
            btnYes.text(divForcedProductDialog.data("forcedproductdialogtextok"));
            btnNo.css("display", "none");
        }

        var callbackCalled = false;

        function closeDialog(accepted) {
            if (callbackCalled) {
                return;
            }
            onClose(accepted);
            callbackCalled = true;
            modalHelper.hideModal(dialog);
            dialog.removeClass(additionalCssClass);
        }

        btnYes.unbind("click").bind("click", function (e) {
            e.preventDefault();
            closeDialog(true);
        });
        btnNo.unbind("click").bind("click", function (e) {
            e.preventDefault();
            closeDialog(false);
        });
        btnClose.unbind("click").bind("click", function () {
            closeDialog(false);
        });
        dialog.bind("hidden.bs.modal", function () {
            closeDialog(false);
        });
    }

    // Expose globals
    window.forcedProductDialog = {
        isAvailable: isAvailable,
        show: show,
    };
})(window, window.jQuery);
