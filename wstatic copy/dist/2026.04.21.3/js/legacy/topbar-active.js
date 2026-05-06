(function ($, undefined) {
    var activeClass = "activeHover";
    var languageSwitcherMode = "Default";

    $(document).ready(function () {
        setLanguageSwitcherMode();
        addCurrencySelectorActiveClass();
        addSearchActiveClass();
        addBagDropdownActiveClass();
        addMyAccountActiveClass();
        addPullMenuActiveClass();
    });

    function setLanguageSwitcherMode() {
        if ($("#hidLanguageSwitcherMode").length && $("#hidLanguageSwitcherMode").val().length != 0) {
            languageSwitcherMode = $("#hidLanguageSwitcherMode").val();
        }
    }

    function addCurrencySelectorActiveClass() {
        if (languageSwitcherMode != "modal") {
            $(document).bind("click", function (e) {
                var $parents = $(e.target).parents();
                if (
                    !$parents.hasClass("currencyLanguageSlider") &&
                    !$parents.hasClass("spanCurrencyLanguageSelector") &&
                    $("#divCurrencyLanguageSliding").is(":visible")
                ) {
                    toggleActiveClass($("#divCurrencyLanguageSelector"));
                }
            });

            $("#currencyLanguageSelector").click(function () {
                var $langSelector = $("#divCurrencyLanguageSelector");
                toggleActiveClass($langSelector);
            });
        }

        function toggleActiveClass(el) {
            el.hasClass(activeClass) ? el.removeClass(activeClass) : el.addClass(activeClass);
        }
    }

    function addSearchActiveClass() {
        var $txtSearch = $("#txtSearch");
        var $search = $(".search");
        $txtSearch.focus(function () {
            $search.addClass(activeClass);
        });

        $txtSearch.blur(function () {
            $search.removeClass(activeClass);
        });
    }

    function addBagDropdownActiveClass() {
        var $bagDropdown = $("#divBagItems");
        var $divBag = $("#divBag");
        $bagDropdown.mouseenter(function () {
            $divBag.addClass(activeClass);
        });

        $bagDropdown.mouseleave(function () {
            $divBag.removeClass(activeClass);
        });
    }

    function addMyAccountActiveClass() {
        var $accountMenu = $(".TopSubLinkMenu");
        var $headerIcon = $(".bsheaderIcons");
        $accountMenu.mouseenter(function () {
            $headerIcon.addClass(activeClass);
        });

        $accountMenu.mouseleave(function () {
            $headerIcon.removeClass(activeClass);
        });
    }

    function addPullMenuActiveClass() {
        var menuActiveClass = "PullMenuActive";
        var $bodyWrap = $("#BodyWrap");
        $bodyWrap.removeClass("PullMenuActive");

        $(document).on("sd-mob-menu-toggled", function (e, isVisible) {
            isVisible ? $bodyWrap.addClass(menuActiveClass) : $bodyWrap.removeClass(menuActiveClass);
        });
    }
})(window.jQuery);
