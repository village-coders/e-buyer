(function (window, $, scriptService, isTouchDevice, undefined) {
    "use strict";

    function productDetailZoom() {
        if ($("#thumbList li").length < 2) {
            $("#ImgPrevImg_hr").css("visibility", "hidden"); //hide causes scrollbars to be added as the zoom window changes size
            $("#ImgNextImg_hr").css("visibility", "hidden");
        }
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function (searchString, position) {
                position = position || 0;
                return this.substr(position, searchString.length) === searchString;
            };
        }

        $("#ImgPrevImg_hr").click(function () {
            thumbButtonClickHandler("previous");
        });

        $("#ImgNextImg_hr").click(function () {
            thumbButtonClickHandler("next");
        });

        $("#prevThumbButtonLarge").click(function () {
            thumbButtonClickHandler("previous");
        });

        $("#nextThumbButtonLarge").click(function () {
            thumbButtonClickHandler("next");
        });

        $(".ThumbSelector").click(function (e) {
            e.preventDefault();
            setNewZoom($(this));
        });

        setupMobileItems();

        return setupZoom();
    }

    function setupMobileItems() {
        if (isTouchDevice()) {
            scriptService.load("legacy/pinch-zoom.js", function () {
                new window.RTP.PinchZoom($("#imgProductZoom"), {});
            });
        }
        if ($("#sliderDots").is(":visible")) {
            var dots = $('<ul class="dotThumbUl"></ul>');
            var dotTemplate = '<li class="dotThumbLi"  data-index="{{imageIndex}}"></li>';
            $("#thumbList .ThumbSelector").each(function (i, element) {
                dots.append(dotTemplate.replace("{{imageIndex}}", i + 1));
            });
            //insert dots
            $("#sliderDots").append(dots);

            var imgProductZoom = document.getElementById("imgProductZoom");
            imgProductZoom.addHorizontalSwipeEventListener(
                function () {
                    thumbButtonClickHandler("next");
                    setActiveDotClass();
                },
                function () {
                    thumbButtonClickHandler("previous");
                    setActiveDotClass();
                },
            );

            var sliderDots = $("#sliderDots li");
            sliderDots.first().addClass("activeDot");
            sliderDots.on("click", function (event) {
                event.preventDefault();
                var $this = $(this);
                var newActiveThumbIndex = $this.data("index");
                var newActiveThumbSelector = $("#aThumb" + newActiveThumbIndex);
                setNewZoom(newActiveThumbSelector);
                setActiveDotClass();
            });

            function setActiveDotClass() {
                sliderDots.removeClass("activeDot");
                var currentThumbNumber = getCurrentThumbNumber();
                sliderDots.filter("[data-index=" + currentThumbNumber + "]").addClass("activeDot");
            }

            setActiveDotClass();
        }
    }

    function thumbButtonClickHandler(action) {
        var thumbList = $("#thumbList");
        var currentThumbNumber = getCurrentThumbNumber();
        var thumbImages = getThumbImages();
        var newActiveThumbIndex = getNewActiveThumbIndex(action, currentThumbNumber - 1, thumbImages.length);
        var newActiveThumbImage = $(thumbImages[newActiveThumbIndex]);
        var newActiveThumbAnchor = newActiveThumbImage.parent();

        scrollAltImages(currentThumbNumber, newActiveThumbIndex + 1, thumbList);

        setNewZoom(newActiveThumbAnchor);
    }

    function setupZoom() {
        var zoomTarget = $("#zoomtarget");
        var destroyZoomHandle = zoomTarget.easyZoomResponsive({
            parent: "div#easyzoomOverlay",
        });

        return destroyZoomHandle;
    }

    function scrollAltImages(oldIndex, newIndex, thumbList) {
        if (oldIndex && newIndex) {
            var step = (newIndex - oldIndex) * 74;
            thumbList.animate({
                scrollTop: "+=" + step + "px",
            });
        }
    }

    function setNewZoom(newActiveThumbAnchor) {
        $(".ThumbSelector").removeClass("activeThumb");
        newActiveThumbAnchor.addClass("activeThumb");
        var imgProductZoom = $("#imgProductZoom");
        imgProductZoom.attr("src", newActiveThumbAnchor.attr("href"));

        var zoomImage = newActiveThumbAnchor.data("largimage");
        $("#zoomtarget").attr("href", zoomImage);
    }

    function getThumbImages() {
        return $("#thumbList .thumb");
    }

    function getCurrentThumbNumber() {
        var thumbImage = $("#thumbList .activeThumb");
        return thumbImage.data("index");
    }

    function getNewActiveThumbIndex(action, currentThumbIndex, numberOfThumbs) {
        var newActiveThumbIndex = 0;
        if (action == "next") {
            // next
            newActiveThumbIndex = currentThumbIndex + 1;
            if (newActiveThumbIndex == numberOfThumbs) {
                newActiveThumbIndex = 0;
            }
        } else {
            // previous
            newActiveThumbIndex = currentThumbIndex - 1;
            if (newActiveThumbIndex == -1) {
                newActiveThumbIndex = numberOfThumbs - 1;
            }
        }

        return newActiveThumbIndex;
    }

    // Expose globals
    window.productDetailZoom = productDetailZoom;
})(window, window.jQuery, window.scriptService, window.isTouchDevice);
