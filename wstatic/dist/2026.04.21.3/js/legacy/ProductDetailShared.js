(function (window, $, modalHelper, hashService, undefined) {
    "use strict";

    const pdpMainImageType = {
        ImageGrid: "imageGrid",
        Carousel: "carousel",
        VerticalSlider: "verticalSlider",
    };

    function getCurrentColourVariant(parentEl) {
        var variants = getColourVariants(parentEl);
        var selectedVariantId = getSelectedColourVariantValue(parentEl);
        for (var c = 0; c < variants.length; c++) {
            var colrVariant = variants[c];
            if (colrVariant.ColVarId.toLowerCase() === selectedVariantId.toLowerCase()) return colrVariant;
        }

        return null;
    }

    function getCurrentColourVariantImages(parentEl) {
        var colourVariant = productDetailsShared.getCurrentColourVariant(parentEl);
        return colourVariant ? colourVariant.ProdImages : null;
    }

    var productDetailsVariantsClass = ".ProductDetailsVariants";
    function getColourVariants(parentEl) {
        return $(productDetailsVariantsClass, parentEl).data("variants");
    }

    function getSelectedColourVariantValue() {
        return $(productDetailsVariantsClass).attr("data-selectedcolour") || "";
    }

    function getProductScope(childJqEl) {
        var el = childJqEl.parentsUntil(getProductScopesOnPage()).parent();
        if (el.length > 0) {
            return el.get(0);
        }
        var parent = childJqEl.parent();
        if (parent.hasClass("sdPageProductContainer")) {
            return parent;
        }
        return undefined;
    }

    // collapse colourways
    (function initExpandingColourways() {
        const ulColourImages = document.getElementById("ulColourImages");
        if (!ulColourImages) {
            return;
        }

        const hasExpandingColourways = ulColourImages.classList.contains("expandingColorways");
        if (!hasExpandingColourways) {
            return;
        }

        const colourImagesItem = ulColourImages.querySelector("li");
        if (!colourImagesItem) {
            return;
        }

        const colourImagesItemMarginBottom = parseInt(window.getComputedStyle(colourImagesItem).marginBottom, 10) || 0;
        const colourImagesItemMarginLeft = parseInt(window.getComputedStyle(colourImagesItem).marginLeft, 10) || 0;
        const notMobile = window.matchMedia("(min-width: 769px)");
        const colourways = ulColourImages.children.length;
        const colourwaysClass = "expandColourways";
        let colourImageItemHeight = colourImagesItem.offsetHeight || 1;
        let colourImageItemWidth = colourImagesItem.offsetWidth || 1;
        colourImageItemHeight += colourImagesItemMarginBottom;
        colourImageItemWidth += colourImagesItemMarginLeft;

        const setOverflowHeight = () => {
            const expandColourwaysElems = document.querySelector(`.${colourwaysClass}`);
            if (expandColourwaysElems === null) {
                return;
            }
            const colourwayOverflowHeight =
                ulColourImages.querySelector("li:last-child").offsetTop + colourImageItemHeight;
            ulColourImages.style.maxHeight = `${colourwayOverflowHeight}px`;
        };

        const expandColourways = (colourImagesInSpace) => {
            const plusColourways = Math.floor(colourways - colourImagesInSpace);
            const lastImage = ulColourImages
                .querySelector(`li:nth-child(${colourImagesInSpace}) img`)
                .getAttribute("src");
            const expandDiv = `
                <li class="colorwayExpandAction">
                    <a>
                        <div class="overlayColorway">
                            +${plusColourways}
                        </div>
                        <img src="${lastImage}"/>
                    </a>
                </li>
            `;
            ulColourImages
                .querySelector(`li:nth-child(${colourImagesInSpace - 1})`)
                .insertAdjacentHTML("afterend", expandDiv);
            const colourwayExpandActions = document.querySelectorAll(".colorwayExpandAction");

            colourwayExpandActions.forEach((element) => {
                element.addEventListener("click", (e) => {
                    e.preventDefault();
                    ulColourImages.classList.add(colourwaysClass);
                    setOverflowHeight();
                });
            });
        };

        const handleResizeAndLoad = () => {
            document.querySelector(".colorwayExpandAction")?.remove();
            const ulColourImagesWidth = ulColourImages.offsetWidth || 1;
            const ulColourImagesHeight = ulColourImages.offsetHeight || 1;
            const rowCount = Math.ceil(ulColourImagesHeight / colourImageItemHeight);
            const colourImagesInSpace = Math.floor(ulColourImagesWidth / colourImageItemWidth) * rowCount;
            const colourwaysOverflow = colourImagesInSpace - colourways < 0;

            if (colourwaysOverflow && notMobile.matches) {
                expandColourways(colourImagesInSpace);
            }

            setOverflowHeight();
        };
        window.addEventListener("load", handleResizeAndLoad);
        window.addEventListener("resize", debounce(handleResizeAndLoad, 200));
    })();

    function getProductScopesOnPage() {
        return $(".ContentPane");
    }

    function imgProduct() {
        /// <summary>
        /// Main Image
        /// </summary>
        return $("img.imgProduct");
    }

    var popupModal;
    $(function () {
        popupModal = modalHelper.setupModal({
            cssClass: "ProductDetailModals PopUpModal",
            titleHtml: $(".SizeGuideText").html(),
        });
    });

    var popupModalClasses = {
        // <summary>Contains all the popup modal classes to swap out</summary>
        // <remarks>When adding new classes be sure to update the javascript in ViewRatingAndComments.ascx classes object</remarks>
        popupSmallZoom: "popupSmallZoom",
        popupSizes: "popupSizes",
        popupFrame360: "popupFrame360",
        popupThreesixty: "popupThreesixty",
        popupFrameThreesixty: "popupFrameThreesixty",
        popupLargeZoom: "popupLargeZoom",
        popupFullscreen: "popupFullscreen",
        popupHeroProduct: "popupHeroProduct",
        popupReviewsAndRatings: "popupReviewsAndRatings",
        popupVideo: "popupVideo",
    };

    function changePopupOrientation(newClassName) {
        for (var className in popupModalClasses) {
            if (Object.prototype.hasOwnProperty.call(popupModalClasses, className)) {
                popupModal.removeClass(className);
            }
        }
        popupModal.addClass(newClassName);
    }

    function openPopUpModal(opts, href, isScrollBarVisible) {
        modalHelper.OpenIFrameModal(popupModal, opts, href, isScrollBarVisible);
        var height = $(window).height();
        $("iframe", popupModal).on("load", function () {
            if (height < 768) {
                $(".modal-body", popupModal).css("height", height - 46 + "px");
            }
        });
    }

    function openPopUpModalWithAjaxContent(opts, url, onModalReady, onModalClose) {
        $.ajax({
            cache: false,
            type: "GET",
            url: url,
            success: function (data) {
                var modal = openPopUpModalWithContent(opts, data, onModalClose);
                if (onModalReady) {
                    onModalReady(modal);
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                if (onModalClose) {
                    onModalClose();
                }
            },
        });
    }

    function openPopUpModalWithContent(opts, content, onModalClose) {
        var options = opts || {};
        var modalClass = options.wrapperClass || "";

        options.contentHtml = content;
        options.cssClass = "ProductDetailModals PopUpModal";

        var modal = window.modalHelper.setupModal(options);

        modal.addClass(modalClass);

        window.modalHelper.showModal(modal);

        modal.off("hidden.bs.modal").on("hidden.bs.modal", function () {
            if (onModalClose) {
                onModalClose(modal);
            }
        });
    }

    function hdnSelectedSizeName(parentEl) {
        return $('input[id$="hdnSelectedSizeName"]', parentEl);
    }

    function hdnSelectedSizeVarId(parentEl) {
        return $('input[id$="hdnSelectedSizeVarId"]', parentEl);
    }

    function getSelectedSizeVariantName(parentEl) {
        return hdnSelectedSizeName(parentEl).val();
    }

    function checkVariableExists(gVariable) {
        if (typeof gVariable !== "undefined") {
            return true;
        }
        return false;
    }

    function getQuantity(parentControl) {
        var qty = 1;
        if (checkVariableExists(window.multiplePurchasesVisible) && window.multiplePurchasesVisible) {
            qty = $('input[id$="ProductQty"]', parentControl).val();
        }
        return qty;
    }
    function getPrintessDetails(parentControl) {
        const printessContainer = parentControl.querySelector(".printess-container");

        if (!printessContainer) return null;

        const printessDetails = printessContainer.getAttribute("data-printess-save-details");

        if (!printessDetails) return null;

        return JSON.parse(printessDetails);
    }

    function addToBagBarActive() {
        var addToBagBar = $(".AddToBagBar");
        return addToBagBar.is(":visible");
    }

    function getSelectedSizeVariantValue(parentEl) {
        return hdnSelectedSizeVarId(parentEl).val();
    }

    function isSizeSelected(parentControl) {
        var sizeVariantId = getSelectedSizeVariantValue(parentControl),
            variantIsOk = sizeVariantId != "";
        return variantIsOk;
    }

    function showSizeRequiredMessage(button, scope) {
        if (isSizeSelected(scope) || addToBagBarActive()) return false;
        sizeRequiredButtons.showMessage(button, scope);
        return true;
    }

    function showPersonalisationMandatoryMessage(scope) {
        const isPersonalisationMandatory = getCurrentColourVariant(scope)?.PrintessPersonalisationMandatory ?? false;

        if (!isPersonalisationMandatory || isPersonalisationApplied()) return false;

        const persButton = $(scope).find('.printess-button-cta');
        const persPopover = persButton.data('bs.popover');
        const persMandatoryText = 'Personalisation is mandatory';

        persPopover.options.content = persMandatoryText;
        persButton.popover("show");
        persPopover.tip().find('.popover-content').text(persMandatoryText);

        return true;
    }

    function isPersonalisationApplied() {
        return document.querySelector(".printess-container.personalisation-applied") !== null;
    }

    function isProductPersonalised(parentEl) {
        return $("div[id$='pnlPersonalisation']", parentEl).length > 0;
    }

    function isProductMyIdPersonalised() {
        return $("#pnlPersonalisation.pnlMyIdPersonalisation").attr("class") === "pnlMyIdPersonalisation";
    }

    function hdnSelectedSizePreorderValue(parentEl) {
        return $('input[id$="hdnSelectedSizePreorderValue"]', parentEl);
    }

    function getBrand() {
        return {
            name: $("#lblProductBrand")
                .text()
                .replace(/\B\s+|\s+\B/g, ""),
            url: $(".brandLink").attr("href"),
        };
    }

    function isCompetition(parentEl) {
        return $(".addToBag", parentEl).find(".addToBagInner").data("iscompetition");
    }

    function _getSelectedSizeVariantPreorderValue(parentEl) {
        return hdnSelectedSizePreorderValue(parentEl).val();
    }

    function _isEVoucher(parentEl) {
        return $('div[id$="pnlEvoucher"]', parentEl).length > 0;
    }

    function _isEsdProduct(parentEl) {
        const sizesElement = document.getElementById("ulSizes");

        if (!sizesElement) return false;

        const selectedSizeValue = hdnSelectedSizeVarId(parentEl).val()?.slice(-3) ?? "";

        if (selectedSizeValue == "") return false;

        let selectedSizeElem = sizesElement.querySelector(`[data-sizevarid='${selectedSizeValue}']`);

        if (!selectedSizeElem) {
            selectedSizeElem = parentEl.querySelector(".sizeVariantHighlight");
        }

        const selectedSizeAttrValue = selectedSizeElem?.getAttribute("data-is-esd-product") ?? null;

        if (!selectedSizeAttrValue) return false;

        return JSON.parse(selectedSizeAttrValue);
    }

    function _isProductGated(parentEl) {
        return $(".ProductDetailsVariants", parentEl).attr("data-isgated");
    }

    function getProductVariantDetails(parentEl, overridePersonalisableFlag) {
        const productNameResults = $('[id$="ProductName"]', parentEl);
        const productName = productNameResults.length > 1 ? productNameResults[0].innerText : productNameResults.text();

        return {
            id: getSelectedSizeVariantValue(parentEl),
            isPeronalisable: overridePersonalisableFlag ? false : isProductPersonalised(parentEl),
            isMyIdPersonalisable: overridePersonalisableFlag ? false : isProductMyIdPersonalised(),
            isPreOrderable: _getSelectedSizeVariantPreorderValue(parentEl),
            ageRestriction: window.ageRestrictionVal ? window.ageRestrictionVal : null,
            isEVoucher: _isEVoucher(parentEl),
            isGated: _isProductGated(parentEl),
            name: productName,
            brand: getBrand(),
            isEsdProduct: _isEsdProduct(parentEl),
            printessPersonalisationMandatory: getCurrentColourVariant(parentEl)?.PrintessPersonalisationMandatory ?? false
        };
    }

    function isValidColCode(colCode) {
        if (colCode) {
            var variants = getColourVariants();
            if (variants) {
                return variants.some(function (v) {
                    return v.ColVarId.toUpperCase() === colCode.toString().toUpperCase();
                });
            }
        }
        return false;
    }

    // Expose globals
    window.productDetailsShared = {
        getCurrentColourVariant: getCurrentColourVariant,
        getCurrentColourVariantImages: getCurrentColourVariantImages,
        getColourVariants: getColourVariants,
        getSelectedColourVariantValue: getSelectedColourVariantValue,
        getProductScope: getProductScope,
        getProductScopesOnPage: getProductScopesOnPage,
        imgProduct: imgProduct,
        changePopupOrientation: changePopupOrientation,
        popupModalClasses: popupModalClasses,
        openPopUpModal: openPopUpModal,
        openPopUpModalWithAjaxContent: openPopUpModalWithAjaxContent,
        openPopUpModalWithContent: openPopUpModalWithContent,
        hdnSelectedSizeName: hdnSelectedSizeName,
        getSelectedSizeVariantName: getSelectedSizeVariantName,
        getQuantity: getQuantity,
        addToBagBarActive: addToBagBarActive,
        hdnSelectedSizeVarId: hdnSelectedSizeVarId,
        hdnSelectedSizePreorderValue: hdnSelectedSizePreorderValue,
        getSelectedSizeVariantValue: getSelectedSizeVariantValue,
        isSizeSelected: isSizeSelected,
        showSizeRequiredMessage: showSizeRequiredMessage,
        getProductVariantDetails: getProductVariantDetails,
        isProductPersonalised: isProductPersonalised,
        isProductMyIdPersonalised: isProductMyIdPersonalised,
        getBrand: getBrand,
        isCompetition: isCompetition,
        pdpMainImageType: function () {
            return pdpMainImageType;
        },
        isValidColCode: isValidColCode,
        getPrintessDetails: getPrintessDetails,
        showPersonalisationMandatoryMessage: showPersonalisationMandatoryMessage
    };

    function switchTab(selectedTabOption) {
        if (selectedTabOption.getAttribute("aria-selected") == true) {
            return;
        }

        const targetPanel = selectedTabOption.getAttribute("aria-controls");
        const targetPanelEl = document.getElementById(targetPanel);
        const panelsContent = document.querySelectorAll(".product-info-tab-content");

        panelsContent.forEach((elem) => {
            elem.classList.add("is-hidden");
        });

        productInfoTitle.forEach((elem) => {
            elem.classList.remove("is-active");
            elem.setAttribute("aria-selected", false);
        });

        targetPanelEl.classList.remove("is-hidden");
        selectedTabOption.classList.add("is-active");
        selectedTabOption.setAttribute("aria-selected", true);
    }

    const productInfoTitle = document.querySelectorAll(".product-info-tab-title");

    productInfoTitle.forEach((elem) => {
        elem.addEventListener("click", (e) => {
            return switchTab(e.currentTarget);
        });
    });
})(window, window.jQuery, window.modalHelper, window.hashService);
