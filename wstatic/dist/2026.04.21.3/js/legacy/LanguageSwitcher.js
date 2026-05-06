$(document).ready(function () {
    var languageSwitcherMode = getLanguageSwitcherMode();
    if (languageSwitcherMode == "modal") {
        var modal = initLanguageCurrencyModal();
        $("#currencyLanguageSelector").click(function () {
            modalHelper.showModal(modal);
        });
    }
    if (checkVariableExists(window.enableCurrencyLanguageDropdown) && !window.enableCurrencyLanguageDropdown) {
        $("#hdnSelectedCurrency").val("");
        $("#divCurrencyLanguageSelector").hide();

        $(".langdropdown dt a").click(function () {
            $(".langdropdown dd ul").toggle();
            return false;
        });

        $(".langdropdown dd ul li a").click(function () {
            var text = $(this).html();
            $(".langdropdown dt a span").html(text);
            $(".langdropdown dd ul").hide();
            CountrySiteDirects.switchSite(getSelectedValue("languageDropDown"));
            return false;
        });

        $(document).bind("click", function (e) {
            var $clicked = $(e.target);
            if (!$clicked.parents().hasClass("langdropdown")) $(".langdropdown dd ul").hide();
        });
    } else {
        //Combined Currency Language Selector
        $("#divCurrencyLanguageSelector").show();
        $("#currencyLanguageSelector").show();
        if (languageSwitcherMode != "modal") $("#divCurrencyLanguageSliding").hide();

        if ($("#currencyLanguageSelector").hasClass("disableCurrencyLanageSelector")) return;
        if (languageSwitcherMode != "modal") {
            var $divLangSliding = $("#divCurrencyLanguageSliding");

            var toggleFunc = function () {
                $divLangSliding.is(":visible") ? $divLangSliding.slideUp() : $divLangSliding.slideDown();
            };

            var linkEle = $("#currencyLanguageSelector");

            // Always add the click event
            linkEle.click(toggleFunc);

            // Add the hover events if we wan't them
            if (window.CurrencyOnHover === true) {
                var tint = null;

                var hoverInFunc = function () {
                    // Clear any pending slide ups
                    if (tint) clearTimeout(tint);

                    $divLangSliding.slideDown();
                };

                var currencyBox = $("#divCurrencyLanguageSliding");

                var hoverOutFunc = function (event) {
                    var cbDomEle = currencyBox[0];

                    // Don't slide up if we are on the currency selector
                    if (cbDomEle === event.relatedTarget) return;

                    // Don't slide up if we are on the currency link
                    if (linkEle === event.relatedTarget) return;

                    // Clear any pending slide ups
                    if (tint) clearTimeout(tint);

                    // Slide up after a small time period, as we hover over some elements that would slide up,
                    // on the way from our currency link to our currency modal
                    tint = setTimeout(function () {
                        $divLangSliding.stop().slideUp();
                    }, 200);
                };

                linkEle.hover(hoverInFunc, hoverOutFunc);
                currencyBox.hover(hoverInFunc, hoverOutFunc);
            }

            if (window.CloseLanguageCurrencySelectorWhenNotClicked != false) {
                $(document).bind("click", function (e) {
                    var $clicked = $(e.target);
                    var $parents = $clicked.parents();
                    if (!$parents.hasClass("currencyLanguageSlider") && !$parents.hasClass("currencyLanguageSelector"))
                        $("#divCurrencyLanguageSliding").slideUp();
                });
            }
        }

        $("#divLanguageSelector li a").click(function () {
            var selectedValue = $(this).find("span.value").html();
            if (languageSwitcherMode != "modal") {
                $("#divCurrencyLanguageSliding").slideUp();
            }
            CountrySiteDirects.switchSite(selectedValue.trim());
            return false;
        });

        $("input[name=lCurrenciesSwitcher]:radio").change(function () {
            var id = $(this).attr("id");
            if ($("#" + id).is(":checked")) {
                var selectedCurrency = $("#" + id).attr("value");
                var cookieName = $("[data-currency-cookie-name]").data("currencyCookieName");
                setCurrencyCookieAndReload(cookieName, selectedCurrency);
            }
        });

        $("input[name=lCurrenciesSwitcher]:radio").each(function () {
            if ($(this).attr("value") == $("#hdnSelectedCurrency").val()) {
                if (!$(this).is(":checked")) {
                    $(this).prop("checked", true);
                    $(this).parent("li").addClass("activeHover");
                }
            }
        });

        $(".languageSelector li").each(function () {
            if ($(this).data("value") == $("#hdnSelectedCountry").val()) {
                if (!$(this).is(":checked")) {
                    $(this).prop("checked", true);
                    $(this).addClass("activeHover");
                }
            }
        });

        // Mobile menu methods
        $("#liMobileLanguageSelector li a").click(function (ev) {
            if ($(".mp-level-opening").length > 0) {
                ev.preventDefault();
            } else {
                var selectedValue = $(this).find("span.value").html();
                CountrySiteDirects.switchSite(selectedValue.trim());
                return false;
            }
        });

        $("input[name=lCurrenciesSwitcherMobile]:radio").change(function () {
            var id = $(this).attr("id");
            if ($("#" + id).is(":checked")) {
                var selectedCurrency = $("#" + id).attr("value");
                var cookieName = $("[data-currency-cookie-name]").data("currencyCookieName");
                setCurrencyCookieAndReload(cookieName, selectedCurrency, window.location.hostname);
            }
        });

        $("input[name=lCurrenciesSwitcherMobile]:radio").each(function () {
            if ($(this).attr("value") == $("#hdnSelectedCurrency").val()) {
                if (!$(this).is(":checked")) {
                    $(this).prop("checked", true);
                    $(this).parents("li").addClass("activeHover");
                }
            }
        });
    }

    function getSelectedValue(id) {
        return $("#" + id)
            .find("dt a span.value")
            .html();
    }

    function checkVariableExists(gVariable) {
        return typeof gVariable !== "undefined";
    }

    function getLanguageSwitcherMode() {
        if ($("#hidLanguageSwitcherMode").length && $("#hidLanguageSwitcherMode").val().length != 0) {
            return $("#hidLanguageSwitcherMode").val();
        }
        return "Default";
    }

    function initLanguageCurrencyModal() {
        return (modal = modalHelper.setupModal({
            bodyDiv: "divCurrencyLanguageSliding",
            titleDiv: "divCurrencyLanguageModalHeader",
            modalName: "languageCurrencySelectModel",
            cssClass: "popupLanguageCurrencySelect",
        }));
    }
});
