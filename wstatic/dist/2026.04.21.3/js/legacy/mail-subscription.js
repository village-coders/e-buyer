(function (window, $, undefined) {
    "use strict";

    function subscribeToNewsletter(
        emailAddress,
        series,
        comSeq,
        company,
        dob,
        country,
        gender,
        name,
        onProcessing,
        onSuccess,
        onFailure,
    ) {
        if (onProcessing != null) {
            onProcessing();
        }
        $.ajax({
            type: "POST",
            url: "/wcallbacks/mailinglist/subscribe",
            data: {
                email: emailAddress,
                series: series,
                comSeq: comSeq,
                company: company,
                dob: dob,
                country: country,
                gender: gender,
                name: name,
                rCode: "TRUE",
                sdCustom3: "Newsletter Signup",
            },
            success: function (data) {
                onSuccess();
                sendDataToGoogleAnalyticsAboutNewsletter("SignUp");
            },
            error: function (xhr, textStatus, errorThrown) {
                onFailure();
            },
        });
    }

    function SetupMailSubscription(element, gender, signupPage) {
        $(element).click(function (e) {
            $("#NewsLetterModal").attr("data-label", "OpenedOnClick");
            e.preventDefault();
            var emailtext = "";
            if ($(".signup-wrapper #signupEmail").length > 0) {
                var email = $(".signup-wrapper #signupEmail").removeClass("error");
                emailtext = email.val();
                if (!validateEmail(emailtext)) {
                    email.addClass("error");
                    return;
                }
            }
            setUpNewsletterModal(signupPage, gender, emailtext);
        });

        if (window.location.search.indexOf("showsubscribe=true") > -1) {
            $(document).ready(function () {
                setUpNewsletterModal(signupPage, gender, "");
            });
        }
    }

    function SetupMailSubscriptionInline(
        element,
        gender,
        comSeq,
        series,
        company,
        preCallback,
        processingCallback,
        successCallback,
        errorCallback,
    ) {
        $(element).click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            var emailtext = "";
            var countryCode = "";
            if (preCallback) {
                preCallback();
            }
            if ($(".signup-wrapper #signupEmail").length > 0) {
                var email = $(".signup-wrapper #signupEmail").removeClass("error");
                emailtext = email.val();
                if (!validateEmail(emailtext)) {
                    email.addClass("error");
                    return;
                }
                var lang = document.documentElement.getAttribute("lang");
                if (lang) {
                    var countryCode = lang.split("-")[1];
                }
            }
            subscribeToNewsletter(
                emailtext,
                series,
                comSeq,
                company,
                "",
                countryCode,
                gender,
                "",
                // Processing call back
                processingCallback,
                // Success callback (hide dialog)
                successCallback,
                // Fail callback
                errorCallback,
            );
        });
    }

    function validateEmail(email) {
        var rx =
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return rx.test(email);
    }

    function sendDataToGoogleAnalyticsAboutNewsletter(action) {
        var $NewsLetterModal = $("#NewsLetterModal"),
            label = $NewsLetterModal.attr("data-label");
        window.parent.dataLayer.push({
            event: "NewsletterPopup",
            newsletterPopupAction: action,
            newsletterPopupLabel: label,
        });
    }

    function getNewsLetterContent(signupPageUrl, onSuccess) {
        return $.ajax({
            type: "GET",
            url: signupPageUrl,
            success: function (data) {
                if (onSuccess) {
                    onSuccess(data);
                }
            },
        });
    }

    function setUpNewsletterModal(signupPage, gender, emailtext, onOpen, onClose) {
        function newsletterModalClose() {
            var $NewsLetterModal = $("#NewsLetterModal");
            $NewsLetterModal.unbind("hidden.bs.modal", newsletterModalClose);

            if (typeof onOpen == "function") onOpen();

            sendDataToGoogleAnalyticsAboutNewsletter("Dismiss");
        }

        function newsletterModalOpen() {
            $("#NewsLetterModal").unbind("shown.bs.modal", newsletterModalOpen);

            if (typeof onClose == "function") onOpen();

            sendDataToGoogleAnalyticsAboutNewsletter("Show");
        }

        $(".form-wrapper").show();
        $(".thankyou-wrapper").hide();
        var newsLetterUrl = signupPage.indexOf("/") == 0 ? signupPage : "/static/newsletters/" + signupPage,
            opts = {};
        return getNewsLetterContent(newsLetterUrl, function (newsletterContent) {
            var modal = modalHelper.setupModal({
                contentHtml: newsletterContent,
                modalName: "NewsLetterModal",
                cssClass: "NewsLetterModal",
            });
            modal.bind("hidden.bs.modal", newsletterModalClose);
            modal.bind("shown.bs.modal", newsletterModalOpen);
            var modalShown = modalHelper.showModal(modal, {});
            var newsLetterModal = $("#NewsLetterModal");
            if (modalShown) {
                var $contents = newsLetterModal.contents();
                var i = newsLetterModal.contents();
                if (emailtext != null && gender != null) {
                    i.find("#email").val(emailtext);
                    i.find("#" + gender).prop("checked", true);
                }
                //temproray try catch
                try {
                    var tag = i.find("h2")[0];
                    newsLetterModal.find(".text-center").children().remove();
                    if (newsLetterModal.find(".text-center").length === 1) {
                        newsLetterModal
                            .find(".text-center")
                            .append('<span class="header-text">' + tag.outerText + "</span>");
                        newsLetterModal
                            .find(".text-center")
                            .append(
                                '<button id="CloseNewsLetterModal" type="button" class="close" data-dismiss="modal">×</button>',
                            );
                        $(tag).hide();
                    }
                    $(tag).hide();
                } catch (err) {}

                // Close button (thanks)
                $contents.find("#NewsLetterCloseBtn").bind("click", function () {
                    modalHelper.hideModal(newsLetterModal);
                });
            }
            return modalShown;
        });
    }

    $(document).ready(function () {
        var genderRadios = $("input:radio[name=gender]");
        if (genderRadios.length != 0) {
            if (genderRadios.filter(":checked").length == 0) genderRadios.first().prop("checked", true);
        }
    });

    //Expose globals
    window.subscribeToNewsletter = subscribeToNewsletter;
    window.SetupMailSubscription = SetupMailSubscription;
    window.SetupMailSubscriptionInline = SetupMailSubscriptionInline;
    window.setUpNewsletterModal = setUpNewsletterModal;
})(window, window.jQuery);
