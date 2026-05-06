$(function () {
    if (typeof window.initializeHotspotsQuickBuyAndWishListEvents == "function") {
        window.initializeHotspotsQuickBuyAndWishListEvents("ul div.RvStratImgQuick");
    }

    // Recently viewed swiper
    var recentlyViewedSwiper = new Swiper(".recently-viewed-swiper-container", {
        slidesPerView: "auto",
        centeredSlides: false,
        freeMode: true,
        freeModeFluid: true,
        navigation: {
            nextEl: ".rv-swiper-button-next",
            prevEl: ".rv-swiper-button-prev",
        },
        scrollbar: {
            el: ".rv-swiper-scrollbar",
        },
    });
});
