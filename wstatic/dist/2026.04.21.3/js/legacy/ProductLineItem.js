(function (window) {
    const wishlistPage = document.querySelector(".wishlist-page");
    const basketContainer = document.getElementById("basket-container");

    const createLineItem = (clonedItem, itemData) => {
        const lineItemNameValue = clonedItem.querySelector("[data-product-line-item-name-value]");
        const lineItemImage = clonedItem.querySelector("[data-product-line-item-image]");

        if (itemData.originalPrice == 0) {
            itemData.originalPrice = itemData.productSellingPrice;
            itemData.originalPriceText = itemData.productSellingPriceText;
            itemData.isFullPrice = true;
        }

        lineItemNameValue.innerText = itemData.productName;
        lineItemNameValue.setAttribute("href", itemData.productUrl);
        lineItemImage.setAttribute("src", getProductImage(itemData));
        lineItemImage.setAttribute("alt", itemData.productName);
        clonedItem.setAttribute("data-productid", itemData.variantId);
        clonedItem.setAttribute("data-product-taxonomy", itemData.taxonomy);
        clonedItem.setAttribute("data-line-item-id", itemData.lineItemId);
        clonedItem.setAttribute("data-prdurl", itemData.productUrl);
        clonedItem.setAttribute("data-is-pre-order", itemData.preOrderAvailableDateText?.length > 0);
        if (!lineIsWishlist(clonedItem)) {
            clonedItem
                .querySelector('[data-action="move-line-item-to-wishlist"]')
                .setAttribute("data-bag-line-item-id", itemData.lineItemId);
        }

        clonedItem.querySelector("[data-product-line-item-image-link]").setAttribute("href", itemData.productUrl);
        clonedItem.querySelector("[data-product-line-item-brand-value]").innerText = itemData.productBrand;
        const priceLabelElem = clonedItem.querySelector("[data-product-price-label]");
        if (priceLabelElem) {
            priceLabelElem.innerText = "RRP";
        }

        clonedItem.querySelector("[data-product-line-item-original-price-value]").innerText =
            itemData.originalPriceText;
        clonedItem.querySelector("[data-product-line-item-price-value]").innerText = itemData.productSellingPriceText;
        clonedItem.querySelector("[data-product-line-item-subtotal-value]").innerText = itemData.lineSubtotalText;
        clonedItem.querySelector("[data-product-line-item-subtotal-with-discount-value]").innerText =
            itemData.lineSubtotalText;
        clonedItem.querySelector("[data-product-line-item-colour-value]").innerText = itemData.productColour;
        clonedItem
            .querySelector("[data-product-line-item-quantity-value]")
            .setAttribute("data-original-quantity", itemData.productQuantity);
        clonedItem.querySelector("[data-product-line-item-quantity-value]").value = itemData.productQuantity;

        // MemberPricing
        if (
            clonedItem.querySelector("[data-product-line-item-memberprice-label]") &&
            clonedItem.querySelector("[data-product-line-item-memberprice-value]") &&
            clonedItem.querySelector("[data-product-line-memberprice-total-label]")
        ) {
            clonedItem.querySelector(".member-pricing").classList.add(itemData.memberPriceScheme);
            clonedItem.querySelector("[data-product-line-item-memberprice-label]").innerText =
                itemData.memberPriceSchemeLabel != null ? itemData.memberPriceSchemeLabel : "";
            clonedItem.querySelector("[data-product-line-item-memberprice-value]").innerText =
                itemData.memberPriceSchemeLabel != null ? itemData.unitMemberPriceConvertedFormatted : "";

            if (itemData.memberPriceSchemeLabel != null) {
                clonedItem.querySelector("[data-product-line-memberprice-total-label]").style.display = "block";
                clonedItem.querySelector("[data-product-line-memberprice-total-label]").innerText = "Price";
            } else {
                clonedItem.querySelector("[data-product-line-memberprice-total-label]").style.display =
                    itemData.memberPriceSchemeLabel != null ? "" : "none";
            }
        }

        //Printess Personalisation
        setPrintessPersonalisationDetails(clonedItem, itemData);

        setSummarySizeSelector(clonedItem, itemData);

        if (itemData.preOrderAvailableDateText?.length > 0) {
            clonedItem.querySelector("[data-product-line-preorder-date]").innerText =
                itemData.preOrderAvailableDateText;
            clonedItem.classList.add("is-preorder");
        }

        if (itemData.discounts.length > 0) {
            itemData.discounts.forEach((discount, i) => {
                const discountElement = clonedItem.querySelector("[data-product-line-item-discount]");
                if (i > 0) {
                    const clonedDiscountElement = discountElement.cloneNode();
                    clonedDiscountElement.innerText = discount;
                    discountElement.after(clonedDiscountElement);
                } else {
                    discountElement.innerText = discount;
                }
            });
            clonedItem.classList.add("has-discount");
        }

        if (!itemData.isFullPrice) {
            clonedItem.classList.add("has-savings");
        }

        if (itemData.lineError?.length) {
            clonedItem.querySelector("[data-line-error-label]").innerText = itemData.lineError;
            clonedItem.classList.add("is-line-error");
        }

        if (itemData.lineErrorTypes?.includes("OutOfStock")) {
            clonedItem.classList.add("is-out-of-stock");
        }

        if (itemData.hasPersonalisation) {
            clonedItem.querySelector("[data-personalisation-text]").innerHTML = itemData.personalisationText;
            clonedItem.classList.add("has-personalisation");
        }

        if (itemData.ageRestriction > 0) {
            clonedItem.querySelector("[data-age-restriction-text]").innerHTML = itemData.ageRestrictionText;
            clonedItem.classList.add("is-age-restricted");
        }

        if (itemData.suppliedBy?.length > 0) {
            var isSupplierNameOverrideEnabled = clonedItem.getAttribute(
                "data-is-dropship-suppliername-override-enabled",
            );
            if (isSupplierNameOverrideEnabled && isSupplierNameOverrideEnabled.toLowerCase() === "true") {
                clonedItem.querySelector("[data-dropship-text] strong").innerHTML = clonedItem.getAttribute(
                    "data-dropship-suppliername-override-value",
                );
            } else {
                clonedItem.querySelector("[data-dropship-text] strong").innerHTML = itemData.suppliedBy;
            }
            clonedItem.classList.add("is-dropship");
        }

        if (
            itemData.inStockQuantity >= itemData.basketLowStockFromValue &&
            itemData.inStockQuantity <= itemData.basketLowStockToValue
        ) {
            const lowStockElem = clonedItem.querySelector(".product-line-card__description-low-stock-message");
            const lowStockLabel = lowStockElem.querySelector("[data-low-stock-label]");
            lowStockLabel.innerText = itemData.basketLowStockMessage;
            lowStockLabel.style.color = itemData.basketLowStockMessageFontColour;
            lowStockElem
                .querySelector(".global-icon svg path")
                .setAttribute("fill", itemData.basketLowStockMessageFontColour);
            clonedItem.classList.add("is-low-stock");
        }

        return clonedItem;
    };

    const setPrintessPersonalisationDetails = (clonedItem, itemData) => {
        if (itemData.printessPersonalisationDetails?.printessPersChildItems == null) return;

        const printessContainer = clonedItem.querySelector(".printess-container");

        if (!printessContainer) return;

        const hideBreakdownCosts =
            !itemData.printessPersonalisationDetails.printessPersChildItems.every((x) => x.isChargeable) ||
            itemData.printessPersonalisationDetails.printessPersChildItems.length == 1;
        const labels = JSON.parse(printessContainer.dataset.printessLabels);
        let firstChild = printessContainer.firstChild;

        if (hideBreakdownCosts) printessContainer.classList.add("hide-breakdown-costs");

        const header = printessContainer.querySelector(".printess-header-container-template").cloneNode(true);
        header.querySelector("[data-header-total-value]").innerHTML =
            itemData.printessPersonalisationDetails.totalPersonalisationConvertedFormattedPrice;
        header.classList.remove("printess-header-container-template");

        const sortedPrintessChildItems = itemData.printessPersonalisationDetails.printessPersChildItems.sort(
            (a, b) => a.displayOrder - b.displayOrder,
        );
        sortedPrintessChildItems.forEach((x) => {
            const field = clonedItem.querySelector(".printess-field-container-template").cloneNode(true);
            const fieldValue =
                x.fieldType == "checkbox"
                    ? x.fieldValue == "true"
                        ? labels.filter((x) => x.name == "Yes")[0].value
                        : labels.filter((x) => x.name == "No")[0].value
                    : x.fieldValue;

            field.querySelector("[data-field-label]").innerHTML = x.fieldUiLabel;
            field.querySelector("[data-field-value]").innerHTML = fieldValue;
            field.querySelector("[data-field-price]").innerHTML = x.convertedFormattedPrice;
            field.querySelector("[data-field-quantity]").innerHTML = x.quantity;

            field.classList.remove("printess-field-container-template");
            printessContainer.insertBefore(field, firstChild);
        });

        firstChild = printessContainer.firstChild;
        printessContainer.insertBefore(header, firstChild);

        printessContainer.classList.remove("is-hidden");
    };

    const getProductImage = (itemData) => {
        if (!!itemData.printessPersonalisationDetails) return itemData.printessPersonalisationDetails.thumbnailUrl;

        return itemData.productImageMediumUrl;
    };

    const lineIsWishlist = (element) => {
        const result =
            element.closest("[data-product-line-item]").getAttribute("data-is-wishlist").toLowerCase() === "true"
                ? true
                : false;
        return result;
    };

    const setSummarySizeSelector = (clonedItem, lineItemData) => {
        const sizeSelector = clonedItem.querySelector("[data-product-line-item-size-options]");

        if (lineItemData?.sizes != null) {
            lineItemData?.sizes?.map((x) => {
                const option = new Option(x.text, x.value, x.selected, x.selected);
                option.disabled = x.disabled;
                sizeSelector.add(option);
            });
        } else {
            const option = new Option(lineItemData.productSize, lineItemData.variantId, true, true);
            sizeSelector.add(option);
        }
    };

    const bindSizeUpdateEvents = () => {
        const sizeSelectors = document.querySelectorAll("[data-product-line-item-size-options]");

        sizeSelectors.forEach((element) => {
            element.removeEventListener("change", sizeUpdateEvent);
            element.addEventListener("change", sizeUpdateEvent);
        });
    };

    const bindLineQuantityEvents = () => {
        let quantityButtons = document.querySelectorAll(".product-line-card__quantity-button");

        quantityButtons.forEach((element) => {
            element.removeEventListener("click", lineQuantityEvent);
            element.addEventListener("click", lineQuantityEvent);
        });
    };

    const bindRemoveLineItem = () => {
        const removeButtons = document.querySelectorAll('[data-action="remove-line-item"]');

        removeButtons.forEach((element) => {
            element.removeEventListener("click", lineRemoveEvent);
            element.addEventListener("click", lineRemoveEvent);
        });
    };

    function bindMoveToBagEvents() {
        const moveToBagItemButtons = document.querySelectorAll('[data-action="move-line-item-to-bag"]');

        moveToBagItemButtons.forEach((element) => {
            element.removeEventListener("click", moveLineItemResolver);
            element.addEventListener("click", moveLineItemResolver);
        });
    }

    function bindMoveToWishlistEvents() {
        const moveToWishlistItemButtons = document.querySelectorAll('[data-action="move-line-item-to-wishlist"]');

        moveToWishlistItemButtons.forEach((element) => {
            element.removeEventListener("click", moveLineItemResolver);
            element.addEventListener("click", moveLineItemResolver);
        });
    }

    const sizeUpdateEvent = (event) => {
        const element = event.target;
        const productLineCard = element.closest("[data-product-line-item]");
        const lineItemIsWishlist = lineIsWishlist(productLineCard);

        updateLineItem(productLineCard, lineItemIsWishlist, true);
    };

    const lineQuantityEvent = (event) => {
        const element = event.target;
        const lineItemIsWishlist = lineIsWishlist(element);
        const thisQuantInput = element.parentElement.querySelector('input[data-action="quantity"]');
        const productLineCard = element.closest("[data-product-line-item]");

        const actionType = event.target.dataset.action;

        if (actionType === "quant-up") {
            thisQuantInput.value++;
        } else {
            thisQuantInput.value--;
        }

        if (thisQuantInput.value <= 0) {
            thisQuantInput.value = 1;
        }
        checkQuantity(productLineCard, lineItemIsWishlist);
    };

    const debounce = (callback, wait) => {
        let timeoutId = null;

        return (...args) => {
            window.clearTimeout(timeoutId);

            timeoutId = window.setTimeout(() => {
                callback.apply(null, args);
            }, wait);
        };
    };

    const checkQuantity = debounce(function (productLineCard, lineItemIsWishlist) {
        const originalQuant = productLineCard
            .querySelector('[data-action="quantity"]')
            .getAttribute("data-original-quantity");
        const newQuant = productLineCard.querySelector('[data-action="quantity"]').value;
        if (newQuant === originalQuant) {
            return;
        } else {
            updateLineItem(productLineCard, lineItemIsWishlist);
        }
    }, 500);

    const lineRemoveEvent = (event) => {
        event.stopPropagation();
        const element = event.target;
        const lineItemIsWishlist = lineIsWishlist(element);
        const productLineCard = element.closest("[data-product-line-item]");

        removeLineItem(productLineCard, lineItemIsWishlist);
    };

    function moveLineItemResolver(event) {
        event.stopPropagation();
        const element = event.target;
        const lineItemIsWishlist = lineIsWishlist(element);
        const productCardToMove = element.closest("[data-product-line-item]");
        const sizeVariantId = productCardToMove.getAttribute("data-productid");
        const isPreOrder = productCardToMove.getAttribute("data-is-pre-order") === "true";
        const isMoveToBag = element.getAttribute("data-action") === "move-line-item-to-bag";
        const request = {
            variantDetails: {
                id: sizeVariantId,
            },
        };

        if (isPreOrder && isMoveToBag) {
            window.addToBagCoordinator.preOrderPromise = window.addToBagCoordinator._openPreorderPopup(
                request,
                isMoveToBag,
            );
            window.addToBagCoordinator.preOrderPromise.then(function () {
                moveLineItem(productCardToMove, lineItemIsWishlist);
                window.addToBagCoordinator.preOrderPromise = null;
                window.addToBagCoordinator._reset();
            });
        } else {
            moveLineItem(productCardToMove, lineItemIsWishlist);
        }
    }

    const cartViewUpdateAction = (data, productLineCard) => {
        const lineItemError = productLineCard.querySelector(".product-line-card__description-line-error-label");

        fetch("/cart/basketfrombody", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.text();
            })
            .then((html) => {
                if (window.location.href.indexOf("/cart") > 0) {
                    basketContainer.textContent = "";
                    toggleBasketEmptyClass(html);
                    basketContainer.innerHTML = html;
                    bindSizeUpdateEvents();
                    bindLineQuantityEvents();
                    bindMoveToBagEvents();
                    bindMoveToWishlistEvents();
                    bindRemoveLineItem();
                    window.Printess?.initPrintess();
                    window.bindPromoCodeSubmit();
                    window.bindCheckoutSubmit();
                    window.setupWishlistSwiper();
                }
            })
            .catch((error) => {
                lineItemError.innerHTML = error.message;
                productLineCard.classList.add("is-line-error");
            });
    };

    const updateLineItem = (productLineCard, lineItemIsWishlist, isSizeUpdate = false) => {
        const lineItemVariantIdUpdate = productLineCard.querySelector("[data-product-line-item-size-options]").value;
        const lineItemLineItemId = productLineCard.getAttribute("data-line-item-id");
        const lineItemQuantity = parseInt(productLineCard.querySelector(".product-line-card__quantity input").value);
        //const lineItemPrintessPersonalisation = getLineItemPrintessPersonalisationDetails(productLineCard, lineItemQuantity);
        const lineItemPrintessPersonalisation = productLineCard
            .querySelector(".printess-container")
            ?.getAttribute("data-printess-save-details");
        const lineItemError = productLineCard.querySelector(".product-line-card__description-line-error-label");
        const existingItemInWishlist = wishlistPage?.querySelector(`[data-productid="${lineItemVariantIdUpdate}"]`);
        const isApp = document.querySelector(".appOnly") !== null;

        let updateItems = [
            {
                lineItemId: lineItemLineItemId,
                quantity: lineItemQuantity,
                variantId: lineItemVariantIdUpdate,
                printessSaveDetails:
                    lineItemPrintessPersonalisation != "" ? JSON.parse(lineItemPrintessPersonalisation) : null,
            },
        ];

        if (existingItemInWishlist?.length > 0 && isSizeUpdate) {
            const existingItemInLinesLineItemId = existingItemInWishlist.attr("data-line-item-id");
            const existingItemInLinesQuantity = parseInt(
                existingItemInWishlist.find(".product-line-card__quantity input").val(),
            );

            updateItems.push({
                lineItemId: existingItemInLinesLineItemId,
                quantity: existingItemInLinesQuantity + lineItemQuantity,
                variantId: lineItemVariantIdUpdate,
            });

            updateItems[0].quantity = 0;
        }

        const requestObj = lineItemIsWishlist
            ? {
                  url: "/wishlist/updatewishlist",
                  data: updateItems,
              }
            : {
                  url: "/cart/basketfrombody",
                  data: {
                      Action: 1,
                      Lines: updateItems,
                      RenderPartialView: true,
                  },
              };

        fetch(requestObj.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestObj.data),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.text();
            })
            .then((html) => {
                if (lineItemIsWishlist) {
                    window.anonymousWishlist.updateWishlistJson();
                    if (window.location.href.indexOf("/wishlist") > 0) {
                        wishlistPage.textContent = "";
                        wishlistPage.innerHTML = html;
                    }
                    window.anonymousWishlist.bindShareWishlistSliderEvents();
                } else {
                    if (window.location.href.indexOf("/cart") > 0) {
                        basketContainer.textContent = "";
                        basketContainer.innerHTML = html;
                        window.bindPromoCodeSubmit();
                        window.bindCheckoutSubmit();
                        window.setupWishlistSwiper();
                        window.updateV12Panels();
                    }
                    if (!isApp) window.updateSkinBag();
                }

                bindSizeUpdateEvents();
                bindLineQuantityEvents();
                bindMoveToBagEvents();
                bindMoveToWishlistEvents();
                bindRemoveLineItem();
                window.Printess?.initPrintess();
            })
            .catch((error) => {
                lineItemError.innerHTML = error.message;
                productLineCard.classList.add("is-line-error");
            });
    };

    const updateWishlistPage = (productLineCard) => {
        const lineItemError = productLineCard.querySelector(".product-line-card__description-line-error-label");

        fetch("/wishlist/updatewishlist", {
            method: "POST",
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
                if (window.location.href.indexOf("/wishlist") > 0) {
                    wishlistPage.textContent = "";
                    wishlistPage.innerHTML = html;
                }

                bindSizeUpdateEvents();
                bindLineQuantityEvents();
                bindMoveToBagEvents();
                bindMoveToWishlistEvents();
                bindRemoveLineItem();
                window.Printess?.initPrintess();
            })
            .catch((error) => {
                lineItemError.innerHTML = error.message;
                productLineCard.classList.add("is-line-error");
            });
    };

    function getProductDetails(productLineCard) {
        if (!productLineCard) return;

        const id = productLineCard.getAttribute("data-productid");
        const taxonomy = productLineCard.getAttribute("data-product-taxonomy");
        const brand = productLineCard.querySelector("div[data-product-line-item-brand-value]").innerText;
        const name = productLineCard.querySelector("a[data-product-line-item-name-value]").innerText;
        const variant = productLineCard.querySelector("span[data-product-line-item-colour-value]").innerText;
        const quantity = productLineCard.querySelector("input[data-product-line-item-quantity-value]").value;
        const priceLabel = productLineCard.querySelector("span[data-product-line-item-price-value]").innerText;

        let price = undefined;
        const priceRegexResult = new RegExp("\\d+(?:\\.\\d+)*").exec(priceLabel);
        if (priceRegexResult?.length > 0) {
            price = priceRegexResult[0];
        }

        return {
            id,
            name,
            brand,
            variant,
            quantity,
            price,
            taxonomy,
            category: undefined,
        };
    }

    function mapToWishlistItem(productDetails) {
        return {
            id: productDetails.id,
            brand: productDetails.brand,
            name: productDetails.name,
            variant: productDetails.variant,
            category: productDetails.category,
            price: productDetails.price,
            taxonomy: productDetails.taxonomy,
            quantity: productDetails.quantity,
        };
    }

    const removeLineItem = (productLineCard, lineItemIsWishlist) => {
        const lineItemId = productLineCard.getAttribute("data-line-item-id");
        const variantId = productLineCard.getAttribute("data-productid").toString().substring(0, 8);
        const requestObj = lineItemIsWishlist
            ? {
                  url: "/wishlist/remove",
                  data: lineItemId,
                  variantId: variantId,
                  lineItemIsWishlist: true,
                  productLineCard: productLineCard,
              }
            : {
                  url: "/cart/basketfrombody",
                  data: {
                      Action: 2,
                      RemoveItemId: lineItemId,
                      RenderPartialView: true,
                  },
                  variantId: variantId,
                  lineItemIsWishlist: false,
                  productLineCard: productLineCard,
              };

        submitFetch(requestObj, moveAndRemoveLineItemCallback);

        if (lineItemIsWishlist) {
            const productDetails = getProductDetails(productLineCard);
            sendGtmCustomEvent({
                event: "wishlistRemoval",
                ecommerce: {
                    currencyCode: window._currencyFormatter.ActiveCurrency,
                    wishlistItems: [mapToWishlistItem(productDetails)],
                },
            });
        }
    };

    function moveLineItem(productCardToMove, lineItemIsWishlist) {
        const lineItemId = productCardToMove.getAttribute("data-line-item-id");
        const variantId = productCardToMove.getAttribute("data-productid")?.toString().substring(0, 8);
        const requestObj = lineItemIsWishlist
            ? {
                  url: "/wishlist/move",
                  data: lineItemId,
                  variantId: variantId,
                  lineItemIsWishlist: true,
                  productLineCard: productCardToMove,
              }
            : {
                  url: "/cart/basketfrombody",
                  data: {
                      Action: 5,
                      RemoveItemId: lineItemId,
                      RenderPartialView: true,
                  },
                  variantId: variantId,
                  lineItemIsWishlist: false,
                  productLineCard: productCardToMove,
              };

        submitFetch(requestObj, moveAndRemoveLineItemCallback);

        if (lineItemIsWishlist) {
            const productDetails = getProductDetails(productCardToMove);
            sendGtmCustomEvent({
                event: "moveToBasketFromWishlist",
                ecommerce: {
                    currencyCode: window._currencyFormatter.ActiveCurrency,
                    wishlistItems: [mapToWishlistItem(productDetails)],
                },
            });
        }
    }

    function moveAndRemoveLineItemCallback(requestObj, data) {
        const isApp = document.querySelector(".appOnly") !== null;
        const productListItem = document.querySelector('#navlist li[li-productid="' + requestObj.variantId + '"]');
        const isPDP = document.querySelector(".ProdDetails");

        if (!isApp) {
            if (requestObj.lineItemIsWishlist) {
                window.anonymousWishlist.updateWishlistJson(JSON.parse(data));
            } else {
                window.anonymousWishlist.updateWishlistJson();
            }

            window.updateSkinBag();

            if (window.anonymousWishlist.isWishlistPage()) {
                updateWishlistPage(requestObj.productLineCard);
            }
        }

        if (isApp) {
            cartViewUpdateAction(
                {
                    Action: 0,
                    RenderPartialView: true,
                },
                requestObj.productLineCard,
            );
        } else {
            if (window.location.href.indexOf("/cart") > 0) {
                if (requestObj.lineItemIsWishlist) {
                    cartViewUpdateAction(
                        {
                            Action: 0,
                            RenderPartialView: true,
                        },
                        requestObj.productLineCard,
                    );
                } else {
                    toggleBasketEmptyClass(data);
                    basketContainer.textContent = "";
                    basketContainer.innerHTML = data;
                    bindSizeUpdateEvents();
                    bindLineQuantityEvents();
                    bindMoveToBagEvents();
                    bindMoveToWishlistEvents();
                    bindRemoveLineItem();
                    window.bindPromoCodeSubmit();
                    window.bindCheckoutSubmit();
                    window.setupWishlistSwiper();
                    window.Printess?.initPrintess();
                    window.updateV12Panels();
                }
            }
        }

        if (!isApp) {
            if (productListItem) {
                window.anonymousWishlist.handlePLPWishlistClass(false, productListItem);
            }

            if (isPDP) {
                window.anonymousWishlist.checkIfProductOnWishlist(requestObj.variantId);
            }

            window.anonymousWishlist.highlightIconIfProductsOnWishlistDy();
        }
    }

    function toggleBasketEmptyClass(data) {
        if (data.indexOf("cart-page__empty") > 0) {
            basketContainer.classList.add("elevated-cart-is-empty");
        } else {
            basketContainer.classList.remove("elevated-cart-is-empty");
        }
    }

    function submitFetch(requestObj, callback) {
        fetch(requestObj.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestObj.data),
        })
            .then((response) => {
                const contentType = response.headers.get("Content-Type");

                if (contentType.includes("application/json")) {
                    return response.json();
                }

                if (contentType.includes("text/html")) {
                    return response.text();
                }
            })
            .then((data) => {
                callback(requestObj, data);
            })
            .catch((error) => {
                console.log(error);
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

    window.ProductLineItem = {
        createLineItem: createLineItem,
        bindSizeUpdateEvents: bindSizeUpdateEvents,
        bindLineQuantityEvents: bindLineQuantityEvents,
        bindMoveToBagEvents: bindMoveToBagEvents,
        bindMoveToWishlistEvents: bindMoveToWishlistEvents,
        bindRemoveLineItem: bindRemoveLineItem,
        updateLineItem: updateLineItem,
    };
})(window);
