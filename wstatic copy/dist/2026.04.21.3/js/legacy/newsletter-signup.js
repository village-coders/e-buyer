(function (window, $, undefined) {
    "use strict";

    var mailinglistPopOver = {
        config: {
            timeoutInterval: 60, // seconds
            timeoutHandle: null,
            cookieName: document.getElementById("hidNewsLetterCookieName").value || "newsletterPoppedUp",
            daysCookiesAcceptanceValid: document.getElementById("hidNewsLetterCookieAgeInDays").value || 365,
        },
        signupPage: function () {
            return $("#NewsLetterModal").data("mailinglistsignuppage");
        },
        setupMailSubscription: function () {
            mailinglistPopOver.unbindDocumentForIdle();
            $("#NewsLetterModal").attr("data-label", "OpenedOnIdle");
            $("#NewsLetterModal").addClass("OpenedOnIdle");

            var signupPage = mailinglistPopOver.signupPage();
            window.setUpNewsletterModal(
                signupPage,
                null,
                null,
                mailinglistPopOver.setShownCookie,
                mailinglistPopOver.setShownCookie,
            );
        },
        timeoutBindingFunction: function () {
            var myTimeoutHandle = mailinglistPopOver.config.timeoutHandle;
            clearTimeout(myTimeoutHandle);
            myTimeoutHandle = window.setTimeout(
                mailinglistPopOver.setupMailSubscription,
                mailinglistPopOver.config.timeoutInterval * 1000,
            );
            mailinglistPopOver.config.timeoutHandle = myTimeoutHandle;
        },
        unbindDocumentForIdle: function () {
            $(document).unbind("mousemove keypress mousewheel touchmove", mailinglistPopOver.timeoutBindingFunction);
        },
        setShownCookie: function () {
            setCookieValue(
                mailinglistPopOver.config.cookieName,
                "true",
                mailinglistPopOver.config.daysCookiesAcceptanceValid,
            );
        },
        start: function () {
            if (!getCookie(mailinglistPopOver.config.cookieName)) {
                mailinglistPopOver.config.timeoutHandle = window.setTimeout(
                    mailinglistPopOver.setupMailSubscription,
                    mailinglistPopOver.config.timeoutInterval * 1000,
                ); // 1 minute
                $(document).bind("mousemove keypress mousewheel touchmove", mailinglistPopOver.timeoutBindingFunction);
            }
        },
        init: function () {
            var $newsLetterModal = modalHelper.setupModal({
                modalName: "NewsLetterModal",
                attributeObject: $("#NewsLetterModalAttributes").data(),
                cssClass: "NewsLetterModal",
            });

            if ($newsLetterModal.data("newsletterpopupenabled") == true) {
                mailinglistPopOver.config.timeoutInterval = $newsLetterModal.data("newsletterpopuptime");
                mailinglistPopOver.start();
            }
        },
    };

    $(document).ready(function () {
        mailinglistPopOver.init();
    });
})(window, window.jQuery);
