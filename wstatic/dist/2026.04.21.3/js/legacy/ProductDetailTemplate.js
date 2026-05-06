(function (
    window,
    $,
    queryutils,
    segment,
    dataLayerData,
    ecommerceData,
    GTMpushDataLayer_event,
    productDetailsShared,
    mainImageZoom,
    productLook,
    productDetailSwiper,
    hashService,
    algoliaUtil,
    undefined,
) {
    "use strict";

    var isColCodeHashEnabled = false,
        previousColourState = "",
        sdPage = {
            model: {
                init: function () {
                    this.spnPrevThumbImage = $("#sPrevImg");
                    this.spnNextThumbImage = $("#sNextImg");
                    this.moduleDnnCentricRatingAndCommentsControl = $(".ModDNNCentricRatingAndCommentsC");
                    this.divShowAlternateImages = $("#divShowAlternateImges");
                    this.divImageControls = $("#divImageControls");
                    this.zoomSpan = $("#zoomSpan");
                    this.img1 = $("#img1");
                    this.stickyCtaWrapper = $("#sticky-atb-wrapper");
                },
                panelCount: 0,
                currAltImagePos: 4,
                productImagesCarouselExists: function () {
                    return $(".productImageCarousel").length > 0;
                },
                productImagesVerticalSliderlExists: function () {
                    return $(".productImageVerticalSlider").length > 0;
                },
                productImagesGridExists: function () {
                    return $(".productImageGrid").length > 0;
                },
                productImagesTwoImageCarouselExists: function () {
                    return $(".productTwoImageCarousel").length > 0;
                },
                divSlidingReviewContainer: function () {
                    return $("#slidingReviewContainer");
                },
                customerReviewHeader: function () {
                    return $("#customerReviewHeader");
                },
                mainProductTop: function () {
                    return $("div#mainProductTop");
                },
                mainProductBottom: function () {
                    return $("#mainProductBottom");
                },
                divMainProduct: function () {
                    return $("div.MainProduct");
                },
                divLastHeroChild: function () {
                    return $("#lastHeroChild");
                },
                imgProductSash: function () {
                    /// <summary>
                    /// Main Image sash
                    /// </summary>
                    return $('img[id$="imgProductSash"]');
                },
                imgProductImage: function (parentEl) {
                    return $('img[id$="imgProductImage"]', parentEl);
                },
                piThumbList: function (parentEl) {
                    /// <summary>
                    /// Thumbnails under main image
                    /// </summary>
                    var ctrl = $('ul[id$="piThumbList"]', parentEl);
                    if (ctrl.length === 0) {
                        return $('ul[id$="piThumbList"]');
                    }
                    return ctrl;
                },
                spnPrevThumbImage: null,
                spnNextThumbImage: null,
                divShowAlternateImages: null,
                stickyCtaWrapper: null,
                pnlRatingsAndReviews: function (parentEl) {
                    /// <summary>
                    /// Returns Review Summary panel given context
                    /// </summary>
                    /// <param name="parentEl"></param>
                    return $("div[id$='divReviewSummary']", parentEl);
                },
                divImageControls: null,
                zoomSpan: null,
                img1: null,
                isHeroProduct: function (parentEl) {
                    /// <summary>
                    /// Returns true if this is a Hero product
                    /// </summary>
                    /// <param name="parentEl"></param>
                    return sdPage.model.imgProductImage(parentEl).length > 0;
                },
                sizeDdl: function (parentEl) {
                    return $('select[id$="sizeDdl"]', parentEl);
                },
                sizeCustomDdl: function (parentEl) {
                    return $(".no-image-dropdown-option", parentEl);
                },
                colourDdl: function (parentEl) {
                    return $('select[id$="colourDdl"]', parentEl);
                },
                divSize: function (parentEl) {
                    return $('div[id$="divSize"]', parentEl);
                },
                colourName: function (parentEl) {
                    return $('span[id$="colourName"]', parentEl);
                },
                moduleDnnCentricRatingAndCommentsControl: null,
                setSelectedSizeVariantValue: function (value, parentControl) {
                    productDetailsShared.hdnSelectedSizeVarId(parentControl).val(value);
                },
                setSelectedSizeVariantName: function (value, parentControl) {
                    productDetailsShared.hdnSelectedSizeName(parentControl).val(value);
                },
                getDisplayAttributes: function (parentEl) {
                    return $("#DisplayAttributes", parentEl);
                },
                getDescriptionAttributesContainer: function (parentEl) {
                    return $(".ProductDescriptionAttributesContainer", parentEl);
                },
                getInStockSizeVariantsForColour: function (variants, colourVariantId) {
                    var inStockSizeVariants = [];

                    if (!variants) {
                        return inStockSizeVariants;
                    }

                    $.each(variants, function (i, variant) {
                        if (variant.ColVarId == colourVariantId) {
                            $.each(variant.SizeVariants, function (j, sizeVariant) {
                                if (sizeVariant.InStock) {
                                    inStockSizeVariants.push(sizeVariant);
                                }
                            });
                        }
                    });

                    return inStockSizeVariants;
                },
                getNoOfThumbImgsToDisplay: function () {
                    /// <summary>
                    /// Returns the number of ThumbImgs to display
                    /// </summary>
                    var x = sdPage.model.divShowAlternateImages.attr("ThumbImgsToDisplay");
                    if (x === undefined) {
                        return 4;
                    }
                    try {
                        return parseInt(x);
                    } catch (e) {
                        return 4;
                    }
                },
                ratingsMarkup: null,
                InfoAccordion: function () {
                    var that = this;
                    that.panels = [];
                    return that;
                },
                InfoPanel: function (title, id, markup, shouldExpand) {
                    var that = this;
                    that.title = title;
                    that.id = id;
                    that.Markup = markup;
                    that.shouldExpand = shouldExpand;
                    return that;
                },
                accordionTemplate:
                    "<div class='{{id}}Container'>" +
                    "		<div class='panel-heading FooterHeader'>" +
                    "			<a data-toggle='collapse' data-parent='.infoaccordion' href='#{{id}}'>" +
                    "				<h4 class='panel-title '>" +
                    "					{{title}}" +
                    "                 <span class='MobMenIcon glyphicon glyphicon-chevron-right'></span>" +
                    "				</h4>" +
                    "			</a>" +
                    "		</div>" +
                    "        {{#if shouldExpand}}" +
                    "		<div id='{{id}}' class='panel-collapse collapse in'>" +
                    "           {{else}}" +
                    "		<div id='{{id}}' class='panel-collapse collapse'>" +
                    "           {{/if}}" +
                    "			<div class='panel-body'>" +
                    "				{{{Markup}}}" +
                    "			</div>" +
                    "		</div>" +
                    "</div>",
                contentVideos: [],
                contentVideoPlayers: [],
                bannerVideo: null,
                bannerResponsiveVideo: null,
                bannerVideoPlayer: null,
                bannerResponsiveVideoPlayer: null,
                prodDescExpandableExists: function () {
                    return $("#pdp-expandable-section-1").length > 0;
                },
            },
            view: {
                init: function () {
                    sdPage.model.init();
                    this.setInitialSizeState();
                    this.addCurrentBrandToRecents();
                    this.initNextDayDeliveryCountdownTimer();
                },
                addCurrentBrandToRecents: function () {
                    try {
                        if ($("#hdnVisitedBrandsEnabled").val() !== "true") return;
                        var brand = productDetailsShared.getBrand();
                        if (!brand || !brand.name || !brand.url) return;
                        if (isVisitedBrandExclusion(brand.name)) return;

                        var key = "visitedBrands";
                        var brandsJson = localStorage.getItem(key);
                        var brandsList = [];
                        if (brandsJson) {
                            try {
                                var savedBrandsList = JSON.parse(brandsJson);
                                if (savedBrandsList.length > 0) {
                                    for (var i = 0; i < savedBrandsList.length; i++) {
                                        if (savedBrandsList[i].name === brand.name) {
                                            savedBrandsList.splice(i, 1);
                                            break;
                                        }
                                    }
                                    savedBrandsList.push(brand);
                                    localStorage.setItem(key, JSON.stringify(savedBrandsList));
                                } else {
                                    brandsList.push(brand);
                                    localStorage.setItem(key, JSON.stringify(brandsList));
                                }
                            } catch (ex) {
                                brandsList.push(brand);
                                localStorage.setItem(key, JSON.stringify(brandsList));
                            }
                        } else {
                            brandsList.push(brand);
                            localStorage.setItem(key, JSON.stringify(brandsList));
                        }
                    } catch (e) {
                        if (console.error) console.error("Error in addCurrentBrandToRecents", e);
                    }
                },
                addCurrentProductToRecents: function () {
                    try {
                        if ($("#hdnEnableRecentlyViewed").val() !== "true") return;
                        var product = productDetailsShared.getCurrentColourVariant();
                        var selected = productDetailsShared.getSelectedColourVariantValue();
                        if (!product || !selected) return;

                        var selectedProduct = {
                            id: selected,
                            product: product,
                        };

                        var maxLength = parseInt($("#hdnRecentlyViewedProductsMax").val());

                        var key = "recentlyViewedProducts";
                        var productsJson = localStorage.getItem(key);
                        var productsList = [];
                        if (productsJson) {
                            try {
                                var savedProductsList = JSON.parse(productsJson);
                                if (savedProductsList.length > 0) {
                                    var productFound = false;
                                    for (var i = 0; i < savedProductsList.length; i++) {
                                        if (savedProductsList[i].id === selectedProduct.id) {
                                            productFound = true;
                                            break;
                                        }
                                    }
                                    if (!productFound) {
                                        savedProductsList.push(selectedProduct);
                                        if (savedProductsList.length > maxLength) {
                                            savedProductsList = savedProductsList.slice(1, savedProductsList.length);
                                        }
                                        localStorage.setItem(key, JSON.stringify(savedProductsList));
                                    }
                                } else {
                                    productsList.push(selectedProduct);
                                    localStorage.setItem(key, JSON.stringify(productsList));
                                }
                            } catch (ex) {
                                productsList.push(selectedProduct);
                                localStorage.setItem(key, JSON.stringify(productsList));
                            }
                        } else {
                            productsList.push(selectedProduct);
                            localStorage.setItem(key, JSON.stringify(productsList));
                        }
                    } catch (e) {
                        if (console.error) console.error("Error in addCurrentProductToRecents", e);
                    }
                },
                setInitialSizeState: function () {
                    $.each(productDetailsShared.getProductScopesOnPage(), function () {
                        // check for size index override
                        if (queryutils.exists("sizeIndex")) {
                            var sizeIndex = queryutils.get("sizeIndex");
                            if (sizeIndex !== "") {
                                sizeIndex = parseInt(sizeIndex);
                                var currSize = $(".SizeDropDown option").eq(sizeIndex);
                                if (typeof currSize !== "undefined") {
                                    sdPage.model.setSelectedSizeVariantName(currSize.attr("title"));
                                    sdPage.model.setSelectedSizeVariantValue(currSize.val());
                                }
                            }
                        }

                        var el = $(this);
                        var initialSizeName = productDetailsShared.getSelectedSizeVariantName(el);

                        var scope = productDetailsShared.getProductScope(el);
                        if (initialSizeName.length > 0) {
                            populateSizeVariantChangedValues(scope, initialSizeName, el);
                        }
                    });
                },
                populateHiddenSizeValues: function (
                    parentScope,
                    sizeText,
                    sizeVariantId,
                    preOrderStatus,
                    sizeSashUrl,
                    sizeQty,
                ) {
                    sdPage.model.setSelectedSizeVariantValue(sizeVariantId, parentScope);
                    sdPage.model.setSelectedSizeVariantName(sizeText, parentScope);
                    productDetailsShared.hdnSelectedSizePreorderValue(parentScope).val(preOrderStatus);

                    var sizeButtons = $("ul > li.sizeButtonli", parentScope);
                    if (sizeButtons.length != 0) {
                        if (sizeSashUrl != "" && productDetailsShared.isProductPersonalised(parentScope)) {
                            var imgProductSash = sdPage.model.imgProductSash();
                            imgProductSash.attr("src", sizeSashUrl);
                            imgProductSash.show();
                        }
                        sizeButtons.removeClass("sizeVariantHighlight");
                        var sizeli = $('ul > li.sizeButtonli[data-text="' + sizeText + '"]', parentScope);
                        if (sizeli !== null && sizeli.length > 0) {
                            sizeli.addClass("sizeVariantHighlight");
                            sizeli.attr("data-stock-qty", sizeQty);
                            toggleLowStockSellingFastIndicators(sizeli, parentScope);
                            window.anonymousWishlist.highlightIconIfProductOnWishlistPDP();
                            // predorder button is black
                            $(".addToBasketContainer, .PersVouchBasketContainer").removeClass("addedToBag");
                            setAddToBagButtonText();
                        }
                    } else {
                        $(".addToBasketContainer, .PersVouchBasketContainer").addClass("sizeSelected");
                    }

                    var ddl = sdPage.model.sizeDdl(parentScope);
                    if (ddl.length != 0) {
                        ddl.find("option:selected").removeAttr("selected");
                        $("option[value='" + sizeText.replace("'", "\\'") + "']", ddl).prop("selected", true);
                        setAddToBagButtonText();
                    } else {
                        $(".addToBasketContainer, .PersVouchBasketContainer").addClass("sizeSelected");
                    }
                },
                processAccordion: function (infoTab) {
                    var headings = $(".rtsIn", infoTab),
                        contents = $(".infoTabPageContainer .infoTabPage", infoTab),
                        templateObj = new sdPage.model.InfoAccordion(),
                        accordionTemplate =
                            "<div class='infoaccordion'>{{#panels}}" +
                            sdPage.model.accordionTemplate +
                            "{{/panels}}</div>";
                    $.each(contents, function (i, tab) {
                        var c = $(tab).text();
                        if (c.indexOf("No Specification Available") !== -1) {
                            contents.splice(i, 1);
                        }
                    });
                    $.each(headings, function (i, heading) {
                        var $contents = $(contents[i]);
                        templateObj.panels.push(
                            new sdPage.model.InfoPanel(
                                $(heading).html(),
                                "InfoTab" + sdPage.model.panelCount,
                                $contents.html(),
                                $contents.data("openbydefault") == "True",
                            ),
                        );
                        sdPage.model.panelCount++;
                    });

                    var template = window.Handlebars.compile(accordionTemplate);
                    infoTab.after(template(templateObj));
                },
                addProductDetailToBag: function (parentEl) {
                    var button = $(".addToBag", parentEl);
                    var buttonInner = button.find(".addToBagInner");
                    var addingText = buttonInner.data("addingtobag");
                    var onComplete;

                    if (sdPage != null && sdPage.model != null) {
                        if (addingText) {
                            var addToBasketContainer = $(".addToBasketContainer", parentEl);
                            if (!$("#pnlPersonalisation").length > 0) {
                                addToBasketContainer.removeClass("addedToBag").addClass("addToBagInProgress");
                                buttonInner.text(addingText);
                            }

                            onComplete = function () {
                                var isPreOrderable = buttonInner.hasClass(".isPreOrderable");
                                var buttonText = isPreOrderable
                                    ? buttonInner.data("preorder")
                                    : buttonInner.data("addtobag");
                                buttonInner.text(buttonText);
                                addToBasketContainer.removeClass("addToBagInProgress");

                                // check if added to bag text is available
                                if ($("#divMyIdPersonalisation").length > 0) {
                                    button = $("#aPersAddToBag", parentEl);
                                    buttonInner = button.find(".addToBagInner");
                                    addingText = buttonInner.data("addingtobag");
                                    addToBasketContainer = $(".PersVouchBasketContainer", parentEl);
                                }

                                var addedtobagAttr = buttonInner.attr("data-addedtobag");
                                if (
                                    typeof addedtobagAttr !== "undefined" &&
                                    addedtobagAttr !== false &&
                                    !isPreOrderable
                                ) {
                                    var buttonText = buttonInner.data("addedtobag");
                                    buttonInner.text(buttonText);
                                    addToBasketContainer.addClass("addedToBag");
                                    setTimeout(function () {
                                        buttonInner.text(buttonInner.data("addtobag"));
                                        addToBasketContainer.removeClass("addedToBag");
                                    }, 3000);
                                }
                                window.Printess?.resetPrintessPersonalisation();
                            };
                        } else {
                            onComplete = function () {
                                window.Printess?.resetPrintessPersonalisation();
                            };
                        }
                    }
                    sdPage.view.processAddProductRequest(
                        parentEl,
                        addToBagCoordinator.addTypes.Bag,
                        null,
                        null,
                        onComplete,
                    );
                },
                // it's acting like a toggler function, once clicked on 'add personalisation' it will hide (non pers) buttons, or show them again
                openProductDetailForPersonalisation: function (parentEl) {
                    var product = productDetailsShared.getCurrentColourVariant(parentEl);
                    if ($("#ProductStandardAddToBag").is(":visible")) {
                        if (product.IsPreorderable) {
                            if ($("#pnlPersonalisation").hasClass("personalisationActive")) {
                                return;
                            }
                            sdPage.view.processAddProductRequest(
                                parentEl,
                                addToBagCoordinator.addTypes.Bag,
                                null,
                                null,
                                null,
                            );
                        } else {
                            $("#pnlPersonalisation").addClass("personalisationActive");
                            $(".BasketWishContainer").hide();
                            $("#ProductStandardAddToBag").hide();
                            $("#aPersWishListToLogin").removeClass("hidden");
                            $("#aAddToWishList").addClass("hidden");
                            $("#aWishListToLogin").addClass("hidden");
                            sdPage.view.processAddProductRequest(
                                parentEl,
                                addToBagCoordinator.addTypes.Bag,
                                null,
                                null,
                                null,
                            );
                        }
                    } else {
                        $("#pnlPersonalisationDetails").html("");
                        $(".BasketWishContainer").show();
                        $("#ProductStandardAddToBag").show();
                        $("#pnlPersonalisation").removeClass("personalisationActive");
                        $("#ProductStandardAddToBag #aAddToBag").removeClass("hidden");
                        $("#aAddToWishList").removeClass("hidden");
                        $("#aWishListToLogin").removeClass("hidden");
                        $("#aPersWishListToLogin").addClass("hidden");
                        $("#aPersAddToBag").addClass("hidden");
                        $("#aNoPersAddToBag").addClass("hidden");
                        $("#aPersAddToWishList").addClass("hidden");
                        $("#aNoPersAddToWishList").addClass("hidden");
                    }
                },
                addMyIdProductDetailToBag: function (parentE1) {
                    var addType = addToBagCoordinator.addTypes.Bag;
                    var parentEl = productDetailsShared.getProductScopesOnPage()[0];
                    $("html, body").scrollTop();
                    var addToBasketContainer = $(".addToBasketContainer ", parentEl);
                    var addToBagInner = addToBasketContainer.find(".addToBagInner");
                    var addToBagText = addToBagInner.data("addtobag");
                    var addingToBagText = addToBagInner.data("addingtobag");
                    var addedToBagText = addToBagInner.data("addedtobag");

                    if (typeof addingToBagText !== "undefined" && addingToBagText !== null) {
                        addToBasketContainer.addClass("addToBagInProgress");
                        addToBagInner.text(addingToBagText);
                    }

                    addToBagCoordinator.start({
                        variantDetails: productDetailsShared.getProductVariantDetails(parentEl, true),
                        quantity: productDetailsShared.getQuantity(parentEl),
                        addType: addType,
                        onComplete: function () {
                            addToBasketContainer.removeClass("addToBagInProgress");

                            if (typeof addedToBagText == "undefined" || addedToBagText !== null) {
                                addToBagInner.text(addedToBagText);
                            } else {
                                addToBagInner.text(addToBagText);
                            }
                        },
                    });
                },
                addMyIdProductDetailToWishlist: function (parentE1) {
                    var addType = addToBagCoordinator.addTypes.WishList;
                    var parentEl = productDetailsShared.getProductScopesOnPage()[0];
                    $("html, body").scrollTop();
                    addToBagCoordinator.start({
                        variantDetails: productDetailsShared.getProductVariantDetails(parentEl, true),
                        quantity: productDetailsShared.getQuantity(parentEl),
                        addType: addType,
                    });
                },
                addProdDetailToWishList: function (parentEl) {
                    sdPage.view.processAddProductRequest(
                        parentEl,
                        addToBagCoordinator.addTypes.WishList,
                        null,
                        null,
                        function (bagItem) {
                            var lblWishListButton = $("span[id$='lblWishListButton']", parentEl);
                            var wishListSVG = $("a.wishListSVG", parentEl);
                            lblWishListButton.text(lblWishListButton.data("addedtext")).addClass("addWishList");
                            wishListSVG.addClass("addedWishList");
                            window.Printess?.resetPrintessPersonalisation();
                        },
                    );
                },
                initiateFastPay: function (parentEl) {
                    if (!parentEl) {
                        parentEl = productDetailsShared.getProductScopesOnPage()[0];
                    }
                    var settingID = null;
                    var fastPayWrapper = $(parentEl).find(".FastPayBuyNow");
                    var settingsDropDownValue = parseInt(
                        fastPayWrapper.find(".FastPayAvailableSettingsDropDown").val(),
                    );
                    if (!isNaN(settingsDropDownValue)) settingID = settingsDropDownValue;
                    fastPayWrapper.addClass("FastPayBuyNowProcessing");
                    sdPage.view.processAddProductRequest(
                        parentEl,
                        addToBagCoordinator.addTypes.FastPay,
                        settingID,
                        null,
                        function (bagItem) {},
                        function () {
                            fastPayWrapper.removeClass("FastPayBuyNowProcessing");
                        },
                    );
                },
                enableAddToBagButton: function () {
                    $(".NonBuyableOverlay").removeClass("NonBuyableOverlayOutOfStock");
                },
                disableAddToBagButton: function () {
                    $(".NonBuyableOverlay").addClass("NonBuyableOverlayOutOfStock");
                },
                processAddProductRequest: function (
                    parentEl,
                    addType,
                    fastPaySettingId,
                    buyNowCallback,
                    onComplete,
                    onError,
                ) {
                    function processAddProductRequestContinue() {
                        var productRec = 0;
                        if (isColCodeHashEnabled) {
                            var hashOptions = hashService.deserialiseLocation();
                            if (hashOptions.pr !== undefined) {
                                productRec = parseInt(hashOptions.pr);
                            }
                        }

                        const ecommerceProductDetails = getEcommerceProductDetails();
                        const productVariantDetails = productDetailsShared.getProductVariantDetails(parentEl);

                        addToBagCoordinator.start({
                            variantDetails: productDetailsShared.getProductVariantDetails(parentEl),
                            quantity: productDetailsShared.getQuantity(parentEl),
                            printessDetails: productDetailsShared.getPrintessDetails(parentEl),
                            addType: addType,
                            fastPaySettingId: fastPaySettingId,
                            buyNowCallback: buyNowCallback,
                            onComplete: onComplete,
                            onError: onError,
                            isProductRec: isColCodeHashEnabled
                                ? productRec == 1
                                : window.location.search.indexOf("pr=1") != -1,
                        });
                    }

                    if (!productDetailsShared.isSizeSelected(parentEl)) {
                        sdPage.view.showSizeSelectionPopup(parentEl, addType, processAddProductRequestContinue);
                        return;
                    }

                    var button = $(".addToBag", parentEl);
                    var buttonInner = button.find(".addToBagInner");
                    if (buttonInner.data("iscompetition")) {
                        sdPage.view.showCompetitionPopup(
                            buttonInner.data("competitiontitle"),
                            buttonInner.data("competitiontext"),
                            buttonInner.data("competitionconfirmtext"),
                            processAddProductRequestContinue,
                        );
                        return;
                    }

                    processAddProductRequestContinue();
                },
                showCompetitionPopup: function (title, text, confirmText, onComplete) {
                    var modalContent =
                        '<div id="CompetitionModalWrapper">' +
                        "<h2>" +
                        title +
                        "</h2>" +
                        "<p>" +
                        text +
                        "</p>" +
                        '<span class="ImgButWrap">' +
                        '<a id="CompetitionEntryButton">' +
                        confirmText +
                        "</a>" +
                        "</span>" +
                        "</div>";
                    var compModal = modalHelper.setupModal({
                        modalName: "CompetitionModal",
                        contentHtml: modalContent,
                    });
                    modalHelper.showModal(compModal);
                    $("#CompetitionEntryButton").click(function () {
                        onComplete();
                        modalHelper.hideModal(compModal);
                    });
                },
                showSizeSelectionPopup: function (parentEl, popupMode, onComplete) {
                    if (!productDetailsShared.addToBagBarActive()) {
                        return;
                    }
                    var buttonText, buttonCssClass;
                    if (popupMode == "BuyNowWithFastPay") {
                        buttonText = $(".FastPayBuyNowButton", parentEl).data("text");
                        buttonCssClass = "SizeModalButton_FastPay";
                    } else if (popupMode == "AddToWishList") {
                        buttonText = $(".pdpWishListLabel", parentEl).data("addtext");
                        buttonCssClass = "SizeModalButton_WishList";
                    } else {
                        buttonText = $(".addToBagInner", parentEl).data("addtobag");
                        buttonCssClass = "SizeModalButton_AddToBag";
                    }
                    var prompt = sdPage.model.divSize(parentEl).data("prompt");
                    var errorMessage = sizeRequiredButtons.getMessageText();
                    var optionsHtml = '<option value="">' + prompt + "</option>";
                    var variants = productDetailsShared.getColourVariants(parentEl);
                    for (var c = 0; c < variants.length; c++) {
                        var colrVariant = variants[c];
                        if (colrVariant.ColVarId == productDetailsShared.getSelectedColourVariantValue(parentEl)) {
                            for (var s = 0; s < colrVariant.SizeVariants.length; s++) {
                                var sizeVariant = colrVariant.SizeVariants[s];
                                var preOrder = false;
                                if (sizeVariant.PreOrderable != undefined && sizeVariant.PreOrderable != null) {
                                    preOrder = sizeVariant.PreOrderable;
                                }
                                //TODO - Escape values
                                optionsHtml +=
                                    '<option value="' +
                                    sizeVariant.SizeVarId +
                                    '" data-preorder="' +
                                    preOrder +
                                    '">' +
                                    sizeVariant.SizeName +
                                    "</option>";
                            }
                        }
                    }
                    var modalContent =
                        '<div id="SizeModalDropDownWrapper">' +
                        '<select id="SizeModalDropDown">' +
                        optionsHtml +
                        "</select>" +
                        "</div>" +
                        '<div id="SizeModalErrorMessage" style="display:none">' +
                        errorMessage +
                        "</div>" +
                        '<span class="ImgButWrap">' +
                        '<a id="SizeModalDropDownButton" class="' +
                        buttonCssClass +
                        '">' +
                        buttonText +
                        "</a>" +
                        "</span>";
                    var sizeModal = modalHelper.setupModal({
                        modalName: "SizeSelectionModal",
                        titleHtml: prompt,
                        contentHtml: modalContent,
                    });
                    modalHelper.showModal(sizeModal);
                    $("#SizeModalDropDownButton").click(function () {
                        var sizeDropDown = $("#SizeModalDropDown");
                        var sizeDropDownValue = sizeDropDown.val();
                        if (sizeDropDownValue == "") {
                            $("#SizeModalErrorMessage").show();
                            return;
                        }

                        var sizeText = sizeDropDown.find("option:selected").text().toLowerCase();
                        var preOrder = sizeDropDown.find("option:selected").data("preorder");
                        var sizeSashUrl = this.SizeSash;
                        sdPage.view.populateHiddenSizeValues(
                            parentEl,
                            sizeText,
                            sizeDropDownValue,
                            preOrder,
                            sizeSashUrl,
                            this.Qty,
                        );

                        modalHelper.hideModal(sizeModal);
                        sizeModal.remove();
                        onComplete();
                    });

                    $("select#SizeModalDropDown").click(function () {
                        var dropdownParent = $(this).parents("#SizeModalDropDownWrapper");
                        dropdownParent.toggleClass("active");
                    });

                    $("select#SizeModalDropDown").focusout(function () {
                        var dropdownParent = $(this).parents("#SizeModalDropDownWrapper");
                        dropdownParent.removeClass("active");
                    });
                },
                bindQuantities: function () {
                    sdPage.view.checkQuantityOverride();
                    $('input[id$="ProductQty"]').change(sdPage.view.productQuantityChange);
                    $(".s-basket-minus-button").click(sdPage.view.btnQuantityReduceClick);
                    $(".s-basket-plus-button").click(sdPage.view.btnQuantityIncreaseClick);
                },
                checkQuantityOverride: function () {
                    if (queryutils.exists("quantity")) {
                        var newQuantity = parseInt(queryutils.get("quantity"));
                        if (!isNaN(newQuantity)) {
                            $('input[id$="ProductQty"]').val(newQuantity);
                        }
                    }
                },
                productQuantityChange: function () {
                    var newQty = this.value.replace(/\D/g, "");
                    if (newQty == "" || newQty == 0) newQty = "1";
                    this.value = newQty;
                },
                btnQuantityReduceClick: function (e) {
                    e.preventDefault();
                    sdPage.view.changeQuantity($(this), -1);
                },
                btnQuantityIncreaseClick: function (e) {
                    e.preventDefault();
                    sdPage.view.changeQuantity($(this), 1);
                },
                changeQuantity: function (jqEl, modifier) {
                    var scope = productDetailsShared.getProductScope(jqEl),
                        ctrlQuantity = $('input[id$="ProductQty"]', scope),
                        originalQty = ctrlQuantity.val();
                    try {
                        var currentQty = parseInt(originalQty);
                        if (isNaN(currentQty)) {
                            ctrlQuantity.val(originalQty);
                            return;
                        }
                        currentQty = currentQty + modifier;
                        if (currentQty < 1) {
                            currentQty = 1;
                        }
                        if (currentQty > 999) {
                            currentQty = 999;
                        }
                        ctrlQuantity.val(currentQty);
                    } catch (err) {
                        ctrlQuantity.val(originalQty);
                    }
                },
                populateAlternateImagesOnHover: function (productImages, initProductImagesUi, parentEl, colVarId) {
                    /// <summary>
                    /// Change the thumbnails down the left of the main product image
                    /// </summary>
                    /// <param name="productImages"></param>
                    /// <param name="parentEl"></param>
                    var piThumbList = sdPage.model.piThumbList(parentEl);
                    if (!piThumbList || piThumbList.length === 0) return;

                    if (productImages.AlternateImages.length > 0) {
                        piThumbList.empty();

                        var altImagesDeepCopy = $.extend(true, [], productImages.AlternateImages);

                        $.each(altImagesDeepCopy, function () {
                            var dot =
                                    '<div class="imgdot visible-xs" onclick="$(this).parent().find(\'img\').click()"/>',
                                imageTag = $("<img></img>", {
                                    src: this.ImgUrlThumb,
                                    id: this.ImgId + "_piThumbImg",
                                    alt: this.AltText,
                                    title: this.AltText,
                                    class: this.CssClasses + " hidden-xs",
                                    "data-imgcolourid": colVarId,
                                }),
                                aTag = $("<a/>", {
                                    id: this.Id + "_apiThumb1",
                                    href: this.ImgUrlLarge,
                                    src: this.ImgUrlThumb,
                                    srczoom: this.ImgUrlXXLarge,
                                }),
                                li = $("<li></li>");
                            aTag.append(imageTag).append(dot);
                            li.append(aTag).addClass("col-xs-1 col-sm-3");
                            piThumbList.append(li);
                        });
                        sdPage.model.divShowAlternateImages.show();
                        if (initProductImagesUi) {
                            sdPage.view.enableDisableAltImagesNavigation(parentEl);
                            mainImageZoom.initProductZoomRollOver(false);
                        }
                    } else {
                        piThumbList.empty();
                        sdPage.model.divShowAlternateImages.hide();
                    }
                },
                enableDisableAltImagesNavigation: function (parentEl) {
                    var divPrevImg = $("#divPrevImg"),
                        divNextImg = $("#divNextImg"),
                        piThumbList = sdPage.model.piThumbList(parentEl),
                        altImagesCount = $("li", piThumbList).length;
                    if (altImagesCount > sdPage.model.getNoOfThumbImgsToDisplay()) {
                        divPrevImg.show();
                        divNextImg.show();
                        if (sdPage.model.spnPrevThumbImage.length > 0) {
                            sdPage.model.spnPrevThumbImage.unbind("click").click(function () {
                                piThumbList.css({
                                    left: "-75px",
                                });
                                sdPage.view.altImageSlide(piThumbList, altImagesCount, $(this).attr("action"));
                            });
                        }
                        if (sdPage.model.spnNextThumbImage.length > 0) {
                            sdPage.model.spnNextThumbImage
                                .addClass("Active")
                                .unbind("click")
                                .click(function () {
                                    sdPage.view.altImageSlide(piThumbList, altImagesCount, $(this).attr("action"));
                                });
                        }
                    } else {
                        divPrevImg.hide();
                        divNextImg.hide();
                    }
                },
                altImageSlide: function (piThumbList, liCount, value) {
                    if (value === "prev") {
                        $("li:first", piThumbList).before($("li:last", piThumbList));
                        sdPage.model.currAltImagePos--;
                    } else {
                        $("li:last", piThumbList).after($("li:first", piThumbList));
                        sdPage.model.currAltImagePos++;
                    }
                    sdPage.view.renderPreviousNext(sdPage.model.getNoOfThumbImgsToDisplay(), liCount);
                },
                renderPreviousNext: function (noOfAltImagesPerPage, liCount) {
                    var offset = 0;
                    switch (noOfAltImagesPerPage) {
                        case 5:
                            offset = 1;
                            break;
                        case 4:
                            offset = 0;
                            break;
                        case 3:
                            offset = -1;
                            break;
                    }
                    sdPage.model.spnPrevThumbImage.toggleClass(
                        "Active",
                        sdPage.model.currAltImagePos + offset > noOfAltImagesPerPage,
                    );
                    sdPage.model.spnNextThumbImage.toggleClass(
                        "Active",
                        sdPage.model.currAltImagePos + offset < liCount,
                    );
                },
                openRatingsAndReviewsPopup: function (parentEl) {
                    var prdId = sdPage.model.pnlRatingsAndReviews(parentEl).data("productid");
                    var url = sdPage.model.pnlRatingsAndReviews(parentEl).attr("data-url") + "?prid=" + prdId;
                    var title = $('[id$="ProductName"]', parentEl).text();
                    productDetailsShared.changePopupOrientation(
                        productDetailsShared.popupModalClasses.popupHeroProduct,
                    );
                    productDetailsShared.openPopUpModal({ titleHtml: title }, url, true);
                },
                updateProductPrices: function (parentEl, productPrices) {
                    var fromPriceDiv2 = $(".spnFrom", parentEl),
                        lblSellingPrice = $('span[id$="lblSellingPrice"]', parentEl),
                        lblTicketPrice = $('span[id$="lblTicketPrice"]', parentEl),
                        ticketPriceDiv2 = $("div[id$='TicketPriceDiv2']", parentEl),
                        lblAdditionalPriceLabel = $(".AdditionalPriceLabel", parentEl),
                        youSave = $("div[id$='YouSave']", parentEl),
                        lblWeLeftTab = $("span[id$='lblWeLeftTab']", parentEl),
                        oldListPrice = lblSellingPrice.text(),
                        discountPercentTextElem = $(".discount-percentage-off", parentEl);

                    productPrices.ShowFrom ? fromPriceDiv2.show() : fromPriceDiv2.hide();

                    if (oldListPrice != this.ListPrice) {
                        lblSellingPrice.text(this.ListPrice);
                    }

                    lblSellingPrice.text(productPrices.SellPrice);

                    productPrices.SellNoPence
                        ? lblSellingPrice.addClass("nopence")
                        : lblSellingPrice.removeClass("nopence");

                    if (productPrices.ShowRefPrice) {
                        lblSellingPrice.addClass("productHasRef");
                        ticketPriceDiv2.show();
                    } else {
                        lblSellingPrice.removeClass("productHasRef");
                        ticketPriceDiv2.hide();
                    }
                    if (productPrices.AdditionalPriceLabel) {
                        lblAdditionalPriceLabel.show();
                        lblAdditionalPriceLabel.text(productPrices.AdditionalPriceLabel);
                    } else {
                        lblAdditionalPriceLabel.hide();
                        lblAdditionalPriceLabel.text("");
                    }
                    lblTicketPrice.text(productPrices.RefPrice);
                    productPrices.RefNoPence
                        ? lblTicketPrice.addClass("nopence")
                        : lblTicketPrice.removeClass("nopence");
                    if (productPrices.YouSave && productPrices.ShowRefPrice) {
                        lblWeLeftTab.text(productPrices.YouSaveText);
                        youSave.show();
                    } else {
                        youSave.hide();
                    }
                    checkVariableExists(window.webPercentOffVisible) &&
                    window.webPercentOffVisible &&
                    !productPrices.ShowFrom &&
                    productPrices.ShowRefPrice
                        ? $("#pnlWebPercentOff").show()
                        : $("#pnlWebPercentOff").hide();
                    checkVariableExists(window.webExclusiveVisible) &&
                    window.webExclusiveVisible &&
                    productPrices.ShowRefPrice
                        ? $("#pnlWebExclusive").show()
                        : $("#pnlWebExclusive").hide();

                    toggleDiscountPercentText(productPrices.DiscountPercentText);
                    toggleMemberPrice(productPrices);
                    getFrasersPlusBreakdownPrice(productPrices);
                },
                btnColourVariantClick: function (e) {
                    e.preventDefault();
                    var jqEl = $(this),
                        parentEl = productDetailsShared.getProductScope(jqEl),
                        selectedLi = jqEl.attr("data-colVarid"),
                        prevSelectedColourId = productDetailsShared.getSelectedColourVariantValue(parentEl);
                    sdPage.model.colourName(parentEl).removeClass("colourText");
                    if (prevSelectedColourId != selectedLi) {
                        populateColorVariantChangedValuesNew(selectedLi, parentEl);
                    }
                    var v = productDetailsShared.getSelectedColourVariantValue(parentEl);
                    sdPage.model.colourDdl(parentEl).val(v);
                    sdPage.view.setColourVariantDropdownWithImage($("#divColourImageDropdownGroup", parentEl));

                    if (sdPage.model.productImagesCarouselExists()) {
                        productImageCarousel.setSwiperSlideChange(); // This fix added to load zoom images on switching colour variants
                    }

                    if (prevSelectedColourId != selectedLi) {
                        triggerProductViewedEventOnColorChanged(selectedLi, parentEl);
                        toggleLowStockSellingFastIndicatorsForAllSizes(parentEl);
                    }
                },
                btnColourVariantHoverEnter: function () {
                    /// <summary>
                    /// MouseEnter event : Colour button
                    /// </summary>
                    sdPage.view.changeColourVariantImageOnHover($(this), true);
                },
                btnColourVariantHoverLeave: function () {
                    /// <summary>
                    /// MouseLeave event : Colour button
                    /// </summary>
                    sdPage.view.changeColourVariantImageOnHover($(this), false);
                },
                changeColourVariantImageOnHover: function (jqEl, isHover) {
                    var colourVariantId = jqEl.attr("data-colVarid"),
                        colourName = jqEl.attr("data-text"),
                        parentEl = productDetailsShared.getProductScope(jqEl),
                        imageId = sdPage.model.img1,
                        iszoomRollOverEnabled =
                            checkVariableExists(window.zoomRollOverEnabled) && window.zoomRollOverEnabled,
                        colourNameToDisplay = colourName,
                        selectedColourName = $(".variantHighlight", parentEl).attr("data-text"),
                        selectedColourVariantId = productDetailsShared.getSelectedColourVariantValue(parentEl),
                        replaceWithValue,
                        selectedColourDisplayAttributes,
                        selectedSizeDisplayAttributes;
                    var selectedVariantId = productDetailsShared.getSelectedSizeVariantValue();
                    var sizeId = selectedVariantId.substring(8);
                    var newVariantId = colourVariantId + sizeId;
                    if (iszoomRollOverEnabled && !sdPage.model.isHeroProduct(parentEl)) {
                        imageId = productDetailsShared.imgProduct();
                    }

                    if (colourVariantId !== selectedColourVariantId) {
                        if (isHover) {
                            replaceWithValue = colourVariantId;
                            updateVisualisationWindowColour(replaceWithValue, selectedColourVariantId);
                            window.anonymousWishlist.highlightIconIfProductOnWishlistPDP(newVariantId);
                            window.Printess?.handleColourHoverEnterPrintessPdp(parentEl);
                        } else {
                            replaceWithValue = selectedColourVariantId;
                            colourNameToDisplay = selectedColourName;
                            updateVisualisationWindowColour(replaceWithValue, colourVariantId);
                            window.anonymousWishlist.highlightIconIfProductOnWishlistPDP(
                                productDetailsShared.getSelectedSizeVariantValue(),
                            );
                            window.Printess?.handleColourHoverLeavePrintessPdp(parentEl);
                        }
                        var colourNameId = sdPage.model.colourName(parentEl),
                            initialResults = productDetailsShared.getColourVariants(parentEl);
                        if (imageId.length === 0) {
                            imageId = sdPage.model.imgProductImage(parentEl);
                        }
                        if (sdPage.model.productImagesCarouselExists()) {
                            // If no variant is selected and on mouse hover-out of colour variants icons, reset swiper.
                            if (!isHover && !replaceWithValue) {
                                setupSwiperContainer();
                            } else {
                                imageId = productImageCarousel.getSwiperImage(replaceWithValue);
                                productImageCarousel.initializeSwiper(replaceWithValue);
                            }
                        } else if (sdPage.model.productImagesVerticalSliderlExists()) {
                            if (!isHover && !replaceWithValue) {
                                setupVSliderContainer();
                            } else {
                                imageId = productVSlider.getVSliderImage(replaceWithValue);
                                productVSlider.initializeSlider(replaceWithValue);
                            }
                        } else if (sdPage.model.productImagesGridExists()) {
                            productImageGrid.initializeImageGrid(replaceWithValue);
                        } else if (sdPage.model.productImagesTwoImageCarouselExists()) {
                            productTwoImageCarousel.initializeSwiper(replaceWithValue);
                        }
                        if (
                            !sdPage.model.productImagesCarouselExists() &&
                            !sdPage.model.productImagesVerticalSliderlExists() &&
                            !sdPage.model.productImagesGridExists() &&
                            !sdPage.model.productImagesTwoImageCarouselExists()
                        ) {
                            mainImageZoom.setNewZoom();
                        }

                        colourNameId.text(colourNameToDisplay).addClass("colourText");
                        if (initialResults.length > 0) {
                            var selectedDdlSize = productDetailsShared.getSelectedSizeVariantName(parentEl);
                            var inStockSizes = sdPage.model.getInStockSizeVariantsForColour(
                                initialResults,
                                replaceWithValue,
                            );

                            var isSelectedDdlSizeOk = selectedDdlSize !== "";
                            $.each(initialResults, function () {
                                var productImg = $(".productRollOverPanel");
                                if (replaceWithValue == this.ColVarId) {
                                    selectedColourDisplayAttributes = this.DisplayAttributes;
                                    if (sdPage.model.productImagesGridExists()) {
                                        productImageGrid.setViewMoreContainer(replaceWithValue);
                                    } else if (!sdPage.model.productImagesTwoImageCarouselExists()) {
                                        imageId.attr("src", this.MainImageDetails.ImgUrlLarge);
                                    }
                                    if (!sdPage.model.productImagesGridExists() && productImg.is(":hidden")) {
                                        productImg.show();
                                    }
                                    sdPage.view.changeProductImageSash(this.ProdImages, parentEl);
                                    setPreOrderText(parentEl, this.PreOrderAvailableDate);
                                    togglePrintessCta(parentEl, this);
                                    window.ProductDetailAmplienceVideo?.toggleVideoButtonDisplay(this.ColVarId);
                                    if (isSelectedDdlSizeOk) {
                                        if (inStockSizes.length > 0) {
                                            $(inStockSizes).each(function () {
                                                if (selectedDdlSize === this.SizeName) {
                                                    selectedSizeDisplayAttributes = this.DisplayAttributes;
                                                    sdPage.view.updateProductPrices(parentEl, this.ProdSizePrices);
                                                    sdPage.view.updateStackTrafficLights(parentEl, this.State);
                                                    return;
                                                }
                                            });
                                        }
                                    } else {
                                        sdPage.view.updateProductPrices(parentEl, this.ProdVarPrices);
                                        sdPage.view.updateStackTrafficLights(parentEl, "");
                                        return;
                                    }
                                    return;
                                }
                            });
                            $(initialResults).each(function () {
                                if (replaceWithValue === this.ColVarId) {
                                    if (!sdPage.model.isHeroProduct(parentEl)) {
                                        sdPage.view.populateAlternateImagesOnHover(
                                            this.ProdImages,
                                            replaceWithValue == selectedColourVariantId,
                                            parentEl,
                                            this.colVarId,
                                        );
                                    }
                                    return;
                                }
                            });
                        }
                    }
                    sdPage.view.updateDisplayAttributes(
                        parentEl,
                        selectedColourDisplayAttributes,
                        selectedSizeDisplayAttributes,
                    );
                    sdPage.view.updateKeyBenefits();
                },
                updateKeyBenefits: function () {
                    var wrapper = $(".keyBenInfoBox");
                    if (wrapper.length == 0) {
                        // not enabled
                        return;
                    }

                    var styleBenefits = $(".ProductDetailsVariants").data("defaultkeybenefit");
                    var selectedColour = productDetailsShared.getCurrentColourVariant();
                    if (selectedColour == null) {
                        selectedColour = productDetailsShared.getColourVariants()[0];
                    }
                    var colourBenefits = selectedColour.KeyBenefits;

                    var selectedSizeVarId = productDetailsShared.getSelectedSizeVariantValue();

                    var getSelectedSize = function (colour, sizeVarId) {
                        if (colour != null && sizeVarId != "") {
                            return colour.SizeVariants.filter(function (size) {
                                return size.SizeVarId == sizeVarId;
                            })[0];
                        }
                    };

                    var selectedSize = getSelectedSize(selectedColour, selectedSizeVarId);
                    var sizeBenefits = selectedSize != undefined ? selectedSize.KeyBenefits : null;
                    var mergedBenefits = styleBenefits;

                    var mergeUniqueBenefits = function (merged, level) {
                        return merged
                            .filter(function (elem) {
                                return !level.find(function (subElem) {
                                    if (subElem["Benefit"] === elem["Benefit"]) {
                                        return 1;
                                    }
                                });
                            })
                            .concat(level);
                    };

                    if (colourBenefits) {
                        mergedBenefits = mergeUniqueBenefits(colourBenefits, mergedBenefits);
                    }

                    if (sizeBenefits) {
                        mergedBenefits = mergeUniqueBenefits(sizeBenefits, mergedBenefits);
                    }

                    var sortKeyBenefitsIcons = function (a, b) {
                        if (a.Order > b.Order) {
                            return 1;
                        }
                        if (a.Order < b.Order) {
                            return -1;
                        }

                        var benefitA = a.Benefit.toLowerCase();
                        var benefitB = b.Benefit.toLowerCase();
                        if (benefitA > benefitB) {
                            return 1;
                        }
                        if (benefitA < benefitB) {
                            return -1;
                        }
                        return 0;
                    };

                    mergedBenefits.sort(sortKeyBenefitsIcons);

                    var model = { keyBenefits: mergedBenefits };

                    if (model.keyBenefits.length > 0) {
                        var template = $("#key-benefits-template").html();
                        var compiledTemplate = Handlebars.compile(template);
                        var html = compiledTemplate(model);

                        $(".keyBenInfoBox .swiper-wrapper").html(html);
                    }
                },
                updateDisplayAttributes: function (parentEl, colourDisplayAttributes, sizeDisplayAttributes) {
                    if ($("#DisplayAttributes", parentEl).length > 0) {
                        try {
                            var defaultDisplayAttributes = $(".ProductDetailsVariants", parentEl).data(
                                "defaultdisplayattributes",
                            );
                            var combinedWithColour = this.returnCombinedDisplayAttributes(
                                defaultDisplayAttributes,
                                colourDisplayAttributes,
                            );
                            var combinedWithSize = this.returnCombinedDisplayAttributes(
                                combinedWithColour,
                                sizeDisplayAttributes,
                            );

                            if (
                                combinedWithSize != null &&
                                combinedWithSize.length >=
                                    parseInt($(".ProductDetailsVariants", parentEl).data("displayattributesthreshold"))
                            ) {
                                var orderedDisplayAttributes = combinedWithSize.sort(function (a, b) {
                                    if (a.SortOrder > b.SortOrder) return 1;
                                    if (a.SortOrder < b.SortOrder) return -1;
                                    return 0;
                                });

                                this.updateOnpageDisplayAttributes(orderedDisplayAttributes);
                                //remove static attributes string
                                sdPage.model.getDescriptionAttributesContainer(parentEl).empty();
                            } else {
                                //add static attributes string
                                sdPage.model.getDisplayAttributes(parentEl).empty();
                                sdPage.model
                                    .getDescriptionAttributesContainer(parentEl)
                                    .html($(".ProductDetailsVariants", parentEl).data("staticattributestring"));
                            }
                        } catch (ex) {
                            console.log(ex);
                        }
                    }
                },
                updateOnpageDisplayAttributes: function (toSetDisplayAttributesData) {
                    sdPage.model.getDisplayAttributes().empty();
                    for (var i = 0; i < toSetDisplayAttributesData.length; i++) {
                        var liElement = document.createElement("li");
                        var featName =
                            '<span class="feature-name">' + toSetDisplayAttributesData[i].DisplayName + "</span>";
                        var featVal =
                            '<span class="feature-value">' + toSetDisplayAttributesData[i].DisplayValue + "</span>";
                        liElement.innerHTML = featName + featVal;
                        sdPage.model.getDisplayAttributes()[0].appendChild(liElement);
                    }
                },
                returnCombinedDisplayAttributes: function (existingDisplayAttributes, overrideDisplayAttributes) {
                    if (existingDisplayAttributes == null && overrideDisplayAttributes == null) {
                        return null;
                    }
                    //no overrides, just return
                    if (
                        existingDisplayAttributes != null &&
                        (overrideDisplayAttributes == null || overrideDisplayAttributes.length == 0)
                    ) {
                        return existingDisplayAttributes;
                    }
                    //no display attributes yet, overrides should be sorted from data
                    if (
                        (existingDisplayAttributes == null || existingDisplayAttributes.length == 0) &&
                        overrideDisplayAttributes != null
                    ) {
                        return overrideDisplayAttributes;
                    }
                    //
                    if (existingDisplayAttributes.length > 0 && overrideDisplayAttributes.length > 0) {
                        var overrideDisplayAttributesNames = [];
                        for (var i = 0; i < overrideDisplayAttributes.length; i++) {
                            overrideDisplayAttributesNames.push(overrideDisplayAttributes[i].DisplayName);
                        }
                        var defaultsWithOverridesRemoved = [];
                        for (var i = 0; i < existingDisplayAttributes.length; i++) {
                            var displayAttributesData = existingDisplayAttributes[i];
                            if (overrideDisplayAttributesNames.indexOf(displayAttributesData.DisplayName) == -1) {
                                defaultsWithOverridesRemoved.push(displayAttributesData);
                            }
                        }
                        var combinedDispalyAttributes = defaultsWithOverridesRemoved.concat(overrideDisplayAttributes);
                        return combinedDispalyAttributes;
                    }
                },
                updateDeliveryEstimate: function () {
                    var $estimateEl = $("#productDeliveryEstimate");
                    if (!$estimateEl.length) return;
                    var product = productDetailsShared.getCurrentColourVariant();
                    if (product && product.PreOrderAvailableDate) {
                        $estimateEl.text($estimateEl.attr("data-preorder-text"));
                        $("#productDeliveryEstimateText").hide();
                    } else {
                        $estimateEl.text($estimateEl.attr("data-text"));
                        $("#productDeliveryEstimateText").show();
                    }
                },
                updateStackTrafficLights: function (parentEl, state) {
                    var pnlTrafficLights = $('div[id$="pnlTrafficLights"]', parentEl),
                        hdnOnLoadTrafficLightsColorState = $('input[id$="hdnOnLoadTrafficLightsColorState"]', parentEl);
                    if (checkVariableExists(window.trafficLightsEnabled) && !window.trafficLightsEnabled) {
                        return;
                    }
                    if (state.length > 0 && checkVariableExists(window.isPreOrderable) && !window.isPreOrderable) {
                        pnlTrafficLights.show();
                        var currentStockClassName = "stock" + state, //Set css class
                            onLoadColorState = "";
                        if (hdnOnLoadTrafficLightsColorState.length > 0) {
                            onLoadColorState = hdnOnLoadTrafficLightsColorState.val();
                        }
                        if (previousColourState.length === 0 && onLoadColorState.length > 0) {
                            previousColourState = onLoadColorState;
                            hdnOnLoadTrafficLightsColorState.val("");
                        }
                        pnlTrafficLights.removeClass(previousColourState).addClass(currentStockClassName);
                        previousColourState = currentStockClassName;
                        var toolTipText = eval("window.trafficLights" + state + "ToolTip");
                        if (toolTipText.replace(/\s/g, "").length > 0) {
                            pnlTrafficLights.attr("title", toolTipText); //Set tooltip
                        } else {
                            pnlTrafficLights.removeAttr("title");
                        }
                        var contentText = eval("window.trafficLights" + state + "Content");
                        pnlTrafficLights.text(contentText); //Set content
                    } else {
                        pnlTrafficLights.hide();
                    }
                },
                updateProductDetailMainImage: function (parentEl, selectedColVarId) {
                    var imgProductDetailMain = productDetailsShared.imgProduct();
                    if (imgProductDetailMain.length === 0) {
                        return;
                    }
                    var initialResults = productDetailsShared.getColourVariants(parentEl);
                    if (initialResults.length > 0) {
                        $(initialResults).each(function () {
                            if (selectedColVarId === this.ColVarId) {
                                sdPage.view.populateImages(this.ProdImages, parentEl, this.ColVarId);
                            }
                        });
                    }
                },
                changeProductImageSash: function (productImages, parentEl) {
                    /// <summary>
                    /// Update the main image sash
                    /// </summary>
                    /// <param name="productImages"></param>
                    /// <param name="parentEl"></param>
                    if (sdPage.model.isHeroProduct(parentEl) || productImages == null) {
                        return;
                    }
                    var imgProductSash = sdPage.model.imgProductSash();
                    if (productImages.HasImgProdSash) {
                        imgProductSash.attr("src", productImages.ImgProdSashUrl).show();
                    } else {
                        imgProductSash.hide();
                    }
                },
                populateImages: function (productImages, parentEl, colvarId) {
                    var iszoomRollOverEnabled =
                            checkVariableExists(window.zoomRollOverEnabled) && window.zoomRollOverEnabled,
                        imgProductSash = sdPage.model.imgProductSash(),
                        lblSeparator = $("#lblSeparator"),
                        btnClickToZoom = $("#clickToZoomText"),
                        img1 = sdPage.model.img1;
                    var imgProduct = productDetailsShared.imgProduct();
                    if (sdPage.model.productImagesCarouselExists()) {
                        imgProduct = productImageCarousel.getSwiperImage(colvarId);
                        productImageCarousel.initializeSwiper(colvarId);
                    } else if (sdPage.model.productImagesVerticalSliderlExists()) {
                        imgProduct = productVSlider.getVSliderImage(colvarId);
                        productVSlider.initializeSlider(colvarId);
                    } else if (sdPage.model.productImagesGridExists()) {
                        imgProduct = productImageGrid.getGridImages(colvarId);
                        productImageGrid.initializeImageGrid(colvarId);
                        productImageGrid.setViewMoreContainer(colvarId);

                        const debounce = (callback, wait) => {
                            let timeoutId = null;

                            return (...args) => {
                                window.clearTimeout(timeoutId);

                                timeoutId = window.setTimeout(() => {
                                    callback.apply(null, args);
                                }, wait);
                            };
                        };

                        window.addEventListener(
                            "resize",
                            debounce(() => {
                                productImageGrid.setViewMoreContainer(colvarId);
                            }, 200),
                            false,
                        );
                    } else if (sdPage.model.productImagesTwoImageCarouselExists()) {
                        imgProduct = productTwoImageCarousel.getSwiperImage(colvarId);
                        productTwoImageCarousel.initializeSwiper(colvarId);
                    }
                    if (
                        iszoomRollOverEnabled &&
                        !sdPage.model.productImagesGridExists() &&
                        !sdPage.model.productImagesTwoImageCarouselExists() &&
                        imgProduct &&
                        imgProduct.length > 0
                    ) {
                        imgProduct.attr("src", productImages.ImgUrl);
                        imgProduct.attr("alt", productImages.AltText);
                        imgProduct.attr("title", productImages.AltText);
                    } else {
                        img1.attr("src", productImages.ImgUrl);
                        img1.attr("title", productImages.AltText);
                    }
                    if (iszoomRollOverEnabled && productImages.HasZoom) {
                        btnClickToZoom.show();
                    } else {
                        btnClickToZoom.hide();
                    }
                    if (productImages.HasImgProdSash && !sdPage.model.isHeroProduct(parentEl)) {
                        imgProductSash.attr("src", productImages.ImgProdSashUrl);
                        imgProductSash.show();
                    } else {
                        imgProductSash.hide();
                    }
                    if (productImages.ImgCtrlsVisible) {
                        sdPage.model.divImageControls.show();
                    } else {
                        sdPage.model.divImageControls.hide();
                    }
                    if (productImages.ImgCtrlsVisible && imgProduct && imgProduct.length > 0) {
                        sdPage.model.zoomSpan.attr("class", productImages.ZoomCss);
                        var href = productImages.ApopupZoomHRef;
                        var title = productImages.APopupZoomTitle;
                        productDetailsShared
                            .imgProduct()
                            .data("popuphref", href)
                            .data("popuptitle", title)
                            .data("popupindex", 1);
                        $("#imgZoomGif").attr("src", productImages.ZoomGif);
                        if (
                            productImages.HasZoom &&
                            checkVariableExists(window.zoomRollOverEnabled) &&
                            !window.zoomRollOverEnabled
                        ) {
                            sdPage.model.zoomSpan.show();
                        } else {
                            sdPage.model.zoomSpan.hide();
                        }
                        if (productImages.HasSeparator) {
                            lblSeparator.show();
                        } else {
                            lblSeparator.hide();
                        }

                        var popup360Buttons = $(".popup360Button");
                        if (productImages.HasFrames) {
                            $("#Popup360ButtonWrapper").data("spintype", "popupFrame360");
                            popup360Buttons.show();
                            popup360Buttons.removeClass("flashRequired");
                            productDetailsShared
                                .imgProduct()
                                .data("popup360href", productImages.APopupFrame360HRef)
                                .data("popup360title", productImages.APopup360Title);
                        } else if (productImages.HasSpin) {
                            $("#Popup360ButtonWrapper").data("spintype", "popupThreesixty");
                            popup360Buttons.addClass("flashRequired");
                            popup360Buttons.show();
                            productDetailsShared
                                .imgProduct()
                                .data("popup360href", productImages.APopup360HRef)
                                .data("popup360title", productImages.APopup360Title);
                        } else {
                            popup360Buttons.removeClass("flashRequired");
                            popup360Buttons.hide();
                        }
                    }

                    if (!sdPage.model.isHeroProduct(parentEl)) {
                        sdPage.view.populateAlternateImagesOnHover(productImages, true, parentEl, colvarId);
                    }

                    sdPage.model.bannerVideo = null;
                    sdPage.model.bannerResponsiveVideo = null;
                    var bannerImage = $("#bannerImage");
                    var bannerImageResponsive = $("#bannerImageResponsive");
                    var bannerVideoControl = $("#bannerVideoControl");
                    var bannerVideoResponsiveControl = $("#bannerVideoResponsiveControl");
                    if (productImages.HasBanner) {
                        if (productImages.Banner.ImageType === 21) {
                            bannerImage.attr("src", productImages.Banner.FileReference).show();
                            bannerVideoControl.hide();
                        } else if (productImages.Banner.ImageType === 24) {
                            sdPage.model.bannerVideo = {
                                id: "vidBanner",
                                source: productImages.Banner.FileReference,
                            };
                            bannerImage.hide();
                            bannerVideoControl.show();
                        }
                    } else {
                        bannerImage.hide();
                        bannerVideoControl.hide();
                    }
                    if (productImages.HasBannerResponsive) {
                        if (productImages.BannerResponsive.ImageType === 22) {
                            bannerImageResponsive.attr("src", productImages.BannerResponsive.FileReference).show();
                            bannerVideoResponsiveControl.hide();
                        } else if (productImages.BannerResponsive.ImageType === 24) {
                            sdPage.model.bannerResponsiveVideo = {
                                id: "vidBannerResponsive",
                                source: productImages.BannerResponsive.FileReference,
                            };
                            bannerImageResponsive.hide();
                            bannerVideoResponsiveControl.show();
                        }
                    } else {
                        bannerImageResponsive.hide();
                        bannerVideoResponsiveControl.hide();
                    }
                },
                accordionOpenAndCloseChevron: function (el) {
                    el.find("span").toggleClass("glyphicon-chevron-right").toggleClass("glyphicon-chevron-down");
                    var $tabContentDiv = $(el.attr("href"));
                    if ($tabContentDiv.find("span[itemprop='description']").length > 0) {
                        $("#pdpAttributesWrapper").toggleClass("mob-desc-closed").toggleClass("mob-desc-open");
                    }
                },
                btnCustomerReviewsClick: function () {
                    /// <summary>
                    /// Fires when the user clicks on the reviews link
                    /// </summary>
                    var $customerReviewHeader = sdPage.model.customerReviewHeader();
                    if (
                        !isAlternateAccordionEnabled() &&
                        window.IsTabletView() &&
                        $customerReviewHeader != null &&
                        $customerReviewHeader.length > 0
                    ) {
                        var $divSlidingReviewContainer = sdPage.model.divSlidingReviewContainer();
                        if (
                            $divSlidingReviewContainer != null &&
                            $divSlidingReviewContainer.length > 0 &&
                            !sdPage.model.divSlidingReviewContainer().is(":visible")
                        ) {
                            $customerReviewHeader.trigger("click");
                        }
                    } else {
                        var $reviews = $("div.infoaccordion").find("div[id^='Reviews']");
                        if (
                            (window.IsTabletView() || window.IsMobileView()) &&
                            $reviews != null &&
                            $reviews.length > 0 &&
                            !$reviews.hasClass("collapse in")
                        ) {
                            $('a[href^="#Reviews"]').trigger("click.bs.collapse.data-api");
                            sdPage.view.accordionOpenAndCloseChevron($('a[href^="#Reviews"]'));
                        }
                    }
                },
                btnAddToBagClick: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var button = $(this),
                        scope = productDetailsShared.getProductScope(button);
                    if (productDetailsShared.showSizeRequiredMessage(button, scope)) return;
                    if (productDetailsShared.showPersonalisationMandatoryMessage(scope)) return;
                    sdPage.view.addProductDetailToBag(scope);
                },
                personalisationOpener: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var button = $(this),
                        scope = productDetailsShared.getProductScope(button);
                    if (productDetailsShared.showSizeRequiredMessage(button, scope)) return;
                    sdPage.view.openProductDetailForPersonalisation(scope);
                },
                btnAddToBagNoPersonalisaionClick: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var button = $(this),
                        scope = productDetailsShared.getProductScope(button);
                    if (productDetailsShared.showSizeRequiredMessage(button, scope)) return;
                    sdPage.view.addMyIdProductDetailToBag(scope);
                },
                btnAddToWishlistNoPersonalisationClick: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var button = $(this),
                        scope = productDetailsShared.getProductScope(button);
                    if (productDetailsShared.showSizeRequiredMessage(button, scope)) return;
                    sdPage.view.addMyIdProductDetailToWishlist(scope);
                },
                btnAddToWishListClick: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var button = $(this),
                        scope = productDetailsShared.getProductScope(button);

                    sendWishlistGtmEvent(scope);

                    if (productDetailsShared.showSizeRequiredMessage(button, scope)) return;
                    if (productDetailsShared.showPersonalisationMandatoryMessage(scope)) return;
                    sdPage.view.addProdDetailToWishList(scope);
                },
                btnBuyNowWithFastPayClick: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var button = $(this),
                        scope = productDetailsShared.getProductScope(button);
                    if (productDetailsShared.showSizeRequiredMessage(button, scope)) return;
                    sdPage.view.initiateFastPay(scope);
                },
                updateMainImageThumbNail: function (previousColourVarId, selectedColourVarId) {
                    var thumbNailImageLinks = $('ul[id$="piThumbList"] li a');
                    $.each(thumbNailImageLinks, function () {
                        var $anc = $(this),
                            $img = $anc.find("img"),
                            ancHref = $anc.attr("href"),
                            ancSrc = $anc.attr("src"),
                            ancSrcZoom = $anc.attr("srczoom"),
                            imgSrc = $img.attr("src"),
                            imgDataColourId = $img.attr("data-imgcolourid"),
                            regEx = new RegExp(/[\da-z]{2}\d{6}/gim);
                        if (ancHref === undefined) {
                            return true;
                        }
                        var result = regEx.exec(ancHref);
                        if (result != null && result[0] !== previousColourVarId) {
                            return true;
                        }
                        var newAncHref = ancHref.replace(previousColourVarId, selectedColourVarId),
                            newAncSrc = ancSrc.replace(previousColourVarId, selectedColourVarId),
                            newAncSrcZoom = ancSrcZoom.replace(previousColourVarId, selectedColourVarId),
                            newImgSrc = imgSrc.replace(previousColourVarId, selectedColourVarId),
                            newImgDataColourId = imgDataColourId.replace(previousColourVarId, selectedColourVarId);

                        $anc.attr("href", newAncHref).attr("src", newAncSrc).attr("srczoom", newAncSrcZoom);
                        $img.attr("src", newImgSrc).attr("data-imgcolourid", newImgDataColourId);
                        return false;
                    });
                },
                sizeDdlChange: function () {
                    /// <summary>
                    /// Fires when the size selector changes
                    /// </summary>
                    var thisDdl = $(this),
                        scope = productDetailsShared.getProductScope(thisDdl);
                    setTimeout(function () {
                        populateSizeVariantChangedValues(scope, thisDdl.val(), thisDdl);
                    }, 0);
                },
                sizeCustomDdlChange: function (clickedElem) {
                    var scope = productDetailsShared.getProductScope(clickedElem);
                    populateSizeVariantChangedValues(scope, clickedElem.attr("data-value"), clickedElem);
                },
                enableHeroChildScrolling: function () {
                    var lastHeroChildProduct = productDetailsShared.getProductScopesOnPage().last();
                    if (lastHeroChildProduct != null) {
                        $('<div id="lastHeroChild"></div>').insertAfter($("div.infoaccordion", lastHeroChildProduct));

                        if (
                            sdPage.model.divLastHeroChild().offset().top > sdPage.model.mainProductBottom().offset().top
                        ) {
                            sdPage.model.divMainProduct().addClass("MainFixed");
                        }
                    }
                },
                windowResize: function () {
                    if (!isAlternateAccordionEnabled()) {
                        bindProductInfoAccordians();
                    }
                    sdPage.view.ratingsAndReviews();
                    var piThumbList = sdPage.model.piThumbList(undefined),
                        liCount = $("li", piThumbList).length;
                    sdPage.view.renderPreviousNext(sdPage.model.getNoOfThumbImgsToDisplay(), liCount);
                    sdPage.view.loadContentImages();
                },
                removeRatingsAndReviewsTab: function () {
                    var reviewsContainer = $("div.infoaccordion").find("div[id^='Reviews']");
                    if (reviewsContainer.length > 0) {
                        reviewsContainer.parent().remove();
                    }
                },
                ratingsAndReviews: function () {
                    var isDesktopMode = window.IsDesktopView(),
                        isTabletMode = window.IsTabletView(),
                        isMobileMode = window.IsMobileView();
                    if (
                        (isDesktopMode || (!isAlternateAccordionEnabled() && isTabletMode)) &&
                        sdPage.model.ratingsMarkup !== null &&
                        sdPage.model.ratingsMarkup.length > 0
                    ) {
                        sdPage.view.removeRatingsAndReviewsTab();
                        if (sdPage.model.moduleDnnCentricRatingAndCommentsControl.children().length === 0) {
                            sdPage.model.moduleDnnCentricRatingAndCommentsControl.append(sdPage.model.ratingsMarkup);
                        }
                    } else if (
                        (isMobileMode || (isAlternateAccordionEnabled() && isTabletMode)) &&
                        sdPage.model.ratingsMarkup !== null
                    ) {
                        var accordion = isMobileMode
                            ? $("div.ProdDetRight div.infoaccordion")
                            : $("div.mobileProdInfo div.infoaccordion");
                        if (
                            sdPage.model.ratingsMarkup.length > 0 &&
                            accordion.find("div[id^='Reviews']").length === 0
                        ) {
                            sdPage.view.removeRatingsAndReviewsTab();
                            sdPage.model.moduleDnnCentricRatingAndCommentsControl.empty();
                            var markup = $("<div/>").append(sdPage.model.ratingsMarkup).html(),
                                templateObj = new sdPage.model.InfoPanel(
                                    "Customer Reviews",
                                    "Reviews" + sdPage.model.panelCount,
                                    markup,
                                    false,
                                ),
                                template = window.Handlebars.compile(sdPage.model.accordionTemplate);
                            accordion.append(template(templateObj));
                            sdPage.view.bindAccordionClickEvent();
                        }
                    }
                },
                bindAccordionClickEvent: function () {
                    $(".infoaccordion a[data-toggle='collapse']")
                        .unbind("click")
                        .click(sdPage.view.accordionOpenAndCloseChevron($(this)));
                },
                loadContentImages: function () {
                    $("#ProductMediaWrapper img[data-original]").each(function () {
                        var $this = $(this);
                        if ($this.is(":visible") && !$this.attr("src")) {
                            $this.attr("src", $this.data("original"));
                        }
                    });
                },
                createImageElement: function (imageCssClass, fileReference) {
                    var div = document.createElement("div");
                    var img = document.createElement("img");

                    div.className = "contentImageContainer";

                    img.setAttribute("data-original", fileReference);

                    img.className = "lazyImg " + imageCssClass;

                    div.appendChild(img);

                    return div;
                },
                initializeContentVideos: function () {
                    if (!!sdPage.model.contentVideos) {
                        if (sdPage.model.contentVideos.length > 0) {
                            var videoOptions = {
                                nativeControlsForTouch: false,
                                controls: true,
                                autoplay: false,
                                width: "auto",
                                height: "auto",
                                poster: "",
                                logo: {
                                    enabled: false,
                                },
                            };
                            sdPage.model.contentVideoPlayers.forEach(function (player) {
                                player.dispose();
                            });
                            sdPage.model.contentVideoPlayers = [];
                            sdPage.model.contentVideos.forEach(function (video) {
                                var azureMp = window.amp(video.id, videoOptions);
                                azureMp.src([{ src: video.source, type: "application/vnd.ms-sstr+xml" }]);
                                sdPage.model.contentVideoPlayers.push(azureMp);
                            });
                        }
                    }
                },
                //***********  DropShip **************************************************
                showDropShipInfoSummary: function (suppliedBy, suppliedByName, deliveryInfoSummary, returnsInfo) {
                    var sWrapper = $(".dropShipSupplierInfoSummary");
                    var isSupplierNameOverrideEnabled;
                    $(sWrapper).css("display", "none");
                    if (!(!suppliedBy || suppliedBy.length <= 1 || !suppliedByName)) {
                        var suppliers = $(".ProductDetailsVariants").data("suppliers");
                        //// update returns info
                        if (returnsInfo) {
                            sdPage.view.updateReturnsInfo(returnsInfo);
                        } else {
                            if (suppliers && suppliers.length > 0) {
                                $(suppliers).each(function () {
                                    if (this.DropShipSupplier.Code === suppliedBy) {
                                        if (
                                            this.DropShipSupplier.ReturnsInfoData &&
                                            this.DropShipSupplier.ReturnsInfoData != null
                                        ) {
                                            if (
                                                this.DropShipSupplier.ReturnsInfoData.Pdp &&
                                                this.DropShipSupplier.ReturnsInfoData.Pdp != null &&
                                                this.DropShipSupplier.ReturnsInfoData.Pdp.length > 15
                                            ) {
                                                sdPage.view.updateReturnsInfo(
                                                    this.DropShipSupplier.ReturnsInfoData.Pdp,
                                                );
                                                return false;
                                            }

                                            if (
                                                this.DropShipSupplier.ReturnsInfoData.Popup &&
                                                this.DropShipSupplier.ReturnsInfoData.Popup != null &&
                                                this.DropShipSupplier.ReturnsInfoData.Popup.length > 15
                                            ) {
                                                sdPage.view.updateReturnsInfo(
                                                    this.DropShipSupplier.ReturnsInfoData.Popup,
                                                );
                                                return false;
                                            }
                                        }
                                    }
                                });
                            }
                        }

                        $(sWrapper).css("display", "block");

                        $(sWrapper).removeClass(function (index, className) {
                            return (className.match(/\bfulfilledBy\S+/g) || []).join(" ");
                        });

                        $(sWrapper).addClass("fulfilledBy" + suppliedBy);

                        if (!deliveryInfoSummary || deliveryInfoSummary.length <= 15) {
                            $(".dropshipSupplierName", sWrapper).text(suppliedByName);
                            $(".dropshipSupplierCountries", sWrapper).text("the UK");
                            // Delivery country names...
                            if (suppliers && suppliers.length > 0) {
                                $(suppliers).each(function () {
                                    if (this.DropShipSupplier.Code === suppliedBy) {
                                        $(".dropshipSupplierCountries", sWrapper).text(this.DeliveryCountriesNames);
                                        return false;
                                    }
                                });
                            }
                        } else {
                            $(sWrapper).html(deliveryInfoSummary);

                            isSupplierNameOverrideEnabled = $(sWrapper).data("isdropshipsuppliernameoverrideenabled");
                            if (
                                isSupplierNameOverrideEnabled &&
                                isSupplierNameOverrideEnabled.toLowerCase() === "true"
                            ) {
                                $(sWrapper)
                                    .find("span.dropshipSupplierName:first")
                                    .text($(sWrapper).data("dropshipsuppliernameoverridevalue"));
                            }
                        }

                        if (suppliers && suppliers.length > 0) {
                            $("a#learnMore", sWrapper)
                                .off("click")
                                .on("click", function (e) {
                                    if (suppliers && suppliers != null && suppliers.length > 0) {
                                        $(suppliers).each(function () {
                                            if (this.DropShipSupplier.Code === suppliedBy) {
                                                dropShipHelper.GetDropShipSupplier(
                                                    e,
                                                    suppliedBy,
                                                    suppliedByName,
                                                    isSupplierNameOverrideEnabled,
                                                );
                                                return false;
                                            }
                                        });
                                    }
                                });
                        }

                        $("a.ourTermsAndConditions", ".dropShipSupplierInfoSummary").css("text-transform", "lowercase");
                        //***********************************************************************
                    } else {
                        sdPage.view.updateReturnsInfo();
                    }
                },
                displayPDPAndGoodToKnowAttributes: function (productId) {
                    $.each(["PDP", "GoodToKnow"], function (index, value) {
                        if (value === "PDP") sdPage.view.displayPDPAttributes(productId);
                        if (value === "GoodToKnow") sdPage.view.displayGoodToKnowAttributes(productId);
                    });
                },
                displayPDPAttributes: function (productId) {
                    var pdpAttribWrapper = $("#pdpAttributesWrapper");
                    if (!pdpAttribWrapper.length) return;
                    if (!productId || productId.length <= 1) {
                        pdpAttribWrapper.html("");
                        return;
                    }
                    $.ajax({
                        url: "/wcallbacks/pdpattributes/" + productId + "/PDP",
                        method: "get",
                    }).done(function (data, textStatus, jqXHR) {
                        pdpAttribWrapper.html(data);
                    });
                },
                displayGoodToKnowAttributes: function (productId) {
                    var gtkAttribWrapper = $("#pdpGoodtoKnowWrapper");
                    if (!gtkAttribWrapper.length) return;
                    if (!productId || productId.length <= 1) {
                        gtkAttribWrapper.html("");
                        return;
                    }
                    $.ajax({
                        url: "/wcallbacks/pdpattributes/" + productId + "/GoodToKnow",
                        method: "get",
                    }).done(function (data, textStatus, jqXHR) {
                        gtkAttribWrapper.html(data);
                    });
                },
                showFinanceOptionsLink: function (amount, cashPriceType, viewType) {
                    const finLnkWrapper = $("#financeOptionsGenericWrapper");
                    if ((finLnkWrapper.length, amount > 0)) {
                        if (typeof v12fin === "undefined") {
                            console.info("v12fin is undefined... continuing...");
                            finLnkWrapper.css("display", "none").html("");
                            return;
                        }
                        const depositPercent = finLnkWrapper.data("deposit");
                        const financeProducts = finLnkWrapper.data("finproducts");
                        const retVal = v12fin.AmountMeetsMinimumPurchaseAmount(amount, depositPercent, financeProducts);

                        if (retVal.amountIsAllowedForFinance) {
                            $.ajax({
                                url: "/wcallbacks/finance/v12finance",
                                data: {
                                    amount: amount,
                                    cashPriceType: cashPriceType,
                                    viewType: viewType,
                                    productCount: retVal.qualifyingProducts.length,
                                },
                                method: "get",
                                cache: false,
                            })
                                .done(function (data, textStatus, jqXHR) {
                                    if (data && data != null && data.length > 0) {
                                        finLnkWrapper.css("display", "block").html(data);
                                        const innerFinCtnr = $("div#viewFinanceLinkWrapper", finLnkWrapper);
                                        const ret = v12fin.GetLinkLowestMonthlyPayment(
                                            amount,
                                            retVal.qualifyingProducts,
                                            depositPercent,
                                        );

                                        innerFinCtnr.data("finproducts", retVal.qualifyingProducts);
                                        innerFinCtnr.data("deposit", depositPercent);

                                        $("#pdpFinAvailableFrom").text(ret.lowestMonthlyPayment);
                                        $("#pdpFinPercentage").text((ret.apr == 0 ? "0" : ret.apr) + "%");
                                    } else {
                                        finLnkWrapper.css("display", "none").html("");
                                    }
                                })
                                .fail(function (jqXHR, textStatus, errorThrown) {
                                    finLnkWrapper.css("display", "none").html("");
                                    console.log(errorThrown);
                                });
                        }
                    }
                },
                updateReturnsInfo: function (info) {
                    // USC
                    var ctnr = $(".pdpDeliveryOptions .delRetContainer .returnsInfo");
                    if (ctnr.length) {
                        if (sdPage.view.InitialPdpReturnsInfo && sdPage.view.InitialPdpReturnsInfo.length > 1) {
                            if (info && info.length > 15) {
                                ctnr.html(sdPage.view.InitialPdpReturnsInfo);
                                $(".TitleReturns", ctnr).siblings().css("display", "none");
                                $(".TitleReturns", ctnr).after('<p class="dropShipReturnInfoContent">' + info + "</p>");
                            } else {
                                ctnr.html(sdPage.view.InitialPdpReturnsInfo);
                            }
                        }
                        return;
                    }
                    // HOF
                    if (!ctnr.length) ctnr = $(".returnsOnly .pd-accordion .acc-content .returnsInfo");

                    // EVAN
                    if (!ctnr.length) ctnr = $(".returnsInfo", ".returnsPage.infoTabPage");
                    // SD
                    if (!ctnr.length) ctnr = $(".infoTabPage", ".returnsPage.infoTabPage");

                    if (ctnr.length) {
                        if (info && info.length > 15) {
                            ctnr.html('<p class="dropShipReturnInfoContent">' + info + "</p>");
                        } else {
                            if (sdPage.view.InitialPdpReturnsInfo && sdPage.view.InitialPdpReturnsInfo.length > 1)
                                ctnr.html(sdPage.view.InitialPdpReturnsInfo);
                        }
                    }
                },
                saveInitialPdpReturnsInfo: function () {
                    // USC
                    var ctnr = $(".pdpDeliveryOptions .delRetContainer .returnsInfo");
                    // HOF
                    if (!ctnr.length) ctnr = $(".returnsOnly .pd-accordion .acc-content .returnsInfo");

                    // EVAN
                    if (!ctnr.length) ctnr = $(".returnsInfo", ".returnsPage.infoTabPage");
                    // SD
                    if (!ctnr.length) ctnr = $(".infoTabPage", ".returnsPage.infoTabPage");

                    if (ctnr.length) sdPage.view.InitialPdpReturnsInfo = ctnr.html();
                },
                InitialPdpReturnsInfo: "",
                setColourVariantDropdownWithImage: function (jqEl, parentEl) {
                    var currentColourVariantImages = productDetailsShared.getCurrentColourVariantImages(parentEl);
                    if (currentColourVariantImages != null) {
                        $("#spanDropdownSelectedImage > img:first", jqEl).attr(
                            "src",
                            currentColourVariantImages.UrlColourSelectorImage,
                        );
                    }

                    var currentColourVariant = productDetailsShared.getCurrentColourVariant(parentEl);
                    if (currentColourVariant != null) {
                        $("#spanDropdownSelectedText", jqEl).text(currentColourVariant.ColourName);
                    }
                },
                initNextDayDeliveryCountdownTimer: function () {
                    var nextDayDeliveryCountdownElement = document.getElementsByClassName("ndd-countdown");

                    if (nextDayDeliveryCountdownElement.length == 0) return;

                    var deliveryDeadline = nextDayDeliveryCountdownElement[0].dataset.nddDeliveryDeadline;
                    var cutOffTime = new Date(deliveryDeadline).getTime();
                    var countdownElement = document.getElementById("countdown");
                    var countdownHourElement = countdownElement.getElementsByClassName("ndd-countdown-time-hour")[0];
                    var countdownMinuteElement =
                        countdownElement.getElementsByClassName("ndd-countdown-time-minute")[0];
                    var countdownSecondElement =
                        countdownElement.getElementsByClassName("ndd-countdown-time-second")[0];
                    var checkIfSeconds = document.querySelector(".countdown-timer-second-container");
                    var countdownHourElementUnit = document.getElementById("ndd-countdown-hour-unit");

                    var countdownId = setInterval(function () {
                        var now = new Date().getTime();
                        var timeLeft = cutOffTime - now;

                        var hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                        var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                        if (
                            (checkIfSeconds && hours <= 0 && minutes <= 0 && seconds <= 0) ||
                            (!checkIfSeconds && hours <= 0 && minutes <= 0)
                        ) {
                            nextDayDeliveryCountdownElement[0]
                                .closest(".productNextDayDeliveryCountdownWrapper")
                                .remove();
                            clearInterval(countdownId);
                        }

                        countdownHourElement.innerHTML = ("00" + hours).slice(-2);
                        countdownMinuteElement.innerHTML = ("00" + minutes).slice(-2);

                        if (checkIfSeconds) {
                            countdownSecondElement.innerHTML = ("00" + seconds).slice(-2);
                        } else {
                            if (hours < 2) {
                                countdownElement.classList.add("cut-off");
                                countdownHourElementUnit.innerHTML =
                                    countdownHourElementUnit.dataset.nddNonPluralHourUnit;
                            } else {
                                countdownHourElementUnit.innerHTML = countdownHourElementUnit.dataset.nddPluralHourUnit;
                            }
                        }
                    }, 1000);
                },
            },
            controller: {
                init: function () {
                    sdPage.view.init();
                },
                setScrollingForHeroChild: function () {
                    if (sdPage.model.divMainProduct().hasClass("MainFixed")) {
                        var lastHeroChildBottom = sdPage.model.divLastHeroChild().offset().top;
                        var mainProductBottom = sdPage.model.mainProductBottom().offset().top;
                        var mainProductTop =
                            sdPage.model.mainProductTop().offset().top - Math.floor($(window).scrollTop());

                        if (lastHeroChildBottom < mainProductBottom) {
                            sdPage.model.divMainProduct().addClass("MainAbs");
                        }

                        if (mainProductTop > 260) {
                            sdPage.model.divMainProduct().removeClass("MainAbs");
                        }
                    }
                },
            },
        };

    function isVisitedBrandExclusion(brand) {
        var brandsVal = $("#hdnVisitedBrandsExclusions").val();
        var brands = [];
        if (brandsVal) {
            brands = brandsVal.split("|");
        }
        var excluded = false;
        for (var x = 0; x < brands.length; x++) {
            if (brands[x].toLowerCase() === brand.toLowerCase()) {
                excluded = true;
                break;
            }
        }
        return excluded;
    }

    $(function () {
        // Select dropdown active class
        $("select").on("click", function () {
            $(this).toggleClass("active");
            var colourParent = $(this).parents("#divColour");
            var swapParent = $(this).parents(".swapSize");
            if (colourParent.length > 0) {
                colourParent.toggleClass("active");
            } else if (swapParent.length > 0) {
                swapParent.toggleClass("active");
            }
        });

        $("select").focusout(function () {
            $(this).toggleClass("active");
            var colourParent = $(this).parents("#divColour");
            var swapParent = $(this).parents(".swapSize");
            if (colourParent.length > 0) {
                colourParent.removeClass("active");
            } else if (swapParent.length > 0) {
                swapParent.removeClass("active");
            }
        });

        // Accordion
        // Open on first load
        $(".pd-accordion.open-on-load").each(function () {
            $(this).addClass("open");
            var accContent = $(this).find(".acc-content");
            accContent.show();
        });

        /// Open on click when on Tablet/Mobile
        $(".pd-accordion .acc-title h3").on("click", function () {
            if (window.innerWidth < 1022) {
                var accordionParent = $(this).parents(".pd-accordion");
                if (!accordionParent.hasClass("open")) {
                    // For each open parent close the
                    $(".pd-accordion.open").each(function () {
                        $(this).toggleClass("open");
                        var accContent = $(this).find(".acc-content");
                        accContent.slideToggle("slow");
                    });
                }

                accordionParent.toggleClass("open");
                var accContent = accordionParent.find(".acc-content");
                accContent.slideToggle("slow");
            }
        });

        $(window).resize(function () {
            $(".pd-accordion.open").each(function () {
                var accContent = $(this).find(".acc-content");
                accContent.show();
            });
        });

        // works only with firefox, and this is required as in firefox when you selected size and if you hit F5 then size is not changing
        // but prices are changed, to fix this remove selected size option.
        //$(document).bind('keypress', function (e) { if (e.keyCode == 116) { removeSelectedSizeonF5(); } });

        var hasBannerVideo = false;

        sdPage.controller.init();
        if (window.enableColourImagesFunctionality) {
            var clrSet;
            $.each(productDetailsShared.getProductScopesOnPage(), function (i, parentEl) {
                var v = $("li.variantHighlight", parentEl).attr("data-colvarid");
                setSelectedColour(v, parentEl);
                sdPage.model.piThumbList(parentEl).addClass("piThumbImages");
                // PDP Attributes-related && DropShip
                if (v && v.length > 0) {
                    sdPage.view.displayPDPAndGoodToKnowAttributes(v);
                    clrSet = true;
                }
            });
            // PDP Attributes-related && DropShip
            if (!clrSet) {
                var selectedclr = productDetailsShared.getSelectedColourVariantValue();
                if (selectedclr && selectedclr.length > 0) {
                    sdPage.view.displayPDPAndGoodToKnowAttributes(selectedclr);
                }
            }
        }

        sdPage.view.bindQuantities();
        mainImageZoom.initProductZoomRollOver(true);
        initialiseDeliveryOptions();
        setupEventHandlers();
        setWishListClass();
        productLook.initializeLook();

        if (isAlternateAccordionEnabled()) {
            productInfoAccordians();
        } else {
            bindProductInfoAccordians();
        }

        if (sizeRequiredButtons) sizeRequiredButtons.init();
        else console.error("sizeRequiredButtons not found");

        var currentVariantId = sdPage.model.colourDdl().val();
        algoliaUtil.bindAlgloliaDataAttributes("#productDetails", currentVariantId);
        $(window).resize(sdPage.view.windowResize);

        function initialiseDeliveryOptions() {
            $("#parDeliveryMethods.DeliveryMethodPopoverMode .DeliveryMethod").popover({
                trigger: "hover",
                placement: "top",
                html: true,
                content: function () {
                    return $(this).find(".DeliveryMethodDescription").html();
                },
            });
        }

        if (sdPage.model.mainProductTop().length > 0) {
            sdPage.view.enableHeroChildScrolling();
            $(window).scroll(function () {
                sdPage.controller.setScrollingForHeroChild();
            });
        }

        sdPage.view.saveInitialPdpReturnsInfo();

        productDetailSwiper.initializePdpFeaturesSwiper();
    });

    function setupSwiperContainer() {
        if ($(".productImageCarousel").length > 0) {
            var selectedColourId = productDetailsShared.getSelectedColourVariantValue();
            if (!selectedColourId || !productDetailsShared.isValidColCode(selectedColourId)) {
                selectedColourId = $(".swiper-container").find("img:first").data("colourcode");
            }
            productImageCarousel.initializeSwiper(selectedColourId);
        }
    }

    function setupImageGridContainer(colCode) {
        if (sdPage.model.productImagesGridExists()) {
            if (!colCode || !productDetailsShared.isValidColCode(colCode)) {
                colCode = productImageGrid.getDefaultColCode();
            }
        }
        return colCode.toString();
    }

    function setupVSliderContainer() {
        if ($(".productImageVerticalSlider").length > 0) {
            productVSlider.initializeSlider(productDetailsShared.getSelectedColourVariantValue());
        }
    }

    function setupTwoImageContainer() {
        if (sdPage.model.productImagesTwoImageCarouselExists()) {
            productTwoImageCarousel.initializeSwiper(productDetailsShared.getSelectedColourVariantValue());
        }
    }

    function bindProductInfoAccordians() {
        if ($("#trigger").is(":visible") && $(".infoaccordion").length < 1) {
            productInfoAccordians();
        }
    }

    function productInfoAccordians() {
        var infoTabs = $(".infoTabs"),
            modDnnCentricRatingAndCommentsC = sdPage.model.moduleDnnCentricRatingAndCommentsControl;
        sdPage.model.ratingsMarkup = modDnnCentricRatingAndCommentsC.children();
        $.each(infoTabs, function (i, el) {
            sdPage.view.processAccordion($(el));
        });
        sdPage.view.ratingsAndReviews();
        sdPage.model.customerReviewHeader().addClass("FooterHeader");
        sdPage.view.bindAccordionClickEvent();
    }

    function isAlternateAccordionEnabled() {
        return (
            (checkVariableExists(window.alternateAccordion) && window.alternateAccordion) ||
            $("#contentWrapper").hasClass("HeroProdDet")
        );
    }

    function setupEventHandlers() {
        $("#BrandLogo").one("error", function () {
            $(this).hide();
        });
        $("a.acustomerreviews").click(sdPage.view.btnCustomerReviewsClick);
        $(".BasketWishContainer  a.addToBag").click(sdPage.view.btnAddToBagClick);
        $("#aPrePersAddToBag").click(sdPage.view.btnAddToBagNoPersonalisaionClick);
        $("#aPrePersAddToWishList").click(sdPage.view.btnAddToWishlistNoPersonalisationClick);
        $("a[id$='aAddToWishList'], button#aAddToWishList").click(sdPage.view.btnAddToWishListClick);
        $("a[id$='aSaveForLater']").click(sdPage.view.btnAddToWishListClick);
        $(".FastPayBuyNowButton").click(sdPage.view.btnBuyNowWithFastPayClick);
        if (window.enableColourImagesFunctionality) {
            //New
            var images = $("ul > li.colorImgli");
            images.click(sdPage.view.btnColourVariantClick);
            if (!isTouchDevice() || (IsDesktopView() && !isIPadOrAndroid())) {
                images
                    .mouseenter(sdPage.view.btnColourVariantHoverEnter)
                    .mouseleave(sdPage.view.btnColourVariantHoverLeave);
            }
        }

        function isIPadOrAndroid() {
            // Is it iPad?
            var isIPad = navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2;
            if (isIPad) {
                return true;
            }
            // Is it android?
            return /android/i.test(navigator.userAgent);
        }

        $("ul > li.sizeButtonli").on("click", function (e) {
            e.preventDefault();
            onSizeButtonClicked($(this));
        });

        $('select[id$="sizeDdl"]').change(sdPage.view.sizeDdlChange);
        var isHeroProduct = false;
        $.each(productDetailsShared.getProductScopesOnPage(), function () {
            var parentEl = $(this);
            sdPage.view.enableDisableAltImagesNavigation(parentEl); // for alternate images navigation
            if (productDetailsShared.isProductPersonalised(parentEl)) {
                $(".persOpener", parentEl).click(sdPage.view.btnAddToBagClick);
                $(".personalisationOpener", parentEl).click(sdPage.view.personalisationOpener);
            }
            if (sdPage.model.isHeroProduct(parentEl)) {
                isHeroProduct = true;
            }
        });

        if (isHeroProduct) {
            sdPage.model.pnlRatingsAndReviews().click(function (e) {
                var scope = productDetailsShared.getProductScope($(this));
                sdPage.view.openRatingsAndReviewsPopup(scope);
                return false;
            });

            $('img[id$="imgProductImage"]')
                .unbind("click")
                .click(function (e) {
                    e.preventDefault();
                    var parentEl = productDetailsShared.getProductScope($(this)),
                        scope = productDetailsShared.getProductScope($(this));
                    sdPage.view.updateProductDetailMainImage(
                        scope,
                        productDetailsShared.getSelectedColourVariantValue(parentEl),
                    );
                    return false;
                });

            // hide advert on top
            var siteWideAdvert = $(".sitewide");
            if (siteWideAdvert.length > 0) {
                siteWideAdvert.hide();
            }
        }

        var divShareButton = $("#divShareButton");
        if (divShareButton.length > 0) {
            divShareButton.click(openSocialLinksDialog);
        }

        $("a.rtsIn")
            .unbind("click")
            .click(function (e) {
                e.preventDefault();
                var $div = $(this).closest("div.rtsLink");
                $("div.rtsSelected").removeClass("rtsSelected");
                $div.addClass("rtsSelected");
                var tabid = $div.attr("data-tabid"),
                    $tabs = $("div.sdtabBody", "div.multiPage");
                $tabs.addClass("rmpHiddenView");
                $("div.sdtabBody[data-tabid='" + tabid + "']", "div.multiPage").removeClass("rmpHiddenView");
            });

        // Update aria attributes
        $("li[role='tab']").click(function () {
            $("li[role='tab']").attr("aria-selected", "false"); //deselect all the tabs
            $(this).attr("aria-selected", "true"); // select this tab
            var tabpanid = $(this).attr("aria-controls"), //find out what tab panel this tab controls
                tabpan = $("#" + tabpanid);
            $("div[role='tabpanel']").attr("aria-hidden", "true"); //hide all the panels
            tabpan.attr("aria-hidden", "false"); // show our panel
        });

        bindFinanceEvents();
        var financeServiceInfo = $("#financeServiceInfo"),
            payOnFinanceInfo = $(".payOnFinanceInfo");
        if (financeServiceInfo.length > 0) {
            financeServiceInfo.click(function () {
                showFinanceModalDialog();
            });
        }
        if (payOnFinanceInfo.length > 0) {
            payOnFinanceInfo.click(function () {
                showFinanceModalDialog();
            });
        }
        openFinanceModalDialogIfHashExists();
    }

    function onSizeButtonClicked(clickedButton) {
        var scope = productDetailsShared.getProductScope(clickedButton);

        $("ul > li.sizeButtonli", scope).removeClass("sizeVariantHighlight");
        clickedButton.addClass("sizeVariantHighlight");

        //setTimeout used to get run a chrome on android bug
        setTimeout(function () {
            populateSizeVariantChangedValues(scope, clickedButton.attr("data-text"), clickedButton);
        }, 0);
    }

    function toggleLowStockSellingFastIndicators(clickedButton, scope) {
        var stockLevelWrapper = $(scope).find(".stockLevelWrapper");
        var quantityOfSelectedSize = parseInt(
            clickedButton.attr("data-stock-qty") ?? clickedButton.find(":selected").attr("data-stock-qty"),
        );

        stockLevelWrapper.find(".stock-level-container").addClass("hide");

        if (
            quantityOfSelectedSize >= getLowStockIndicatorFromValue() &&
            quantityOfSelectedSize <= getLowStockIndicatorToValue()
        ) {
            stockLevelWrapper.find("[data-stock-level-running-low]").removeClass("hide");
        } else if (
            quantityOfSelectedSize >= getSellingFastIndicatorFromValue() &&
            quantityOfSelectedSize <= getSellingFastIndicatorToValue()
        ) {
            stockLevelWrapper.find("[data-stock-level-selling-fast]").removeClass("hide");
        }
    }

    function toggleLowStockSellingFastIndicatorsForAllSizes(parentEl) {
        var stockLevelWrapper = $(parentEl).find(".stockLevelWrapper");
        var totalStockQuantityForSelectedColour = getTotalStockQuantiyForSelectedColour(parentEl);

        stockLevelWrapper.find(".stock-level-container").addClass("hide");

        if (
            totalStockQuantityForSelectedColour >= getLowStockIndicatorFromValue() &&
            totalStockQuantityForSelectedColour <= getLowStockIndicatorToValue()
        ) {
            stockLevelWrapper.find("[data-stock-level-running-low]").removeClass("hide");
        } else if (
            totalStockQuantityForSelectedColour >= getSellingFastIndicatorFromValue() &&
            totalStockQuantityForSelectedColour <= getSellingFastIndicatorToValue()
        ) {
            stockLevelWrapper.find("[data-stock-level-selling-fast]").removeClass("hide");
        }
    }

    function getTotalStockQuantiyForSelectedColour(parentEl) {
        return $(parentEl)
            .find("#ulSizes li:not(.greyOut)")
            .map(function () {
                return parseInt($(this).attr("data-stock-qty"));
            })
            .toArray()
            .reduce(function (a, b) {
                return a + b;
            });
    }

    function getLowStockIndicatorFromValue() {
        return parseInt($("#lowStockIndicatorFromValue").val());
    }

    function getLowStockIndicatorToValue() {
        return parseInt($("#lowStockIndicatorToValue").val());
    }

    function getSellingFastIndicatorFromValue() {
        return parseInt($("#sellingFastIndicatorFromValue").val());
    }

    function getSellingFastIndicatorToValue() {
        return parseInt($("#sellingFastIndicatorToValue").val());
    }

    function checkVariableExists(gVariable) {
        if (typeof gVariable !== "undefined") {
            return true;
        }
        return false;
    }

    function setWishListClass() {
        var isWishListActive = $("div[id$='addToWishListContainer']").length > 0;
        if (isWishListActive) {
            $("div.BasketWishContainer ").addClass("WishlistActive");
        } else {
            $("div.BasketWishContainer ").removeClass("WishlistActive");
        }
    }

    function openFinanceModalDialogIfHashExists() {
        if (window.location.href.toLowerCase().indexOf("#financetab") >= 0 && $("#divFinanceContainer").length > 0) {
            showFinanceModalDialog();
            return false;
        }
        return true;
    }

    // this is used to let the containing model set the validity of this item

    function setPreOrderText(parentEl, preOrderAvailableDate) {
        var preOrderTextId = $("div[id$='parPreOrderableText']", parentEl),
            addToBagInner = $(".addToBagInner", parentEl),
            availableFromContainer = $("#availableFromContainer"),
            litAvailableFromDate = $("#litAvailableFromDate"),
            aAddToWishList = $("a[id$='aAddToWishList']", parentEl);
        if (checkVariableExists(window.isPreOrderable)) {
            window.isPreOrderable = preOrderAvailableDate.length > 0;
        }
        if (preOrderAvailableDate.length > 0) {
            var preOrderText = $("input[id$='hdnPreOrderParagraphText']", parentEl).val();
            if (preOrderText.length > 0) {
                preOrderTextId
                    .html(preOrderText.replace("{0}", preOrderAvailableDate))
                    .removeClass("hidden")
                    .addClass("preOrder");
                var preOrder = addToBagInner.data("preorder");
                addToBagInner.text(preOrder).addClass("isPreOrderable");
                aAddToWishList.addClass("isPreOrderable");
                availableFromContainer.removeClass("hidden");
                litAvailableFromDate.html(preOrderAvailableDate);
            }
        } else {
            preOrderTextId.text("").removeClass("preOrder").addClass("hidden");
            availableFromContainer.addClass("hidden");
            var addToBagText = addToBagInner.data("addtobag");
            addToBagInner.removeClass("isPreOrderable");
            aAddToWishList.removeClass("isPreOrderable");

            var sizeselectAttr = addToBagInner.data("selectsize");
            if (typeof sizeselectAttr === "undefined" || sizeselectAttr === false) {
                addToBagInner.text(addToBagText);
            }
        }
    }

    function togglePrintessCta(parentEl, productDetails) {
        parentEl
            .querySelector(".printess-container")
            ?.classList.toggle("is-hidden", !productDetails.IsPrintessPersonalisable);
    }

    function setSelectedColour(value, parentEl) {
        var prevSelectedColourId = productDetailsShared.getSelectedColourVariantValue(parentEl);
        if (value) {
            $(".variantHighlight", parentEl).removeClass("variantHighlight").attr("aria-checked", "false");
            $(".ProductDetailsVariants", parentEl).attr("data-selectedcolour", value);
        }
        var v = $("#cvli" + value, parentEl).attr("data-text"),
            ddl = sdPage.model.colourDdl(parentEl);
        sdPage.model.colourName(parentEl).text(v);
        $("#cvli" + value, parentEl)
            .addClass("variantHighlight")
            .attr("aria-checked", "true");
        if (ddl.length > 0) {
            $("option:selected", ddl).removeAttr("selected");
            $("option[value='" + value + "']", ddl).prop("selected", true);
        }
        sdPage.view.setColourVariantDropdownWithImage("#divColourImageDropdownGroup", parentEl);

        updateTrueFitColour(value, v);

        return prevSelectedColourId;
    }

    function updateTrueFitColour(id, colorId) {
        if (!id || !colorId || typeof tfcapi === "undefined") {
            return;
        }

        var productId = id.substring(0, 6);
        var data = { products: {} };
        data["products"][productId] = { colorId };

        setTimeout(() => tfcapi("update", "tfc-fitrec-product", data), 0);
    }

    function colourDropdownVariantIndexChanged(ele) {
        var clickedElement = $(ele),
            parentEl = productDetailsShared.getProductScope(clickedElement),
            prevSelectedColourId = productDetailsShared.getSelectedColourVariantValue(parentEl),
            selectedValue = clickedElement.is("select") ? clickedElement.val() : clickedElement.attr("data-value");

        // ImageDropdown item clicked
        if (clickedElement.closest("#ddlColours").length) {
            var eleId = "cvli" + clickedElement.data("value");
            if ($("#ulColourImages li[id=" + eleId + "]").hasClass("more-hide")) {
                $("#cvlimore > a:first").click();
            }
        }
        sdPage.model.colourName(parentEl).removeClass("colourText");
        if (prevSelectedColourId != selectedValue) {
            //setTimeout used to get run a chrome on android bug
            setTimeout(function () {
                populateColorVariantChangedValuesNew(selectedValue, parentEl);
            }, 0);
            triggerProductViewedEventOnColorChanged(selectedValue, parentEl);
        } else {
            sdPage.view.addCurrentProductToRecents();
        }
    }

    function populateSizeVariantChangedValues(parentEl, selectedDdlSize, clickedElem) {
        var selectedDdlColour = productDetailsShared.getSelectedColourVariantValue(parentEl),
            initialResults = productDetailsShared.getColourVariants(parentEl),
            selectedColourDisplayAttributes,
            selectedSizeDisplayAttributes;

        var isSelectedDdlSizeOk = selectedDdlSize != "";
        if (initialResults.length === 0) {
            return;
        }
        var colVarId = "",
            colName = "",
            sizeVarId = "",
            sizeName = "",
            sizeSash = "";

        var selectedSizeExists = false,
            colourVariantIdToChange = "";
        $(initialResults).each(function () {
            var colorVariantId = this.ColVarId,
                colourName = this.ColourName,
                sizeExists = false,
                inStockSizes = sdPage.model.getInStockSizeVariantsForColour(initialResults, colorVariantId);

            if (selectedDdlColour === colorVariantId) {
                selectedColourDisplayAttributes = $(this)[0].DisplayAttributes;
                if (isSelectedDdlSizeOk) {
                    if (inStockSizes.length > 0) {
                        $(inStockSizes).each(function () {
                            if (selectedDdlSize === this.SizeName) {
                                selectedSizeDisplayAttributes = $(this)[0].DisplayAttributes;
                                selectedSizeExists = true;
                                sdPage.view.populateHiddenSizeValues(
                                    parentEl,
                                    selectedDdlSize,
                                    this.SizeVarId,
                                    this.PreOrderable,
                                    this.SizeSash,
                                    this.Qty,
                                );
                                sdPage.view.updateProductPrices(parentEl, this.ProdSizePrices);
                                sdPage.view.updateStackTrafficLights(parentEl, this.State);
                                sdPage.view.showDropShipInfoSummary(
                                    this.SuppliedBy,
                                    this.SuppliedByName,
                                    this.DeliveryInfoSummaryData && this.DeliveryInfoSummaryData != null
                                        ? this.DeliveryInfoSummaryData.Pdp
                                        : undefined,
                                );
                                sdPage.view.displayPDPAndGoodToKnowAttributes(this.SizeVarId);
                                sdPage.view.showFinanceOptionsLink(
                                    this.ProdSizePrices.PriceUnFormatted,
                                    "PDP",
                                    "LinkToView",
                                );
                                colVarId = colorVariantId;
                                colName = colourName;
                                sizeVarId = this.SizeVarId;
                                sizeName = this.SizeName;
                                sizeSash = this.SizeSash;

                                this.ColVarId = colVarId;
                                this.ColourName = colName;
                                updateDataLayerData(this);

                                return;
                            }
                        });
                    }
                    removeGreyOutClassForColourVariants(parentEl, colorVariantId, selectedSizeExists);
                } else {
                    sdPage.view.updateProductPrices(parentEl, this.ProdVarPrices);
                }
            } else {
                if (isSelectedDdlSizeOk) {
                    $(inStockSizes).each(function () {
                        if (selectedDdlSize === this.SizeName) {
                            sizeExists = true;
                            if (!selectedSizeExists && colourVariantIdToChange.length === 0) {
                                sdPage.view.populateHiddenSizeValues(
                                    parentEl,
                                    selectedDdlSize,
                                    this.SizeVarId,
                                    this.PreOrderable,
                                    this.SizeSash,
                                    this.Qty,
                                );
                                colourVariantIdToChange = colorVariantId;
                                sdPage.view.updateStackTrafficLights(parentEl, this.State);
                                sdPage.view.showDropShipInfoSummary();
                                sdPage.view.displayPDPAndGoodToKnowAttributes();
                                sdPage.view.showFinanceOptionsLink();
                            }
                            colVarId = colorVariantId;
                            colName = colourName;
                            sizeVarId = this.SizeVarId;
                            sizeName = this.SizeName;
                            return;
                        }
                    });
                    removeGreyOutClassForColourVariants(parentEl, colorVariantId, sizeExists);
                }
            }

            // if selected size is "Please Select" then enable all colour variants
            if (!isSelectedDdlSizeOk) {
                removeGreyOutClassForColourVariants(parentEl, colorVariantId, true);
                sdPage.view.populateHiddenSizeValues(parentEl, "", "", "", "", 0);
                sdPage.view.updateStackTrafficLights(parentEl, "");
                sdPage.view.showDropShipInfoSummary();
                sdPage.view.displayPDPAndGoodToKnowAttributes(colorVariantId);
                sdPage.view.showFinanceOptionsLink();
            }
        });

        if (selectedSizeExists) {
            sdPage.view.enableAddToBagButton();
            setAddToBagButtonText();
        } else {
            sdPage.view.disableAddToBagButton();
        }

        if (!selectedSizeExists && colourVariantIdToChange.length > 0) {
            populateColorVariantChangedValuesNew(colourVariantIdToChange, parentEl);
        }

        sdPage.view.updateDisplayAttributes(parentEl, selectedColourDisplayAttributes, selectedSizeDisplayAttributes);
        sdPage.view.updateKeyBenefits();

        triggerProductViewedEventOnSizeChanged(sizeName, parentEl);
        toggleLowStockSellingFastIndicators(clickedElem, parentEl);
        window.anonymousWishlist.highlightIconIfProductOnWishlistPDP();
    }

    function updateVisualisationWindowColour(replaceWithValue, previousValue) {
        var modelSrc = $("#divPersMyIdImage").data("modelsrc");
        if (modelSrc) {
            var newSrc = modelSrc.replace(previousValue, String(replaceWithValue));
            var modelVisualisation = document.getElementById("PersImage");

            if (modelVisualisation != null) {
                modelVisualisation.setAttribute("src", newSrc);
            }
        }
    }

    function populateColorVariantChangedValuesNew(selectedColourVarId, parentEl) {
        var previousValue = setSelectedColour(selectedColourVarId, parentEl),
            selectedColourDisplayAttributes,
            selectedSizeDisplayAttributes;

        if (selectedColourVarId !== "") {
            updateVisualisationWindowColour(selectedColourVarId, previousValue);

            var initialResults = productDetailsShared.getColourVariants(parentEl);
            $.each(initialResults, function () {
                if (selectedColourVarId !== this.ColVarId) {
                    return true; // continue
                }
                selectedColourDisplayAttributes = this.DisplayAttributes;
                var previousSelectedSizeAvailable = false,
                    sizeVariantPrices = [],
                    colourVariantPrices = this.ProdVarPrices,
                    divSize = sdPage.model.divSize(parentEl);
                setPreOrderText(parentEl, this.PreOrderAvailableDate);
                togglePrintessCta(parentEl, this);
                window.Printess?.handleColourChangedPrintessPdp(parentEl);
                window.ProductDetailAmplienceVideo?.toggleVideoButtonDisplay();
                sdPage.view.populateImages(this.ProdImages, parentEl, this.ColVarId);
                var colorSizeVariantResults = sdPage.model.getInStockSizeVariantsForColour(
                        initialResults,
                        this.ColVarId,
                    ),
                    stockState = "",
                    sl;

                if (
                    colorSizeVariantResults.length > 1 ||
                    (colorSizeVariantResults.length === 1 && colorSizeVariantResults[0].SizeName != "")
                ) {
                    divSize.show();
                    var previousSelectedSize = productDetailsShared.hdnSelectedSizeName(parentEl).val();
                    $(colorSizeVariantResults).each(function () {
                        var sizeName = this.SizeName;
                        if (previousSelectedSize == sizeName) {
                            selectedSizeDisplayAttributes = this.DisplayAttributes;
                            sdPage.view.populateHiddenSizeValues(
                                parentEl,
                                sizeName,
                                this.SizeVarId,
                                this.PreOrderable,
                                this.SizeSash,
                                this.Qty,
                            );
                            previousSelectedSizeAvailable = true;
                            sizeVariantPrices = this.ProdSizePrices;
                            stockState = this.State;
                            sdPage.view.showDropShipInfoSummary(
                                this.SuppliedBy,
                                this.SuppliedByName,
                                this.DeliveryInfoSummaryData && this.DeliveryInfoSummaryData != null
                                    ? this.DeliveryInfoSummaryData.Pdp
                                    : undefined,
                            );
                            sdPage.view.displayPDPAndGoodToKnowAttributes(this.SizeVarId);
                            sdPage.view.showFinanceOptionsLink(
                                this.ProdSizePrices.PriceUnFormatted,
                                "PDP",
                                "LinkToView",
                            );

                            // update ecommerce data with size variant
                            this.ColVarId = selectedColourVarId;
                            updateDataLayerData(this);

                            return;
                        }
                    });
                    var sizes = $.map(colorSizeVariantResults, function (val) {
                        return val.SizeName;
                    });
                    var colourName = sdPage.model.colourName(parentEl);

                    var buttons = $("ul > li.sizeButtonli", parentEl),
                        clickToSelectText = buttons.parent().data("clicktoselecttext");
                    buttons.each(function () {
                        var li = $(this),
                            sizeName = li.attr("data-text"),
                            sizeText = li.data("text");
                        if (sizeName != null && sizeName.length > 0) {
                            if ($.inArray(sizeName, sizes) != -1) {
                                li.removeClass("greyOut");
                                li.attr("title", clickToSelectText + " " + sizeText);
                            } else {
                                li.removeClass("sizeVariantHighlight");
                                li.addClass("greyOut");
                                li.attr(
                                    "title",
                                    sizeText + " " + colourName.text() + " " + divSize.data("outofstocktext"),
                                );
                            }
                        }
                    });

                    $("option", sdPage.model.sizeDdl(parentEl)).each(function () {
                        var ddlSizeName = $(this).attr("value"),
                            ddlSizeText = $(this).text();
                        if (ddlSizeName != null && ddlSizeName.length > 0) {
                            if ($.inArray(ddlSizeName, sizes) != -1) {
                                $(this).removeClass("greyOut").attr("title", ddlSizeText);
                            } else {
                                $(this)
                                    .removeAttr("selected")
                                    .addClass("greyOut")
                                    .attr(
                                        "title",
                                        ddlSizeText + " " + colourName.text() + " " + divSize.data("outofstocktext"),
                                    );
                            }
                        }
                    });

                    sdPage.model.sizeCustomDdl(parentEl).each(function () {
                        var ddlSizeName = $(this).attr("data-value");
                        if (ddlSizeName != null && ddlSizeName.length > 0) {
                            if ($.inArray(ddlSizeName, sizes) != -1) {
                                $(this).children("a:first").removeClass("greyOut").attr("title", ddlSizeName);
                            } else {
                                $(this)
                                    .children("a:first")
                                    .addClass("greyOut")
                                    .attr(
                                        "title",
                                        ddlSizeName + " " + colourName.text() + " " + divSize.data("outofstocktext"),
                                    );
                            }
                        }
                    });
                } else {
                    divSize.hide();
                }
                if (previousSelectedSizeAvailable) {
                    sdPage.view.updateProductPrices(parentEl, sizeVariantPrices);
                    sdPage.view.updateStackTrafficLights(parentEl, stockState);
                } else {
                    sdPage.view.populateHiddenSizeValues(parentEl, "", "", "", "", 0);
                    sdPage.view.updateProductPrices(parentEl, colourVariantPrices);
                    sdPage.view.updateStackTrafficLights(parentEl, stockState);
                    sdPage.view.showDropShipInfoSummary();
                    sdPage.view.displayPDPAndGoodToKnowAttributes(selectedColourVarId);
                    sdPage.view.showFinanceOptionsLink();

                    // previous size not available rest button to select size
                    var addToBagInner = $(".addToBagInner");
                    var sizeselectAttr = addToBagInner.data("selectsize");
                    var isPreOrderable = addToBagInner.hasClass("isPreOrderable");
                    if (typeof sizeselectAttr !== "undefined" || sizeselectAttr !== false) {
                        if (!isPreOrderable) {
                            addToBagInner.text(sizeselectAttr);
                        }
                        $(".addToBasketContainer").removeClass("sizeSelected addedToBag");
                    }

                    // update ecommerce data with colour variant
                    updateDataLayerData(this);
                }
                sdPage.view.updateMainImageThumbNail(previousValue, selectedColourVarId);
                if (isColCodeHashEnabled) {
                    replaceState("", "", "colcode=" + selectedColourVarId);
                }
                if (sdPage.model.productImagesVerticalSliderlExists()) {
                    mainImageZoom.setNewZoomForImageElement();
                } else if (!sdPage.model.productImagesCarouselExists()) {
                    mainImageZoom.setNewZoom();
                }

                return false;
            });

            const selectedSize = productDetailsShared.getSelectedSizeVariantName(parentEl);
            $(initialResults).each(function () {
                const inStockSizes = sdPage.model.getInStockSizeVariantsForColour(initialResults, this.ColVarId);
                if (selectedSize != "") {
                    var sizesArray = $.map(inStockSizes, function (val) {
                        return val.SizeName;
                    });
                    if ($.inArray(selectedSize, sizesArray) != -1) {
                        removeGreyOutClassForColourVariants(parentEl, this.ColVarId, true);
                    } else {
                        removeGreyOutClassForColourVariants(parentEl, this.ColVarId, false);
                    }
                } else {
                    removeGreyOutClassForColourVariants(parentEl, this.ColVarId, true);
                }
            });
            // Add to recently viewed
            sdPage.view.addCurrentProductToRecents();

            sdPage.view.enableAddToBagButton();

            sdPage.view.updateDeliveryEstimate();

            productLook.updateLook();

            // Fire custom event
            if (typeof window.CustomEvent === "function")
                window.dispatchEvent(
                    new CustomEvent("colourVariantChanged", { detail: productDetailsShared.getCurrentColourVariant() }),
                );
        }

        sdPage.view.updateDisplayAttributes(parentEl, selectedColourDisplayAttributes, selectedSizeDisplayAttributes);
        sdPage.view.updateKeyBenefits();
        algoliaUtil.bindAlgloliaDataAttributes("#productDetails", selectedColourVarId);
        window.anonymousWishlist.highlightIconIfProductOnWishlistPDP();
    }

    function triggerProductViewedEventOnColorChanged(selectedColourVarId, parentEl) {
        var initialResults = productDetailsShared.getColourVariants(parentEl);
        $(initialResults).each(function () {
            if (selectedColourVarId === this.ColVarId) {
                var selectedSizeName = productDetailsShared.getSelectedSizeVariantName(parentEl),
                    inStockSizes = sdPage.model.getInStockSizeVariantsForColour(initialResults, this.ColVarId);

                var sizeVariant = getSizeVariant(inStockSizes, selectedSizeName);
                triggerProductViewedEvent(
                    this.ColVarId,
                    this.ColourName,
                    sizeVariant.SizeVarId,
                    sizeVariant.SizeName,
                    sizeVariant.ProdSizePrices?.SellPriceRaw,
                    sizeVariant.ProdSizePrices?.BaseCurrencyListPriceRaw,
                );
            }
        });
    }

    function triggerProductViewedEventOnSizeChanged(selectedSizeName, parentEl) {
        var selectedColourVariant = productDetailsShared.getCurrentColourVariant(parentEl);
        var colourVariants = productDetailsShared.getColourVariants(parentEl);
        var sizeFound = false,
            selectedSizeVarId = "",
            colVarId = "",
            colourName = "",
            selectedSizePrice = null,
            selectedSizeBaseCurrencyPrice = null;

        if (selectedColourVariant == null) {
            $(colourVariants).each(function () {
                colVarId = this.ColVarId;
                colourName = this.ColourName;
                var inStockSizes = sdPage.model.getInStockSizeVariantsForColour(colourVariants, this.ColVarId);
                $(inStockSizes).each(function () {
                    if (selectedSizeVarId == this.SizeVarId) {
                        sizeFound = true;
                        selectedSizeName = this.SizeName;
                        selectedSizePrice = this.ProdSizePrices?.SellPriceRaw;
                        selectedSizeBaseCurrencyPrice = this.ProdSizePrices?.BaseCurrencyListPriceRaw;

                        return false;
                    }
                });
                if (sizeFound) {
                    return false;
                }
            });
        } else {
            colVarId = selectedColourVariant.ColVarId;
            colourName = selectedColourVariant.ColourName;
            var inStockSizes = sdPage.model.getInStockSizeVariantsForColour(colourVariants, colVarId);
            $(inStockSizes).each(function () {
                if (selectedSizeName == this.SizeName) {
                    selectedSizeVarId = this.SizeVarId;
                    selectedSizePrice = this.ProdSizePrices?.SellPriceRaw;
                    selectedSizeBaseCurrencyPrice = this.ProdSizePrices?.BaseCurrencyListPriceRaw;

                    return false;
                }
            });
        }
        triggerProductViewedEvent(
            colVarId,
            colourName,
            selectedSizeVarId,
            selectedSizeName,
            selectedSizePrice,
            selectedSizeBaseCurrencyPrice,
        );
    }

    /** Gets the selected or default size variant from the available sizes in stock. */
    function getSizeVariant(inStockSizes, selectedSizeName) {
        var sizeVariant = inStockSizes[0];
        if (selectedSizeName != "") {
            $(inStockSizes).each(function () {
                if (this.SizeName === selectedSizeName) {
                    sizeVariant = this;
                    return false;
                }
            });
        }
        return sizeVariant;
    }

    function removeGreyOutClassForColourVariants(parentEl, colVariantId, exists) {
        var id = $("#cvli" + colVariantId, parentEl),
            colourDdl = sdPage.model.colourDdl(parentEl),
            isColourDdlExists = colourDdl.length > 0;
        if (exists) {
            id.removeClass("greyOut").removeAttr("data-tooltipText");
            $(".tooltipContent", parentEl).remove();
            var spanId = $("#sp" + colVariantId, parentEl);
            if (typeof spanId !== "undefined" && spanId.length > 0) {
                spanId.remove();
            }

            if (isColourDdlExists) {
                $("option[value='" + colVariantId + "']", colourDdl)
                    .removeClass("greyOut")
                    .removeAttr("title");
            }
        } else {
            var sizeNotAvailable = $("ul[id$='ulColourImages']", parentEl).attr("data-text"),
                spId = "#sp" + colVariantId;
            id.addClass("greyOut").attr("data-tooltiptext", sizeNotAvailable);
            if ($(spId, parentEl).length === 0) {
                var spanTag = $("<span></span>", {
                    id: "sp" + colVariantId,
                });
                id.find("a").append(spanTag);
            }
            if (isColourDdlExists) {
                $("option[value='" + colVariantId + "']", colourDdl)
                    .addClass("greyOut")
                    .attr("title", sizeNotAvailable);
            }
        }
    }

    // Finance
    function bindFinanceEvents() {
        if ($("#divFinanceContainer").length > 0) {
            $(window).bind("resize.divFinanceContainer", function () {
                calcFinanceCentreModal("divFinanceContainer", "id");
            });

            $(".finance-close").click(function () {
                hideFinanceModalDialog();
                return false;
            });

            $("#finance-modal-background").click(function () {
                hideFinanceModalDialog();
                return false;
            });
        }
    }

    function showFinanceModalDialog() {
        if ($("#divFinanceContainer").length > 0) {
            $("html, body").addClass("no-scroll");
            $("#finance-modal-background").show();
            $("#divFinanceContainer").show();
            calcFinanceCentreModal("divFinanceContainer", "id");
        }
    }

    function hideFinanceModalDialog() {
        $("html, body").removeClass("no-scroll");
        $("#divFinanceContainer").hide();
        $("#finance-modal-background").hide();
    }

    function calcFinanceCentreModal(selector, type) {
        var top,
            left,
            jSelect = type == "id" ? "#" + selector : "." + selector;
        top = Math.max($(window).height() - $(jSelect).outerHeight(), 0) / 2;
        left = Math.max($(window).width() - $(jSelect).outerWidth(), 0) / 2;
        $(jSelect).css({
            top: top,
            left: left,
        });
    }

    // social links

    function openSocialLinksDialog() {
        var title = $("div[id$='divShareBoxContent']").data("title");

        var socialModal = modalHelper.setupModal({
            modalName: "SocialModal",
            titleHtml: title,
            bodyDiv: "divShareBoxContent",
            cssClass: "ProductDetailModals",
        });

        modalHelper.showModal(socialModal);
        getSocialScripts();

        $(".fullURLshare").on("click", "#shareCopyURLbutton", function () {
            if (this.hasAttribute("data-page-url")) {
                var altCopyUrl = this.getAttribute("data-page-url");
                var copiedText = this.getAttribute("data-copied-text");
                navigator.clipboard
                    .writeText(altCopyUrl)
                    .then(function () {
                        let copyButtonText = document.getElementById("copyText");
                        copyButtonText.innerHTML = copiedText;
                    })
                    .catch(function (error) {
                        console.error("Failed to copy text: ", error);
                    });
            } else {
                var shareCopyURL = $("#shareCopyURL");
                shareCopyURL.select();
                document.execCommand("copy");
            }
        });
    }

    function getSocialScripts() {
        var language = getLanguage();

        var facebookLocale = "en_US";
        if (language === "de") facebookLocale = "de_DE";

        //Set the Google PlusOne language
        window.___gcfg = {
            lang: language,
        };

        $.cachedGetSocialScript([
            "//connect.facebook.net/" + facebookLocale + "/all.js#xfbml=1",
            "//platform.twitter.com/widgets.js",
            "https://apis.google.com/js/plusone.js",
            "https://assets.pinterest.com/js/pinit.js",
        ]);
    }

    // Global script manager to avoid duplicate loading of scripts
    var scripts = [];
    // Adds ability to load multiple scripts at a time and provides a global cache
    // for the page so that multiple script references are avoided
    $.cachedGetSocialScript = function (urls, callback) {
        var counter = 0,
            internalCallback = function () {
                counter++;
                if (counter === urls.length && callback) {
                    callback();
                }
            };
        for (var i = 0; i < urls.length; i++) {
            loadScript(urls[i], internalCallback);
        }
    };

    function loadScript(url, callback) {
        if ($.inArray(url, scripts) != -1) {
            if (callback) callback();
            return undefined;
        } else {
            scripts.push(url);
        }
        $.getSocialScript(url, callback);
        return undefined;
    }

    $.getSocialScript = function (url, callback) {
        var headTag = document.getElementsByTagName("head")[0] || document.documentElement,
            scriptTag = document.createElement("script");
        scriptTag.src = url;
        scriptTag.async = true;
        scriptTag.cache = true;

        // Handle Script loading
        {
            var done = false;
            // Attach handlers for all browsers
            scriptTag.onload = scriptTag.onreadystatechange = function () {
                if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                    done = true;

                    if (callback) callback();

                    // Handle memory leak in IE
                    scriptTag.onload = scriptTag.onreadystatechange = null;
                }
            };
        }
        headTag.appendChild(scriptTag);
        // We handle everything using the script element injecion
        return undefined;
    };
    mainImageZoom.init();

    function replaceState(option, url, filters) {
        if (!window.history) return;
        if (filters) {
            url += "#" + filters;
        }

        setTimeout(() => window.history.replaceState(option, "", url), 0);
    }

    function toggleMoreVariants(el) {
        var $el = $(el);
        var max = parseInt($("#hdnMaxVariants").val()) - 1;
        var more = $("#hdnMoreVariantsText").val();
        var less = $("#hdnLessVariantsText").val();
        if ($el.hasClass("colour-images-open")) {
            $("ul.colourImages")
                .children("li:gt(" + max + ")")
                .not("#cvlimore")
                .addClass("more-hide")
                .removeClass("more-show");
            $el.addClass("colour-images-closed").removeClass("colour-images-open");
            $el.children("span.colourImagesMore").text(more);
            // Scroll up
            var topPosition = $("#productDetails").offset().top - 100;
            $("html, body").animate({ scrollTop: topPosition });
        } else {
            $("ul.colourImages")
                .children("li:gt(" + max + ")")
                .not("#cvlimore")
                .addClass("more-show")
                .removeClass("more-hide");
            $el.addClass("colour-images-open").removeClass("colour-images-closed");
            $el.children("span.colourImagesMore").text(less);
        }
    }

    $(document).ready(function () {
        processColourCodeHash();
        attachDropDownWithImageColourVariantSelectionHandler();

        // set hover events for images. Since there are multiple images shown at
        // one time in the view port. When user change the image, zoom element need
        // change dynamically.
        if (sdPage.model.productImagesVerticalSliderlExists()) {
            $(".productImageVerticalSlider .product-image").hover(function () {
                mainImageZoom.setNewZoomForImageElement($(this).parent());
            });
        }

        $(".moreless-button").click(function (e) {
            e.preventDefault();
            $(".pegiMore").slideToggle();
            if ($(".moreless-button").text() == "Read More...") {
                $(this).text("Read Less...");
            } else {
                $(this).text("Read More...");
            }
        });

        sdPage.model.sizeCustomDdl(this).onload = (function () {
            var onloadElem = sdPage.model.sizeCustomDdl(this);
            var ifOneSize = $("#ddlSizes .dropdown-menu").children();

            if (ifOneSize.length === 1) {
                $("#btnNoImageDropdown .value").text(onloadElem.attr("data-value"));
                sdPage.view.sizeCustomDdlChange.call($("#btnNoImageDropdown"), onloadElem);
            }
        })();

        sdPage.model.sizeCustomDdl(this).click(function () {
            var clickedElem = $(this);
            var value = clickedElem.attr("data-value");
            $("#btnNoImageDropdown .value").text(value);
            sdPage.view.sizeCustomDdlChange.call($("#btnNoImageDropdown"), clickedElem);
        });

        $("#productContainerTop").on("click", "#deliveryDetailsShowMore", function (e) {
            e.preventDefault();
            var $this = $("#deliveryDetailsShowMore");
            var $content = $("#deliveryDetails");
            $this.attr("aria-expanded", !$content.is(":visible"));
            $content.slideToggle();
            var text = $this.text();
            $this.text($this.attr("data-text"));
            $this.attr("data-text", text);
        });

        if (queryutils.exists("sizeguide") && queryutils.get("sizeguide") === "true") {
            $(".sizeslink").click();
        }
        if (queryutils.exists("wishlist") && queryutils.get("wishlist") === "true") {
            var addText = $(".pdpWishListLabel").data("addtext");
            var isLoggedIn = typeof addText !== "undefined";

            var $wrapper = $(".sAddToWishListWrapper a");
            if (isLoggedIn) {
                $wrapper.click();
                $("html, body").scrollTop($wrapper.offset().top);
            } else {
                var href = decodeURIComponent($wrapper.attr("href"));
                if (href && href.length) {
                    var newHref = window.location.protocol + "//" + window.location.host + href;
                    window.location.href = newHref;
                }
            }
        }
        if (queryutils.exists("addtobag") && queryutils.get("addtobag") === "true") {
            var addToBag = $(".addToBag:visible");
            if (addToBag.length) {
                $("html, body").scrollTop(addToBag.offset().top);
                addToBag.click();
            }
        }
        if (queryutils.exists("myid") && queryutils.get("myid") === "true") {
            var pers = $(".persOpener");
            if (pers.length) {
                $("html, body").scrollTop(pers.offset().top);
                pers.click();
            }
        }
        if (queryutils.exists("zoomIndex")) {
            var idx = parseInt(queryutils.get("zoomIndex"));
            if (!isNaN(idx)) {
                $("#piThumbs li a").eq(idx).click();
                $(".mobile_zoom_button").click();
            }
        }

        $("#liPlayerPickTab").click(function () {
            var isSelected = $(this).hasClass("myIdRtsSelected");
            switchPersonalisationInput(isSelected);
        });

        $("#liMyIdTab").click(function () {
            var isSelected = $(this).hasClass("myIdRtsSelected");
            switchPersonalisationInput(isSelected);
        });

        sdPage.view.updateDeliveryEstimate();

        function processColourCodeHash() {
            isColCodeHashEnabled = $("#hdnColHashEnabled").val().toLowerCase() === "true";
            if (!isColCodeHashEnabled) {
                processImageIsReady();
                return;
            }
            var hashOptions = hashService.deserialiseLocation();
            var hashColCode = "";
            if (hashOptions.colcode) {
                hashColCode = hashOptions.colcode.toString().toUpperCase();
            }
            var productPageScope = productDetailsShared.getProductScopesOnPage()[0];
            var variants = productDetailsShared.getColourVariants(productPageScope);
            var switchToHashColCode = false;
            var currentlySelectedColCode = productDetailsShared.getSelectedColourVariantValue(productPageScope);

            if (!hashColCode) {
                segmentTrackInitialProductViewedEvent();
            } else {
                $.each(variants, function () {
                    if (hashColCode === this.ColVarId.toUpperCase()) {
                        switchToHashColCode = currentlySelectedColCode !== this.ColVarId;

                        if (window.deferDataLayerPushEnabled && window.initialDataLayerPushIsDeferred) {
                            updateDataLayerData(this);
                        }

                        // Currently when no size is selected the colour variant price is shown.
                        // The default size variant is retrieved to ensure it is consistent with the colour selected behaviour.
                        var selectedSizeName = productDetailsShared.getSelectedSizeVariantName(productPageScope),
                            inStockSizes = this.SizeVariants.filter((sizeVariant) => sizeVariant.InStock),
                            sizeVariant = getSizeVariant(inStockSizes, selectedSizeName);

                        var product = {
                            colourVarId: this.ColVarId,
                            colourName: this.ColourName,
                            price: sizeVariant.ProdSizePrices?.SellPriceRaw,
                            baseCurrencyPrice: sizeVariant.ProdSizePrices?.BaseCurrencyListPriceRaw,
                            sizeName: sizeVariant.SizeName,
                            sizeVarId: sizeVariant.SizeVarId,
                        };

                        triggerProductViewedEvent(
                            product.colourVarId,
                            product.colourName,
                            product.sizeVarId,
                            product.sizeName,
                            product.price,
                            product.baseCurrencyPrice,
                        );

                        return false;
                    }
                });
            }

            // Delayed Swiper setup and video setup until selected colour is initialized to fix video play issue.
            setSelectedColour(hashColCode, productPageScope);
            setupSwiperContainer();
            hashColCode = setupImageGridContainer(hashColCode);
            setupTwoImageContainer();

            if (
                !switchToHashColCode ||
                sdPage.model.productImagesGridExists() ||
                sdPage.model.productImagesTwoImageCarouselExists()
            ) {
                processImageIsReady();
                sdPage.view.addCurrentProductToRecents();
                populateColorVariantChangedValuesNew(hashColCode, productPageScope);
            } else {
                var $imgProduct = $(".imgProduct");
                if ($imgProduct.length === 0) {
                    // We're on a carousel, Swiper handles the rest
                    processImageIsReady();
                } else {
                    $(".imgProduct").on("load", processImageIsReady);
                }
                setTimeout(processImageIsReady, 8000); //Just in case the img load event doesn't fire
                sdPage.view.addCurrentProductToRecents();
                populateColorVariantChangedValuesNew(hashColCode, productPageScope);
            }
            var colElement;
            if ($(".colorImgli").length) {
                $(".colorImgli").each(function () {
                    var id = $(this).data("colvarid");
                    if (id) {
                        if (id.toString().toUpperCase() === hashColCode) {
                            colElement = $(this);
                            return false;
                        }
                    }
                });
            }
            if (colElement) {
                // Take the matched element and move it to the front
                var max = parseInt($("#hdnMaxVariants").val()) - 1;
                if (colElement.index() > max) {
                    // clone element and prep it for showing
                    var clonedColElement = colElement.clone(true);
                    clonedColElement.removeClass("more-hide").addClass("more-show");

                    $("ul.colourImages li:eq(0)").before(clonedColElement);
                    $("ul.colourImages")
                        .children("li:gt(" + max + ")")
                        .not("#cvlimore")
                        .addClass("more-hide")
                        .removeClass("more-show");

                    // remove original colElement
                    colElement.remove();
                }
            }
        }

        function processImageIsReady() {
            $("#productImages").removeClass("ImageNotReady");
            $(".imgProduct").off("load", processImageIsReady);
        }

        function attachDropDownWithImageColourVariantSelectionHandler() {
            $("#ddlColours .image-dropdown-option").click(function () {
                colourDropdownVariantIndexChanged(this);
            });
        }

        if (sdPage.model.stickyCtaWrapper.length > 0) {
            initStickyAddToBagAction();
        }

        if (sdPage.model.prodDescExpandableExists()) addProdDescToggleHandlers();
    });

    function updateDataLayerData(variant) {
        try {
            // change dataLayerData fields
            const productPrice = variant.ProdSizePrices
                ? variant.ProdSizePrices.SellPriceRaw.toFixed(2)
                : variant.ProdVarPrices.SellPriceRaw.toFixed(2);

            dataLayerData.colourVariantId = variant.ColVarId;
            dataLayerData.productPrice = productPrice;

            // change ecommerceData fields
            if (ecommerceData.ecommerce) {
                ecommerceData.ecommerce.detail.products[0].id =
                    variant.ColVarId + "-" + dataLayerData.productSequenceNumber.toString();
                ecommerceData.ecommerce.detail.products[0].colourVariantId = variant.ColVarId;
                ecommerceData.ecommerce.detail.products[0].sizeVariantId = variant.SizeVarId;
                ecommerceData.ecommerce.detail.products[0].price = productPrice;
                ecommerceData.ecommerce.detail.products[0].variant = variant.ColourName;
                ecommerceData.ecommerce.detail.products[0].dimension5 = variant.ColVarId;
            }

            window.dispatchEvent(new CustomEvent(GTMpushDataLayer_event));
        } catch (e) {
            if (console.error) console.error(e);
        }
    }

    function switchPersonalisationInput(isSelected) {
        if (!isSelected) {
            $("#liMyIdTab").toggleClass("myIdRtsSelected");
            $("#liPlayerPickTab").toggleClass("myIdRtsSelected");
            $("#myIdCustomName").toggleClass("hidden");
            $("#myIdPlayerName").toggleClass("hidden");
        }
    }

    function setupPimIntegration() {
        try {
            if (window === window.top) return;

            window.addEventListener("message", function (event) {
                if (event.origin !== "https://suppliers.sdgroup.com") {
                    return;
                }

                if (typeof event.data === "object" && event.data.type === "getUrl") {
                    window.parent.postMessage(
                        { type: "getUrl", url: window.location.href },
                        "https://suppliers.sdgroup.com",
                    );
                }
            });
        } catch (e) {
            if (console) {
                console.error(e);
            }
        }
    }

    setupPimIntegration();

    function triggerProductViewedEvent(colourVariantId, colourName, sizeVarId, sizeName, price, base_currency_price) {
        segmentTrackProductViewedEvent(sizeVarId, sizeName, colourName, price, base_currency_price);
    }

    function segmentReadProductDetails() {
        var json = $("#hdnSegmentProduct").val();
        return segment.productFactory(JSON.parse(json));
    }

    function segmentIsEnabled() {
        if (checkVariableExists(window.segmentEnabled) && window.segmentEnabled) return true;

        window.segmentEnabled =
            segment && typeof segment.getTrackingEnabled === "function" && segment.getTrackingEnabled();

        return window.segmentEnabled;
    }

    function segmentSendTrackProductViewedEvent(product) {
        try {
            if (!segmentIsEnabled()) return;

            // We need this once Segment fixes 'prototype' issue
            //var eventData = new segment.ProductViewedData(
            //    product
            //);

            let segmentParams = JSON.parse(decodeURIComponent(segmentPageController.getSegmentCookie("segmentParams")));
            let options = null;
            if (segmentParams?.utm_source && segmentParams?.utm_source.toLowerCase() === "c8") {
                options = {
                    campaign: {
                        id: segmentParams.c8cid,
                        content: segmentParams.utm_content,
                        medium: segmentParams.utm_medium,
                        name: segmentParams.utm_campaign,
                        source: segmentParams.utm_source,
                    },
                };
            }

            setTimeout(() => segment.trackProductViewed(product, options), 0);
        } catch (e) {
            console.error(e);
        }
    }

    function segmentTrackInitialProductViewedEvent() {
        if (!segmentIsEnabled()) return;

        segmentSendTrackProductViewedEvent(segmentReadProductDetails());
    }

    function segmentTrackProductViewedEvent(sizeVarId, sizeName, colourName, price, base_currency_price) {
        if (!segmentIsEnabled()) return;

        var product = segmentReadProductDetails();
        product.color = colourName;
        product.sku = sizeVarId;
        product.variant = colourName + " " + sizeName;
        product.price = price;
        product.price_gbp = base_currency_price;

        segmentSendTrackProductViewedEvent(product);
    }

    /** Expandable sections */
    function getWindowWidth() {
        const windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

        return windowWidth;
    }

    function getWindowHeight() {
        const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        return windowHeight;
    }

    function getAbsoluteHeight(elem) {
        const theElem = typeof elem === "string" ? document.querySelector(elem) : elem;
        const styles = window.getComputedStyle(theElem);
        const margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);

        return Math.ceil(theElem.offsetHeight + margin);
    }

    function makeTabbable(tabElems, unTabElems) {
        if (unTabElems) {
            for (var i = 0; i < unTabElems.length; i++) {
                unTabElems[i].setAttribute("tabindex", "-1");
                unTabElems[i].classList.add("is_disabled");
            }
        }
        if (tabElems) {
            for (var i = 0; i < tabElems.length; i++) {
                tabElems[i].removeAttribute("tabindex");
                tabElems[i].classList.remove("is_disabled");
            }
        }
    }

    function expandableInit(expandableElem, expandableToggles, expandableSections) {
        setExpandableSectionHeights(expandableSections);
        addExpandableListeners(expandableToggles, expandableSections);
    }

    function setExpandableSectionHeights(expandableSections) {
        for (var i = 0; i < expandableSections.length; i++) {
            setSectionHeight(expandableSections[i]);
            expandableSectionClose(expandableSections[i]);
        }
    }

    function addExpandableListeners(expandableToggles, expandableSections) {
        for (var i = 0; i < expandableToggles.length; i++) {
            expandableToggles[i].addEventListener("click", function (e) {
                var targetId = e.currentTarget.getAttribute("aria-controls");
                var thisSection = document.getElementById(targetId);

                e.currentTarget.classList.contains("is_expanded")
                    ? expandableSectionClose(thisSection)
                    : expandableSectionOpen(thisSection);
            });
        }
    }

    function expandableReset(expandableSections) {
        for (var i = 0; i < expandableSections.length; i++) {
            var sectionToggle = document.getElementById(expandableSections[i].getAttribute("aria-labelledby"));

            sectionToggle.removeAttribute("aria-expanded");
            sectionToggle.classList.remove("is_expanded");
            expandableSections[i].removeAttribute("aria-hidden");
            expandableSections[i].classList.remove("is_expanded");
            expandableSections[i].removeAttribute("style");
            expandableSections[i].removeAttribute("data-height");
        }
    }

    function expandableSectionClose(section) {
        var sectionToggle = document.getElementById(section.getAttribute("aria-labelledby"));

        var tabbableItems = section.querySelectorAll("a, button, input, textarea, select, label");

        tabbableItems = Array.prototype.slice.call(tabbableItems);

        sectionToggle.setAttribute("aria-expanded", false);
        sectionToggle.classList.remove("is_expanded");
        section.setAttribute("aria-hidden", true);
        section.classList.remove("is_expanded");
        section.style.height = "0px";
        makeTabbable(false, tabbableItems);
    }

    function expandableSectionOpen(section) {
        var sectionToggle = document.getElementById(section.getAttribute("aria-labelledby"));

        var tabbableItems = section.querySelectorAll("a, button, input, textarea, select, label");

        tabbableItems = Array.prototype.slice.call(tabbableItems);

        sectionToggle.setAttribute("aria-expanded", true);
        sectionToggle.classList.add("is_expanded");
        section.setAttribute("aria-hidden", false);
        section.classList.add("is_expanded");
        //section.style.height = section.getAttribute('data-height') + 'px';
        section.style.height = "auto";
        makeTabbable(tabbableItems, false);
    }

    function setSectionHeight(section) {
        var sectionHeight = getAbsoluteHeight(section);
        section.setAttribute("data-height", sectionHeight);
    }

    function expandableResize(sections) {
        expandableReset(sections);
        setExpandableSectionHeights(sections);
    }

    var currentWidth = getWindowWidth();
    var currentHeight = getWindowHeight();

    function windowReziseEventHandler() {
        var newWidth = getWindowWidth();
        var newHeight = getWindowHeight();

        if ((newHeight !== currentHeight && newWidth === currentWidth) || newWidth === currentWidth) {
            return false;
        }

        currentWidth = newWidth;
        currentHeight = newHeight;

        expandableElems.map(function (expandable) {
            var sections = expandable.querySelectorAll(".expandable-content");

            sections = Array.prototype.slice.call(sections);
            expandableResize(sections);
        });
    }

    var expandableInstances;
    var expandableElems = document.querySelectorAll(".expandable-section");
    var wait = false;

    expandableElems = Array.prototype.slice.call(expandableElems);

    window.addEventListener("DOMContentLoaded", function () {
        const preloadImageLinksEnabled =
            document.querySelectorAll("link[fetchpriority='high'][as='image']").length > 0 ? true : false;

        expandableInstances = expandableElems.map(function (expandable) {
            var expandableElemId = expandable.getAttribute("id");
            var expandableElem = document.getElementById(expandableElemId);
            var expandableToggles = expandableElem.querySelectorAll(".expandable-toggle");
            var expandableSections = expandableElem.querySelectorAll(".expandable-content");

            expandableToggles = Array.prototype.slice.call(expandableToggles);
            expandableSections = Array.prototype.slice.call(expandableSections);

            return new expandableInit(expandableElem, expandableToggles, expandableSections);
        });

        if (preloadImageLinksEnabled) {
            const getProductVariants = document.getElementsByClassName("productRollOverPanel");

            const altProductPrefetchBuilder = (imageHref) => {
                let linkTag = document.createElement("link");
                linkTag.rel = "prefetch";
                linkTag.as = "image";
                linkTag.href = imageHref;

                document.head.append(linkTag);
            };

            for (let i = 1; i < getProductVariants.length; i++) {
                const productImages = getProductVariants[i].getElementsByClassName("product-image");

                for (let i = 0; i < Math.min(productImages.length, 2); i++) {
                    altProductPrefetchBuilder(productImages[i].getAttribute("src"));
                }
            }
        }
    });

    window.addEventListener("resize", function () {
        if (wait) {
            return;
        }

        wait = true;

        setTimeout(function () {
            wait = false;
            windowReziseEventHandler();
        }, 1000);
    });
    /** End expdandable sections */

    // TODO: refactoring needed to make it more generic.
    function addProdDescToggleHandlers() {
        if (!sdPage.model.prodDescExpandableExists()) return;

        $("#prodDescToggleButton").on("click", function () {
            var prodDescContent = $("#pdp-expandable-content-1");
            if (prodDescContent.hasClass("showLess")) {
                prodDescContent.removeClass("showLess");
                prodDescContent.addClass("showMore");
                $(this).text("Show Less");
                $("#pdp-expandable-toggle-1").attr("aria-expanded", "true");
            } else {
                prodDescContent.removeClass("showMore");
                prodDescContent.addClass("showLess");
                $(this).text("Read More");
                $("#pdp-expandable-toggle-1").attr("aria-expanded", "false");
            }
        });
    }

    function initStickyAddToBagAction() {
        var $productStandardAddtoBag = $(".BasketWishContainer");
        var $productPersonalisationAddtoBag = $("#divPersaddToBasketContainer");
        var $personalisationPanel = $("#pnlPersonalisation");
        var $win = $(window);
        var isVisible = false;
        var checkTimer;
        var needsCheck = false;

        function setCurrentImg() {
            var sourceImg = $('.colorImgli[aria-checked="true"] a img');

            if (sourceImg.length === 0) {
                sourceImg = $("#productImageContainer img.imgProduct").first();
            }

            $(".currentVariantImg", sdPage.model.stickyCtaWrapper)
                .attr("src", sourceImg.attr("src") || sourceImg.data("src"))
                .attr("alt", sourceImg.attr("alt"));
        }

        function getPosOfAtb() {
            var headerGroupDivHeight = $("#HeaderGroup").height();
            var topOfDiv = $productStandardAddtoBag.offset().top - headerGroupDivHeight;
            var heightOfDiv = $productStandardAddtoBag.height();

            if ($("#divMyIdPersonalisation").is(":visible") || $productStandardAddtoBag.is(":hidden")) {
                $(".BasketWishContainer").hide();
                topOfDiv = $productPersonalisationAddtoBag.offset().top - headerGroupDivHeight;
                heightOfDiv = $productPersonalisationAddtoBag.height();
            } else {
                $(".BasketWishContainer").show();
            }

            return topOfDiv + heightOfDiv;
        }

        function checkScrollBelowAddToBag(event) {
            if (event) {
                if (checkTimer) {
                    needsCheck = true;
                    return;
                }
                checkTimer = setTimeout(function () {
                    checkTimer = undefined;
                    if (needsCheck) {
                        needsCheck = false;
                        checkScrollBelowAddToBag();
                    }
                }, 200);
            }
            var newVisible = $win.scrollTop() > getPosOfAtb();
            if (isVisible !== newVisible) {
                isVisible = newVisible;
                sdPage.model.stickyCtaWrapper.toggleClass("stickyCTA-active", isVisible);
                setCurrentImg();
            }
        }

        $win.on("resize scroll", checkScrollBelowAddToBag);

        $(".addToBag", sdPage.model.stickyCtaWrapper).on("click", function () {
            var $wrapEl = $(".addToBasketContainer", sdPage.model.stickyCtaWrapper);

            var scrollOffsetY = window.pageYOffset - $("#HeaderGroup").height() - 50;
            var addToBagStandard = $(".addToBag:visible", $productStandardAddtoBag);
            var addToBagPersonalisation = $(".ContinueWithPers:visible", $personalisationPanel);
            if (addToBagStandard.length > 0) {
                addToBagStandard.click();
            }

            if (addToBagPersonalisation.length > 0) {
                addToBagPersonalisation.click();
            }

            window.scrollTo({
                top: $("#divSize")[0].getBoundingClientRect().top + scrollOffsetY,
                behavior: "smooth",
            });
        });
    }

    function setDiscountPercentText(discountPercentageOffElem, discountPercentText) {
        discountPercentageOffElem.find("span").text(discountPercentText);
    }

    function toggleDiscountPercentText(discountPercentText) {
        const discountPercentageOffElem = $(".discount-percentage-off");

        if (discountPercentText !== undefined && discountPercentText !== null && discountPercentText !== "") {
            setDiscountPercentText(discountPercentageOffElem, discountPercentText);
            discountPercentageOffElem.removeClass("hide");
        } else {
            discountPercentageOffElem.addClass("hide");
        }
    }

    function getFrasersPlusBreakdownPrice(productPrices) {
        const frasersPlusBreakdown = document.querySelector(".frasers-plus-breakdown");

        if (!frasersPlusBreakdown) return;

        const frasersPlusBreakdownPrice = frasersPlusBreakdown.querySelector(".frasers-plus-breakdown-desc span");
        const getUpdatedFrasersPlusBreakdownPrice = productPrices.FrasersPlusBreakdownPrice;

        frasersPlusBreakdownPrice.innerText = getUpdatedFrasersPlusBreakdownPrice;
    }

    function toggleMemberPrice(productPrices) {
        const memberPriceElem = document.querySelector(".member-price");

        if (!memberPriceElem) return;

        const memberPriceValueElem = memberPriceElem.querySelector(".member-price-value");
        const memberPriceLabelElem = memberPriceElem.querySelector(".member-price-label");
        const memberPriceFrasLabel = memberPriceElem.getAttribute("data-member-price-fras-label");
        const memberPriceStudLabel = memberPriceElem.getAttribute("data-member-price-stud-label");
        const memberFromPriceFrasLabel = memberPriceElem.getAttribute("data-member-from-price-fras-label");
        const memberFromPriceStudLabel = memberPriceElem.getAttribute("data-member-from-price-stud-label");

        const sizeIsSelected = productDetailsShared.getSelectedSizeVariantValue()?.length > 0;
        const hasMemberPrice = productPrices.MemberPriceConverted != null && productPrices.MemberPriceConverted > 0;
        const hasMemberPriceGroup = productPrices.MemberPriceGroup?.length > 0;
        const showMemberPriceGroup = !sizeIsSelected && hasMemberPriceGroup;
        const showFromPrice = !showMemberPriceGroup && productPrices.MemberFromPriceConverted > 0;
        const memberPriceScheme =
            showMemberPriceGroup || showFromPrice
                ? productPrices.MemberFromPriceScheme
                : productPrices.MemberPriceScheme;
        const showMemberPrice = showFromPrice || hasMemberPrice;

        if (showMemberPriceGroup || showMemberPrice) {
            switch (memberPriceScheme) {
                case "FRAS":
                    memberPriceLabelElem.innerText = showFromPrice ? memberFromPriceFrasLabel : memberPriceFrasLabel;
                    break;
                case "STUD":
                    memberPriceLabelElem.innerText = showFromPrice ? memberFromPriceStudLabel : memberPriceStudLabel;
                    break;
            }

            if (showMemberPriceGroup) {
                memberPriceValueElem.innerText = productPrices.MemberPriceGroup;
            } else if (showFromPrice) {
                memberPriceValueElem.innerText = productPrices.MemberFromPriceConvertedFormatted;
            } else {
                memberPriceValueElem.innerText = productPrices.MemberPriceConvertedFormatted;
            }

            memberPriceElem.setAttribute("data-member-price-scheme", memberPriceScheme);
            memberPriceElem.classList.remove("hide-member-price");
        } else {
            memberPriceElem.classList.add("hide-member-price");
        }
    }

    function setAddToBagButtonText() {
        var addToBagInner = $(".addToBasketContainer .addToBagInner");
        var persAddToBagInner = $(".PersVouchBasketContainer .addToBagInner");
        var sizeselectAttr = addToBagInner.data("selectsize");
        var isPreOrderable = addToBagInner.hasClass("isPreOrderable");

        if (typeof sizeselectAttr !== "undefined" || sizeselectAttr !== false) {
            if (!isPreOrderable) {
                var addToBagText = addToBagInner.data("addtobag");
                addToBagInner.text(addToBagText);
                addToBagInner.removeClass("disabled");
                persAddToBagInner.text(addToBagText);
                $(".addToBasketContainer, .PersVouchBasketContainer").addClass("sizeSelected");
            } else {
                var addToBagText = addToBagInner.data("preorder");
                addToBagInner.text(addToBagText);
                addToBagInner.removeClass("disabled");
                persAddToBagInner.text(addToBagText);
                $(".addToBasketContainer, .PersVouchBasketContainer").removeClass("sizeSelected");
            }
        }
    }

    function getEcommerceProductDetails() {
        return ecommerceData?.ecommerce?.detail?.products[0];
    }

    function sendWishlistGtmEvent() {
        const productDetails = getEcommerceProductDetails();

        if (!productDetails) return;

        sendGtmCustomEvent({
            event: "wishlistHeartClick",
            ecommerce: {
                currencyCode: window._currencyFormatter.ActiveCurrency,
                wishlistItems: [
                    {
                        id: productDetails.id,
                        name: productDetails.name,
                        price: productDetails.price,
                        brand: productDetails.brand,
                        category: productDetails.category,
                        variant: productDetails.variant,
                        taxonomy: productDetails.taxonomy,
                        quantity: productDetailsShared.getQuantity(),
                    },
                ],
            },
        });
    }

    function sendGtmCustomEvent(event) {
        try {
            if (window.parent.dataLayer != null) {
                window.parent.dataLayer.push(event);
            }
        } catch (e) {
            console.log(e);
        }
    }

    // Expose globals
    window.toggleMoreVariants = toggleMoreVariants;
    window.isColCodeHashEnabled = isColCodeHashEnabled;
})(
    window,
    window.jQuery,
    window.queryutils,
    window.segment || {},
    window.dataLayerData,
    window.ecommerceData,
    window.GTMpushDataLayer_event,
    window.productDetailsShared,
    window.mainImageZoom,
    window.productLook,
    window.productDetailSwiper,
    window.hashService,
    window.algoliaUtil,
);
