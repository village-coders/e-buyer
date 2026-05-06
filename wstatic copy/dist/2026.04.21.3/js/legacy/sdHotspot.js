var selectedColourVarId = "",
    selectedSizeVarId = "",
    hsProductInfo = "",
    clickToggle = true,
    isSingleColourHotspot = true,
    hsHideSingleSize = false,
    hsShowDescription = false,
    hsIsProductRecClick = false,
    isWishListClicked = false,
    isSaveForLaterClicked = false,
    hotspotModal = null,
    hsAddToBagHandler = null,
    selectivesElem = null,
    colourVariantDropdown = null;
var productHotspotTemplate = `<div class="row">
        ${getImages()}
        ${getProductInfo()}
    </div>`;

var hotspotErrorTemplate =
    '<div class="PinWrapText">' +
    "</div>" +
    '<div class="PinWrapGroup">' +
    "<li>{{message}}</li>" +
    "</div>" +
    "</div>";

function getImages() {
    return `{{#each variantsData}}
                {{#colourequal colVarId }}
                    <div class="col-xs-12 col-sm-7 PinWrapImage">
                        {{#useImageCarousel}}
                            <div class="swiper-container hsAltImageSwiper">
                                <div class="swiper-wrapper">
                                    {{#each altImages}}
                                        <div class="swiper-slide">
                                            <a href="{{../detailsUrl}}"><img class="img-responsive" alt="{{../altText}}" title="{{../altText}}" src="{{this}}" /></a>
                                        </div>
                                    {{/each}}
                                </div>
                                <div class="swiper-pagination"></div>
                                <div class="swiper-button-prev"></div>
                                <div class="swiper-button-next"></div>
                            </div>
                        {{else}}
                            <div class="PinImageHeightEnforcer"></div>
                            <div class="PinImage">
                                <a href="{{detailsUrl}}"><img class="img-responsive" alt="{{altText}}" title="{{altText}}" src="{{imageUrl}}" /></a>
                            </div>
                        {{/useImageCarousel}}
                    </div>
                {{/colourequal}}
            {{/each}}`;
}

function getProductInfo() {
    return `<div class="col-xs-12 col-sm-5 PinWrapText">
                ${getTitle()}
                ${getPrice()}
                ${getColour()}
                ${getSize()}
                ${getAddToBag()}
            </div>`;
}

function getTitle() {
    return `<div class="col-xs-12 hsProductName">
                <h2>{{productBrand}} <span>{{productName}}</span></h2>
            </div>`;
}

function getPrice() {
    return `{{#each variantsData}}
                {{#pricecheck colVarId this}}
                    ${getMemberPricingHtml()}
                    <div id="hsPriceWrapper" class="col-xs-12">
                        {{#if prodVarPrices.showFrom}}
                            <div id="hsFrom">{{../../../fromText}}</div>
                        {{/if}}
                        <div id="hsPrice">
                            {{prodVarPrices.sellPrice}}
                        </div>       
                        {{#if ../additionalPriceLabel}}
                            <div id="hsAdditionalPriceLabel">{{additionalPriceLabel}}</div>
                        {{/if}}
                        {{#if prodVarPrices.showRefPrice}}
                            <div id="hsRefPrice">{{prodVarPrices.refPrice}}</div>
                        {{/if}}
                        {{#if prodVarPrices.hasDiscountPercentText}}
                            <div id="hsDiscountPercentText" class="discount-percentage-off {{#if prodVarPrices.showWebPercentOffParenthesisOnProductDetailsPage}}discount-percentage-show-parenthesis{{/if}} {{#if prodVarPrices.showDiscountPercentageForMobileOnly}}discount-percentage-off-mobile-only{{/if}}">
                                <div class="discount-percentage-parenthesis">(</div>
                                {{prodVarPrices.discountPercentText}}
                                <div class="discount-percentage-parenthesis">)</div>
                            </div>
                        {{/if}}
                    </div>
                {{else}}
                    {{#colourequal colVarId }}
                        {{#each sizeVariants}}
                            {{#sizeequal sizeVarId}}
                                ${getMemberPricingHtml(true)}
                                <div id="hsPriceWrapper" class="col-xs-12">
                                    <div id="hsPrice">
                                        {{prodSizePrices.sellPrice}}
                                    </div>   
                                    {{#if ../../additionalPriceLabel}}
                                        <div id="hsAdditionalPriceLabel">{{../../../additionalPriceLabel}}</div>
                                    {{/if}}
                                    {{#if prodSizePrices.showRefPrice}}
                                        <div id="hsRefPrice">{{prodSizePrices.refPrice}}</div>
                                    {{/if}}
                                    {{#if prodSizePrices.hasDiscountPercentText}}
                                        <div id="hsDiscountPercentText" class="discount-percentage-off {{#if prodSizePrices.showWebPercentOffParenthesisOnProductDetailsPage}}discount-percentage-show-parenthesis{{/if}} {{#if prodSizePrices.showDiscountPercentageForMobileOnly}}discount-percentage-off-mobile-only{{/if}}">
                                            <div class="discount-percentage-parenthesis">(</div>
                                            {{prodSizePrices.discountPercentText}}
                                            <div class="discount-percentage-parenthesis">)</div>
                                        </div>
                                    {{/if}}
                                </div>
                            {{/sizeequal}}
                        {{/each}}
                    {{/colourequal}}
                {{/pricecheck}}
            {{/each}}`;
}

function getColour() {
    return `{{#unless hideSingleColourForProductVariant}}
                {{#if showColour}}
                    <div class="col-xs-12 hsColourDesc">
                        <span class="ColourLabel">{{colourText}}</span>
                        <span class="ColourDesc">
                            {{#each variantsData}}
                                {{#colourequal colVarId }}
                                    {{colourName}}
                                {{/colourequal}}
                            {{/each}}
                        </span>
                    </div>
                    {{#checksinglecolourhotspot}}
                    {{else}}
                        <div class="col-xs-12 hsColourSelection">
                            {{#isproducthotspotcolourbuttonsenabled}}
                                <ul id="ulHsColours" class="hsVariantButtons">
                                    {{#each variantsData}}
                                        <li class="hsColourButtonli {{#colourequal colVarId}}hsVariantHighlight{{/colourequal}}" role="radio" data-hscolvarid="{{colVarId}}" title="{{../../../../clickToSelectText}} {{colourName}}">
                                            <a href="#"><img alt="{{colourName}}" src="{{thumbnailUrl}}"/></a>
                                        </li>
                                    {{/each}}
                                </ul>
                            {{else}}
                                {{#isRollUpVariant}}
                                    <div class="col-xs-12 rollUpVariantsDropdown">
                                        <div readonly id="input" class="colourVariantDropdown" value="Dropdown">
                                            <img src="{{rollUpImageUrl}}" />{{colourName}}
                                        </div>
                                        <div id="selectives">
                                            <ul>
                                                {{#each variantsData}}
                                                    <li class="colourVariantItem" data-value="{{colVarId}}" {{#colourequal colVarId}}selected{{/colourequal}}><img src="{{rollUpImageUrl}}" />{{colourName}}</li>
                                                {{/each}}
                                            </ul>
                                        </div>
                                    </div>
                                    {{else}}
                                        <select id="hsColourDdl">
                                            {{#each variantsData}}
                                                <option value="{{colVarId}}" {{#colourequal colVarId}}selected{{/colourequal}} title="{{colourName}}">{{colourName}}</option>
                                            {{/each}}
                                        </select>
                                {{/isRollUpVariant}}
                            {{/isproducthotspotcolourbuttonsenabled}}
                        </div>
                    {{/checksinglecolourhotspot}}
                {{/if}}
            {{/unless}}`;
}

function getSize() {
    return `{{#each variantsData}}
                {{#colourequal colVarId }}
                    {{#hidesize sizeVariants}}
                    {{else}}
                        <div class="col-xs-12 BuySizeText"><span class="hsSizeLabel">{{../../../sizeText}}</span></div>
                        <div class="col-xs-12 hsSizeSelection">
                            {{#isproducthotspotsizebuttonsenabled}}
                                <ul id="ulHsSizes" class="hsVariantButtons">
                                    {{#each sizeVariants}}
                                        <li class="hsSizeButtonli {{#sizeequal sizeVarId}}hsVariantHighlight{{/sizeequal}} {{#unless inStock}}greyOut{{/unless}}" role="radio" data-hsvariantid="{{sizeVarId}}" title="{{#if inStock}}{{../../../../../../clickToSelectText}} {{sizeName}}{{else}}{{../../../../../../outOfStockText}}{{/if}}">
                                            <a href="#">{{sizeName}}</a>
                                        </li>
                                    {{/each}}
                                </ul>
                            {{else}}
                                <select id="hsSizeDdl">
                                    {{#hasmanysizes sizeVariants}}
                                        <option value="" title="{{../../../../../selectText}}">{{../../../../../selectText}}</option>
                                    {{/hasmanysizes}}
                                    {{#each sizeVariants}}
                                        <option value="{{sizeVarId}}" {{#sizeequal sizeVarId}}selected{{/sizeequal}} title="{{sizeName}}">{{sizeName}}</option>
                                    {{/each}}
                                </select>
                            {{/isproducthotspotsizebuttonsenabled}}
                        </div>
                        {{#showPromotionLink}}
                            <div class="col-xs-12 promotionLink">
                                <a href="{{detailsUrl}}"><span>{{../../../../promotionInfoText}}</span></a>
                            </div>
                        {{/showPromotionLink}}
                        {{#showSizeGuide}}
                            <div class="col-xs-12 sizeGuideLink">
                                <a href="/customerservices/otherinformation/sizeguide" target="_blank"><span class="sizeGuide-text">{{../../../../sizeGuideText}}</span></a>
                            </div>
                        {{/showSizeGuide}}
                    {{/hidesize}}
                {{/colourequal}}
            {{/each}}`;
}
function getAddToBag() {
    return `<div class="col-xs-12 hsbottom">
                {{#each variantsData}}
                    {{#colourequal colVarId }}
                        {{#checkifwishlisthotspotclicked}}
                            <div class="addToBasketContainer SizeRequiredButton" id="hsAddToWishListContainer" data-size-select-text="{{../../../selectASizeText}}" data-add-to-bag-text="{{../../../addToWishListText}}">
                                <div class="ImgButWrap">
                                    {{#if isPrintessPersonalisable}}
                                        <button class="printess-button-cta" data-pdp-printess-url="{{detailsUrl}}" id="addHotspotPrintessToWishlist">{{../../../../addPersonalisationText}}</button>
                                    {{/if}}
                                    {{#unless printessPersonalisationMandatory}}
                                        <span id="hsAddToWishListWrapper">
                                             {{#checkifsaveforlaterhotspotclicked}}
                                                <a href="#" id="addHotspotToSaveForLater"><span class="innerHotSpotLine">{{../../../../../saveForLaterText}}</span></a>
                                             {{else}}
                                                <a href="#" id="addHotspotToWishList"><span class="innerHotSpotLine">{{../../../../../addToWishListText}}</span></a>
                                             {{/checkifsaveforlaterhotspotclicked}}
                                        </span>
                                    {{/unless}}
                                </div>
                            </div>
                        {{else}}
                             <div class="addToBasketContainer SizeRequiredButton" id="hsAddToBagContainer" data-size-select-text="{{../../../selectASizeText}}" data-add-to-bag-text="{{../../../addToBagText}}">
                                 <div class="ImgButWrap">
                                    {{#if isPrintessPersonalisable}}
                                        <button class="printess-button-cta" data-pdp-printess-url="{{detailsUrl}}" id="addHotspotPrintessToBag">{{../../../../addPersonalisationText}}</button>
                                    {{/if}}
                                    {{#unless printessPersonalisationMandatory}}
                                        <span id="hsAddToBagWrapper">
                                            {{#if isPreOrderable}}
                                                <a href="#" id="addHotspotToBag"><span class="innerHotSpotLine">{{../../../../../preOrderText}}</span></a>
                                            {{else}}
                                                <a href="#" id="addHotspotToBag"><span class="innerHotSpotLine">{{../../../../../addToBagText}}</span></a>
                                            {{/if}}
                                        </span>
                                    {{/unless}}
                                </div>
                             </div>
                             {{#showWishListShortcut}}
                                <a href="#" id="addHotspotToWishList" class="wishlistShortcut"></a>
                             {{/showWishListShortcut}}
                        {{/checkifwishlisthotspotclicked}}
                        <div id="hsViewProduct"><a href="{{detailsUrl}}">{{../../viewProductText}}</a></div>
                    {{/colourequal}}
                {{/each}}
                ${getBottomDescription()}
            </div>`;
}

function getBottomDescription() {
    return `{{#showdescription}}
                <div class="col-xs-12 hsdescription">
                    {{{description}}}
                </div>
            {{/showdescription}}`;
}

function getMemberPricingHtml(isSizeLevel) {
    let memberPricingEnabled = "../../memberPricingEnabled";
    let showMemberPrice = "prodVarPrices.showMemberPrice";
    let memberPrice = "prodVarPrices.memberPrice";
    let memberPriceLabel = "prodVarPrices.memberPriceLabel";
    let memberPriceScheme = "prodVarPrices.memberPriceScheme";

    if (isSizeLevel) {
        memberPricingEnabled = "../../../../../memberPricingEnabled";
        showMemberPrice = "prodSizePrices.showMemberPrice";
        memberPrice = "prodSizePrices.memberPrice";
        memberPriceLabel = "prodSizePrices.memberPriceLabel";
        memberPriceScheme = "prodSizePrices.memberPriceScheme";
    }

    return `{{#if ${memberPricingEnabled}}}
                <div class="member-price{{#unless ${showMemberPrice}}} hide-member-price{{/unless}}" data-member-price-scheme="{{${memberPriceScheme}}}">
                    <span class="member-price-label">{{${memberPriceLabel}}}</span> <span class="member-price-value">{{${memberPrice}}}</span>
                </div>
            {{/if}}`;
}

$(function () {
    hotspotModal = modalHelper.setupModal({
        modalName: "hotspotModal",
    });

    hotspotModal.find(".modal-content").click(function (e) {
        if (!e.target.matches(".colourVariantDropdown")) {
            hideSelectives();
        }
    });
});

(function ($) {
    Handlebars.registerHelper("colourequal", function (lvalue, options) {
        if (arguments.length < 2) throw new Error("Handlebars Helper colourequal needs 1 parameters");
        return lvalue == selectedColourVarId ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("pricecheck", function (lvalue, currentVariantData, options) {
        if (arguments.length < 3) throw new Error("Handlebars Helper pricecheck needs 2 parameters");
        return lvalue == selectedColourVarId && selectedSizeVarId == "" ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("sizeequal", function (lvalue, options) {
        if (arguments.length < 2) throw new Error("Handlebars Helper sizeequal needs 1 parameters");
        return lvalue == selectedSizeVarId ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("checksinglecolourhotspot", function (options) {
        return isSingleColourHotspot ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("hidesize", function (sizes, options) {
        if (arguments.length < 2) throw new Error("Handlebars Helper hidesize needs 1 parameter");
        return hsHideSingleSize && sizes.length == 1 ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("showdescription", function (options) {
        return hsShowDescription ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("checkifwishlisthotspotclicked", function (options) {
        return isWishListClicked ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("checkifsaveforlaterhotspotclicked", function (options) {
        return isSaveForLaterClicked ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("hasmanysizes", function (sizes, options) {
        if (arguments.length < 2) throw new Error("Handlebars Helper hasmanysizes needs 1 parameter");
        return sizes.length > 1 ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("isproducthotspotsizebuttonsenabled", function (options) {
        return isProductHotspotSizeButtonSelectorEnabled() ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("isproducthotspotcolourbuttonsenabled", function (options) {
        return isProductHotspotColourButtonSelectorEnabled() ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("showWishListShortcut", function (options) {
        return isWishListShortcutEnabled() ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("showSizeGuide", function (options) {
        return isHotSpotSizeGuideEnabled() ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("showPromotionLink", function (options) {
        return isHotSpotPromotionLinkEnabled() ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("useImageCarousel", function (options) {
        return isHotSpotCarouselEnabled() ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("isRollUpVariant", function (options) {
        return isRollUpVariant(this) ? options.fn(this) : options.inverse(this);
    });

    $.fn.extend({
        sdHotspot: function () {
            checkHotspots();
            return this.each(function () {
                $(".hotspotimage").each(function () {
                    $(this)
                        .find(".hotspotTooltip")
                        .each(function (index, value) {
                            var htmlContent = $(value).html();
                            var button = $(value).data("button");
                            var round = $(value).data("round");
                            var tooltipBg = $(value).data("tooltipbg");
                            var hsButtonText = $(value).data("hsbuttontext");
                            $(value).html("");
                            if (round != undefined && round != "") {
                                $(
                                    '<div class="' +
                                        round +
                                        '"></div><div class="' +
                                        round +
                                        'In"></div><div class="' +
                                        round +
                                        'Inner"></div>',
                                ).appendTo(value);
                            }
                            if (hsButtonText != null && hsButtonText.length > 0) {
                                $(
                                    '<div class="button ' +
                                        button +
                                        '"><p class="hsbuttontext">' +
                                        hsButtonText +
                                        "</p></div>",
                                ).appendTo(value);
                            } else {
                                $('<div class="button ' + button + '"></div>').appendTo(value);
                            }

                            var prdColourVariantId =
                                $(value).data("colourvariantid") != null
                                    ? $(value).data("colourvariantid").toString()
                                    : "";
                            if (prdColourVariantId.length == 0) {
                                $(
                                    '<div class="hsHtmlContainer"><div class="hsText ' +
                                        tooltipBg +
                                        '"><div class="hotspot-html-close">close</div><div class="hsHtmlContent">' +
                                        htmlContent +
                                        "</div></div></div>",
                                ).appendTo(value);
                                insertDescr($(value), "ltr-before", "pass-ltr");
                                //mouseOverHotspotHandler($(value), 'ltr-slide');
                                clickHotspotHandler($(value), prdColourVariantId);
                            } else {
                                clickHotspotHandler($(value), prdColourVariantId);
                            }
                        });
                });
            });
        },
    });
})(jQuery);

function removeQuickBuyAndWishlistForGiftCards() {
    var $shortcutButtonsContainers = $("div[data-productidstodisableshortcutbuttons]");
    if ($shortcutButtonsContainers != null && $shortcutButtonsContainers.length > 0) {
        var $shortcutButtonsContainer = $shortcutButtonsContainers[0];
        if ($shortcutButtonsContainer != null) {
            var productIds = $($shortcutButtonsContainer).data("productidstodisableshortcutbuttons");
            if (productIds != null) {
                var productIdsSplit = productIds.toString().split(",");
                if (productIdsSplit != null) {
                    $.each(productIdsSplit, function (i, val) {
                        $(".hotspotbuy[data-colourvariantid^='" + val + "']").each(function () {
                            $(this).remove();
                        });
                    });
                }
            }
        }
    }
}

function initiateHotspotBuy() {
    const hotspotsbuy = document.querySelectorAll("div.hotspotbuy");

    if (hotspotsbuy != null && hotspotsbuy.length > 0) {
        if (isHotspotEnabled()) {
            if (window.isTouchDevice()) {
                hotspotsbuy.forEach((element) => {
                    if (
                        element.classList.contains("hotspotwishlist") ||
                        element.classList.contains("hotspotquickbuy")
                    ) {
                        element.style.display = "block";
                    }

                    if (element.classList.contains("hotspotsaveforlater")) {
                        const userLoggedInVal = element.getAttribute("data-userloggedin");
                        if (userLoggedInVal != null && userLoggedInVal.toString().toLowerCase() == "false") {
                            element.style.display = "block";
                        }
                    }
                });
            }
            removeQuickBuyAndWishlistForGiftCards();
            hotspotsbuy.forEach((element) =>
                element.addEventListener("click", function (e) {
                    e.preventDefault();
                    const wishlistVal = element.getAttribute("data-iswishlist");
                    isWishListClicked = wishlistVal != null && wishlistVal.toString().toLowerCase() == "true";
                    if (isWishListClicked) {
                        const userLoggedInVal = element.getAttribute("data-userloggedin");
                        const elevatedCartAndWishlistEnabled = element.getAttribute(
                            "data-elevatedcartandwishlistenabled",
                        );
                        const saveForLaterVal = element.getAttribute("data-issaveforlater");
                        isSaveForLaterClicked =
                            saveForLaterVal != null && saveForLaterVal.toString().toLowerCase() == "true";

                        if (
                            elevatedCartAndWishlistEnabled != null &&
                            elevatedCartAndWishlistEnabled.toString().toLowerCase() == "false" &&
                            !isSaveForLaterClicked &&
                            userLoggedInVal != null &&
                            userLoggedInVal.toString().toLowerCase() == "false"
                        ) {
                            window.location =
                                window.location.origin + "/Login?addto=wishlist&returnurl=" + window.location.pathname;
                            return;
                        }
                    } else {
                        configureGtmForHotspotQuickBuy(element.getAttribute("data-colourvariantid"));
                    }
                    showHotSpotPurchaseDetails(element);
                }),
            );
        } else {
            hotspotsbuy.forEach((element) => (element.style.display = "none"));
        }
    }
}

function clickHotspotHandler(selector, prodId) {
    if (selector != null && selector.length > 0) {
        selector
            .find(".button")
            .off("click")
            .on("click", function () {
                if (prodId.length > 0) {
                    showHotSpotPurchaseDetails(selector);
                } else {
                    if (clickToggle) {
                        showTooltip(selector, "ltr-slide");
                    } else {
                        hideTooltip(selector, "ltr-slide");
                    }
                }
            });
    }
}

function mouseOverHotspotHandler(selector, animationType) {
    if (selector != null && selector.length > 0) {
        var mouseEvents = "ontouchstart touchstart touch";
        selector.unbind(mouseEvents).bind(mouseEvents, function () {
            if (clickToggle) {
                showTooltip(selector, "ltr-slide");
                window.clickToggle = false;
            } else {
                hideTooltip(selector, "ltr-slide");
                window.clickToggle = true;
            }
        });

        selector.off("mouseover").on("mouseover", function () {
            showTooltip(selector, animationType);
        });
        selector.off("mouseout").on("mouseout", function () {
            hideTooltip(selector, animationType);
        });
    }
}

function showHotSpotPurchaseDetails(selector, addToBagHandler) {
    (selectedColourVarId = ""), (selectedSizeVarId = ""), (hsProductInfo = ""); // clear previous stored values
    if (addToBagHandler) hsAddToBagHandler = addToBagHandler;
    else hsAddToBagHandler = hsAddProductToBag;
    var productId = $(selector).data("colourvariantid");
    if ($(selector).length) {
        algoliaUtil.saveSearchAttributes($(selector)[0], productId.toString());
        var listItem = $(selector)[0].closest("li");
        if (window.DY && listItem && listItem.hasAttribute("li-seq")) {
            var sequenceId = $(listItem).attr("li-seq");
            if (sequenceId) {
                window.dyUtil.setQuickViewProductContext(productId + "-" + sequenceId);
            }
        }
    }

    getProductInformation(productId);
}

function addHotspotHtmlModalBackground() {
    if ($("#hotspot-html-modal-background").length == 0) {
        $('<div id="hotspot-html-modal-background" style="display: none"></div>').insertAfter($("#sdHotspot"));
    }
}

function insertDescr(selector, descrClass, divClass) {
    if (selector != null && selector.length > 0) {
        var descr = selector.find(".hsText").addClass(descrClass);
        $('<div class="' + divClass + '"></div>').insertBefore(descr);
    }
}

function isHotspotEnabled() {
    if (!productHotspotConfig) return false;
    return productHotspotConfig.Enabled;
}

function checkHotspots() {
    if (isHotspotEnabled()) {
        var colourVariantIds = "";
        $("div[data-colourvariantid]").each(function () {
            var id = $(this).data("colourvariantid") != null ? $(this).data("colourvariantid") : null; // this is colourvariantid and the length should be 8
            if (id != null && id.toString().length > 0) {
                var showAllColours =
                    $(this).data("hsshowallcolours") == null ? "false" : $(this).data("hsshowallcolours");
                if (colourVariantIds == "") {
                    colourVariantIds = id + "|" + showAllColours;
                } else {
                    colourVariantIds += "," + id + "|" + showAllColours;
                }
            }
        });

        if (colourVariantIds.length > 0) {
            productHotspotCheck(colourVariantIds);
        }
    } else {
        $("div.hotspotTooltip").hide();
    }
}

var currentProductHotspotCheckXhr = null;
function productHotspotCheck(colourVarIds) {
    if (currentProductHotspotCheckXhr != null) currentProductHotspotCheckXhr.abort();

    currentProductHotspotCheckXhr = $.ajax({
        cache: true,
        type: "GET",
        url: "/productdetail/producthotspotcheck",
        data: {
            colourVariantIds: colourVarIds,
            selectedCurrency: _currencyFormatter.ActiveCurrency,
        },
        dataType: "json",
        success: function (data) {
            if (data != null) {
                enableDisableHotspots(data);
            }
        },
        error: function () {},
        complete: function () {
            currentProductHotspotCheckXhr = null;
        },
    });
}

function enableDisableHotspots(results) {
    $(results).each(function () {
        var currentHotspot = $('[data-colourvariantid="' + this.colourVariantId + '"]');
        if (!this.showHotspot && currentHotspot != null) {
            currentHotspot.hide();
        }
    });
}

function validatePage(target) {
    if (!selectedSizeVarId) {
        sizeRequiredButtons.showMessage(target, hotspotModal);
        return false;
    }

    return true;
}

function setSelectedSizeVariantId() {
    var hsSelectedVariantId = "";
    if (isProductHotspotSizeButtonSelectorEnabled()) {
        var $hsSizeVariantSelector = $("ul > li.hsSizeButtonli.hsVariantHighlight");
        if ($hsSizeVariantSelector != null && $hsSizeVariantSelector.length > 0) {
            hsSelectedVariantId = $hsSizeVariantSelector.attr("data-hsvariantid");
        }
    } else {
        var sizeDropDown = $("#hsSizeDdl");
        if (sizeDropDown) hsSelectedVariantId = sizeDropDown.val();
    }
    selectedSizeVarId = hsSelectedVariantId;
}

function addHotspotProductToBag(target, isWishlist, isSaveForLater) {
    if (!validatePage(target)) {
        return;
    }

    hotspotModal.data("addingToBag", true);
    hideHotspotModal();
    hsAddToBagHandler(
        selectedSizeVarId,
        isWishlist ? addToBagCoordinator.addTypes.WishList : addToBagCoordinator.addTypes.Bag,
        isSaveForLater,
    );
}
function addHotspotPrintessProductToBag(target) {
    const detailsUrl = target.dataset.pdpPrintessUrl;

    window.location.assign(detailsUrl);
}
function getCurrentVariantDetails(variantId) {
    let colourVariant = undefined;
    let sizeVariant = undefined;

    if (hsProductInfo.variantsData?.length > 0) {
        for (let i = 0; i < hsProductInfo.variantsData.length; i++) {
            sizeVariant = hsProductInfo.variantsData[i].sizeVariants.find((s) => s.sizeVarId === variantId);

            if (sizeVariant) {
                colourVariant = hsProductInfo.variantsData[i];
                break;
            }
        }
    }

    return {
        brand: hsProductInfo.productBrand,
        name: hsProductInfo.productName,
        taxonomy: hsProductInfo.taxonomy,
        variant: colourVariant?.colourName,
        price: sizeVariant?.prodSizePrices?.priceUnFormatted || colourVariant?.ProdVarPrices?.PriceUnFormatted,
        colourVariantId: colourVariant?.colVarId,
        colourVariantName: colourVariant?.colourName,
        colourVariantPrice: colourVariant?.ProdVarPrices?.PriceUnFormatted,
        sizeVariantId: sizeVariant?.sizeVarId,
        sizeVariantName: sizeVariant?.sizeName,
        sizeVariantPrice: sizeVariant?.prodSizePrices?.priceUnFormatted,
    };
}

function hsAddProductToBag(variantId, type, isSaveForLater) {
    var preorderable = false;
    let isEsdProduct = false;
    let isPrintessPersonalisable = false;

    if (hsProductInfo != undefined && hsProductInfo != null && hsProductInfo != null) {
        try {
            $(hsProductInfo.variantsData[0].sizeVariants).each(function () {
                if (this.sizeVarId == variantId) {
                    preorderable = this.preOrderable;
                    isEsdProduct = this.isEsdProduct;
                    return false;
                }
            });

            isPrintessPersonalisable =
                hsProductInfo.variantsData?.find((x) => x.colVarId == hsProductInfo.selectedColourVariantId)
                    ?.isPrintessPersonalisable ?? false;
        } catch (err) {}
    }

    if (isWishListShortcutEnabled() && type === addToBagCoordinator.addTypes.WishList) {
        var hsElem = $(".hotspotwishlist");
        var userLoggedInVal = hsElem.data("userloggedin");
        var elevatedCartAndWishlistEnabledVal = hsElem.data("elevatedcartandwishlistenabled");
        var elevatedCartAndWishlistEnabled = elevatedCartAndWishlistEnabledVal == "True" ?? false;
        var isUserLoggedIn = userLoggedInVal != null && userLoggedInVal.toString().toLowerCase() == "true";
        if (!elevatedCartAndWishlistEnabled && !isUserLoggedIn && !isSaveForLater) {
            window.location = window.location.origin + "/Login?addto=wishlist&returnurl=" + window.location.pathname;
            return;
        } else {
            addToBagCoordinator.start({
                variantDetails: {
                    id: variantId,
                    isPeronalisable: !isPrintessPersonalisable ? hsProductInfo.isPersonalisable : false,
                    isPreOrderable: preorderable,
                    ageRestriction: hsProductInfo.ageRestriction,
                    isEVoucher: hsProductInfo.isEVoucher,
                    name: hsProductInfo.productName,
                    brand: hsProductInfo.productBrand,
                    isEsdProduct: isEsdProduct,
                },
                quantity: 1,
                addType: type,
                isProductRec: window.hsIsProductRecClick,
            });
        }
    } else {
        addToBagCoordinator.start({
            variantDetails: {
                id: variantId,
                isPeronalisable: !isPrintessPersonalisable ? hsProductInfo.isPersonalisable : false,
                isPreOrderable: preorderable,
                ageRestriction: hsProductInfo.ageRestriction,
                isEVoucher: hsProductInfo.isEVoucher,
                name: hsProductInfo.productName,
                brand: hsProductInfo.productBrand,
                isEsdProduct: isEsdProduct,
            },
            quantity: 1,
            addType: type,
            isProductRec: window.hsIsProductRecClick,
            onComplete: function () {
                if (type === addToBagCoordinator.addTypes.WishList) {
                    $(".hotspotwishlist[data-colourvariantid=" + variantId.substring(0, 8) + "]").addClass(
                        "addedWishList",
                    );
                }
            },
        });
    }
}

function bindHotspotHtmlEvents() {
    $(".hotspot-html-close")
        .unbind("click")
        .click(function () {
            hideHotspotHtmlModalDialog();
            return false;
        });

    $("#hotspot-html-modal-background")
        .unbind("click")
        .click(function () {
            hideHotspotHtmlModalDialog();
            return false;
        });
}

function bindHotspotEvents() {
    if (isProductHotspotColourButtonSelectorEnabled()) {
        var $hsColourButtonli = $("ul > li.hsColourButtonli");
        if ($hsColourButtonli != null && $hsColourButtonli.length > 0) {
            var events = "ontouchstart touchstart click";
            $hsColourButtonli.off(events).on(events, function (e) {
                e.preventDefault();
                hotspotColourVariantChanged($(this).data("hscolvarid"));
                bindHotspotProductData();
            });
        }
    } else {
        var $hsColourDdl = $("#hsColourDdl");
        if ($hsColourDdl != null && $hsColourDdl.length > 0) {
            if ($("#hsColourDdl option").length == 1) {
                $hsColourDdl.prop("disabled", true);
                $(".hsColourSelection").attr("data-disabled", "disabled");
            } else {
                $hsColourDdl.prop("disabled", false);
            }
            $hsColourDdl.change(function () {
                hotspotColourVariantChanged($(this).val());
                bindHotspotProductData();
            });
        }
    }

    if (isProductHotspotSizeButtonSelectorEnabled()) {
        var $hsSizeButtonli = $("ul > li.hsSizeButtonli");
        if ($hsSizeButtonli != null && $hsSizeButtonli.length > 0) {
            if ($hsSizeButtonli.length == 1) {
                $hsSizeButtonli.addClass("hsVariantHighlight");
                selectedSizeVarId = $hsSizeButtonli.attr("data-hsvariantid");
            }
            var events = "ontouchstart touchstart click";
            $hsSizeButtonli.off(events).on(events, function (e) {
                e.preventDefault();
                var $this = $(this);
                if ($this.hasClass("hsVariantHighlight") || $this.hasClass("greyOut")) return;
                $hsSizeButtonli.removeClass("hsVariantHighlight");
                $this.addClass("hsVariantHighlight");
                selectedSizeVarId = $this.attr("data-hsvariantid");
                bindHotspotProductData();
            });
        }
    } else {
        var $hsSizeDdl = $("#hsSizeDdl");
        if ($hsSizeDdl != null && $hsSizeDdl.length > 0) {
            if ($hsSizeDdl.find("option").length == 1) {
                $hsSizeDdl.prop("disabled", true);
                selectedSizeVarId = $hsSizeDdl.val();
                $(".hsSizeSelection").attr("data-disabled", "disabled");
            } else {
                $hsSizeDdl.prop("disabled", false);
            }
            $hsSizeDdl.change(function () {
                selectedSizeVarId = $(this).val();
                bindHotspotProductData();
            });
        }
    }

    $("#addHotspotToBag")
        .unbind("click")
        .click(function (e) {
            e.preventDefault();
            addHotspotProductToBag(this, false, false);
        });

    $("#addHotspotPrintessToBag, #addHotspotPrintessToWishlist")
        .unbind("click")
        .click(function (e) {
            e.preventDefault();
            addHotspotPrintessProductToBag(this);
        });

    $("#addHotspotToWishList")
        .unbind("click")
        .click(function (e) {
            e.preventDefault();
            addHotspotProductToBag(this, true, false);
        });

    $("#addHotspotToSaveForLater")
        .unbind("click")
        .click(function (e) {
            e.preventDefault();
            addHotspotProductToBag(this, true, true);
        });
}

function hotspotColourVariantChanged(colourVarId) {
    selectedColourVarId = colourVarId;
    var newSizeVarId = "";
    var isSizeExists = false;
    if (hsProductInfo != null) {
        var selectedSizeCode = selectedSizeVarId.substr(8);
        $(hsProductInfo.variantsData).each(function () {
            if (selectedColourVarId != this.colVarId) return;
            if (this.sizeVariants.length == 0) return;
            if (this.sizeVariants.length == 1 && window.hsHideSingleSize) {
                newSizeVarId = this.sizeVariants[0].sizeVarId;
                return;
            }

            $(this.sizeVariants).each(function () {
                if (selectedSizeCode == this.sizeVarId.substr(8) && this.inStock) {
                    isSizeExists = true;
                    newSizeVarId = this.sizeVarId;
                }
            });
        });
    }
    selectedSizeVarId = newSizeVarId;
}

function hideHotspotModal() {
    isWishListClicked = false;
    modalHelper.hideModal(hotspotModal);
}

function hideHotspotHtmlModalDialog() {
    var toolTipTagToHide = $("div.hotspotTooltip.hotspot_img.show");
    if (toolTipTagToHide.length > 0) {
        hideTooltip($("div.hotspotTooltip.hotspot_img.show"), "ltr-slide");
    }
}

var currentGetHotspotProductXhr = null;
function getProductInformation(productId) {
    if (currentGetHotspotProductXhr != null) currentGetHotspotProductXhr.abort();

    hotspotModal.find(".modal-body").html('<p class="loading-text">Loading...</p>');
    currentGetHotspotProductXhr = $.ajax({
        cache: true,
        type: "GET",
        url: "/ProductDetail/GetColourVariantsForProduct",
        data: {
            productId: productId,
            selectedCurrency: _currencyFormatter.ActiveCurrency,
        },
        dataType: "json",
        success: function (data) {
            if (data != null && data.variantsData.length > 0) {
                hsProductInfo = data;
                var hotspotElement = $('[data-colourvariantid="' + hsProductInfo.selectedColourVariantId + '"]');
                window.isSingleColourHotspot =
                    hotspotElement.data("hsshowallcolours") || getHotSpotColourSelectEnabled() ? false : true;
                window.hsHideSingleSize = hotspotElement.data("hshidesinglesize") ? true : false;
                window.hsShowDescription = hotspotElement.data("hsshowdescription") ? true : false;
                window.hsIsProductRecClick = hotspotElement.data("hsisproductrecclick") ? true : false;
                hotspotColourVariantChanged(hsProductInfo.selectedColourVariantId);
                bindHotspotProductData();
            } else {
                showHotspotError();
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            if (textStatus != "abort") showHotspotError();
        },
        complete: function () {
            addHotspotDismissHandler(productId);
            modalHelper.showModal(hotspotModal);
            currentGetHotspotProductXhr = null;
            $(window).resize(); // Trigger modal positioning
        },
    });
}

function bindHotspotProductData() {
    var hasProduct = hsProductInfo && hsProductInfo.variantsData && hsProductInfo.variantsData.length > 0;
    var template = Handlebars.compile(productHotspotTemplate);
    var html = template(hsProductInfo);

    hotspotModal.find(".modal-body").html(html);
    sizeRequiredButtons.init();
    bindHotspotEvents();
    if (hasProduct && selectedColourVarId) {
        algoliaUtil.bindAlgloliaDataAttributes("#addHotspotToBag", selectedColourVarId.toString());
        if (window.DY) {
            window.dyUtil.updateProductContext(selectedColourVarId);
        }
    }
    var swiperSelector = ".swiper-container.hsAltImageSwiper";
    $(swiperSelector).addClass("hideControls");

    if (isHotSpotCarouselEnabled() && $(".swiper-slide", swiperSelector).length > 1) {
        setTimeout(function () {
            $(swiperSelector).removeClass("hideControls");
            var timeout = parseInt(getHotSpotCarouselTimeout(), 10);
            var mySwiper = new Swiper(swiperSelector, {
                // Optional parameters
                direction: "horizontal",
                loop: true,
                autoplay:
                    timeout > 0
                        ? {
                              delay: timeout,
                              disableOnInteraction: false,
                          }
                        : undefined,
                pagination: {
                    el: ".hsAltImageSwiper .swiper-pagination",
                    clickable: true,
                },
                navigation: {
                    nextEl: ".hsAltImageSwiper .swiper-button-next",
                    prevEl: ".hsAltImageSwiper .swiper-button-prev",
                },
            });
        }, 0);
    }
    if (productHotspotConfig.SelectSizeTextEnabled) {
        setSelectASizeText();
    }

    if (isRollUpVariant(hsProductInfo)) {
        createRollUpVariantDropdown(selectedColourVarId);
    }
}

function getErrorMessage() {
    var errorTemplate = Handlebars.compile(hotspotErrorTemplate);
    return errorTemplate({ message: "Sorry, something went wrong. Please try again later." });
}

function showHotspotError() {
    var html = getErrorMessage();
    hotspotModal.find(".modal-body").html(html);
    bindHotspotEvents();
}

function initializeHotspotsQuickBuyAndWishListEvents(selector) {
    const selectorList = document.querySelectorAll(selector);

    if (selectorList != null && selectorList.length > 0) {
        if (!window.isTouchDevice()) {
            selectorList.forEach((element) => {
                const hotspotWishList = element.querySelector(".hotspotbuy.hotspotwishlist");
                const hotspotQuickBuy = element.querySelector(".hotspotbuy.hotspotquickbuy");
                const hotspotSaveForLater = element.querySelector(".hotspotbuy.hotspotsaveforlater");
                const userLoggedInVal = hotspotSaveForLater?.dataset.userloggedin;

                element.addEventListener("mouseover", function (e) {
                    handleMouseEvents(e, hotspotWishList, hotspotQuickBuy, hotspotSaveForLater, userLoggedInVal);
                });

                element.addEventListener("mouseout", function (e) {
                    handleMouseEvents(e, hotspotWishList, hotspotQuickBuy, hotspotSaveForLater, userLoggedInVal);
                });
            });
        }
        initiateHotspotBuy();
    }
}

function handleMouseEvents(e, hotspotWishList, hotspotQuickBuy, hotspotSaveForLater, userLoggedInVal) {
    if (e.type === "mouseover") {
        if (hotspotWishList != null && hotspotWishList.style.display == "none") hotspotWishList.style.display = "block";
        if (hotspotQuickBuy != null && hotspotQuickBuy.style.display == "none") hotspotQuickBuy.style.display = "block";
        if (userLoggedInVal != null && userLoggedInVal.toString().toLowerCase() == "false") {
            if (hotspotSaveForLater != null && hotspotSaveForLater.style.display == "none") {
                hotspotSaveForLater.style.display = "block";
            }
        }
    }

    if (e.type === "mouseout") {
        if (hotspotWishList != null) hotspotWishList.style.display = "none";
        if (hotspotQuickBuy != null) hotspotQuickBuy.style.display = "none";
        if (hotspotSaveForLater != null) hotspotSaveForLater.style.display = "none";
    }
}

function showTooltip(selector, animationType) {
    addHotspotHtmlModalBackground();
    $("#hotspot-html-modal-background").show();
    selector.css("z-index", "9999");
    selector.addClass("show");
    selector.find(".hsHtmlContent").css("display", "block");
    selector.find(".hsText").addClass(animationType);
    window.clickToggle = false;
    bindHotspotHtmlEvents();
}
function hideTooltip(selector, animationType) {
    $("#hotspot-html-modal-background").hide();
    selector.css("z-index", "1");
    selector.removeClass("show");
    selector.find(".hsHtmlContent").css("display", "none");
    selector.find(".hsText").removeClass(animationType);
    window.clickToggle = true;
}

function checkVariableExists(gVariable) {
    if (typeof gVariable !== "undefined") {
        return true;
    }
    return false;
}

function isProductHotspotSizeButtonSelectorEnabled() {
    if (!productHotspotConfig) return false;
    return productHotspotConfig.SizeButtonSelectorEnabled;
}

function isRollUpVariant(productData) {
    if (!productHotspotConfig || !productHotspotConfig.HotSpotRollUpVariantsEnabled) return false;
    return $(".hotspotquickbuy[data-colourvariantid=" + productData.selectedColourVariantId + "]")[0].hasAttribute(
        "data-hsshowallcolours",
    );
}

function isProductHotspotColourButtonSelectorEnabled() {
    if (!productHotspotConfig) return false;
    return productHotspotConfig.ColourButtonSelectorEnabled;
}

function isWishListShortcutEnabled() {
    if (!productHotspotConfig) return false;
    return productHotspotConfig.WishListShortcutEnabled;
}

function isHotSpotSizeGuideEnabled() {
    if (!productHotspotConfig) return false;
    return productHotspotConfig.HotSpotSizeGuideEnabled;
}

function isHotSpotPromotionLinkEnabled() {
    if (!hsProductInfo) return false;
    return hsProductInfo.IsProductInActiveGiftPromotion;
}

function isHotSpotCarouselEnabled() {
    if (!productHotspotConfig) return false;
    return productHotspotConfig.HotSpotCarouselEnabled;
}

function getHotSpotCarouselTimeout() {
    if (!productHotspotConfig) return false;
    return productHotspotConfig.HotSpotCarouselTimeout;
}

function getHotSpotColourSelectEnabled() {
    if (!productHotspotConfig) return false;
    return productHotspotConfig.HotSpotColourSelectEnabled;
}

function configureGtmForHotspotQuickBuy(productId) {
    if (!productHotspotConfig || !window.dataLayer) return;
    if (productId == null || productId.toString().length == 0) return;

    window.dataLayer.push({
        event: productHotspotConfig.SiteShortName + "_onClick",
        specificEvent: "QuickBuyButton",
        description: "Clicked on " + productId.toString(),
        catalogShortname: productHotspotConfig.SiteShortName,
    });
    pushDataLayerEvent("quickBuy", "quickBuy", "clicked", productId);
}

function addHotspotDismissHandler(productId) {
    hotspotModal.one("hidden.bs.modal", function () {
        if (hotspotModal.data()["addingToBag"] === true) {
            hotspotModal.removeData("addingToBag");
            return;
        }

        if (!window.dataLayer || productId == null || productId.toString().length == 0) return;

        pushDataLayerEvent("quickBuy", "quickBuy", "dismissed", productId);
    });
}

function setSelectASizeText() {
    var addToBagWrapper = $(".addToBasketContainer");
    $(".hsSizeButtonli.hsVariantHighlight").length > 0 ||
    ($("#hsSizeDdl").length > 0 && $("#hsSizeDdl").val() != "") ||
    hsHideSingleSize
        ? addToBagWrapper
              .find(".innerHotSpotLine")
              .text(addToBagWrapper.attr("data-add-to-bag-text"))
              .end()
              .removeClass("sizeRequired")
        : addToBagWrapper
              .find(".innerHotSpotLine")
              .text(addToBagWrapper.attr("data-size-select-text"))
              .end()
              .addClass("sizeRequired");
}

function pushDataLayerEvent(event, category, action, data) {
    window.dataLayer.push({
        event: event,
        eventCategory: category,
        eventLabel: data,
        eventAction: action,
    });
}

$(document).ready(function () {
    if (queryutils.exists("quickbuy")) {
        var prodId = queryutils.get("quickbuy");
        if (prodId.length > 0) {
            var selector = ".hotspotTooltip.hotspotFull[data-colourvariantid=" + prodId + "]";
            var hotspotButton = $(selector);

            if (hotspotButton.length) {
                showHotSpotPurchaseDetails(selector);
            }
        }
    }
    if (window.DY) {
        $("#hotspotModal").on("hidden.bs.modal", function () {
            window.dyUtil.setOriginalContext();
        });
    }
});

function createRollUpVariantDropdown(productId) {
    selectivesElem = $("#selectives");
    colourVariantDropdown = $(".colourVariantDropdown");

    initialiseRollUpVariantDropdown(productId);

    colourVariantDropdown?.click(function (e) {
        if (!$(e.target).hasClass("colourVariantItem") && selectivesElem?.hasClass("show")) {
            hideSelectives();
            return;
        }
        showSelectives();
    });

    $(".colourVariantItem").click(function () {
        hotspotColourVariantChanged($(this).attr("data-value"));
        bindHotspotProductData();

        var selectedColourVariant = $(this).html();
        colourVariantDropdown?.val(selectedColourVariant);
        colourVariantDropdown?.html(selectedColourVariant);
        hideSelectives();
    });
}

function initialiseRollUpVariantDropdown(productId) {
    var variantsColId = $.grep(hsProductInfo.variantsData, function (prodId, i) {
        return prodId.colVarId == productId;
    });

    var selectedVariantHtml = `<img alt="${variantsColId[0].colourName}" src="${variantsColId[0].rollUpImageUrl}" />${variantsColId[0].colourName}`;

    colourVariantDropdown.val(variantsColId[0].colVarId);
    colourVariantDropdown.html(selectedVariantHtml);
}

function showSelectives() {
    selectivesElem?.addClass("show");
}

function hideSelectives() {
    if (selectivesElem?.hasClass("show")) selectivesElem.removeClass("show");
}
