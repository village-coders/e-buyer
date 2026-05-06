(function (window, undefined) {
    "use strict";

    function PsTemplatesDictionary() {
        var psTemplates = {};

        this.addTemplate = function (key, val) {
            var upperKey = key.toUpperCase().trim();
            psTemplates[upperKey] = val;
        };

        this.getTemplate = function (
            key,
            className,
            from,
            quicklook,
            ticketPricePrefix,
            quickBuyText,
            quickBuyEnabled,
            wishListText,
            wishListEnabled,
            userIsLoggedIn,
        ) {
            var upperKey = key.toUpperCase().trim();
            var dictionaryValue = psTemplates[upperKey];

            var classPlaceholder = "%%PSTEMPLATEMAINCLASS%%",
                fromPlaceholder = "%%FROM%%",
                quickLookPlaceholder = /%%QUICKLOOK%%/g,
                ticketPricePrefixPlaceholder = /%%TPP%%/g,
                quickBuyEnabledPlaceHolder = "%%QuickBuyEnabled%%",
                quickBuyTextPlaceholder = "%%QuickBuyText%%",
                wishListEnabledPlaceholder = "%%WishListEnabled%%",
                wishListTextPlaceholder = "%%WishListText%%",
                userLoggedInPlaceHolder = "%%UserLoggedIn%%";

            return dictionaryValue
                .replace(classPlaceholder, className)
                .replace(fromPlaceholder, from)
                .replace(quickLookPlaceholder, quicklook)
                .replace(ticketPricePrefixPlaceholder, ticketPricePrefix)
                .replace(quickBuyEnabledPlaceHolder, quickBuyEnabled ? "IsBuyable" : "false")
                .replace(quickBuyTextPlaceholder, quickBuyText)
                .replace(wishListEnabledPlaceholder, wishListEnabled ? "IsBuyable" : "false")
                .replace(wishListTextPlaceholder, wishListText)
                .replace(userLoggedInPlaceHolder, userIsLoggedIn);
        };
    }

    window.psTemplates = new PsTemplatesDictionary();
})(window);
