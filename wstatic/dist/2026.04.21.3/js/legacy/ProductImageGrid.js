(function (window, $, productDetailsShared) {
    "use strict";

    var rollOverContainerIdPrefix = "productRollOverPanel_";
    var imageIdPrefix = "zoomMainImage_";
    var activeContainer = null;
    var selectedColourId = 0;
    var breakpoint = window.matchMedia("(min-width:768px)");
    var desktopBreakpoint = window.matchMedia("(min-width:1022px)");
    var viewMore = { total: 0, gridImages: [], colCode: "" };

    function initializeImageGrid(colourId) {
        if (selectedColourId !== colourId) {
            if (!colourId || !productDetailsShared.isValidColCode(colourId)) {
                colourId = getDefaultColCode();
            }

            $("#productImageGrid .productRollOverPanel").addClass("hide");
            var rollOverContainerElementId = "#" + rollOverContainerIdPrefix + colourId;
            activeContainer = $(rollOverContainerElementId);
            activeContainer.removeClass("hide");
            $(".productRollOverPanel").removeClass("active");
            if (!$("#productRollOverPanel_" + colourId).hasClass("active"))
                $("#productRollOverPanel_" + colourId).addClass("active");

            selectedColourId = colourId;
            initSwiperOrDestroy();

            if (
                window.productImageGridViewMoreEnabled &&
                $("#productRollOverPanel_" + colourId).find(".viewMoreNumber").length < 1
            ) {
                $("#productRollOverPanel_" + colourId)
                    .find(".innerImageContainer")
                    .append("<a class='viewMoreNumber hide'></a>");
            }
        }

        gridDisplay();
    }

    function setViewMoreContainer(colourId) {
        const images = getGridImages(colourId);
        const totalImagesCount = images.length;
        let imageCap = 7;
        let hiddenImageTotal = 0;

        viewMore.total = 0;
        viewMore.gridImages = [];
        viewMore.colCode = colourId;

        if (window.productImageGridViewMoreEnabled) {
            if (breakpoint.matches && !desktopBreakpoint.matches) {
                imageCap = 4;
            }

            hiddenImageTotal = totalImagesCount - imageCap;

            for (var i = 0; i < totalImagesCount; ++i) {
                if (i >= imageCap && hiddenImageTotal > 1) {
                    images.eq(i).parents(".grid-item-swiper-slide").addClass("viewMoreHide");
                    ++viewMore.total;
                    viewMore.gridImages.push(images.eq(i).attr("src"));
                } else {
                    images.eq(i).parents(".grid-item-swiper-slide").removeClass("viewMoreHide");
                }
            }

            viewMoreGridHandler();
        }
    }

    function createViewMoreGrid(colourId) {
        var parent = $("#productRollOverPanel_" + colourId);
        if (parent.find(".viewMoreHide").length > 0) {
            parent.find(".viewMoreNumber").removeClass("hide").html("");
            for (var i = 0; i < 4; ++i) {
                if (!!viewMore.gridImages[i])
                    parent
                        .find(".viewMoreNumber")
                        .append(
                            "<div class='viewMoreImageGrid' style='background-image:url(" +
                                viewMore.gridImages[i] +
                                ")'</div>",
                        );
            }
            parent.find(".viewMoreNumber").prepend("<span>+" + viewMore.total + "</span>");
        }
    }

    function getDefaultColCode() {
        return $("div[id^='" + rollOverContainerIdPrefix + "']:first")
            .find("img:first")
            .data("colourcode");
    }

    function getGridImages(colourId) {
        return $("#" + rollOverContainerIdPrefix + colourId).find("img");
    }

    function viewMoreGridHandler() {
        if (breakpoint.matches === true) {
            createViewMoreGrid(viewMore.colCode);
        } else {
            $(".viewMoreNumber").addClass("hide");
        }
    }

    function gridDisplay() {
        $("#productImageGrid .productRollOverPanel").each(function () {
            var $this = $(this),
                imageColl = $this.find(".zoomMainImage"),
                singleImageClass = "gridDisplayOne";

            if (imageColl.length < 2) {
                $this.addClass(singleImageClass);
            }
        });
    }

    $("body").on("click", ".viewMoreNumber", function (e) {
        e.preventDefault();
        $(this).addClass("hide");
        $(this).siblings(".viewMoreHide").removeClass("viewMoreHide");
    });

    function initSwiperOrDestroy() {
        if (breakpoint.matches === true) {
            $("#productImageGrid .productRollOverPanel").each(function () {
                if ($(this)[0].swiper != undefined) {
                    $(this)[0].swiper.destroy();
                }
            });
        } else if (breakpoint.matches === false) {
            enableSwiper();
        }
    }

    function enableSwiper() {
        const swiperPaginationEnabled = $("#productImageGrid .swiper-pagination")?.length > 0;
        const slazengerOverride = $(".slazenger-swipper")[0] ? true : false;

        new Swiper("#productRollOverPanel_" + selectedColourId + ".swiper-container", {
            slidesPerView: swiperPaginationEnabled || slazengerOverride ? 1 : 1.1,
            spaceBetween: 4,
            a11y: true,
            grabCursor: true,
            scrollbar: {
                enabled: !swiperPaginationEnabled,
                el: ".swiper-scrollbar",
                draggable: true,
            },
            pagination: {
                enabled: swiperPaginationEnabled,
                el: ".swiper-pagination",
                type: "bullets",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
        });
    }

    breakpoint.addListener(initSwiperOrDestroy);
    breakpoint.addEventListener("change", viewMoreGridHandler);

    // Expose globals
    window.productImageGrid = {
        initializeImageGrid: initializeImageGrid,
        getGridImages: getGridImages,
        getDefaultColCode: getDefaultColCode,
        setViewMoreContainer: setViewMoreContainer,
    };
})(window, window.jQuery, productDetailsShared);
