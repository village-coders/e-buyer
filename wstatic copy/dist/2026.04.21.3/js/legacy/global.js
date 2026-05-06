(function (window, $, Modernizr, undefined) {
    "use strict";

    function getLanguage() {
        var language = "en";
        var documentLocale = getDocumentLocale();
        if (documentLocale.length >= 2) {
            language = documentLocale.substr(0, 2);
        }
        return language;
    }

    function getDocumentLocale() {
        var documentLocale = $("html").attr("lang");
        if (typeof documentLocale != "string") {
            console.log("Document locale could not be determined");
            documentLocale = "en_GB";
        }
        return documentLocale;
    }

    function getCookie(name) {
        var start = document.cookie.indexOf(name + "=");
        if (start < 0) return null;
        start = start + name.length + 1;
        var end = document.cookie.indexOf(";", start);
        if (end < 0) end = document.cookie.length;
        while (document.cookie.charAt(start) == " ") {
            {
                start++;
            }
        }
        return decodeURIComponent(document.cookie.substring(start, end));
    }

    function setCookieValue(name, value, days, path, domain) {
        var cookie = name + "=" + encodeURIComponent(value);
        if (path) cookie += "; path=" + path;
        if (domain) cookie += "; domain=" + domain;
        if (days) {
            var now = new Date();
            now.setTime(now.getTime() + 1000 * 60 * 60 * 24 * days);
            cookie += "; expires=" + now.toUTCString();
        }
        document.cookie = cookie;
    }

    function setCurrencyCookieAndReload(cookieName, selectedCurrency, domain) {
        setCookieValue(cookieName, selectedCurrency, 90, "/", domain);
        location.reload();
    }

    var selectedLevel2MenuTabIdCookieName = "selectedLevel2MenuTabId";
    function setMenuCookie(cvalue) {
        var d = new Date();
        d.setTime(d.getTime() + 90 * 1 * 24 * 60 * 60 * 1000);
        var expires = "expires=" + d.toUTCString();
        document.cookie =
            selectedLevel2MenuTabIdCookieName + "=" + encodeURIComponent(cvalue) + ";" + expires + ";path=/";
    }

    function getMenuCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    var _currencyFormatter = {
        ActiveCurrency: "GBP",
        CurrencySymbol: "£",
        IsCurrencySymbolPositionLeft: "true",
        CurrencyDecimalSeperator: ".",
        CurrencyGroupSeperator: ",",
        CurrencySizeCssClass: "",

        Init: function () {
            if (typeof currencyFormatterConfig !== "object") {
                try {
                    console.log("No currency formatter config is available");
                } catch (e) {}
                return;
            }
            _currencyFormatter.ActiveCurrency = currencyFormatterConfig.activeCurrency;
            _currencyFormatter.CurrencySymbol = currencyFormatterConfig.symbol;
            _currencyFormatter.IsCurrencySymbolPositionLeft = currencyFormatterConfig.isSymbolPositionLeft;
            _currencyFormatter.CurrencyDecimalSeperator = currencyFormatterConfig.decimalSeparator;
            _currencyFormatter.CurrencyGroupSeperator = currencyFormatterConfig.groupSeparator;
            _currencyFormatter.CurrencySizeCssClass = currencyFormatterConfig.sizeCssClass;
        },

        FormatCurrencyValueZeroDP: function (value) {
            return _currencyFormatter.FormatCurrencyValue(value, 0);
        },

        FormatCurrencyValueTwoDP: function (value) {
            return _currencyFormatter.FormatCurrencyValue(value, 2);
        },

        FormatCurrencyValue: function (value, digits) {
            digits = typeof digits !== "undefined" ? digits : 2; //Default to two decimal places.

            var formatedNumber = _currencyFormatter.FormatNumber(value, digits);
            var formattedCurrencyValue;
            var currSymbol = _currencyFormatter.CurrencySymbol;
            if (_currencyFormatter.IsCurrencySymbolPositionLeft.toLowerCase() == "true") {
                formattedCurrencyValue = currSymbol + formatedNumber;
            } else {
                formattedCurrencyValue = formatedNumber + " " + currSymbol;
            }
            return formattedCurrencyValue;
        },

        FormatNumber: function (number, digits) {
            var fixed = number.toFixed(digits); //limit/add decimal digits
            var parts = new RegExp("^(-?\\d{1,3})((?:\\d{3})+)(\\.(\\d{2}))?$").exec(fixed); //separate begin [$1], middle [$2] and decimal digits [$4]

            if (parts) {
                //number >= 1000 || number <= -1000
                return (
                    parts[1] +
                    parts[2].replace(/\d{3}/g, _currencyFormatter.CurrencyGroupSeperator + "$&") +
                    (parts[4] ? _currencyFormatter.CurrencyDecimalSeperator + parts[4] : "")
                );
            } else {
                return fixed.replace(".", _currencyFormatter.CurrencyDecimalSeperator);
            }
        },
    };
    $(_currencyFormatter.Init);

    function IsMobileView() {
        var $divMobileView = $("#divMobileView");
        return $divMobileView.length > 0 && $divMobileView.is(":visible");
    }

    function IsTabletView() {
        var $divTabletView = $("#divTabletView");
        return $divTabletView.length > 0 && $divTabletView.is(":visible");
    }

    function IsDesktopView() {
        return !(IsMobileView() || IsTabletView());
    }

    function isTouchDevice() {
        return (
            Modernizr.touch ||
            (isIE() && window.navigator.msMaxTouchPoints > 0) ||
            ((isIE() || isEdge()) && window.navigator.maxTouchPoints > 0)
        );
    }

    function isIOS() {
        return (
            ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(
                navigator.platform,
            ) ||
            // iPad on iOS 13 detection
            (navigator.userAgent.includes("Mac") && "ontouchend" in document)
        );
    }

    function isEdge() {
        return navigator.appName == "Netscape" && new RegExp("Edge/").exec(navigator.userAgent) != null;
    }

    function isIE() {
        return (
            navigator.appName == "Microsoft Internet Explorer" ||
            (navigator.appName == "Netscape" &&
                new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})").exec(navigator.userAgent) != null)
        );
    }

    try {
        if (isTouchDevice()) {
            document.body.className += " touchenabled";
        }
        var selectedTopLevelMenuTabIndex = getMenuCookie(selectedLevel2MenuTabIdCookieName);
        if (selectedTopLevelMenuTabIndex === "") {
            selectedTopLevelMenuTabIndex = 0;
        }
        window.selectedTopLevelMenuTabIndex = selectedTopLevelMenuTabIndex;
        setMenuCookie(window.selectedTopLevelMenuTabIndex);
    } catch (e) {
        console.error(e);
    }

    $("[data-submitlink]").click(function (e) {
        if (!e.isDefaultPrevented()) {
            submitClosestForm(this);
        }
        return false;
    });

    function submitClosestForm(el) {
        $(el).closest("form").submit();
    }

    $(document).on("keypress", "form", function () {
        if (event.keyCode != 13) return true;
        var $this = $(this);
        var defaultID = $this.data("defaultbutton");
        if (!defaultID) return true;
        var defaultElement = $(this)
            .find("#" + defaultID)
            .first();
        if (defaultElement == null) return true;
        defaultElement.click();
        return false;
    });

    function configureSearchEvents() {
        const searchInput = document.querySelector("input.ShowClearButton");
        if (!searchInput) return;

        let clearButton = document.querySelector(".search-clear-text-button");
        if (!clearButton) {
            clearButton = document.createElement("span");
            clearButton.className = "TextBoxClear hideClearButton";

            searchInput.parentNode.insertBefore(clearButton, searchInput.nextSibling);
        }

        clearButton.addEventListener("click", () => {
            searchInput.value = "";
            searchInput.focus();
        });

        ["change", "focus", "keyup"].forEach((eventName) => {
            searchInput.addEventListener(eventName, () => {
                clearButton.classList.remove("fadeOutClearButton");

                const isVisible = searchInput.value !== "";
                clearButton.classList.toggle("showClearButton", isVisible);
                clearButton.classList.toggle("hideClearButton", !isVisible);
            });
        });

        searchInput.addEventListener("blur", (e) => {
            clearButton.classList.remove("showClearButton");
            clearButton.classList.remove("hideClearButton");
            clearButton.classList.add("fadeOutClearButton");
        });
    }

    //Text box clear button
    $(function () {
        const useInpSearchOptimisation =
            document.getElementById("UseInpSearchOptimisation")?.value.toLowerCase() === "true";

        if (useInpSearchOptimisation) {
            configureSearchEvents();
            return;
        }

        $("input.ShowClearButton").each(function () {
            var $input = $(this);
            const clearButtonText = $(".search-clear-text-button");
            const isClearButtonText = clearButtonText?.length > 0;
            const $clearButton = isClearButtonText
                ? clearButtonText
                : $('<span class="TextBoxClear" style="display:none;"></span>');

            if (!isClearButtonText) $input.after($clearButton);

            $input.on("focus keyup change", () => {
                $clearButton.toggle($input.val() != "");
            });
            $input.blur(() => {
                //Using fadeOut allows click events on $clearButton to fire
                $clearButton.fadeOut();
            });
            $clearButton.on("click", () => {
                $input.val("").focus();
            });
        });
    });

    // Expose globals
    window.getLanguage = getLanguage;
    window.getDocumentLocale = getDocumentLocale;
    window.getCookie = getCookie;
    window.setCookieValue = setCookieValue;
    window.setCurrencyCookieAndReload = setCurrencyCookieAndReload;
    window.setMenuCookie = setMenuCookie;
    window._currencyFormatter = _currencyFormatter;
    window.IsMobileView = IsMobileView;
    window.IsTabletView = IsTabletView;
    window.IsDesktopView = IsDesktopView;
    window.isTouchDevice = isTouchDevice;
    window.submitClosestForm = submitClosestForm;
    window.isIOS = isIOS;
    window.isIE = isIE;
})(window, window.jQuery, window.Modernizr);
