(function (window, $, Swiper, undefined) {
    "use strict";

    let swiperInstanceExists = false;
    let swiperElements = [];
    let selectedColourId = 0;
    const allMainImages = document.querySelectorAll("#productTwoImageCarousel .swiper-container-main .swiper-slide");
    const allThumbImages = document.querySelectorAll("#productTwoImageCarousel .swiper-container-thumbs .swiper-slide");
    let actualSwiperInstance;
    const thumbNavPrev = document.querySelector("#productThumbnails .pdp-carousel-prev");
    const thumbNavNext = document.querySelector("#productThumbnails .pdp-carousel-next");
    let hiddenThumbsOffset = 0;

    function initializeSwiper(colourId) {
        selectedColourId = colourId;

        slideVisibilityHandler(allMainImages, colourId);
        slideVisibilityHandler(allThumbImages, colourId);

        if (!swiperInstanceExists) {
            swiperElements.push({
                colourId: typeof colourId === "string" ? colourId : colourId.toString(),
                swiperInstance: new Swiper("#productRollOverPanel.swiper-container-main", {
                    slidesPerView: 1,
                    spaceBetween: 0,
                    thumbs: {
                        swiper: setSwiperThumbs(),
                        multipleActiveThumbs: true,
                    },
                    loop: false,
                    breakpoints: {
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 18,
                        },
                    },
                }),
            });

            actualSwiperInstance = getSwiperElement(selectedColourId);
            initializeSwiperNavigation();
            hiddenThumbsOffset = countElementsBeforeWithClass(actualSwiperInstance.thumbs.swiper.slides, "hide");
            handleSwiperNavigationVisibility();
            swiperInstanceExists = true;
        } else {
            handleSwiperUpdate();
        }
    }

    function slideVisibilityHandler(slides, colourId) {
        slides.forEach((slide) => {
            let isActive =
                slide.classList.contains("product-" + colourId) ||
                slide.classList.contains("amplienceProductVideoPlaceholder-" + colourId) ||
                slide.classList.contains("productVideoThumbnail-" + colourId);
            if (isActive) {
                slide.classList.remove("hide");
            } else {
                slide.classList.add("hide");
            }
        });
    }

    function setSwiperThumbs() {
        return new Swiper("#productThumbnails.swiper-container-thumbs", {
            slidesPerView: 5.5,
            spaceBetween: 4,
            watchSlidesProgress: true,
            breakpoints: {
                768: {
                    slidesPerView: 6,
                    spaceBetween: 18,
                },
            },
        });
    }

    function initializeSwiperNavigation() {
        thumbNavPrev.addEventListener("click", () => actualSwiperInstance.thumbs.swiper.slidePrev());
        thumbNavNext.addEventListener("click", () => actualSwiperInstance.thumbs.swiper.slideNext());

        actualSwiperInstance.thumbs.swiper.on("slideChange", () => handleSwiperNavigationVisibility());

        actualSwiperInstance.thumbs.swiper.off("tap");
        actualSwiperInstance.thumbs.swiper.slides.forEach((thumb) => {
            thumb.addEventListener("click", function () {
                actualSwiperInstance.slideTo(actualSwiperInstance.thumbs.swiper.clickedIndex - hiddenThumbsOffset);
                actualSwiperInstance.thumbs.swiper.updateSlidesProgress();
            });
        });

        actualSwiperInstance.on("slideChange", () => handleThumbActiveClass());
        actualSwiperInstance.on(
            "realIndexChange",
            () => (actualSwiperInstance.realIndex = actualSwiperInstance.thumbs.swiper.clickedIndex),
        );
    }

    function handleThumbActiveClass() {
        let mainSlideIndex = actualSwiperInstance.activeIndex;
        let thumbSlideIndex = hiddenThumbsOffset + mainSlideIndex;

        actualSwiperInstance.thumbs.swiper.slides.forEach((thumb, index) => {
            thumb.classList.remove("swiper-slide-thumb-active");
            if (index === thumbSlideIndex || index === thumbSlideIndex + 1)
                thumb.classList.add("swiper-slide-thumb-active");
            if (
                thumb.classList.contains("swiper-slide-thumb-active") &&
                !thumb.classList.contains("swiper-slide-visible")
            )
                actualSwiperInstance.thumbs.swiper.slideTo(thumbSlideIndex, 250, false);
        });
    }

    function countElementsBeforeWithClass(elements, className) {
        let count = 0;

        for (let i = 0; i < elements.length; i++) {
            if (elements[i].classList.contains(className)) {
                count++;
            } else {
                break;
            }
        }

        return count;
    }

    function handleSwiperUpdate() {
        actualSwiperInstance.setProgress(0, 250);
        actualSwiperInstance.update();
        actualSwiperInstance.thumbs.swiper.update();
        handleSwiperNavigationVisibility();
        hiddenThumbsOffset = countElementsBeforeWithClass(actualSwiperInstance.thumbs.swiper.slides, "hide");
        handleThumbActiveClass();
    }

    function handleSwiperNavigationVisibility() {
        actualSwiperInstance.thumbs.swiper.isBeginning
            ? thumbNavPrev.classList.add("hide")
            : thumbNavPrev.classList.remove("hide");
        actualSwiperInstance.thumbs.swiper.isEnd
            ? thumbNavNext.classList.add("hide")
            : thumbNavNext.classList.remove("hide");
    }

    function getSwiperImage(colourId) {
        return $("#productTwoImageCarousel .swiper-container-main").find("img");
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
    window.productTwoImageCarousel = {
        initializeSwiper: initializeSwiper,
        getSwiperImage: getSwiperImage,
        getSwiperElement: getSwiperElement,
        swiperElements: swiperElements,
    };
})(window, window.jQuery, window.Swiper);
