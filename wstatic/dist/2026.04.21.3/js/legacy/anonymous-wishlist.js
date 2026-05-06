(function (window, $) {
    "use strict";

    const wishlistContainerInHeader = $("#divWishList");
    const wishlistSummary = $(".wishlist-summary");
    const wishlistEnabled = wishlistSummary?.length > 0;
    const wishlistSummaryList = wishlistSummary.find("[data-wishlist]");
    let wishlistData = wishlistEnabled ? JSON.parse(wishlistSummaryList.attr("data-wishlist")) : null;
    const wishlistPage = $(".wishlist-page");
    const shareWishlistComponent = $(".wishlist-share");
    const shareWishlistButton = $("#share-wishlist-button");
    const wishListEmailInput = $("#wishListEmail");
    const sendCopyCheckbox = $("#cbSendMeACopy");
    const shareWishlistErrorMessageWrapper = $(".wishlist-share__message-error");
    const shareWishlistErrorMessageItem = $(".wishlist-share__input-error-item");
    const wishlistSharingMessage = $(".wishlist-share__message-sharing");
    const shareWishlistComplete = $(".wishlist-share__complete-message");
    const shareWishlistBody = $(".wishlist-share__body");
    const wishlistContainerUl = wishlistSummary.find(".ul-container");
    const wishlistSummaryCounter = wishlistSummary.find("[data-wishlist-counter]");
    const wishlistItemLabel = wishlistSummaryCounter.data("wishlist-item-label");
    const wishlistItemLabelPlural = wishlistSummaryCounter.data("wishlist-item-label-plural");

    $(document).ready(function () {
        if (!wishlistEnabled) return;

        getWishlistJson();
        window.ProductLineItem.bindSizeUpdateEvents();
        //bindQuantityUpdateEvents();
        bindShareWishlistSliderEvents();
        window.ProductLineItem.bindMoveToBagEvents();
        bindWishlistSummaryHoverEvents();
        window.ProductLineItem.bindRemoveLineItem();
    });

    function bindWishlistSummaryHoverEvents() {
        wishlistContainerInHeader.mouseenter(() => {
            if (!isTouchDevice()) {
                window.onWishlistMouseEnterCallback();
            }
        });

        wishlistContainerInHeader.mouseleave((e) => {
            if (!isTouchDevice()) {
                window.onWishlistMouseLeaveCallback(e);
            }
        });
    }

    function getWishlistJson() {
        const wishlistJsonData = wishlistSummaryList.attr("data-wishlist");

        if (wishlistJsonData?.length > 0) {
            const wishlistJson = JSON.parse(wishlistJsonData);
            if (wishlistJson?.basketTimeUtc) {
                const timeToCheckUtc = new Date().getTime() - 30000;
                const wishlistTimeUtc = Date.parse(wishlistJson.basketTimeUtc);

                if (timeToCheckUtc > wishlistTimeUtc) {
                    updateWishlistJson();
                    return;
                }

                populateWishlistTotalQuantity();
                populateSlidingWishlist();
                highlightIconIfProductsOnWishlistPLP();
            }
        }
    }

    function updateWishlistJson(data) {
        if (data) {
            setWishlistSummaryDataAttr(data);
            populateWishlistTotalQuantity();
            populateSlidingWishlist();
            highlightIconIfProductsOnWishlistPLP();
            highlightIconIfProductOnWishlistPDP();
            highlightIconIfProductsOnWishlistDy();
        } else {
            $.ajax({
                cache: false,
                type: "GET",
                dataType: "json",
                url: "/wishlist/getwishlistoverview",
                success: function (data) {
                    setWishlistSummaryDataAttr(data);
                    populateWishlistTotalQuantity();
                    populateSlidingWishlist();
                    highlightIconIfProductsOnWishlistPLP();
                    highlightIconIfProductOnWishlistPDP();
                    highlightIconIfProductsOnWishlistDy();
                },
                error: function (xhr) {
                    console.log(xhr.statusText);
                },
            });
        }
    }

    function setWishlistSummaryDataAttr(data) {
        wishlistData = data;
        wishlistSummaryList.attr("data-wishlist", JSON.stringify(wishlistData));
    }

    function populateSlidingWishlist() {
        wishlistSummaryList.empty();

        const templateItem = document.querySelector("#template-wishlist-item [data-product-line-item]");
        wishlistData?.basketProductDetails.map((x) => {
            const clonedItem = templateItem.cloneNode(true);
            const productLineCard = window.ProductLineItem.createLineItem(clonedItem, x);
            wishlistSummaryList.append(productLineCard);
        });

        if (wishlistData?.basketProductDetails.length == 0) {
            hideWishlistSlideOut();
        }

        bindWishlistSummaryItemsClickEvents();
        window.ProductLineItem.bindRemoveLineItem();
        window.ProductLineItem.bindMoveToBagEvents();
        window.ProductLineItem.bindSizeUpdateEvents();
        window.ProductLineItem.bindLineQuantityEvents();
    }

    function bindWishlistSummaryItemsClickEvents() {
        wishlistSummaryList.find(".liPrdLnk").click(function () {
            var prdUrl = $(this).attr("data-prdUrl");
            if (prdUrl != null) {
                document.location = prdUrl;
            }
        });
    }

    function populateWishlistTotalQuantity() {
        const wishlistHeaderCounter = $("#lblWishListCount");
        const wishlistSummaryCount = $(".wishlist-summary-count");
        const wishlistSummaryCounter = wishlistSummaryCount.find("[data-wishlist-counter]");
        const wishlistPageCount = $(".wishlist-page__header .totalItemsContainer");
        const wishlistPageCounter = wishlistPageCount.find(".itemCount");
        const wishlistHeaderIcon = $(".WishIcon");

        let wishlistCount = 0;
        let wishlistCountText = null;
        let wishlistSummaryCountText = null;

        wishlistData?.basketProductDetails.map((x) => {
            wishlistCount += x.productQuantity;
        });

        wishlistCountText = wishlistCount > 99 ? "99+" : wishlistCount;
        wishlistSummaryCountText =
            wishlistCount === 1
                ? `${wishlistCount} ${wishlistItemLabel}`
                : `${wishlistCount} ${wishlistItemLabelPlural}`;

        if (wishlistCount > 0) {
            wishlistHeaderCounter?.text(wishlistCountText).end().removeClass("hide-wishlist");
            wishlistHeaderCounter?.removeClass("hide-wishlist");
            wishlistSummaryCounter?.text(wishlistSummaryCountText);
            wishlistSummaryCount?.removeClass("hide-wishlist");
            wishlistPageCounter?.text(wishlistSummaryCountText);
            wishlistPageCount?.removeClass("hide-wishlist");
            wishlistHeaderIcon?.addClass("WishIconActive");
        } else {
            wishlistHeaderCounter?.addClass("hide-wishlist");
            wishlistHeaderCounter?.text("0");
            wishlistSummaryCount?.addClass("hide-wishlist");
            wishlistPageCount.addClass("hide-wishlist");
            wishlistHeaderIcon?.removeClass("WishIconActive");
        }
    }

    function showEmptyWishlistPage() {
        const emptyWishlistContent = $(".wishlist-page-empty-template").find(".wishlist-page__empty").clone();
        wishlistPage.empty().append(emptyWishlistContent);
    }

    function isWishlistPage() {
        return wishlistPage?.length > 0;
    }

    function bindShareWishlistSliderEvents() {
        if (!isWishlistPage()) return;

        $(".wishlist-page__header-share-button").click(function () {
            shareWishlistComponent.addClass("open");
        });

        $(document).mouseup(function (e) {
            var timerId;
            var container = $(".wishlist-share");
            var closeButton = $(".wishlist-share__close");
            clearTimeout(timerId);

            if ((!container.is(e.target) && container.has(e.target).length === 0) || closeButton.is(e.target)) {
                shareWishlistComponent.removeClass("open");
                timerId = setTimeout(() => {
                    resetShareWishlist();
                }, 1000);
            }
        });

        shareWishlistButton.click(function () {
            submitShareWishlist();
        });
    }

    function validateShareWishlistEmail() {
        const emailInputValue = wishListEmailInput.val().trim();

        if (!!!emailInputValue || emailInputValue == "") {
            return true;
        }

        if (
            !emailInputValue.match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            )
        ) {
            $(".wishlist-share__input-error-item.invalid-email").show();
            return false;
        }

        if (emailInputValue.length > 50) {
            $(".wishlist-share__input-error-item.excess-characters").show();
            return false;
        }

        return true;
    }

    function submitShareWishlist() {
        shareWishlistErrorMessageItem.hide();

        if (!validateShareWishlistEmail()) {
            return;
        }

        const recipients = wishListEmailInput.val().trim();

        if (recipients.length <= 0) {
            $(".wishlist-share__input-error-item.empty-input").show();
            return;
        }

        validateShareWishlistEmail();

        const sendCopyToUser = sendCopyCheckbox.is(":checked");

        shareWishlistButton.hide();
        wishlistSharingMessage.show();

        $.ajax({
            url: "/wscallbacks/wishlist/share/email",
            type: "POST",
            data: {
                recipients: recipients,
                sendCopyToUser: sendCopyToUser,
            },
            success: function () {
                shareWishlistErrorMessageWrapper.add(wishlistSharingMessage).add(shareWishlistBody).hide();
                shareWishlistComplete.show();
            },
            error: function () {
                wishlistSharingMessage.add(shareWishlistErrorMessageItem).hide();
                shareWishlistErrorMessageWrapper.show();
            },
        });
    }

    function resetShareWishlist() {
        shareWishlistComplete
            .add(shareWishlistErrorMessageWrapper)
            .add(wishlistSharingMessage)
            .add(shareWishlistErrorMessageItem)
            .hide();
        shareWishlistBody.add(shareWishlistButton).show();
        sendCopyCheckbox.removeAttr("checked");
        wishListEmailInput.val("");
    }

    function removeFromWishlist(removeButton) {
        const productCardToRemove = removeButton.closest("[data-product-line-item]");
        const lineItemId = productCardToRemove.data("line-item-id");
        const sizeVariantId = productCardToRemove.data("productid");
        const variantId = productCardToRemove.data("productid").toString().substring(0, 8);
        const productCardsToRemove = $('[data-line-item-id="' + lineItemId + '"]');
        const productListItem = $("#navlist").find('li[li-productid="' + variantId + '"]');
        const isPDP = $(".ProdDetails");

        $.ajax({
            type: "POST",
            url: "/wishlist/remove",
            data: JSON.stringify(lineItemId),
            dataType: "json",
            contentType: "application/json",
            xhrFields: {
                withCredentials: true,
            },
            success: function (data) {
                checkRemovedFromWishlist(data, lineItemId, productCardsToRemove);

                if (productListItem.length > 0) {
                    handlePLPWishlistClass(false, productListItem);
                }

                if (isPDP.length > 0) {
                    checkIfProductOnWishlist(sizeVariantId);
                }

                if (wishlistPage.length > 0) {
                    var productCardsOnWishlistPage = wishlistPage.find(".product-line-card");
                    if (productCardsOnWishlistPage?.length == 0) {
                        showEmptyWishlistPage();
                    }
                }

                highlightIconIfProductsOnWishlistDy();
            },
            error: function () {
                ShowWishlistRemoveOrStockError(
                    productCardsToRemove,
                    productCardsToRemove.find("[data-line-error-label]"),
                    productCardsToRemove.find("[data-remove-error-message]"),
                    "line-error",
                );
            },
        });
    }

    function checkRemovedFromWishlist(
        data,
        lineItemId,
        productCardsToRemove,
        errorMessageType = "remove-error-message",
    ) {
        const dataLines = data?.data?.basket?.lines;
        const itemExists = dataLines?.some((x) => x.id === lineItemId);

        if (!itemExists) {
            productCardsToRemove.remove();
            updateWishlistJson();
        } else {
            ShowWishlistRemoveOrStockError(
                productCardsToRemove,
                productCardsToRemove.find("[data-line-error-label]"),
                productCardsToRemove.find("[data-" + errorMessageType + "]"),
                "line-error",
            );
        }
    }

    function ShowWishlistRemoveOrStockError(productCard, label, errorMessage, classToAdd) {
        label.text(errorMessage);
        productCard.addClass(classToAdd);
    }

    function updateWishlistSummary(data, showSlideout = true) {
        if (!wishlistSummary?.length) return;
        updateWishlistJson(data);
        showSlideout && showWishlistSlideOut();
    }

    function showWishlistSlideOut() {
        window.onWishlistMouseEnterCallback();
        wishlistContainerUl.animate({ scrollTop: 0 }, "slow");

        setTimeout(function () {
            if (wishlistSummary.find(":hover").length == 0) {
                window.onWishlistMouseLeaveCallback(null);
            }
        }, 3000);
    }

    function hideWishlistSlideOut() {
        wishlistContainerInHeader.removeClass("show-wishlist");
    }

    function handlePLPWishlistClass(addedToWishlist, productListItem) {
        const addToWishlistButton = productListItem.querySelector(".hotspotwishlist #aAddToWishList");

        if (addedToWishlist) {
            const addedToWishlistText = addToWishlistButton.getAttribute("data-addedwishlisttext");
            productListItem.querySelector(".hotspotwishlist").classList.add("addedWishList");
            productListItem
                .querySelector(".hotspotwishlist #aAddToWishList")
                .setAttribute("title", addedToWishlistText);
        } else {
            const addToWishlistText = addToWishlistButton.getAttribute("data-addtowishlisttext");
            productListItem.querySelector(".hotspotwishlist").classList.remove("addedWishList");
            productListItem.querySelector(".hotspotwishlist #aAddToWishList").setAttribute("title", addToWishlistText);
        }
    }

    function checkIfProductOnWishlist(sizeVariantId) {
        const wishlistSummary = $(".wishlist-summary .ul-container");
        if (wishlistSummary?.length > 0) {
            const existingItem = wishlistSummary.find("[data-productid=" + sizeVariantId + "]");
            const wishlistContainer = $("#addToWishListContainer").find("#aAddToWishList");
            const defaultText = wishlistContainer.data("addtowishlisttext");
            const addedText = wishlistContainer.data("addedwishlisttext");
            if (existingItem?.length > 0) {
                wishlistContainer.addClass("addedWishList");
                $(".wishListSVG").addClass("addedWishList");
                wishlistContainer.attr("title", addedText);
            } else {
                $(".wishListSVG.addedWishList").removeClass("addedWishList");
                wishlistContainer.removeClass("addedWishList");
                wishlistContainer.attr("title", defaultText);
            }
        }
    }

    function highlightIconIfProductsOnWishlistDy() {
        var dyContainer = $(".dy-anonymous-wishlist");

        if (dyContainer?.length > 0 && wishlistSummary?.length > 0) {
            var dyWishlistLink = dyContainer.find(".hotspotwishlist a");
            var defaultTitle = dyWishlistLink.data("defaulttitle");
            var wishlistSummaryItems = $(".wishlist-summary  .ul-container .product-line-card");

            dyContainer.find(".hotspotwishlist.addedWishList").removeClass("addedWishList");
            dyWishlistLink.attr("title", defaultTitle);

            wishlistSummaryItems?.each(function (item) {
                var productId = $(this).data("productid").toString().substring(0, 8);
                var productListItem = dyContainer.find(`[data-dy-variant-id='${productId}']`).closest(".swiper-slide");
                if (productListItem?.length > 0) {
                    var itemToUpdate = productListItem.find(".hotspotwishlist");
                    var linkToUpdate = itemToUpdate.find("a");
                    var addedTitle = linkToUpdate.data("addedtitle");
                    itemToUpdate.addClass("addedWishList");
                    linkToUpdate.attr("title", addedTitle);
                }
            });
        }
    }

    function highlightIconIfProductsOnWishlistPLP() {
        const wishlistSummary = $(".wishlist-summary .ul-container");
        const plpList = $("#navlist");

        if (plpList?.length > 0 && wishlistSummary?.length > 0) {
            const wishlistSummaryItems = $(".wishlist-summary  .ul-container .product-line-card");
            wishlistSummaryItems?.each(function (item) {
                const productId = $(this).data("productid").toString().substring(0, 8);
                const productListItem = plpList.find(`[li-productid='${productId}']`);
                if (productListItem?.length > 0) {
                    const addedText = productListItem
                        .find(".hotspotwishlist #aAddToWishList")
                        .data("addedwishlisttext");
                    productListItem.find(".hotspotwishlist").addClass("addedWishList");
                    productListItem.find(".hotspotwishlist #aAddToWishList").attr("title", addedText);
                }
            });
        }
    }

    function highlightIconIfProductOnWishlistPDP(sizeVariantId = undefined) {
        const addToWishlistContainerOnPdp = $(".WishListContain");

        if (addToWishlistContainerOnPdp?.length <= 0) return;

        if (wishlistContainerUl?.length > 0) {
            const selectedSizeVariantIdOnPdp =
                sizeVariantId?.length > 0 ? sizeVariantId : $("#hdnSelectedSizeVarId").val();
            const productInWishlist =
                JSON.parse(wishlistSummaryList?.attr("data-wishlist"))?.basketProductDetails?.find(
                    (x) => x.variantId == selectedSizeVariantIdOnPdp,
                ) ?? false;
            const wishlistContainer = addToWishlistContainerOnPdp.find(".wishListSVG");
            const defaultText = wishlistContainer.data("addtowishlisttext");
            const addedText = wishlistContainer.data("addedwishlisttext");

            if (productInWishlist) {
                wishlistContainer.addClass("addedWishList");
                wishlistContainer.attr("title", addedText);
            } else {
                wishlistContainer.removeClass("addedWishList");
                wishlistContainer.attr("title", defaultText);
            }
        }
    }

    function elevatedCartAndWishlistEnabled() {
        return wishlistSummary?.length > 0;
    }

    const anonymousWishlistPublicMethods = {
        updateWishlistSummary: (data, showSlideout = true) => {
            updateWishlistSummary(data, showSlideout);
        },
        highlightIconIfProductsOnWishlistPLP: highlightIconIfProductsOnWishlistPLP,
        highlightIconIfProductOnWishlistPDP: (sizeVariantId) => {
            highlightIconIfProductOnWishlistPDP(sizeVariantId);
        },
        removeFromWishlist: (removeButton) => {
            removeFromWishlist(removeButton);
        },
        wishlistContainerInHeader: wishlistContainerInHeader,
        elevatedCartAndWishlistEnabled: elevatedCartAndWishlistEnabled,
        highlightIconIfProductsOnWishlistDy: highlightIconIfProductsOnWishlistDy,
        updateWishlistJson: (data) => {
            updateWishlistJson(data);
        },
        hideWishlistSlideOut: hideWishlistSlideOut,
        isWishlistPage: isWishlistPage,
        handlePLPWishlistClass: (addedToWishlist, productListItem) => {
            handlePLPWishlistClass(addedToWishlist, productListItem);
        },
        checkIfProductOnWishlist: (sizeVariantId) => {
            checkIfProductOnWishlist(sizeVariantId);
        },
        bindShareWishlistSliderEvents: bindShareWishlistSliderEvents,
        showEmptyWishlistPage: showEmptyWishlistPage,
    };

    window.anonymousWishlist = anonymousWishlistPublicMethods;
})(window, window.jQuery);
