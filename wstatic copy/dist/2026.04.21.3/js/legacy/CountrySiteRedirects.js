(function (window, $, undefined) {
    "use strict";

    var result = null;
    var pageLoadDone = false;

    function doCheck() {
        if (
            checkIsDoneForSession() ||
            getDomainList() == null ||
            $("#BodyWrap-Popup").length != 0 || //We're in a popup
            window.location.search.indexOf("disablepopups") != -1
        ) {
            return;
        }
        $.get("/wcallbacks/locations/checkforcountryredirect", {}, processResponse);

        window.addEventListener("load", function () {
            pageLoadDone = true;
            processResult();
        });
    }

    function processResponse(data) {
        result = data;
        processResult();
    }

    function processResult() {
        if (!pageLoadDone || result == null) return;

        if (!result.redirectSite) {
            setChosenSiteCookie(getCurrentSite());
            setCheckIsDoneCookie();
            return;
        }

        var domains = getDomainList();

        var currentSiteData = domains[getCurrentSite()];
        var redirectSiteData = domains[result.redirectSite];
        if (!currentSiteData || !redirectSiteData) {
            setCheckIsDoneCookie();
            return;
        }

        $(".CountryRedirectPopupCurrentSiteName").html(currentSiteData.name);
        $(".CountryRedirectPopupRedirectSiteName").html(redirectSiteData.name);

        if (result.returningVisitor) $("#CountryRedirectPreviousMessage").show();
        else $("#CountryRedirectDetectedMessage").show();

        if (currentSiteData.flag)
            $("#CountryRedirectStayFlag").attr("src", "/images/flags/" + currentSiteData.flag + ".png");
        if (redirectSiteData.flag)
            $("#CountryRedirectGoFlag").attr("src", "/images/flags/" + redirectSiteData.flag + ".png");
        $("#CountryRedirectGoLink").click(function () {
            doRedirect(result.redirectSite);
        });

        var modal = $(".CountryRedirectModal");
        $("#CountryRedirectStayLink").click(function () {
            modalHelper.hideModal(modal);
            return false;
        });

        renderOtherSiteList();
        modalHelper.showModal(modal);
        modal.on("hidden.bs.modal", stayHere);

        if (window.parent.dataLayer != null) {
            var action = "newUser_countryDetected";
            if (result.returningVisitor) action = "previousUser_countryDetected";
            window.parent.dataLayer.push({
                event: "countryRedirectPopup",
                countryRedirectPopupAction: action,
                countryRedirectPopupRedirectSite: result.redirectSite,
            });
        }
    }

    function doRedirect(site) {
        if (window.parent.dataLayer != null) {
            var action = "newUser_countrySelected";
            if (result.returningVisitor) action = "previousUser_countrySelected";
            window.parent.dataLayer.push({
                event: "countryRedirectPopup",
                countryRedirectPopupAction: action,
                countryRedirectPopupRedirectSite: result.redirectSite + "," + site,
            });
        }
        switchSite(site);
        return false;
    }

    function stayHere() {
        setChosenSiteCookie(getCurrentSite());
        setCheckIsDoneCookie();
        if (window.parent.dataLayer != null) {
            var action = "newUser_countrySelected";
            if (result.returningVisitor) action = "previousUser_countrySelected";
            window.parent.dataLayer.push({
                event: "countryRedirectPopup",
                countryRedirectPopupAction: action,
                countryRedirectPopupRedirectSite: result.redirectSite + "," + getCurrentSite(),
            });
        }
        return false;
    }

    function switchSite(site) {
        var domainToSwitchTo = getDomainList()[site];
        setChosenSiteCookie(site);
        window.top.location.href =
            "https://" + domainToSwitchTo.domain + $("#CountryRedirectPopup").data("redirecturl");
        return false;
    }

    function getChosenSiteCookieName() {
        return $("#CountryRedirectPopup").data("cookiename");
    }

    function getChosenSiteCookieDomain() {
        return $("#CountryRedirectPopup").data("cookiedomain");
    }

    function setChosenSiteCookie(site) {
        window.setCookieValue(getChosenSiteCookieName(), site, 1, "/", getChosenSiteCookieDomain());
    }

    function checkIsDoneForSession() {
        return window.getCookie("CountryRedirectCheckIsDone") != null;
    }

    function setCheckIsDoneCookie() {
        window.setCookieValue("CountryRedirectCheckIsDone", "true", null, "/", null);
    }

    function getDomainList() {
        if (typeof MP != "object") return null;
        return MP.Domains;
    }

    function getCurrentSite() {
        if (typeof MP != "object") return null;
        return MP.CurrentSite;
    }

    function renderOtherSiteList() {
        var domains = getDomainList();
        if (domains == null) return;
        var list = $("#CountryRedirectOtherSitesList");
        var currentSite = getCurrentSite();
        $.each(domains, function (site, siteData) {
            if (site != result.redirectSite && site != currentSite)
                list.append(
                    '<span class="flagBox"><a href="#" data-site="' +
                        site +
                        '"><span class="flag ' +
                        siteData.flag +
                        '" title="' +
                        siteData.name +
                        ' flag"></span> ' +
                        "<span>" +
                        siteData.name +
                        "</span>" +
                        "</a></span>",
                );
        });
        list.on("click", "a", function () {
            doRedirect($(this).data("site"));
            return false;
        });
    }

    function initSharedBasketLinks() {
        $(".SharedBasketSiteLinks a").click(function () {
            setChosenSiteCookie(getCurrentSite());
            setCheckIsDoneCookie();
        });
    }

    doCheck();

    $(initSharedBasketLinks);

    // Expose globals
    window.CountrySiteDirects = {
        switchSite: switchSite,
    };
})(window, window.jQuery);
