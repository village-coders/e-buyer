var slideUpModalDialogElem = $("#slide-up-modal-dialog");
var slideUpModalOverlayClass = "slide-up-modal-has-overlay";
var slideUpModalPositionXRightClass = "slide-up-modal-position-x-right";
var slideUpModalPositionXLeftClass = "slide-up-modal-position-x-left";
var slideUpModalPositionXCenterClass = "slide-up-modal-position-x-center";
var slideUpModalPositionYTopClass = "slide-up-modal-position-y-top";
var slideUpModalPositionYMiddleClass = "slide-up-modal-position-y-middle";
var slideUpModalPositionYBottomClass = "slide-up-modal-position-y-bottom";

var slideUpModalDialog = {
    setup: function (options) {
        _setupSlideUpModal(options);
    },
    show: function () {
        slideUpModalDialogElem.addClass("slide-up-modal-dialog-active");
    },
    hide: function () {
        slideUpModalDialogElem.removeClass("slide-up-modal-dialog-active");
    },
};

$(function () {
    _bindSlideUpModalEvents();
});

function _setupSlideUpModal(options) {
    var defaults = {
        showOverlay: true,
        positionY: "bottom",
        positionX: "right",
    };

    var settings = $.extend({}, defaults, options);

    _removeAllStylingClasses();

    if (settings.showOverlay) {
        slideUpModalDialogElem.addClass(slideUpModalOverlayClass);
    }

    switch (settings.positionX) {
        case "right":
            slideUpModalDialogElem.addClass(slideUpModalPositionXRightClass);
            break;
        case "left":
            slideUpModalDialogElem.addClass(slideUpModalPositionXLeftClass);
            break;
        default:
            slideUpModalDialogElem.addClass(slideUpModalPositionXCenterClass);
            break;
    }

    switch (settings.positionY) {
        case "top":
            slideUpModalDialogElem.addClass(slideUpModalPositionYTopClass);
            break;
        case "middle":
            slideUpModalDialogElem.addClass(slideUpModalPositionYMiddleClass);
            break;
        default:
            slideUpModalDialogElem.addClass(slideUpModalPositionYBottomClass);
            break;
    }
}

function _bindSlideUpModalEvents() {
    slideUpModalDialogElem.find('[data-action="close-slide-up-modal-dialog"]').on("click", function () {
        slideUpModalDialog.hide();
    });

    document.getElementById("slide-up-modal-dialog")?.addEventListener("click", (e) => {
        if (
            e.target == slideUpModalDialogElem[0] &&
            e.target != slideUpModalDialogElem.find(".slide-up-modal-dialog-content")[0]
        ) {
            slideUpModalDialog.hide();
        }
    });
}

function _removeAllStylingClasses() {
    slideUpModalDialogElem.removeClass(
        `${slideUpModalOverlayClass} ` +
            `${slideUpModalPositionXRightClass} ${slideUpModalPositionXLeftClass} ${slideUpModalPositionXCenterClass} ` +
            `${slideUpModalPositionYTopClass} ${slideUpModalPositionYMiddleClass} ${slideUpModalPositionYBottomClass}`,
    );
}
