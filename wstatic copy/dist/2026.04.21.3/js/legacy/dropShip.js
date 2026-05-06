(function (window, $, undefined) {
    "use strict";

    function GetDropShipSupplier(e, id, name, override) {
        e.preventDefault();
        e.stopPropagation();
        $.ajax({
            url: "/wcallbacks/dropship?suppliedBy=" + id,
            method: "get",
        })
            .done(function (data, textStatus, jqXHR) {
                if (data) {
                    // show modal
                    var options = {
                        modalName: "DropShipSupplierModal",
                        titleHtml: name,
                        contentHtml: data,
                    };
                    var popupModal = modalHelper.setupModal(options);
                    if (!(override && override.toLowerCase() === "true")) {
                        $(".dropshipSupplierName").html(name);
                    }
                    modalHelper.showModal(popupModal);
                    $(".modal-body", "#DropShipSupplierModal").css("overflow-y", "auto");
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            });
    }

    // Expose globals
    window.dropShipHelper = {
        GetDropShipSupplier: GetDropShipSupplier,
    };
})(window, window.jQuery);
