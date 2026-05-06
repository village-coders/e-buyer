var modalHelper = {
    //Configures and adds a Modal to a page
    setupModal: function (options) {
        var defaults = {
            contentHtml: null,
            titleHtml: null,
            iFrameUrl: null,
            iFrameOptions: {},
            modalName: "PopupModal",
            cssClass: null,
            titleDiv: null,
            bodyDiv: null,
            attributeObject: null,
            customCloseButton: null,
            modalFooter: null,
            fillScreenOnMobile: false,
            preventDefaultCloseButtonBehaviour: false,
            showLoader: false,
        };

        //Creates the settings, preserving the defaults
        var settings = $.extend({}, defaults, options);

        //Add the modal to the page
        var div =
            '<div id="' +
            settings.modalName +
            '" class="modal" role="dialog">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal">×</button>' +
            '<div class="text-center">' +
            '<span class="header-text"></span>' +
            "</div>" +
            "</div> " +
            '<div class="modal-body">' +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>";
        $("body").append(div);

        //Adds custom attributes to the modal
        if (settings.attributeObject != null) {
            $.each(settings.attributeObject, function (key, value) {
                $("#" + settings.modalName).data(key, value);
            });
        }

        function isNullOrWhitespace(input) {
            if (typeof input === "undefined" || input == null) {
                return true;
            }
            return input.replace(/\s/g, "").length < 1;
        }

        //Keeps the page from scrolling while modal is active
        $("#" + settings.modalName).on("show.bs.modal", function () {
            setTimeout(centerModalOnShow, 0);
            //trigger scroll event
            $(window).scroll();
        });

        //Adds Iframe to modal body if required
        if (!isNullOrWhitespace(settings.iFrameUrl)) {
            modalHelper.OpenIFrameModal($("#" + settings.modalName), settings.iFrameOptions, settings.iFrameUrl, true);
        }

        //Adds Css classes to the modal
        if (!isNullOrWhitespace(settings.cssClass)) {
            var dialog = $("#" + settings.modalName).find(".modal-dialog");
            dialog.addClass(settings.cssClass);
        }

        //Adds html to the model header
        if (!isNullOrWhitespace(settings.titleHtml)) {
            $(".header-text", $("#" + settings.modalName)).html(settings.titleHtml);
        }

        //Adds html to the modal body
        if (!isNullOrWhitespace(settings.contentHtml)) {
            $(".modal-body", $("#" + settings.modalName)).html(settings.contentHtml);
        }

        //Adds div to modal header
        if (!isNullOrWhitespace(settings.titleDiv)) {
            $(".header-text", $("#" + settings.modalName)).append($("#" + settings.titleDiv));
            $("#" + settings.titleDiv).css("display", "block");
        }

        //Adds div to modal body
        if (!isNullOrWhitespace(settings.bodyDiv)) {
            $(".modal-body", $("#" + settings.modalName)).append($("#" + settings.bodyDiv));
            $("#" + settings.bodyDiv).css("display", "block");
        }

        //Add footer to modal
        if (!isNullOrWhitespace(settings.modalFooter)) {
            $("#" + settings.modalName)
                .find(".modal-content")
                .append($("#" + settings.modalFooter));
            $("#" + settings.modalFooter).css("display", "block");
        }

        //Removes default close button and adds a custom close button
        if (!isNullOrWhitespace(settings.customCloseButton)) {
            $("#" + settings.modalName)
                .find(".close")
                .remove();
            $("#" + settings.modalName)
                .find(".text-center")
                .append(settings.customCloseButton);
        }

        if (settings.preventDefaultCloseButtonBehaviour) {
            document.getElementById(settings.modalName).querySelector(".close").removeAttribute("data-dismiss");
        }

        function centerModalOnShow() {
            if ($("#hdnProductZoomFullscreenEnabled").val() === "true") {
                // don't change dimensions if full screen
                return;
            }
            var $modalElement = $("#" + settings.modalName);
            var windowHeight = $(window).height();
            var bodyAvailableHeight = windowHeight - $modalElement.find(".modal-header").height();
            var $modalBody = $modalElement.find(".modal-body");
            var $modalDialog = $modalElement.find(".modal-dialog");
            $modalBody.css("max-height", bodyAvailableHeight + "px");
            if ($(window).width() < 768 && settings.fillScreenOnMobile) {
                $modalBody.css("height", bodyAvailableHeight + "px");
                $modalDialog.css("margin-top", 0);
            } else {
                $modalBody.css("height", "");
                $modalDialog.css("margin-top", Math.max(0, (windowHeight - $modalDialog.height()) / 2));
            }
        }

        $(window).resize(centerModalOnShow);

        return $("#" + settings.modalName);
    },

    //Adds an Iframe to the modal body
    OpenIFrameModal: function (modalSelector, modalOptions, iframeUrl, isScrollBarVisible) {
        var $modalElement = $(modalSelector);
        var modalBodyElement = $modalElement.find(".modal-body");
        if (typeof isScrollBarVisible === "undefined") {
            modalBodyElement.html(
                '<iframe width="100%" height="100%" frameborder="0" scrolling="no" allowtransparency="true" src="' +
                    iframeUrl +
                    '"></iframe>',
            );
        } else {
            if (isScrollBarVisible) {
                modalBodyElement.html(
                    '<iframe width="100%" height="100%" frameborder="0" scrolling="yes" allowtransparency="true" src="' +
                        iframeUrl +
                        '"></iframe>',
                );
            }
        }
        var modalShown = modalHelper.showModal($modalElement, modalOptions);
        if (modalShown) {
            $modalElement.on("hidden.bs.modal", function () {
                modalBodyElement.empty();
            });
        }
        return modalShown;
    },

    showModal: function (modal, modalOptions) {
        //If a modal is already open
        if ($(".modal-dialog:visible").length != 0) {
            return false;
        }
        modal.modal(modalOptions);
        return true;
    },

    hideModal: function (modal) {
        modal.modal("hide");
    },
};
