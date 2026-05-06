(function (window, $, Swiper, undefined) {
    "use strict";

    var swiperContainerIdPrefix = "divSwiper_";
    var swiperElements = [];
    var activeContainer = null;
    var selectedColourId = 0;

    function initializeSwiper(colourId) {
        var swiperInstanceExists = getSwiperElement(colourId) != null;

        if (selectedColourId !== colourId) {
            $(".productRollOverPanel .swiper-container").hide();
            var swiperContainerElementId = "#" + swiperContainerIdPrefix + colourId;
            activeContainer = $(swiperContainerElementId);
            activeContainer.show();

            if (!swiperInstanceExists) {
                swiperElements.push({
                    colourId: typeof colourId === "string" ? colourId : colourId.toString(),
                    swiperInstance: new Swiper(swiperContainerElementId, {
                        navigation: {
                            nextEl: ".swiper-button-next",
                            prevEl: ".swiper-button-prev",
                        },
                        pagination: {
                            el: ".swiper-pagination",
                            type: "bullets",
                            clickable: true,
                        },
                        loop: false,
                        loopedSlides: 2,
                        slidesPerView: 1,
                        spaceBetween: 20,
                        // Disable preloading of all images
                        preloadImages: false,
                        // Enable lazy loading
                        lazy: {
                            //  tell swiper to load images before they appear
                            loadPrevNext: true,
                            // amount of images to load
                            loadPrevNextAmount: 2,
                        },
                        breakpoints: {
                            767: {
                                slidesPerView: 1.1,
                                spaceBetween: 5,
                            },
                        },
                    }),
                });
            }
            // Hack to reset the default image to the first slide
            var zeroPageIndex = activeContainer.find(".swiper-pagination-bullet").first();
            $(zeroPageIndex).click();

            setImageForZoom();
            selectedColourId = colourId;
            setSwiperSlideChange();
        }
    }

    function setSwiperSlideChange() {
        var productVariantContainer = $(".productVariantContainer");
        var selectedColour = productDetailsShared.getCurrentColourVariant(productVariantContainer);
        if (selectedColour == null) {
            selectedColour = productDetailsShared.getColourVariants()[0];
        }
        var currentColourVariantId = selectedColour.ColVarId;
        var swiperElement = getSwiperElement(currentColourVariantId);
        $(swiperElement).unbind();
        var activeIndex = -1;
        if (swiperElement != null) {
            swiperElement.on("slideChangeTransitionStart", function () {
                if (activeIndex != this.activeIndex) {
                    if (this.slides.length > 0) {
                        setImageForZoom();
                        activeIndex = this.activeIndex;
                    }
                }
            });
        }
    }

    function setImageForZoom() {
        var $easyzoom = $(activeContainer).find(".swiper-slide").not(".video-slide").productEasyZoom();
        $easyzoom.each(function (index, element) {
            var api = $(element).data("easyZoom");
            api.teardown();
            $(element).on("click.easyzoom", function (e) {
                e.preventDefault(); // Disable click event on image present in previous and next slide
            });
        });
        if (window.IsDesktopView()) {
            // activation zoom plugin
            var $activezoom = $(activeContainer).find(".swiper-slide-active").not(".video-slide").productEasyZoom();
        }
    }

    function getSwiperImage(colourId) {
        return $("#" + swiperContainerIdPrefix + colourId).find("img:first");
    }

    function getSwiperElement(colourVariantId) {
        if (swiperElements.length === 0) return null;
        if (!colourVariantId) return swiperElements[0];
        var matchedSwiper = swiperElements.filter(function (s) {
            var colourVariantIdStr = typeof colourVariantId === "string" ? colourVariantId : colourVariantId.toString();
            return s.colourId === colourVariantIdStr;
        });
        return matchedSwiper[0] && typeof matchedSwiper[0].swiperInstance !== "undefined"
            ? matchedSwiper[0].swiperInstance
            : null;
    }

    // Expose globals
    window.productImageCarousel = {
        initializeSwiper: initializeSwiper,
        getSwiperImage: getSwiperImage,
        getSwiperElement: getSwiperElement,
        swiperElements: swiperElements,
        setSwiperSlideChange: setSwiperSlideChange,
    };
})(window, window.jQuery, window.Swiper);
