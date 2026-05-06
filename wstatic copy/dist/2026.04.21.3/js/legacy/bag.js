(function (window, $, segment, scriptService, algoliaUtil, undefined) {
    "use strict";

    var minimizeBagTimer;
    var bagItemsCount = 0;
    var basketSummaryCurrentPage = 1;
    var currentVariantId;
    var showAddToProductMessage = true;
    var addedItemRowNo = -1;
    var showLoader;
    var addRemoveBagMsgTimer;
    var bagItems = [];
    var quantityTotal;
    var bagTotal;
    var bagDiscountTotal;
    var bagDiscountTotalValue;
    var showcheckout;
    var isValidBasket = false;
    var nonMenuLightBoxesEnabled = false;
    var maxOrderText;
    var productQuantityText;
    var discountAppliedText;
    var outOfStockText;
    var bagTotalValue;
    var bagTotalValueGbp;
    var bagDiscountTotalValueGbp;
    var basketId;
    var promoCodes;
    var bagSubTotalValue;
    var bagSubTotalValueGbp;
    var coupon;
    var duty;
    var dutyInGbp;
    var loyaltyDiscount;
    var loyaltyDiscountInGbp;
    var productDiscount;
    var productDiscountInGbp;
    var tax;
    var taxInGbp;
    var timerId;
    var memberPriceScheme;
    var memberPrices;
    var nonMemberPriceTotal;
    var divBagLink = document.getElementById("aBagLink");
    var timer = function () {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            window.anonymousWishlist.wishlistContainerInHeader.removeClass("hide-wishlist");
        }, 100);
    };

    function initialiseProdPersonalise() {
        scriptService.load("legacy/product-personalise.js", function () {
            // Callback has to be wrapped as method doesn't exist on window until after script is loaded
            window.initPersonalisationPopup();
        });
    }

    $(function () {
        nonMenuLightBoxesEnabled = $("#hdnLightboxNonMenuEnabled").val() === "True";
        $("#divBagItems").hide();
        loadSlidingBag();
        doRemoveProductBind();
        setResponsiveWidth();
        $(window).resize(function () {
            setResponsiveWidth();
        });

        wireSegmentSignedOutEvents();

        var divBag = $("#divBag");
        divBag.hover(
            function () {
                if (!isTouchDevice()) {
                    if ($("#openMiniBasketOnHover").val() != "false") {
                        setTimeout(hideAddRemoveToBagMessage, 3000);
                        showShoppingBag();
                        segmentTrackMinicartViewedEvent();
                    }
                }
            },
            function () {
                if (!isTouchDevice()) {
                    if ($("#openMiniBasketOnHover").val() != "false") {
                        minimizeBagTimer = setTimeout(hideShoppingBag, 400);
                    }
                }
            },
        );

        // set css changes for smart phones and tablets
        if (isTouchDevice()) {
            $("#prevPage").removeClass("hidden-xs");
            $("#nextPage").removeClass("hidden-xs");
            $("#divBagItems").css("position", "inherit");
        }

        $("#prevNavPage, #nextNavPage").on("click", function () {
            pagination($(this).attr("data-action"));
        });
        $("#aWishListLink").hover(function () {
            $("#divBagItems").hide();
        });

        $("#topLinkMenu").mouseenter(function () {
            disableTransitions(window.anonymousWishlist.wishlistContainerInHeader);
        });

        $("#clsBasketMob").click(function () {
            hideShoppingBag();
        });

        window.anonymousWishlist.wishlistContainerInHeader.find(".clsWishlistMob").click(function () {
            window.anonymousWishlist.wishlistContainerInHeader.removeClass("show-wishlist");
        });

        var $aCheckout = $("#aCheckout");
        if ($aCheckout != null && $aCheckout.length > 0) {
            $aCheckout.click(function (e) {
                e.preventDefault();
                var navigateToUrl;
                if (isValidBasket) {
                    navigateToUrl = $aCheckout.attr("href");
                } else {
                    navigateToUrl = $("#aViewBag").attr("href");
                }
                window.location.href = navigateToUrl;
            });
        }

        //Loader image deferred to optimise page load
        $("#SlidingBasketLoaderImg").attr("src", "/images/core/loader-products.gif");

        // Enactor support for add to bag
        try {
            var divTill = $("#divTill");
            if (divTill.length) {
                var enactorEnabled = divTill.data("enactoraddtobagenabled");
                if (enactorEnabled && enactorEnabled.toLowerCase() != "false" && window.EnactorExternalBridge) {
                    window.enactorBridge = new EnactorExternalBridge();
                    window.enactorBridge.init();
                }
            }
        } catch (e) {
            console.log("Enactor init error " + e);
        }
    });

    function disableTransitions(hideElem) {
        var disableTransTimerId;
        clearTimeout(disableTransTimerId);

        hideElem.addClass("disable-transitions");
        hideElem.removeClass("hide-wishlist");
        disableTransTimerId = setTimeout(() => {
            hideElem.removeClass("disable-transitions");
        }, 100);
    }

    function onWishlistMouseEnterCallback() {
        var accountElem = $("#topLinkMenu");
        var wishlistCounter = $("#lblWishListCount");
        var wishlistCount = parseInt(wishlistCounter?.html().replace("+", ""), 10) ?? 0;
        $("#divBagItems").hide();
        disableTransitions(accountElem);

        if (wishlistCount < 1 || wishlistCounter.hasClass("hide-wishlist")) {
            return;
        }
        window.anonymousWishlist.wishlistContainerInHeader.addClass("show-wishlist");
    }

    function onWishlistMouseLeaveCallback(e) {
        $("#divWishList").removeClass("show-wishlist");
        if (e?.relatedTarget === divBagLink) {
            window.anonymousWishlist.wishlistContainerInHeader.addClass("hide-wishlist");
            timer();
        }
    }

    function wireSegmentSignedOutEvents() {
        $("li.SignOutAcc a, li.SignOut a, li a.mob-login").on("click", function (e) {
            e.preventDefault();
            var href = $(this).attr("href");
            window.location = href;
        });
    }

    function setResponsiveWidth() {
        if ($("#topMenuWrapper").is(":hidden")) {
            $(".Responsive #divBagItems").css("width", $(window).width());
        } else {
            $(".Responsive #divBagItems").css("width", "");
        }
    }

    function showShoppingBagForAddedToBag() {
        if (showAddToProductMessage) {
            showAddRemoveToBagMessage($("#hdnAddedToBag").val());
        }
        showShoppingBag();
        minimizeBagTimer = setTimeout(hideShoppingBag, 5000);
        $("#divulBagParent").animate({ scrollTop: 0 }, "slow");

        const bodyWrap = document.getElementById("BodyWrap");
        bodyWrap.classList.remove("menu-search-hidden");

        if (window.location.pathname === "/cart") window.location.reload();
    }

    var htmlEncoder = {
        _element: null,
        encode: function (s) {
            if (htmlEncoder._element == null) htmlEncoder._element = $("<div/>");
            return htmlEncoder._element.text(s).html();
        },
    };

    function showMobileAddedToBagPopup(addedProductDetails) {
        if (typeof addedProductDetails != "object") {
            return false;
        }
        var modalData = $("#AddedToBagModalData");
        if (!modalData.is(":visible")) {
            return false;
        }

        var modalContent =
            '<div id="AddedToBagModalImageWrap">' +
            '<div id="AddedToBagModalImageHeightHelper"></div>' +
            '<img alt="" src="' +
            htmlEncoder.encode(addedProductDetails.productImageMediumUrl) +
            '" />' +
            "</div>" +
            '<div id="AddedToBagModalProductName">' +
            htmlEncoder.encode(addedProductDetails.productName) +
            "</div>" +
            '<span class="ImgButWrap"><a id="AddedToBagModalBagLink" href="' +
            htmlEncoder.encode(modalData.data("bagurl")) +
            '">' +
            htmlEncoder.encode(modalData.data("viewbagtext")) +
            "</a></span>";

        var addedModal = modalHelper.setupModal({
            modalName: "AddedToBagModal",
            titleHtml: modalData.data("title"),
            contentHtml: modalContent,
        });
        modalHelper.showModal(addedModal);

        setTimeout(function () {
            modalHelper.hideModal(addedModal);
            addedModal.remove();
        }, 3000);

        return true;
    }

    function segmentTrackMinicartViewedEvent() {
        try {
            if (!(segment && typeof segment.getTrackingEnabled === "function" && segment.getTrackingEnabled())) return;

            var products = bagItems.map(function (bagItem) {
                return new segment.Product(
                    bagItem.productBrand,
                    bagItem.category,
                    bagItem.categoryId,
                    bagItem.productColour,
                    bagItem.productImageUrl,
                    bagItem.isFullPrice,
                    bagItem.productName,
                    null, // Position
                    bagItem.productSellingPrice,
                    bagItem.productSellingPriceInBaseUnit,
                    bagItem.productId,
                    bagItem.productQuantity,
                    bagItem.variantId,
                    bagItem.subCategory,
                    bagItem.variant,
                    bagItem.activity,
                    bagItem.activityGroup,
                    bagItem.budgetCurve,
                );
            });

            if (products.length <= 0) {
                return;
            }

            var eventData = new segment.CartViewedData(
                basketId,
                coupon,
                bagDiscountTotalValue,
                bagDiscountTotalValueGbp,
                duty,
                dutyInGbp,
                loyaltyDiscount,
                loyaltyDiscountInGbp,
                productDiscount,
                productDiscountInGbp,
                products,
                bagSubTotalValue,
                bagSubTotalValueGbp,
                tax,
                taxInGbp,
                bagTotalValue,
                bagTotalValueGbp,
            );

            segment.trackMinicartViewed(eventData);
        } catch (e) {
            console.error(e);
        }
    }

    function showShoppingBag() {
        if (!bagItems || bagItems.length == 0) return;
        clearTimeout(addRemoveBagMsgTimer);
        clearTimeout(minimizeBagTimer);
        updateShoppingBag();
        setResponsiveWidth();
        window.anonymousWishlist.wishlistContainerInHeader.addClass("hide-wishlist");
        timer();
        $("#divBagItems").slideDown(800, function () {
            $(".Responsive #divBagItems").addClass("open");
            if (nonMenuLightBoxesEnabled) {
                $("header").addClass("activeBag");
            }
        });
    }

    function updateShoppingBag() {
        if (currentVariantId.length > 0) {
            $("#" + "li" + currentVariantId).addClass("addedBagItem");
            GTMDataPush(currentVariantId);
        }
        if (!bagItems || bagItems.length == 0) {
            showEmptyErrorMessage($("#hdnBagEmpty").val());
        }
        pagination();
        initHover();
        currentVariantId = 0;
        addedItemRowNo = -1;
    }

    function GTMDataPush(currentVariantId) {
        try {
            window.parent.dataLayer.push({
                event: "xx_onClick",
                specificEvent: "AddToBag",
                description: "Clicked on " + currentVariantId + "\x27",
            });
        } catch (e) {}
    }

    function showAjaxLoadImage() {
        if ($("#divBag").data("addingtobagviewenabled") != "True") return;
        showLoader = setTimeout(function () {
            $("#divAjaxLoaderImage").show();
        }, 1000);
    }
    function hideAjaxLoadImage() {
        clearTimeout(showLoader);
        $("#divAjaxLoaderImage").hide();
    }
    function hideEmptyErrorMessage() {
        $("#divEmptyErrorMessage").slideUp();
    }
    function hideShoppingBag() {
        $("#ulBag li").removeAttr("style");
        hideAddRemoveToBagMessage();
        $("#divBagItems").removeClass("open");
        $("#divBagItems").slideUp("slow");
        if (nonMenuLightBoxesEnabled) {
            $("header").removeClass("activeBag");
        }
    }
    function showEmptyErrorMessage(value) {
        $("#divBagItems").fadeOut(function () {
            $("#divBagItems").hide();
        });
        $("#emptyErrorMessage").text(value);
        $("#divEmptyErrorMessage").fadeIn(function () {
            $("#divEmptyErrorMessage").show();
        });
        setTimeout(hideEmptyErrorMessage, 1000);
    }
    function showError() {
        hideAjaxLoadImage();
        if (bagItems.length == 0) {
            updateSkinBag();
        }
        if (bagItems.length == 0) {
            showEmptyErrorMessage($("#hdnErrorMessage").val());
        } else {
            showAddRemoveToBagMessage($("#hdnBagError").val());
            // Any basket errors show the message, added as part of single catalog custompipeline components
            $("#divBagItems").slideDown(800);
            minimizeBagTimer = setTimeout(hideShoppingBag, 5000);
        }
    }
    function showAddRemoveToBagMessage(value) {
        if (window.location.pathname === "/cart") window.location.reload();

        if (typeof value == "undefined" || value.length == 0) return false;
        $("#genericMessage").text(value);
        $("#divAddRemoveToBag").fadeIn(function () {
            $("#divAddRemoveToBag").slideDown(200);
        });
        addRemoveBagMsgTimer = setTimeout(hideAddRemoveToBagMessage, 3000);
        return true;
    }
    function hideAddRemoveToBagMessage() {
        clearTimeout(addRemoveBagMsgTimer);
        $("#divAddRemoveToBag").slideUp();
    }

    function pagination(action) {
        var itemsPerPage = 3;
        var numPages = Math.ceil(bagItems.length / itemsPerPage);

        var ulBag = $("#ulBag");

        var animate = false;
        if (addedItemRowNo != -1) {
            basketSummaryCurrentPage = 1;
            ulBag.css("top", "0px");
        } else if (action == "next") {
            basketSummaryCurrentPage++;
            animate = true;
        } else if (action == "prev") {
            basketSummaryCurrentPage--;
            animate = true;
        }

        if (basketSummaryCurrentPage > numPages) basketSummaryCurrentPage = numPages;
        if (basketSummaryCurrentPage < 1) basketSummaryCurrentPage = 1;

        if (animate && numPages > 1) {
            var itemIndexToScrollTo = (basketSummaryCurrentPage - 1) * itemsPerPage + 1;
            var lastItemIndexValidScrollTo = bagItems.length - itemsPerPage + 1;
            if (itemIndexToScrollTo > lastItemIndexValidScrollTo) {
                itemIndexToScrollTo = lastItemIndexValidScrollTo;
            }

            scrollTo = -ulBag.find("li:nth-child(" + itemIndexToScrollTo + ")").position().top;
            ulBag.animate({ top: scrollTo + "px" }, 500);
        }

        $("#nextNavPage").toggleClass("NextEnable", basketSummaryCurrentPage < numPages);
        $("#prevNavPage").toggleClass("PreviousEnable", basketSummaryCurrentPage > 1);
    }

    function doRemoveProductBind() {
        $(".removeClass").click(function (e) {
            var id = $(this).attr("ProductVariantItem");
            var qty = $(this).attr("RemoveQuantity");
            if (id != null) {
                removeProductFromBasket("" + id + "", "" + qty + "");
            } else {
                showError();
            }
            if (e && e.stopPropagation) {
                e.stopPropagation();
            } else {
                e = window.event;
                e.cancelBubble = true;
            }
        });

        $(".liPrdLnk").click(function (e) {
            var prdUrl = $(this).attr("data-prdUrl");
            if (prdUrl != null) {
                document.location = prdUrl;
            }
        });
    }

    function initHover() {
        $("#ulBag li").mouseover(function () {
            $(this).addClass("bagItemsContainerHover");
        });
        $("#ulBag li").mouseout(function () {
            $(this).removeClass("bagItemsContainerHover");
        });
    }

    function populateData(data) {
        bagItems = data.basketProductDetails;
        memberPriceScheme = data.memberPriceScheme;
        memberPrices = data.memberPrices;
        nonMemberPriceTotal = data.nonMemberPriceTotal;
        quantityTotal = data.quantity;
        bagTotal = data.total;
        bagTotalValue = data.totalValue;
        bagTotalValueGbp = data.totalInBaseUnit;
        bagDiscountTotal = data.discount;
        bagDiscountTotalValue = data.discountValue;
        bagDiscountTotalValueGbp = data.discountInBaseUnit;
        currentVariantId = data.addedVariantId;
        showAddToProductMessage = data.showAddedToBasketMsg;
        addedItemRowNo = data.addedItemIndex;
        bagItemsCount = !bagItems ? 0 : bagItems.length;
        showcheckout = data.showCheckout;
        isValidBasket = data.isValidBasket;
        basketId = data.basketId;
        promoCodes = data.PromoCodes;
        bagSubTotalValue = data.subTotalValue;
        bagSubTotalValueGbp = data.subTotalInBaseUnit;
        updateShoppingModel(); // update shopping bag
        coupon = data.coupon;
        duty = data.duty;
        dutyInGbp = data.dutyInGbp;
        loyaltyDiscount = data.loyaltyDiscount;
        loyaltyDiscountInGbp = data.loyaltyDiscountInGbp;
        productDiscount = data.productDiscount;
        productDiscountInGbp = data.productDiscountInGbp;
        tax = data.tax;
        taxInGbp = data.taxInGbp;
    }
    function updateShoppingModel() {
        if (window.enactorBridge && window.enactorBridge.isJavascriptBridgeConnected()) return;

        const slidingBagContainer = document.querySelector("[data-sliding-bag]");
        if (slidingBagContainer !== null) {
            slidingBagContainer.textContent = "";
            const templateItem = document.querySelector("#template-bag-item [data-product-line-item]");
            bagItems.map((x) => {
                const clonedItem = templateItem.cloneNode(true);
                const productLineCard = window.ProductLineItem.createLineItem(clonedItem, x);
                slidingBagContainer.append(productLineCard);
            });
            if (bagItems.length == 0) {
                hideShoppingBag();
            }
        } else {
            var ulBagContainer = $("#ulBag");
            ulBagContainer.empty();

            var containsPersonalisedAlt = ulBagContainer.data("containspersonalisedalt"),
                containsPersonalisedTitle = ulBagContainer.data("containspersonalisedtitle");

            var wishlistSummary = $(".wishlist-summary");

            $(bagItems).each(function () {
                var prodImageTag = $("<img></img>", { src: this.productImageUrl, alt: "", class: "Baskimg" });

                var priceandCrossDivTag = $("<div></div>", { class: "PriceandCross" }),
                    helpImageTag = $("<img></img>", {
                        src: "/images/core/help-icn.jpg",
                        alt: containsPersonalisedAlt,
                        title: containsPersonalisedTitle,
                        style: !this.hasPersonalisaton ? "display:none" : "",
                    }),
                    removeAnchorTag = $("<a></a>", {
                        id: "removeItem",
                        class: "removeClass",
                        ProductVariantItem: this.variantId,
                        RemoveQuantity: productQuantityText.replace("{0}", this.productQuantity),
                    }).text("Remove");

                priceandCrossDivTag.append(helpImageTag, removeAnchorTag);

                let moveToWishlistDivTag = null;
                if (wishlistSummary?.length) {
                    const helpImageTag = $("<img></img>", {
                        src: "/images/core/help-icn.jpg",
                        alt: containsPersonalisedAlt,
                        title: containsPersonalisedTitle,
                        style: !this.hasPersonalisaton ? "display:none" : "",
                    });
                    const moveToWishlistAnchorTag = $("<a></a>", {
                        id: "bagMoveToWishlist",
                        class: "bagMoveToWishlistClass",
                        ProductVariantItem: this.variantId,
                        RemoveQuantity: productQuantityText.replace("{0}", this.productQuantity),
                    }).text("Move to wishlist");

                    moveToWishlistDivTag = $("<div></div>", { class: "bagMoveToWishlistContainer" });
                    moveToWishlistAnchorTag.attr({
                        "data-action": "move-to-wishlist",
                        "data-bag-line-item-id": this.lineItemId,
                    });
                    moveToWishlistDivTag.append(helpImageTag, moveToWishlistAnchorTag);
                }

                var productNameSpanTag = $("<span></span>", { class: "BaskName" }).text(this.productName);

                var colrandSizeDivTag = $("<div></div>", { class: "ColrandSize" }),
                    productColourSpanTag = $("<span></span>", { class: "BaskColr" }).text(this.productColour),
                    productSizeSpanTag = $("<span></span>", { class: "BaskSize" }).text(this.productSize);
                colrandSizeDivTag.append(productColourSpanTag, productSizeSpanTag);

                if (this.lineDiscount > 0) {
                    var discountAppliedSpanTag = $("<span></span>", { class: "BaskDiscountApplied" }).text(
                        discountAppliedText,
                    );
                    colrandSizeDivTag.append(discountAppliedSpanTag);
                }

                var productQtySpanTag = $("<span></span>", { class: "BaskQuant" }).text(
                        productQuantityText.replace("{0}", this.productQuantity),
                    ),
                    maxPurchaseLevelSpanTag = $("<span></span>", { class: "maxText" }).text(
                        /*this.maxPurchaseLevelExceeded ? maxOrderText:*/ "",
                    ),
                    productSellingPriceSpanTag = $("<span></span>", { class: "BaskPrice" }).text(this.lineSubtotalText);

                var productSiteDivTag = "";
                if (this.SharedBasketSite) {
                    var productSiteToolTip = ulBagContainer
                        .data("productsitetooltipformat")
                        .replace("{0}", this.sharedBasketSite.friendlyName);
                    var productSiteDivTagHtml =
                        "<div class='BasketProductSite_" +
                        this.sharedBasketSite.shortName +
                        "' title='" +
                        productSiteToolTip +
                        "'>" +
                        this.sharedBasketSite.friendlyName +
                        "</div>";
                    productSiteDivTag = $(productSiteDivTagHtml);
                }

                var lineProblemseDivTag = $("<div></div>", { class: "lineProblems" }),
                    outofstockSpanTag = $("<span></span>", { class: "outofstock" }).text(
                        this.hasErrors ? outOfStockText : "",
                    );
                lineProblemseDivTag.append(outofstockSpanTag);

                /****** DropShip (in Sliding basket) *****************************************/
                var dropShipDivTag = "";
                var dropShipEnabled = $("#divBagItems").data("dropshipenabled");
                var hasDropshipping;
                var wordings;
                var isSupplierNameOverrideEnabled;
                if (dropShipEnabled === "yes") {
                    if (this.suppliedByName && this.suppliedByName != null && this.suppliedByName.length > 1) {
                        var cls = "fulfilledBy fulfilledBy" + this.suppliedBy;
                        dropShipDivTag = $("<div></div>", { class: cls, "data-suppliedby": this.suppliedBy });

                        isSupplierNameOverrideEnabled = $("#divBagItems").data("isdropshipsuppliernameoverrideenabled");
                        if (isSupplierNameOverrideEnabled && isSupplierNameOverrideEnabled.toLowerCase() === "true") {
                            wordings = overrideSuppliedByContent();
                        } else {
                            wordings =
                                !this.suppliedBySlidingBasket || this.suppliedBySlidingBasket == null
                                    ? $("#divBagItems").data("suppliedbytextdefault")
                                    : this.suppliedBySlidingBasket;
                        }
                        dropShipDivTag.append(
                            "<span>" +
                                wordings +
                                (isSupplierNameOverrideEnabled && isSupplierNameOverrideEnabled.toLowerCase() === "true"
                                    ? ""
                                    : " <span>" + this.suppliedByName + "</span>.") +
                                "</span > <a href='#' onclick='dropShipHelper.GetDropShipSupplier(event, \"" +
                                this.suppliedBy +
                                '", "' +
                                this.suppliedByName +
                                "\")'> " +
                                $("#divBagItems").data("learnmoretext") +
                                "</a>",
                        );
                        hasDropshipping = true;
                    }
                }
                /****************************************************************************/

                var wrapDivTag = $("<div></div>", { class: "bagContentItemWrap" });
                wrapDivTag.append(
                    priceandCrossDivTag,
                    moveToWishlistDivTag,
                    productNameSpanTag,
                    colrandSizeDivTag,
                    productQtySpanTag,
                    maxPurchaseLevelSpanTag,
                    productSellingPriceSpanTag,
                    productSiteDivTag,
                    lineProblemseDivTag,
                    dropShipDivTag,
                );

                var li = $("<li></li>", {
                    id: "li" + this.variantId,
                    class: "liPrdLnk",
                    "data-prdUrl": this.productUrl,
                });
                /****************** DropShip bits ****************************************/
                if (hasDropshipping && hasDropshipping === true)
                    li.removeClass("hasDropshipping").addClass("hasDropshipping");
                /*************************************************************************/
                li.append(prodImageTag, wrapDivTag);
                ulBagContainer.append(li);
            });
        }

        window.ProductLineItem.bindSizeUpdateEvents();
        window.ProductLineItem.bindRemoveLineItem();
        window.ProductLineItem.bindLineQuantityEvents();
        window.ProductLineItem.bindMoveToWishlistEvents();

        // Updates bag totals
        updateShoppingBagTotals();

        showcheckout ? $("#aCheckout").removeClass("disable") : $("#aCheckout").addClass("disable");
        !showcheckout ? $("#spnChkOutError").show() : $("#spnChkOutError").hide();
        !showcheckout ? $(".basket-urgency-message").hide() : $(".basket-urgency-message").show();
    }

    function overrideSuppliedByContent() {
        var divBagItems = $("#divBagItems");
        var suppliedByText = divBagItems.data("dropshipsuppliedbyoverridetext");
        suppliedByText = suppliedByText.replace("{0}", divBagItems.data("dropshipsuppliernameoverridevalue"));

        return suppliedByText;
    }

    function updateShoppingBagTotals() {
        $("#bagTotal").text(bagTotal);
        var itemText = "";
        var spanBagQuantity = $("#bagQuantity");
        var mobBasketQuantity = $("#mobBasketQuantity");
        var spanBasketItemText = $("#spanMobBasketItemText");
        var quantityTotalText = quantityTotal;
        spanBagQuantity.toggleClass("empty", quantityTotal === 0);
        spanBagQuantity.toggleClass("hide-count", quantityTotal === 0);
        mobBasketQuantity.toggleClass("empty", quantityTotal === 0);
        if (quantityTotal > 99) {
            quantityTotalText = "99+";
        }
        spanBagQuantity.text(quantityTotalText);
        mobBasketQuantity.text(quantityTotalText);

        if (quantityTotal > 1) {
            itemText = spanBasketItemText.data("basketitemlabelplural");
        } else if (quantityTotal === 1) {
            itemText = spanBasketItemText.data("basketitemlabel");
        }
        spanBasketItemText.text(itemText);
        $("#spanBagTotalDiscount").text(bagDiscountTotal);
        $("#divBagTotalDiscount").toggle(bagDiscountTotalValue !== 0);

        $("#spanBagSubTotalValue").text(bagTotal);

        var divBag = $("#divBag");
        divBag.show();
        if (quantityTotal > 0) {
            divBag.addClass("active");
        } else {
            divBag.removeClass("active");
        }
    }
    function navigateToPage() {
        var navigateTo;
        if ($("#hdnPageName").val() == "checkout") {
            navigateTo = $("#aCheckout").attr("href");
        } else {
            navigateTo = $("#aViewBag").attr("href");
        }
        window.location.href = navigateTo;
    }
    function navigateToWishListPage() {
        var url = $("#aWishListLink").attr("href");
        if (url.length > 0) {
            window.location.href = url;
        }
    }
    function loadSlidingBag() {
        var divBagItems = $("#divBagItems");
        var basketValue = divBagItems.attr("data-basket");
        if (typeof basketValue != "undefined" && basketValue.length > 0) {
            var slidingBasketOptions = $("#divBagItems").data("basket-options");
            maxOrderText = divBagItems.data("maxordertext");
            productQuantityText = divBagItems.data("productquantitytext");
            discountAppliedText = divBagItems.data("discountappliedtext");
            outOfStockText = divBagItems.data("outofstocktext");
            var basketJson = JSON.parse(basketValue);
            if (basketJson.basketTimeUtc) {
                var timeToCheckUtc = new Date().getTime() - 30000;

                var baseketTimeUtc = Date.parse(basketJson.basketTimeUtc);
                if (timeToCheckUtc > baseketTimeUtc) {
                    updateSkinBag();
                    return;
                }
            }
            populateData(basketJson);
        }
    }

    function removeProductFromBasket(id, qty) {
        // restored previous version of function
        $.ajax({
            type: "POST",
            url: "/api/basket/v1/overview/delete/" + id,
            xhrFields: {
                withCredentials: true,
            },
            success: function (data) {
                onRemoveProductFromBasketSuccess(data, id, qty);
            },
            error: function (xhr, textStatus, errorThrown) {
                showError();
            },
        });
    }

    function onRemoveProductFromBasketSuccess(data, id, qty, callback) {
        if (data != null) {
            $("#li" + id).fadeOut(400, function () {
                $(this).remove();
                populateData(data);
                doRemoveProductBind();
                showAddRemoveToBagMessage($("#hdnRemovedFromBag").val());
                updateShoppingBag();
            });
            if (window.anonymousWishlist.elevatedCartAndWishlistEnabled()) {
                populateData(data);
                doRemoveProductBind();
                updateShoppingBag();
            }
            if ($("#openMiniBasketOnHover").val() == "false") {
                navigateToPage();
            }
            if ($("#hdnWishListPage").val() == "true") {
                navigateToWishListPage();
            }

            try {
                var qtys = qty.split(": ");
                qty = qtys[qtys.length - 1];

                // Check if dataLayer is null
                if (window.parent.dataLayer != null) {
                    window.parent.dataLayer.push({
                        event: "productRemoved",
                        productsRemovedFromBasket: [
                            {
                                variantId: id.toString(),
                                quantity: qty.toString(),
                            },
                        ],
                    });
                    if (data.removedItems) {
                        sendEECartEvent("remove", data.removedItems[0], qty);
                    }
                }
            } catch (e) {}

            if (typeof callback === "function") {
                callback();
            }
        } else {
            showError();
        }
    }

    function addProductToBasket(bagContent, callback) {
        if (ShouldShowMessage()) {
            ShowForcedProductDialog(bagContent, callback);
        } else {
            callBackAddToBag(bagContent, callback);
        }
    }

    function initiateBuyNow(bagContent, buyNowCallback, onComplete, onError) {
        var data = buyNowCallback(bagContent);
        $.ajax({
            type: "POST",
            url: "/api/buynow/v1/initialize",
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json",
            xhrFields: {
                withCredentials: true,
            },
            success: function (data) {
                if (data != null) {
                    if (onComplete) {
                        onComplete({
                            bagContent: bagContent,
                            checkoutSession: data.session,
                        });
                    }
                } else {
                    showError();
                    if (onError) onError();
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                showError();
            },
        });
    }

    function callBackAddToBag(bagContent, onComplete, onError) {
        var openMiniBasketOnHover = $("#openMiniBasketOnHover").val() != "false";
        if (openMiniBasketOnHover) {
            showAjaxLoadImage();
        }

        try {
            if (window.enactorBridge && window.enactorBridge.isJavascriptBridgeConnected() && bagContent.length > 0) {
                var postData = {
                    "enactor.mfc.ProductCode": bagContent[0].sizeVariantId,
                    "enactor.mfc.ProductQuantity": bagContent[0].quantity,
                };
                window.enactorBridge.sendEvent("QuantitySellProduct", postData, null);
                hideAjaxLoadImage();
                return;
            }
        } catch (e) {
            console.log("Enactor add to bag error " + e);
        }

        $.ajax({
            type: "POST",
            url: "/cart/add",
            data: JSON.stringify(bagContent),
            dataType: "json",
            contentType: "application/json",
            xhrFields: {
                withCredentials: true,
            },
            success: function (data) {
                if (data != null) {
                    if (onComplete) {
                        onComplete(bagContent);
                    }
                    hideAjaxLoadImage();
                    populateData(data);
                    doRemoveProductBind();
                    if (!openMiniBasketOnHover) {
                        navigateToPage();
                    } else {
                        var addedProductDetails;
                        if (typeof data.basketProductDetails == "object" && data.basketProductDetails.length != 0) {
                            var productId = "";

                            if (bagContent.length > 0) {
                                productId = bagContent[0].sizeVariantId;
                            }

                            data.basketProductDetails.sort(function (a, b) {
                                if (a.variantId == productId) {
                                    return -1;
                                } else if (b.variantId == productId) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            });

                            addedProductDetails = data.basketProductDetails[0];
                        } else {
                            console.error("BasketProductDetails not in response");
                            showError();
                        }
                        var freeSampleVisible = $("#FsPromotionDetailModal").hasClass("in");
                        if (data.addToBagIsGated && !addToBagCoordinator.gatedEmailEnabled()) {
                            gatedAddToBagPopup.showRequestSentPopup(addedProductDetails);
                        } else if (!showMobileAddedToBagPopup(addedProductDetails) && !freeSampleVisible) {
                            showShoppingBagForAddedToBag();
                        }
                    }
                    if (bagContent[0]) {
                        sendEECartEvent("add", addedProductDetails, bagContent[0].quantity);
                        trackSegmentAddedToCart(addedProductDetails, data.basketId, bagContent[0].quantity);
                    }
                } else {
                    showError();
                    if (onError) onError();
                }
                if ($("#hdnProductPersonalisationInSameWebPageEnabled").val() == "true") {
                    $(".addToBagInner", "#aPersAddToBag").text($(".addToBagInner", "#aPersAddToBag").data("addtobag"));
                    window.scrollTo(0, 0);
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                showError();
            },
        });

        try {
            if (window.parent.dataLayer != null && bagContent != null && bagContent.length > 0) {
                window.parent.dataLayer.push({
                    event: "productAdded",
                    productsAddedToBasket: [
                        {
                            variantId: bagContent[0].sizeVariantId.toString(),
                            quantity: bagContent[0].quantity.toString(),
                            isProductRec: bagContent[0].isProductRec.toString(),
                        },
                    ],
                });
            }
        } catch (e) {}

        hideAjaxLoadImage();
    }

    function trackSegmentAddedToCart(product, basketId, quantity) {
        try {
            if (!(segment && typeof segment.getTrackingEnabled === "function" && segment.getTrackingEnabled())) {
                return;
            }
            if (!product || !basketId || !+quantity) {
                return;
            }

            let options = null;
            if (
                segmentPageController.parametersObject?.utm_source &&
                segmentPageController.parametersObject?.utm_source.toLowerCase() === "c8"
            ) {
                options = {
                    campaign: {
                        id: segmentPageController.parametersObject.c8cid,
                        content: segmentPageController.parametersObject.utm_content,
                        medium: segmentPageController.parametersObject.utm_medium,
                        name: segmentPageController.parametersObject.utm_campaign,
                        source: segmentPageController.parametersObject.utm_source,
                    },
                };
            }

            segment.trackAddedToCartEvent(
                {
                    activity: product.activity,
                    activity_group: product.activityGroup,
                    brand: product.productBrand,
                    budget_curve: product.budgetCurve,
                    cart_id: basketId,
                    category: product.category,
                    category_id: product.categoryId,
                    color: product.productColour,
                    colour_code: product.variantId?.substring(0, 8),
                    image_url: product.productImageMediumUrl,
                    is_full_price: product.isFullPrice,
                    name: product.productName,
                    price: product.productSellingPrice,
                    price_gbp: product.productSellingPriceInBaseUnit,
                    product_id: product.productId,
                    quantity: +quantity,
                    sku: product.variantId,
                    sub_category: product.subCategory,
                    variant: product.variant,
                },
                options,
            );
        } catch (e) {
            console.error(e);
        }
    }

    function sendEECartEvent(eventName, product, qty) {
        if (!product) return;
        var ee = $("#divBagSettings").attr("data-ee");
        if (ee === "true" && window.parent.dataLayer != null) {
            var id = product.variantId.substr(0, 8);
            if (product.productSequenceNumber) {
                id += "-" + product.productSequenceNumber;
            }
            var products = {
                products: [
                    {
                        id: id,
                        name:
                            product.productDisplayName && product.productDisplayName.length > 0
                                ? product.productDisplayName
                                : product.productName,
                        price: product.productSellingPrice.toFixed(2),
                        brand: product.productBrand,
                        category: ReplaceCategoryCrumbNestedChar(product.productCategory),
                        variant: product.productColour,
                        quantity: qty,
                        dimension5: product.variantId.substr(0, 8),
                        dimension6: window._currencyFormatter.ActiveCurrency,
                        dimension7: product.lineDiscountApplied ? product.lineDiscountApplied : "",
                        dimension16: product.productSize,
                    },
                ],
            };

            var data = {
                event: eventName === "remove" ? "removeFromCart" : "addToCart",
                ecommerce: {
                    currencyCode: window._currencyFormatter.ActiveCurrency,
                },
            };

            data.ecommerce[eventName] = products;
            window.parent.dataLayer.push(data);
        }
    }

    function ReplaceCategoryCrumbNestedChar(crumb) {
        if (!crumb) {
            return crumb;
        }

        var parts = crumb.replace("/", "&").split(">");
        return parts.slice(0, 5).join("/");
    }

    function addProductToWishList(bagContent, onComplete, onError) {
        $.ajax({
            type: "POST",
            url: "/wishlist/add",
            data: JSON.stringify(bagContent),
            dataType: "json",
            contentType: "application/json",
            xhrFields: {
                withCredentials: true,
            },
            success: function (data) {
                const bodyWrap = document.getElementById("BodyWrap");
                bodyWrap.classList.remove("menu-search-hidden");

                if (window.anonymousWishlist.elevatedCartAndWishlistEnabled()) {
                    window.anonymousWishlist.updateWishlistSummary(data);
                } else {
                    const wishListQuantityElem = document.getElementById("lblWishListCount");
                    const wishListIconElem = document.querySelector(".wishQuantityContainer > .WishIcon");

                    if (wishListQuantityElem === null || wishListIconElem === null) {
                        return;
                    }

                    const currentWishlistCount = parseInt(wishListQuantityElem.innerHTML, 10);
                    const newItemQuantity = parseInt(bagContent[0].quantity, 10);
                    const newWishListCount = currentWishlistCount + newItemQuantity;

                    wishListQuantityElem.innerHTML = newWishListCount;

                    if (newWishListCount > 0) {
                        wishListQuantityElem.classList.remove("HideWishList");
                        wishListIconElem.classList.add("WishIconActive");
                    }
                }

                if (onComplete) {
                    onComplete(bagContent);
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                showError();
                if (onError) onError();
            },
        });

        if (bagContent != null && bagContent.length > 0) {
            sendGtmCustomEvent({
                event: "wishlistAdded",
                productsAddedToWishlist: {
                    variantId: bagContent[0].sizeVariantId.toString(),
                    quantity: bagContent[0].quantity.toString(),
                    isProductRec: bagContent[0].isProductRec.toString(),
                },
                ecommerce: {
                    currencyCode: window._currencyFormatter.ActiveCurrency,
                    wishlistTotal: (bagContent[0].price * bagContent[0].quantity).toFixed(2),
                    wishlistItems: [
                        {
                            id: bagContent[0].sizeVariantId,
                            brand: bagContent[0].brand,
                            name: bagContent[0].name,
                            variant: bagContent[0].variant,
                            category: bagContent[0].category,
                            taxonomy: bagContent[0].taxonomy,
                            price: bagContent[0].price,
                            quantity: bagContent[0].quantity,
                        },
                    ],
                },
            });
        }
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

    function initiateFastPay(bagContent, settingId, onComplete, onError) {
        $.ajax({
            type: "POST",
            url: "/DesktopModules/BasketBag/API/BasketService/InitiateFastPay",
            data: JSON.stringify({
                BagItems: bagContent,
                SettingId: settingId,
            }),
            dataType: "text",
            success: function (data) {
                if (onComplete) onComplete(bagContent);
                //Redirect to checkout
                window.location = data;
            },
            error: function (xhr, textStatus, errorThrown) {
                showError();
                console.error(errorThrown);
                if (onError) onError();
            },
        });
    }

    function updateSkinBag() {
        $.ajax({
            cache: false,
            type: "GET",
            url: "/cart/getbasketoverview",
            success: function (data) {
                if (data != null) {
                    if (typeof data == "string") {
                        data = JSON.parse(data);
                    }
                    populateData(data);
                    doRemoveProductBind();
                } else {
                    showEmptyErrorMessage($("#hdnErrorMessage").val());
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                showEmptyErrorMessage($("#hdnErrorMessage").val());
            },
        });
    }

    function ShowForcedProductDialog(bagContent, callback) {
        forcedProductDialog.show(function (accepted) {
            var cookieValue = accepted ? "YES" : "NO";
            writeCookeAndBagCallBack(cookieValue, bagContent, callback);
        });
    }

    function writeCookeAndBagCallBack(cookieValue, bagContent, callback) {
        setCookieValue("AddForcedProductItemToBasketCookie", cookieValue, 30, "/", null);
        closeDialog();
        callBackAddToBag(bagContent, callback);
    }
    function closeDialog() {
        $("html, body").removeClass("no-scroll-dialog");
    }

    function doesCookieExists(cookieName) {
        var cookeExists = getCookie(cookieName);
        return cookeExists != null && cookeExists != "";
    }

    function ShouldShowMessage() {
        return forcedProductDialog.isAvailable() && !doesCookieExists("AddForcedProductItemToBasketCookie");
    }

    // TODO move to own script and only expose global methods
    var addToBagCoordinator = {
        addTypes: {
            Bag: "AddToBag",
            WishList: "AddToWishList",
            FastPay: "BuyNowWithFastPay",
            BuyNow: "BuyNow",
        },
        _currentRequest: null,
        _modal: null,
        preOrderPromise: null,
        start: function (request) {
            addToBagCoordinator._reset();
            addToBagCoordinator._currentRequest = request;
            addToBagCoordinator.preOrderPromise = null;

            if (
                addToBagCoordinator.gatedEmailEnabled() &&
                (request.variantDetails.isGated === "true" || request.variantDetails.isGated === true)
            ) {
                gatedAddToBagPopup.showEmailVerificationPopup(
                    request.variantDetails.brand,
                    request.variantDetails.name,
                    request.variantDetails.id,
                    request.quantity,
                );
                return false;
            }

            var target = window.event.currentTarget;
            if (!target) {
                target = window.event.srcElement;
            }
            var shouldForwardPersonalisationOpener = false;
            if ($(target).hasClass("personalisationOpener")) {
                shouldForwardPersonalisationOpener = true;
            }
            if (
                request.addType !== addToBagCoordinator.addTypes.WishList &&
                preOrderEnabled() &&
                (request.variantDetails.isPreOrderable === "true" || request.variantDetails.isPreOrderable === true)
            ) {
                addToBagCoordinator.preOrderPromise = addToBagCoordinator._openPreorderPopup(request);
                addToBagCoordinator.preOrderPromise.then(function () {
                    preorderPopupPassed(shouldForwardPersonalisationOpener);
                });
            } else {
                preorderPopupPassed(false);
            }

            function preorderPopupPassed(personalisationOpener) {
                if (request.variantDetails.isEsdProduct) {
                    addToBagCoordinator._handleEsdProduct();
                    return;
                }

                if (request.variantDetails.isPeronalisable) {
                    if (request.variantDetails.isMyIdPersonalisable && $(target).hasClass("persOpener")) {
                        addToBagCoordinator._populateMyIdPersonalisationTab();
                    } else {
                        var $aTag = $(target).closest("a");
                        if ($("#hdnProductPersonalisationInSameWebPageEnabled").val() == "true") {
                            if (personalisationOpener || $(target).hasClass("personalisationOpener")) {
                                addToBagCoordinator._populatePersonalisationTab();
                            }
                            // adding wishlist button to be able to add product, when product is personalisable
                            // but personalisation haven't been added yet
                            else if (
                                $aTag.attr("id") == "aAddToBag" ||
                                $aTag.attr("id") == "aAddToBagPreOrder" ||
                                $aTag.attr("id") == "aAddToWishList"
                            ) {
                                addToBagCoordinator._executeAdd();
                            }
                        }
                        // will add tshirt product to bag/wishlist if no personalisation selected
                        else if (
                            ($aTag.attr("id") == "aAddToBag" ||
                                $aTag.attr("id") == "aAddToBagPreOrder" ||
                                $aTag.attr("id") == "aAddToWishList") &&
                            !addToBagCoordinator._currentRequest.variantDetails.isEVoucher
                        ) {
                            addToBagCoordinator._executeAdd();
                        } else {
                            addToBagCoordinator._openPersonalisationPopup();
                        }
                    }
                } else if (request.variantDetails.ageRestriction) {
                    addToBagCoordinator._openAgeVerificationPopup();
                } else {
                    addToBagCoordinator._executeAdd();
                }
            }

            function preOrderEnabled() {
                var divBagItems = $("#divBagItems");
                if (
                    divBagItems != null &&
                    divBagItems.data("basket") != null &&
                    divBagItems.data("basket").showPreOrderPopUp != undefined
                ) {
                    return divBagItems.data("basket").showPreOrderPopUp;
                }
                //else
                return false;
            }
        },
        _handleEsdProduct: () => {
            const addTypeClass =
                addToBagCoordinator._currentRequest.addType == window.addToBagCoordinator.addTypes.WishList
                    ? "is-add-to-wishlist"
                    : "is-add-to-bag";
            const brand =
                typeof addToBagCoordinator._currentRequest.variantDetails.brand == "object"
                    ? addToBagCoordinator._currentRequest.variantDetails.brand.name
                    : addToBagCoordinator._currentRequest.variantDetails.brand;

            addToBagCoordinator._modal = modalHelper.setupModal({
                modalName: "esd-product-modal",
                titleHtml: `${brand} - ${addToBagCoordinator._currentRequest.variantDetails.name}`,
                cssClass: `esd-product-modal-dialog ${addTypeClass}`,
                preventDefaultCloseButtonBehaviour: true,
            });

            document.getElementById("esd-product-modal").addEventListener("mousedown", function (e) {
                var $modalContent = $(this).find(".modal-content");

                if (!$modalContent.is(e.target) && $modalContent.has(e.target).length === 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    modalHelper.hideModal(addToBagCoordinator._modal);
                    addToBagCoordinator._reset();
                }
            });

            addToBagCoordinator._modal[0].querySelector(".close").addEventListener("click", () => {
                modalHelper.hideModal(addToBagCoordinator._modal);
                addToBagCoordinator._reset();
            });

            const modalBody = addToBagCoordinator._modal[0].querySelector(".modal-body");
            modalBody.classList.add("esd-loading");

            modalHelper.showModal(addToBagCoordinator._modal, { backdrop: "static" });

            var esdContentUrl = `/productdetail/personalise?sv=${addToBagCoordinator._currentRequest.variantDetails.id}&mode=${addToBagCoordinator._currentRequest.addType}&isQuickBuy=true`;

            fetch(esdContentUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                contentType: "application/json",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
                    return response.text();
                })
                .then((html) => {
                    modalBody.classList.remove("esd-loading");
                    modalBody.innerHTML = html;

                    const addToBagCallback = () => {
                        if (addToBagCoordinator._currentRequest.variantDetails.ageRestriction) {
                            modalHelper.hideModal(addToBagCoordinator._modal);
                            addToBagCoordinator._modal.remove();
                            addToBagCoordinator._modal = null;
                            addToBagCoordinator._openAgeVerificationPopup();
                        } else {
                            modalHelper.hideModal(addToBagCoordinator._modal);
                            addToBagCoordinator._executeAdd();
                        }
                    };

                    window.ProdEsd.initialiseProdEsd(addToBagCallback);
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        _openPreorderPopup: function (request, isMoveToBag = false) {
            var def = $.Deferred();
            var url = `/ProductDetail/PreOrderProduct?sv=${request.variantDetails.id}&isMoveToBag=${isMoveToBag}`;

            getAjaxModalContent(url, function (modalContent) {
                addToBagCoordinator._modal = modalHelper.setupModal({
                    contentHtml: modalContent.content,
                    titleHtml: modalContent.title, //request.variantDetails.name,
                    modalName: "PreorderPopupModal",
                    cssClass: "popupPreorderPopup",
                });

                modalHelper.showModal(addToBagCoordinator._modal);
                _bindAlgloliaDataAttributes("#aAddToBagPreOrder", request);
                $(".preorderCancelButton, .preorderCancelContinueButton")
                    .off("click")
                    .on("click", function () {
                        addToBagCoordinator.preorderPopupComplete($(this).data("agreed"));
                    });

                var divPreorder = $(".divPreorder");
                if (divPreorder.data("isvalidforpreorderpopup") == "False") {
                    addToBagCoordinator.preorderPopupComplete(true);
                }

                addToBagCoordinator._modal.off("hidden.bs.modal").on("hidden.bs.modal", function () {
                    var button = $("#sAddToBagWrapper > .addToBag");
                    var buttonInner = button.find(".addToBagInner");
                    buttonInner.text(buttonInner.data("preorder"));
                    var addToBasketContainer = $(".addToBasketContainer");
                    addToBasketContainer.removeClass("addToBagInProgress");
                    if (
                        addToBagCoordinator.preOrderPromise != null &&
                        addToBagCoordinator.preOrderPromise.state == "pending"
                    ) {
                        addToBagCoordinator.preOrderPromise.reject();
                    }
                });
            });

            return def;
        },
        _openPersonalisationPopup: function () {
            var url =
                "/productdetail/personalise?sv=" +
                addToBagCoordinator._currentRequest.variantDetails.id +
                "&mode=" +
                addToBagCoordinator._currentRequest.addType +
                "&isQuickBuy=true";

            getAjaxModalContent(url, function (content) {
                const evoucherClass = addToBagCoordinator._currentRequest.variantDetails.isEVoucher
                    ? "is-evoucher"
                    : "";

                addToBagCoordinator._modal = modalHelper.setupModal({
                    contentHtml: "<div id='productDetails'>" + content + "</div>",
                    titleHtml: addToBagCoordinator._currentRequest.variantDetails.name,
                    modalName: "PersonalisationModal",
                    cssClass: `popupPersonalisation ${evoucherClass}`,
                });

                modalHelper.showModal(addToBagCoordinator._modal);

                if ($("#aPersAddToBag").length)
                    _bindAlgloliaDataAttributes("#aPersAddToBag", addToBagCoordinator._currentRequest);
                else if ($("#btnAddEVoucherToBasket").length)
                    _bindAlgloliaDataAttributes("#btnAddEVoucherToBasket", addToBagCoordinator._currentRequest);

                initialiseProdPersonalise();

                addToBagCoordinator._modal.on("hidden.bs.modal", function () {
                    addToBagCoordinator._executeAdd();
                    $(".addToBasketContainer", "#ProductStandardAddToBag").removeClass("addToBagInProgress");
                });
            });
        },
        _populatePersonalisationTab: function () {
            var url =
                "/productdetail/personalise?sv=" +
                addToBagCoordinator._currentRequest.variantDetails.id +
                "&mode=" +
                addToBagCoordinator._currentRequest.addType;

            getAjaxModalContent(url, function (content) {
                var myIdTabPages = $("#pnlPersonalisationDetails");
                myIdTabPages.html(content);
                if ($("#divFlagEmbGroup").length > 0 && $("#divEmojiGroup").length > 0) {
                    $("#divEmojiGroup").hide();
                    $("#divFlagEmbGroup").hide();
                }

                var removePersClass = function (index, className) {
                    return (className.match(/(^|\s)[emoji-|flag-]+[0-9]+\S+/g) || []).join(" ");
                };

                $("input[name$='rdoEmojiFlagVisible']").click(function () {
                    if ($(this).val() == "Flag") {
                        var flagtext = $("ul > li:eq(0)", "#divFlagEmb").data("text");
                        $("#btnPersonalisationDropdown", "#divFlagEmb").data("value", "");
                        $("#btnPersonalisationDropdown", "#divFlagEmb").removeClass(removePersClass).addClass("none");
                        $("#spanPersonalisationDropdownSelectedValue", "#divFlagEmb").text(flagtext);
                        $("#divFlagEmbGroup").show();
                        $("#divEmojiGroup").hide();
                    } else {
                        var emojitext = $("ul > li:eq(0)", "#divEmojis").data("text");
                        $("#btnPersonalisationDropdown", "#divEmojis").data("value", "");
                        $("#btnPersonalisationDropdown", "#divEmojis").removeClass(removePersClass).addClass("none");
                        $("#spanPersonalisationDropdownSelectedValue", "#divEmojis").text(emojitext);
                        $("#divFlagEmbGroup").hide();
                        $("#divEmojiGroup").show();
                    }
                });
                initialiseProdPersonalise();
                _bindAlgloliaDataAttributes("#aPersAddToBag", addToBagCoordinator?._currentRequest);
            });
        },
        _populateMyIdPersonalisationTab: function () {
            var url =
                "/productdetail/personalise?sv=" +
                addToBagCoordinator._currentRequest.variantDetails.id +
                "&mode=" +
                addToBagCoordinator._currentRequest.addType;

            getAjaxModalContent(url, function (content) {
                var myIdTabPages = $("#productMyIdPerosonalisationPages");
                myIdTabPages.html(content);

                if ($("#liPlayerPickTab").hasClass("rtsSelected")) {
                    $("#liMyIdTab").removeClass("rtsSelected");
                    $("#myIdCustomName").addClass("hidden");
                } else {
                    $("#liPlayerPickTab").remove("rtsSelected");
                    $("#myIdPlayerName").addClass("hidden");
                }

                initialiseProdPersonalise();
            });
        },

        _openAgeVerificationPopup: function () {
            var divBag = $("#divBag");
            var message = divBag.data("ageverification"),
                okText = divBag.data("ageverificationok"),
                cancelText = divBag.data("ageverificationcancel"),
                titleText = divBag.data("ageverificationtitle");
            var popupHtml =
                "<p>" +
                message.replace("{0}", addToBagCoordinator._currentRequest.variantDetails.ageRestriction) +
                "</p>" +
                '<a class="ageVerificationCancel" href="#">' +
                cancelText +
                "</a> " +
                '<a class="ageVerificationOk" href="#">' +
                okText +
                "</a>";
            addToBagCoordinator._modal = modalHelper.setupModal({
                contentHtml: popupHtml,
                modalName: "ageVerificationPopup",
                titleHtml: titleText,
            });
            modalHelper.showModal(addToBagCoordinator._modal);
            addToBagCoordinator._modal.on("click", ".ageVerificationOk", function (e) {
                e.preventDefault();
                modalHelper.hideModal(addToBagCoordinator._modal);
                addToBagCoordinator._executeAdd();
            });
            addToBagCoordinator._modal.on("click", ".ageVerificationCancel", function (e) {
                e.preventDefault();
                modalHelper.hideModal(addToBagCoordinator._modal);
                addToBagCoordinator._reset();
            });
            addToBagCoordinator._modal[0].querySelector(".close").addEventListener("click", () => {
                modalHelper.hideModal(addToBagCoordinator._modal);
                addToBagCoordinator._reset();
            });
            document.getElementById("ageVerificationPopup").addEventListener("click", function (e) {
                var $modalContent = $(this).find(".modal-content");

                if (!$modalContent.is(e.target) && $modalContent.has(e.target).length === 0) {
                    modalHelper.hideModal(addToBagCoordinator._modal);
                    addToBagCoordinator._reset();
                }
            });
        },
        preorderPopupComplete: function (accepted) {
            addToBagCoordinator._modal.off("hidden.bs.modal");
            modalHelper.hideModal(addToBagCoordinator._modal);
            if (accepted === true) {
                addToBagCoordinator.preOrderPromise.resolve();
            } else {
                addToBagCoordinator.preOrderPromise.reject();
            }
        },
        personalisationSelectionComplete: function (personalisationDetails, addType) {
            addToBagCoordinator._currentRequest.addType = addType;
            addToBagCoordinator._currentRequest.personalisationDetails = personalisationDetails;
            if (
                ($("#divPersonalisation").length > 0 && !$("#divPersonalisation").attr("data-nomodal")) ||
                $("#divEvoucher").length > 0
            ) {
                modalHelper.hideModal(addToBagCoordinator._modal); //This will trigger _executeAdd
            } else {
                if ($("#PersonalisationModal").length > 0) {
                    modalHelper.hideModal(addToBagCoordinator._modal); //This will trigger _executeAdd
                } else {
                    addToBagCoordinator._executeAdd();
                }
            }
        },
        noPeronalisationRequired: function () {
            addToBagCoordinator._executeAdd();
        },
        noPersonalisationSelected: function () {
            modalHelper.hideModal(addToBagCoordinator._modal); //This will trigger _executeAdd
        },
        gatedEmailEnabled: function () {
            var divBag = $("#divBag");
            var enabled = divBag.data("gatedaddtobagemailverificationenabled");
            return enabled === true || enabled === "true";
        },
        _executeAdd: function () {
            if (
                addToBagCoordinator._currentRequest.variantDetails.isEVoucher &&
                !addToBagCoordinator._currentRequest.personalisationDetails
            )
                return;

            var bagItem = [
                {
                    sizeVariantId: addToBagCoordinator._currentRequest.variantDetails.id,
                    quantity: addToBagCoordinator._currentRequest.quantity,
                    printessDetails: addToBagCoordinator._currentRequest.printessDetails,
                    personalisation: addToBagCoordinator._currentRequest.personalisationDetails
                        ? JSON.parse(addToBagCoordinator._currentRequest.personalisationDetails)
                        : [],
                    isProductRec: addToBagCoordinator._currentRequest.isProductRec,
                    name: addToBagCoordinator._currentRequest.variantDetails.name,
                },
            ];

            switch (addToBagCoordinator._currentRequest.addType) {
                case addToBagCoordinator.addTypes.Bag:
                    addProductToBasket(
                        bagItem,
                        addToBagCoordinator._currentRequest.onComplete,
                        addToBagCoordinator._currentRequest.onError,
                    );
                    break;
                case addToBagCoordinator.addTypes.WishList:
                    addProductToWishList(
                        bagItem,
                        addToBagCoordinator._currentRequest.onComplete,
                        addToBagCoordinator._currentRequest.onError,
                    );
                    break;
                case addToBagCoordinator.addTypes.FastPay:
                    initiateFastPay(
                        bagItem,
                        addToBagCoordinator._currentRequest.fastPaySettingId,
                        addToBagCoordinator._currentRequest.onComplete,
                        addToBagCoordinator._currentRequest.onError,
                    );
                    break;
                case addToBagCoordinator.addTypes.BuyNow:
                    initiateBuyNow(
                        bagItem,
                        addToBagCoordinator._currentRequest.buyNowCallback,
                        addToBagCoordinator._currentRequest.onComplete,
                        addToBagCoordinator._currentRequest.onError,
                    );
                    break;
                default:
                    console.error("Unknown addType: " + addType);
                    break;
            }

            if (
                addToBagCoordinator._currentRequest.variantDetails != null &&
                !addToBagCoordinator._currentRequest.variantDetails.isMyIdPersonalisable &&
                $("#hdnProductPersonalisationInSameWebPageEnabled").val() != "true"
            ) {
                addToBagCoordinator._reset(false);
            }
        },
        _reset: function (shouldResetButtonText = true) {
            addToBagCoordinator._currentRequest = null;
            if (addToBagCoordinator._modal) {
                addToBagCoordinator._modal.remove();
                addToBagCoordinator._modal = null;
                if (shouldResetButtonText) {
                    addToBagCoordinator._resetAddToBagButtonText();
                }
            }
        },
        _resetAddToBagButtonText: () => {
            const addToBagContainers = document.querySelectorAll(".addToBasketContainer");
            const addToBagButtons = document.querySelectorAll(".addToBag");

            if (!addToBagButtons.length) return;

            const addToBagInnerTextElem = addToBagButtons[0].querySelector(".addToBagInner");
            const addToBagText = addToBagInnerTextElem.getAttribute("data-addtobag");

            addToBagContainers.forEach((container) => {
                container.classList.remove("addToBagInProgress");
            });

            addToBagContainers.forEach((button) => {
                button.querySelector(".addToBagInner").innerText = addToBagText;
            });
        },
    };

    // TODO move to own script and only expose global methods
    var sizeRequiredButtons = {
        _documentClickHandlerRegistered: false,
        _messageText: null,
        getMessageText: function () {
            if (!sizeRequiredButtons._messageText) {
                sizeRequiredButtons._messageText = $("#divBag").attr("data-selectsizetext");
                if (!sizeRequiredButtons._messageText) {
                    console.error("sizeRequiredButtons - Message text not found");
                    sizeRequiredButtons._messageText = "Please select a size";
                }
            }
            return sizeRequiredButtons._messageText;
        },
        init: function () {
            $(".SizeRequiredButton").each(function () {
                var buttonWrapper = $(this);
                if (buttonWrapper.attr("data-content")) return; //Already done
                buttonWrapper.attr("data-content", sizeRequiredButtons.getMessageText());
                buttonWrapper.attr("data-toggle", "popover");
                buttonWrapper.popover({
                    placement: "bottom",
                    trigger: "manual",
                    animation: false,
                    template:
                        '<div class="popover SelectSizePopover" role="tooltip"><div class="arrow"></div><div class="PopoverContentWrapper"><span class="glyphicon glyphicon-warning-sign"></span><span class="popover-content"></span></div></div>',
                });
            });
            if (!sizeRequiredButtons._documentClickHandlerRegistered) {
                $(document).click(sizeRequiredButtons.hideMessages);
                sizeRequiredButtons._documentClickHandlerRegistered = true;
            }
        },
        showMessage: function (target, scope) {
            sizeRequiredButtons.hideMessages();
            setTimeout(function () {
                $(target).closest(".SizeRequiredButton").popover("show");
                var sizeLabel = $(scope).find(".BuySizeText");
                if (sizeLabel) {
                    sizeLabel.addClass("sizeerror");
                    sizeLabel.data("text", sizeLabel.text());
                    sizeLabel.text(sizeRequiredButtons.getMessageText());
                }
            }, 0);
        },
        hideMessages: function () {
            // check if size has been selected
            var isSizeSelected = $("ul > li.sizeButtonli").hasClass("sizeVariantHighlight");
            if (isSizeSelected) {
                // hide error tooltip
                $(".SizeRequiredButton").popover("hide");
                var sizeLabelOnError = $(".BuySizeText.sizeerror");
                if (sizeLabelOnError) {
                    sizeLabelOnError.removeClass("sizeerror");
                    sizeLabelOnError.text(sizeLabelOnError.data("text"));
                }
            }
        },
    };

    // TODO move to own script and only expose global methods
    var gatedAddToBagPopup = {
        _requestSentModal: null,
        showRequestSentPopup: function (addedProductDetails) {
            var divBag = $("#divBag");
            var text = divBag.data("gatedaddtobagpopuptext");
            var buttonText = divBag.data("gatedaddtobagbuttontext");
            var popupHtml =
                '<div class="row gatedBagRow">' +
                '<div class="hidden-xs col-sm-4">' +
                '<div id="AddedToBagModalImageWrap">' +
                '<div id="AddedToBagModalImageHeightHelper"></div>' +
                '<img alt="" src="' +
                htmlEncoder.encode(addedProductDetails.productImageMediumUrl) +
                '" />' +
                "</div>" +
                '<div id="AddedToBagModalProductName">' +
                htmlEncoder.encode(addedProductDetails.productName) +
                "</div>" +
                "</div>" +
                '<div class="col-xs-12 col-sm-8 gatedBagDiv">' +
                text +
                '<div class="GatedAddToBagGoWrapper">' +
                '<a class="GatedAddToBagGo" href="/cart">' +
                htmlEncoder.encode(buttonText) +
                "</a>" +
                "</div>" +
                "</div>";
            gatedAddToBagPopup._requestSentModal = modalHelper.setupModal({
                contentHtml: popupHtml,
                modalName: "GatedAddToBagPopup",
            });
            modalHelper.showModal(gatedAddToBagPopup._requestSentModal);
            gatedAddToBagPopup._requestSentModal.on("hidden.bs.modal", function () {
                gatedAddToBagPopup._requestSentModal.remove();
            });
            gatedAddToBagPopup._setAcceptedCookieWasShown(false);
            gatedAddToBagPopup.scheduleAcceptedPopupShow(30000);
        },
        _showRequestAcceptedPopup: function () {
            var divBag = $("#divBag");
            var text = divBag.data("gatedaddtobagsuccesstext");
            var buttonText = divBag.data("gatedaddtobagsuccessbuttontext");
            var popupHtml =
                '<div class="row">' +
                '<div class="col-xs-12 gatedBagDiv">' +
                text +
                '<div class="GatedAddToBagGoWrapper">' +
                '<a class="GatedAddToBagGo" href="/checkout/launch">' +
                htmlEncoder.encode(buttonText) +
                "</a>" +
                "</div>" +
                "</div>" +
                "</div>";
            var modal = modalHelper.setupModal({
                contentHtml: popupHtml,
                modalName: "GatedAddToBagSuccessPopup",
            });
            modalHelper.showModal(modal);
            modal.on("hidden.bs.modal", function () {
                modal.remove();
            });
        },
        showEmailVerificationPopup: function (brand, productName, sku, qty) {
            var divBag = $("#divBag");
            var text = divBag.data("gatedaddtobagemailpopuptext");
            var buttonText = divBag.data("gatedaddtobagemailbuttontext");
            var popupHtml =
                '<div class="row gatedBagRow">' +
                '<div class="col-xs-12 col-sm-8 gatedBagDiv">' +
                text +
                '<div class="GatedAddToBagFormWrapper">' +
                '<div class="GatedInput">' +
                '<label for="gatedName">First Name</label>' +
                '<input type="text" id="gatedName" name="gatedName" />' +
                "<div>" +
                '<span id="gatedNameError" class="validationError" style="color:red;display:none">Name is not valid</span>' +
                "</div>" +
                "</div>" +
                '<div class="GatedInput">' +
                '<label for="gatedName">Email</label>' +
                '<input type="email" id="gatedEmail" name="gatedEmail" />' +
                "<div>" +
                '<span id="gatedEmailError" class="validationError" style="color:red;display:none">Email address is not valid</span>' +
                "</div>" +
                "</div>" +
                '<div class="GatedAddToBagGoWrapper">' +
                '<span class="ImgButWrap">' +
                '<a id="GatedEmailSubmit" class="GatedAddToBagGo">' +
                htmlEncoder.encode(buttonText) +
                "</a>" +
                "</span>" +
                "</div>" +
                '<p class="terms">I have read the <a href="/customerservices/otherinformation/securityandprivacy" target="_blank">privacy policy</a></p>' +
                "</div>" +
                "</div>" +
                "</div>";
            var modal = modalHelper.setupModal({
                contentHtml: popupHtml,
                modalName: "GatedAddToBagEmailPopup",
            });
            $("#GatedEmailSubmit").click(function () {
                $("#gatedNameError").hide();
                $("#gatedEmailError").hide();

                if (!$("#gatedName").val()) {
                    $("#gatedNameError").show();
                    return;
                }
                if (!$("#gatedEmail").val()) {
                    $("#gatedEmailError").show();
                    return;
                }
                var emailRegEx =
                    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!emailRegEx.test($("#gatedEmail").val())) {
                    $("#gatedEmailError").show();
                    return;
                }

                var request = {
                    brand: brand.name,
                    productName: productName,
                    sku: sku,
                    quantity: qty,
                    name: $("#gatedName").val(),
                    email: $("#gatedEmail").val(),
                };

                $.ajax({
                    type: "POST",
                    url: "/productverify",
                    data: JSON.stringify(request),
                    dataType: "json",
                    contentType: "application/json",
                    xhrFields: {
                        withCredentials: true,
                    },
                    success: function (data) {
                        if (data != null) {
                            modalHelper.hideModal(modal);
                            gatedAddToBagPopup._showEmailVerificationSentPopup();
                        } else {
                            showError();
                            if (onError) onError();
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        showError();
                    },
                });
            });
            modalHelper.showModal(modal);
            modal.on("hidden.bs.modal", function () {
                modal.remove();
            });
        },
        _showEmailVerificationSentPopup: function () {
            var divBag = $("#divBag");
            var text = divBag.data("gatedaddtobagemailsenttext");
            var popupHtml = '<div class="row">' + '<div class="col-xs-12 gatedBagDiv">' + text + "</div>" + "</div>";
            var modal = modalHelper.setupModal({
                contentHtml: popupHtml,
                modalName: "GatedAddToBagEmailSentPopup",
            });
            modalHelper.showModal(modal);
            modal.on("hidden.bs.modal", function () {
                modal.remove();
            });
        },
        _acceptedPopupWasShown: function () {
            return getCookie("GatedAddAccepted") == "Y";
        },
        _setAcceptedCookieWasShown: function (boolValue) {
            var value = boolValue ? "Y" : "N";
            setCookieValue("GatedAddAccepted", value, 30);
        },
        scheduleAcceptedPopupShow: function (milliseconds, onComplete) {
            setTimeout(function () {
                if (gatedAddToBagPopup._acceptedPopupWasShown()) return;
                if (gatedAddToBagPopup._requestSentModal != null) {
                    modalHelper.hideModal(gatedAddToBagPopup._requestSentModal);
                    gatedAddToBagPopup._requestSentModal = null;
                }
                gatedAddToBagPopup._showRequestAcceptedPopup();
                gatedAddToBagPopup._setAcceptedCookieWasShown(true);
                if (onComplete) onComplete();
            }, milliseconds);
        },
    };

    function getAjaxModalContent(url, success, error) {
        $.ajax({
            cache: false,
            type: "GET",
            url: url,
            success: function (data) {
                if (success) {
                    success(data);
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                if (error) {
                    error(xhr, textStatus, errorThrown);
                }
            },
        });
    }

    const _bindAlgloliaDataAttributes = (element, request) => {
        if (request?.variantDetails?.id?.length >= 8) {
            window.algoliaUtil.bindAlgloliaDataAttributes(element, request.variantDetails.id.substring(0, 8));
        }
    };

    // Expose globals
    window.updateSkinBag = updateSkinBag;
    window.addToBagCoordinator = addToBagCoordinator;
    window.sizeRequiredButtons = sizeRequiredButtons;
    window.gatedAddToBagPopup = gatedAddToBagPopup;
    window.onWishlistMouseEnterCallback = onWishlistMouseEnterCallback;
    window.onWishlistMouseLeaveCallback = onWishlistMouseLeaveCallback;
    window.hideShoppingBag = hideShoppingBag;
    window.showShoppingBag = showShoppingBag;
})(window, window.jQuery, window.segment, window.scriptService, window.algoliaUtil);
