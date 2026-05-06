(function (window, Swiper) {
    "use strict";
    function initializePdpFeaturesSwiper() {
        var pdpFeaturesSwiper = new Swiper(".swiper-container-pdpfeatures", {
            slidesPerView: 3.5,
            spaceBetween: 0,
            //centeredSlides: true,
            freeMode: true,
            //loop: false,
            speed: 700,
            threshold: 20,
            breakpoints: {
                1440: {
                    slidesPerView: 8,
                    slidesPerGroup: 8,
                },
                1220: {
                    slidesPerView: 7,
                    slidesPerGroup: 7,
                },
                1022: {
                    slidesPerView: 5,
                    slidesPerGroup: 5,
                },
                768: {
                    slidesPerView: 6.5,
                    slidesPerGroup: 6.5,
                },
                480: {
                    slidesPerView: 5.5,
                    slidesPerGroup: 5.5,
                },
                376: {
                    slidesPerView: 4.5,
                    slidesPerGroup: 4.5,
                },
            },
        });
    }

    function initializeShopTheLookSwiper() {
        var swiperDataEl = document.querySelector("#hdnShopTheLookSwiperData");
        if (!swiperDataEl) {
            return;
        }

        var swiperData = JSON.parse(swiperDataEl.value);

        var shopTheLookSwiper = new Swiper(".swiper-container-shop-the-look", {
            preloadImages: false,
            watchSlidesProgress: true,
            watchOverflow: true,
            lazy: true,
            navigation: {
                enabled: swiperData.navigationMobile,
                nextEl: ".swiper-button-nextLook",
                prevEl: ".swiper-button-prevLook",
            },
            pagination: {
                enabled: swiperData.paginationMobile,
                el: ".swiper-paginationLook",
                type: "bullets",
                clickable: true,
            },
            scrollbar: {
                enabled: swiperData.scrollbarMobile,
                el: ".swiper-scrollbar-shopLook",
                draggable: true,
            },
            slidesOffsetBefore: swiperData.sliderOffsetBeforeMobile,
            slidesOffsetAfter: swiperData.sliderOffsetAfterMobile,
            slidesPerView: swiperData.slidesPerViewMobile,
            slidesPerGroup: Math.floor(swiperData.slidesPerViewMobile),
            grid: {
                rows: 1,
            },
            spaceBetween: swiperData.spaceBetweenMobile,
            centeredSlides: false,
            loop: false,
            breakpoints: {
                [swiperData.breakpointTablet]: {
                    slidesOffsetBefore: swiperData.sliderOffsetBeforeTablet,
                    slidesOffsetAfter: swiperData.sliderOffsetAfterTablet,
                    slidesPerView: swiperData.slidesPerViewTablet,
                    slidesPerGroup: Math.floor(swiperData.slidesPerViewTablet),
                    spaceBetween: swiperData.spaceBetweenTablet,
                    scrollbar: {
                        enabled: swiperData.scrollbarTablet,
                    },
                    pagination: {
                        enabled: swiperData.paginationTablet,
                    },
                    navigation: {
                        enabled: swiperData.navigationTablet,
                    },
                    grid: {
                        rows: 1,
                    },
                },
                [swiperData.breakpointSmallDesktop]: {
                    slidesOffsetBefore: swiperData.sliderOffsetBeforeSmallDesktop,
                    slidesOffsetAfter: swiperData.sliderOffsetAfterSmallDesktop,
                    slidesPerView: swiperData.slidesPerViewSmallDesktop,
                    slidesPerGroup: Math.floor(swiperData.slidesPerViewSmallDesktop),
                    spaceBetween: swiperData.spaceBetweenSmallDesktop,
                    scrollbar: {
                        enabled: swiperData.scrollbarSmallDesktop,
                    },
                    pagination: {
                        enabled: swiperData.paginationSmallDesktop,
                    },
                    navigation: {
                        enabled: swiperData.navigationSmallDesktop,
                    },
                    grid: {
                        rows: swiperData.numberOfRows,
                    },
                },
                [swiperData.breakpointLargeDesktop]: {
                    slidesOffsetBefore: swiperData.sliderOffsetBeforeLargeDesktop,
                    slidesOffsetAfter: swiperData.sliderOffsetAfterLargeDesktop,
                    slidesPerView: swiperData.slidesPerViewLargeDesktop,
                    slidesPerGroup: Math.floor(swiperData.slidesPerViewLargeDesktop),
                    spaceBetween: swiperData.spaceBetweenLargeDesktop,
                    scrollbar: {
                        enabled: swiperData.scrollbarLargeDesktop,
                    },
                    pagination: {
                        enabled: swiperData.paginationLargeDesktop,
                    },
                    navigation: {
                        enabled: swiperData.navigationLargeDesktop,
                    },
                    grid: {
                        rows: swiperData.numberOfRows,
                    },
                },
            },
            on: {
                init: function () {
                    $(".s-productscontainer2.swiper-wrapper").css("visibility", "visible");
                },
            },
        });
    }

    //Expose globals
    window.productDetailSwiper = {
        initializePdpFeaturesSwiper: initializePdpFeaturesSwiper,
        initializeShopTheLookSwiper: initializeShopTheLookSwiper,
    };
})(window, window.Swiper);
