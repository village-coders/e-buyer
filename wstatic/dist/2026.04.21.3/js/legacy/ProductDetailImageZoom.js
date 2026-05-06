(function (window, $, productDetailsShared, queryutils, scriptService, isTouchDevice, undefined) {
    "use strict";

    let active = true;
    let zoomElement = null;
    let enabled = false;
    const desktopPixelBreakpoint = parseInt($("#hdnDesktopPixelBreakpoint").val());
    let imgURL = null;

    function teardown(isResponsive) {
        if (!zoomElement) {
            return;
        }

        const zoom = zoomElement.data("easyZoom");

        zoomElement
            .removeClass("is-loading is-ready is-error")
            .off("click")
            .off("mouseenter")
            .off("mouseleave")
            .off("mousemove");

        // Clone the element to clear away any listeners,
        // because they were set without function references
        if (isResponsive && isTouchDevice()) {
            const $newElement = zoomElement.clone();

            $newElement.appendTo(zoomElement.parent());
            zoomElement.remove();
            zoomElement = $newElement;

            if (window.innerWidth < desktopPixelBreakpoint) {
                const pinchZoomItems = $('[data-pinchzoom="true"]');

                if (!pinchZoomItems.length) {
                    return;
                }

                scriptService.load("legacy/pinch-zoom.js", function () {
                    pinchZoomItems.each(function () {
                        new window.RTP.PinchZoom($(this), {});
                    });
                });
            }
        }

        zoomElement.attr("style", "");
        $(".zoomMainImagePanel").remove();

        if (zoom) {
            zoomElement.removeData("easyZoom");
        }

        active = false;
    }

    function setZoom(parentId) {
        if (!enabled) {
            return;
        }

        if (!parentId) {
            parentId = "productRollOverPanel";
            teardown();

            zoomElement.easyZoom({
                id: "zoomMainImagePanel",
                parent: "#" + parentId,
                loading: "",
            });

            active = true;
        }
    }

    function setNewZoomForImageElement(imageElement) {
        if (!enabled) {
            return;
        }

        if (zoomElement && $(zoomElement).length > 0 && $(zoomElement).data("index") == $(imageElement).data("index")) {
            return;
        }

        teardown();

        if (imageElement) {
            zoomElement = $(imageElement);
        } else {
            zoomElement = $(
                "#divSlider_" + productDetailsShared.getCurrentColourVariant().ColVarId + " .zoomMainImage",
            ).first();
        }

        zoomElement.on("click", function (e) {
            e.preventDefault();
        });

        setZoom("productRollOverPanel_" + productDetailsShared.getCurrentColourVariant().ColVarId);
    }

    function setNewZoom(thumbId) {
        if (!enabled) {
            return;
        }

        if ($(".productImageCarousel").length > 0) {
            return;
        }

        const previouslyActive = active;
        teardown();
        const images = productDetailsShared.getCurrentColourVariantImages(
            productDetailsShared.getProductScope(zoomElement),
        );

        if (!images || !images.AlternateImages || !images.AlternateImages.length) {
            return;
        }

        if (!thumbId) {
            zoomElement.attr("href", images.ImgUrlXXLarge);
            if (previouslyActive) {
                setZoom();
                return;
            }
        }

        for (let i = 0; i < images.AlternateImages.length; i++) {
            const image = images.AlternateImages[i];

            if (image.ImgId === "piThumb" + thumbId) {
                zoomElement.attr("href", image.ImgUrlXXLarge);

                if (previouslyActive) {
                    setZoom();
                    break;
                }
            }
        }
    }

    function init(zoomImageElementId, setZoomParentId, $zoomImageElement) {
        enabled =
            $("#hdnDesktopZoomMainProductImageEnabled").val() === "true" &&
            $("#hdnProductZoomFullscreenEnabled").val() === "false";

        if (isTouchDevice() && window.innerWidth < desktopPixelBreakpoint) {
            const pinchZoomItems = $('[data-pinchzoom="true"]');

            if (!pinchZoomItems.length) {
                return;
            }

            scriptService.load("legacy/pinch-zoom.js", function () {
                pinchZoomItems.each(function () {
                    new window.RTP.PinchZoom($(this), {});
                });
            });
        }

        if (!enabled) {
            return;
        }

        if (!zoomImageElementId) {
            zoomImageElementId = "zoomMainImage";
        }

        if (!setZoomParentId) {
            setZoomParentId = "productRollOverPanel";
        }

        if ($zoomImageElement) {
            zoomElement = $zoomImageElement;
        } else {
            zoomElement = $("#" + zoomImageElementId);
        }
        zoomElement.on("click", function (e) {
            e.preventDefault();
        });

        $(window).resize(function () {
            if (window.innerWidth < desktopPixelBreakpoint) {
                teardown(true);
            } else {
                setZoom(setZoomParentId);
            }
        });

        if (window.innerWidth >= desktopPixelBreakpoint) {
            setZoom(setZoomParentId);
        }
    }

    function initProductZoomRollOver(initPinch) {
        if (initPinch) {
            const hdnProductZoomRollOverEnabled = $("#hdnProductZoomRollOverEnabled").val() === "true";
            const hdnProductZoomFullscreenEnabled = $("#hdnProductZoomFullscreenEnabled").val() === "true";
            const enablePinchZoomMainImage =
                $("#hdnPinchZoomProductMainImageEnabled").val() === "true" && isTouchDevice();

            if (hdnProductZoomRollOverEnabled || hdnProductZoomFullscreenEnabled) {
                $(".mainImageButtons .zoomButton").on("click", function (e) {
                    e.preventDefault();

                    if (enabled) {
                        setZoom();
                    } else {
                        showZoomPopup(this);
                    }
                });

                productDetailsShared.imgProduct().click(function (e) {
                    e.preventDefault();

                    if (enablePinchZoomMainImage || enabled) {
                        return;
                    }

                    showZoomPopup(this);
                });

                const $mobileZoomButton = $(".mobile_zoom_button");

                $mobileZoomButton.on("click", function (e) {
                    e.preventDefault();
                    showZoomPopup(this);
                });

                if (enablePinchZoomMainImage) {
                    $mobileZoomButton.remove();
                }

                $('a[id="SizeGuideLink"]').on("click", function () {
                    const modalOptions = {
                        modalName: "SizeGuidePopup",
                        wrapperClass: "popupSizeGuide",
                        titleHtml: "Size guide",
                    };

                    productDetailsShared.openPopUpModalWithAjaxContent(modalOptions, $(this)[0].href);

                    return false;
                });

                $('a[id$="LearnMore"]').on("ontouchstart touchstart click", function () {
                    const anchor = $(this)[0];

                    productDetailsShared.changePopupOrientation(productDetailsShared.popupModalClasses.popupSizes);
                    productDetailsShared.openPopUpModal([], anchor.href, true);

                    return false;
                });

                $(".popup360Button").on("click", function () {
                    scriptService.load("legacy/three-sixty.js", function () {
                        scriptService.load("legacy/frame-360.js", function () {
                            const mainImage = productDetailsShared.imgProduct();
                            const spinType = $("#Popup360ButtonWrapper").data("spintype");
                            let modalClass = productDetailsShared.popupModalClasses[spinType];

                            if (hdnProductZoomFullscreenEnabled) {
                                modalClass += ` ${productDetailsShared.popupModalClasses.popupFullscreen}`;
                                document.querySelector("html").classList.add("popupFullscreen-open");
                            }

                            const jqEl = $(this);
                            const parentEl = productDetailsShared.getProductScope(jqEl);

                            const modalOptions = {
                                modalName: "ThreeSixtyPopup",
                                wrapperClass: modalClass,
                                titleHtml: mainImage.data("popup360title"),
                            };

                            productDetailsShared.openPopUpModalWithContent(
                                modalOptions,
                                $("#three-sixty-modal-content").html(),
                                function (modal) {
                                    if (hdnProductZoomFullscreenEnabled) {
                                        document.querySelector("html").classList.remove("popupFullscreen-open");
                                    }

                                    modal.remove();
                                },
                            );

                            init360(productDetailsShared.getSelectedColourVariantValue(parentEl));
                        });
                    });

                    return false;
                });

                // handle spin querystring param
                if (queryutils.exists("spin")) {
                    const isSpin = queryutils.get("spin") === "true";

                    if (isSpin) {
                        $(".popup360Button").click();
                    }
                }
            }
        }

        function showZoomPopup(element) {
            let modalClass = null;
            let destroyZoomHandle = null;
            const mainImage = productDetailsShared.imgProduct();
            const hdnProductZoomRollOverEnabled = $("#hdnProductZoomRollOverEnabled").val() === "true";
            const hdnProductZoomFullscreenEnabled = $("#hdnProductZoomFullscreenEnabled").val() === "true";

            if (hdnProductZoomRollOverEnabled) {
                modalClass = productDetailsShared.popupModalClasses.popupLargeZoom;
            } else {
                modalClass = productDetailsShared.popupModalClasses.popupSmallZoom;
            }

            const parentEl = productDetailsShared.getProductScope($(element));
            const colcode = productDetailsShared.getSelectedColourVariantValue(parentEl);
            let url = "/ProductDetail/ProductDetailZoom?colcode=" + colcode;

            if (hdnProductZoomFullscreenEnabled) {
                imgURL = $(element).parent("a").attr("href");
                modalClass = productDetailsShared.popupModalClasses.popupFullscreen;
                url = "/ProductDetail/ProductDetailZoom?colcode=" + colcode + "&isFullscreen=true";
            }

            const modalOptions = {
                modalName: "ZoomPopup",
                wrapperClass: modalClass,
                titleHtml: mainImage.data("popuptitle"),
            };

            productDetailsShared.openPopUpModalWithAjaxContent(
                modalOptions,
                url,
                function () {
                    if (window.productDetailZoom) {
                        const imgProductZoom = document.getElementById("imgProductZoom");
                        imgProductZoom?.addEventListener("load", function () {
                            if (!destroyZoomHandle) {
                                destroyZoomHandle = productDetailZoom();
                            }
                        });

                        document.querySelector("html").classList.add("popupFullscreen-open");

                        if (hdnProductZoomFullscreenEnabled) {
                            setTimeout(function () {
                                //needs to be delayed until modal has fully loaded
                                document.querySelector(`.ZoomBody a[href="${imgURL}"]`)?.scrollIntoView();
                            }, 100);
                        }

                        if (hdnProductZoomRollOverEnabled) {
                            $(".productDetail-zoom a").easyZoomResponsive({
                                parent: "div.productDetail-zoom",
                            });
                        }
                    }
                },

                function (modal) {
                    if (destroyZoomHandle) {
                        destroyZoomHandle();
                    }

                    if (modal) {
                        modal.remove();
                        document.querySelector("html").classList.remove("popupFullscreen-open");
                    }
                },
            );

            return false;
        }

        const thumbImages = getThumbImages();
        const events = window.enableColourImagesFunctionality ? "mouseenter click" : "click";

        $('a[id$="apiThumb1"]').on(events, function (event) {
            thumbClickHandler(event, $(this));
        });

        // Assign an index to the each of the thumb nails rather than depend upon the name of the id
        $.each(thumbImages, function (i, obj) {
            const $el = $(obj);

            if (i == 0) {
                $el.addClass("piActiveThumb");
            }

            $el.data("thumbId", i + 1);
        });

        $(".piActiveThumb").parent().parent().find(".imgdot").addClass("piActiveDot");
        setupMainImagePrevNextButtons();
    }

    if ($(".ResponsiveProductDetail")[0] && !productDetailsShared.imgProduct().hasClass("bound")) {
        const productImage = document.querySelector("img.imgProduct");

        if (productImage) {
            productImage.addHorizontalSwipeEventListener(
                function () {
                    productImageButtonClickHandler("next");
                },
                function () {
                    productImageButtonClickHandler("previous");
                },
            );

            productDetailsShared.imgProduct().addClass("bound");
        }
    }

    function thumbClickHandler(event, newActiveThumbAnchor) {
        event.preventDefault();

        if (newActiveThumbAnchor.find("img").hasClass("piActiveThumb")) {
            return;
        }

        const thumbImages = getThumbImages();

        removeActiveThumbClass(thumbImages);
        newActiveThumbAnchor.find("img").addClass("piActiveThumb");
        newActiveThumbAnchor.parent().find(".imgdot").addClass("piActiveDot");

        const currentThumbNumber = getCurrentThumbNumber();

        if ($("#hdnProductZoomRollOverEnabled").val() === "false") {
            setSelectedThumbNumberForZoom(currentThumbNumber);
        }

        setNewZoom(currentThumbNumber);
        setNewProductImage(newActiveThumbAnchor);

        const newPiActiveThumbId = newActiveThumbAnchor.find("img").data("imgcolourid");

        setNewZoomAndSpinValues(newPiActiveThumbId);
    }

    function replaceProductVariantId(url, newVariantId) {
        return url.replace(/[\da-z]{2}\d{6}/gim, newVariantId);
    }

    function setNewZoomAndSpinValues(newActiveThumbId) {
        if (newActiveThumbId == null) {
            return;
        }

        const zoomControl = $(".zoomControl");

        if (zoomControl.length === 0) {
            return;
        }

        const href = zoomControl.attr("href");
        const newHref = replaceProductVariantId(href, newActiveThumbId);

        zoomControl.attr("href", newHref);
    }

    function setNewProductImage(newActiveThumbAnchor) {
        $("#productImageContainer .productImage img.imgProduct").attr("src", newActiveThumbAnchor.attr("href"));
    }

    function removeActiveThumbClass() {
        $('ul[id$="piThumbList"] li img.piActiveThumb').removeClass("piActiveThumb");
        $('ul[id$="piThumbList"] li div.piActiveDot').removeClass("piActiveDot");
    }

    function productImageButtonClickHandler(action) {
        const currentThumbNumber = getCurrentThumbNumber();
        const thumbImages = getThumbImages();
        const newActiveThumbIndex = getNewActiveThumbIndex(action, currentThumbNumber, thumbImages.length);

        removeActiveThumbClass();

        const newActiveThumbImage = $(thumbImages[newActiveThumbIndex]);

        newActiveThumbImage.addClass("piActiveThumb");
        newActiveThumbImage.parent().parent().find(".imgdot").addClass("piActiveDot");

        setSelectedThumbNumberForZoom(newActiveThumbIndex + 1);
        setNewProductImage(newActiveThumbImage.parent());
    }

    function getCurrentThumbNumber() {
        /// <summary>
        /// Retrieve the current thumb index
        /// </summary>
        let currentThumbNumber = 1;
        const thumbImage = $('ul[id$="piThumbList"] li img.piActiveThumb');

        if (thumbImage != null) {
            const thumbId = thumbImage.data("thumbId");

            if (thumbId !== undefined) {
                const thumbNumber = parseInt(thumbId);

                if (!isNaN(thumbNumber)) {
                    currentThumbNumber = thumbNumber;
                }
            }
        }

        return currentThumbNumber;
    }

    function getThumbImages() {
        const thumbImages = $("ul[id$='piThumbList'] li img.piThumb");

        return thumbImages;
    }

    function getNewActiveThumbIndex(action, currentThumbIndex, numberOfThumbs) {
        let newActiveThumbIndex = 0;

        if (action === "next") {
            // next
            newActiveThumbIndex = currentThumbIndex + 1;

            if (newActiveThumbIndex > numberOfThumbs) {
                newActiveThumbIndex = 1;
            }
        } else {
            // previous
            newActiveThumbIndex = currentThumbIndex - 1;

            if (newActiveThumbIndex < 1) {
                newActiveThumbIndex = numberOfThumbs;
            }
        }
        return newActiveThumbIndex - 1;
    }

    function setSelectedThumbNumberForZoom(currentThumbNumber) {
        productDetailsShared.imgProduct().data("popupindex", currentThumbNumber);
        setNewZoom(currentThumbNumber);
    }

    function setupMainImagePrevNextButtons() {
        const thumbImages = getThumbImages();

        if (thumbImages.length < 2) {
            $(".mainImagePrevNextButton").hide();
        } else {
            $(".mainImagePrevNextButton").show();
        }

        $(".mainImagePrevNextButton")
            .off("click")
            .on("click", function (event) {
                event.preventDefault();

                const handlerName = $(this).attr("rel") === "prev" ? "previous" : "next";

                productImageButtonClickHandler(handlerName);
            });
    }

    // Expose globals
    window.mainImageZoom = {
        init: init,
        setZoom: setZoom,
        setNewZoom: setNewZoom,
        setNewZoomForImageElement: setNewZoomForImageElement,
        enabled: enabled,
        initProductZoomRollOver: initProductZoomRollOver,
    };
})(window, window.jQuery, window.productDetailsShared, window.queryutils, window.scriptService, window.isTouchDevice);
