(function (window, $, undefined) {
    "use strict";

    var $window = $(window),
        $document = $(document),
        windowWidth,
        scrollTopVal;

    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    function throttle(callback, limit) {
        var wait = false;
        return function () {
            if (!wait) {
                callback.call();
                wait = true;
                setTimeout(function () {
                    wait = false;
                }, limit);
            }
        };
    }

    function windowFunctions(type) {
        switch (type) {
            case "scrollTopVal":
                $window.on("load scroll", function () {
                    scrollTopVal = $window.scrollTop();
                });
                break;
            case "windowWidth":
                $window.on("load resize", function () {
                    windowWidth = $window.width();
                });
                break;
        }
    }

    function sdAccordion() {
        var $sdAccordion = $(".sdAccordion"),
            accBreakpoint;

        windowFunctions("windowWidth");

        $sdAccordion.append('<span class="stateIndicator"></span>');

        $window.on("resize load", function () {
            accBreakpoint = $sdAccordion.attr("data-sd-breakpoint") || windowWidth + 1;

            $sdAccordion.siblings("ul").each(function () {
                var $this = $(this);
                var displayCheck = $this.css("display");
                if (displayCheck == "none" && windowWidth > accBreakpoint) {
                    $this.css("display", "block");
                }
                if (
                    displayCheck == "block" &&
                    windowWidth <= accBreakpoint &&
                    !$this.siblings(".sdAccordion").hasClass("activated")
                ) {
                    $this.css("display", "none");
                }
            });
        });

        function sdAccordion(element) {
            windowWidth <= accBreakpoint ? element.toggleClass("activated") : element.removeClass("activated");
            if (windowWidth <= accBreakpoint) {
                if (element.hasClass("activated")) {
                    $sdAccordion.siblings("ul").slideUp().end().removeClass("activated");
                    element.siblings("ul").slideDown().end().addClass("activated");
                } else {
                    element.siblings("ul").slideUp();
                }
            }
        }

        $sdAccordion.on("click", function (e) {
            if (windowWidth <= accBreakpoint) e.preventDefault();
            sdAccordion($(this));
        });
    }

    var mousePosition;
    var carouselSlider;
    var carouselInner;

    function carouselMover() {
        var a = carouselSlider.offset().left;
        var carouselSliderControl = carouselSlider.find("span");
        var carouselCalc = Math.min(
                Math.max(0, mousePosition - a - carouselSliderControl.width() / 2),
                carouselSlider.width(),
            ),
            sliderLimit = carouselSlider.width() / (carouselInner.width() - carousel.width());

        carouselSliderControl.css("left", carouselCalc);
        carouselInner.css("left", -(carouselCalc / sliderLimit));
    }

    function sdSlider(sliderType, sliderElement, sliderController) {
        var carouselType = sliderType,
            carousel = $(sliderElement),
            carouselContainer = carousel.parent(),
            carouselInner = carousel.children(),
            slideNumber = carouselInner.children().length,
            slideWidth = carouselInner.children().width(),
            slideHeight = carouselInner.children().height(),
            iv,
            touch;

        carouselSlider = $(sliderController);

        carousel.height(slideHeight);
        carouselInner.width(slideNumber * slideWidth);

        if (carouselType == "free") {
            carouselContainer.on("touchstart touchmove touchend mousedown mousemove mouseup", function (e) {
                if (e.originalEvent.touches) {
                    touch = e.originalEvent.touches[0];
                }
                if (e.type === "mousemove" || e.type === "touchmove") {
                    e.preventDefault();
                    mousePosition = e.pageX || touch.pageX;
                }
                if (e.type === "mousedown" || e.type === "touchstart") {
                    iv = setInterval(carouselMover, 100);
                }
                if (e.type === "mouseup" || e.type === "touchend") {
                    clearInterval(iv);
                }
            });

            $document.on("mouseup touchend", function () {
                clearInterval(iv);
            });
        }

        console.info("{sdSlider} [TYPE = " + carouselType + ", COUNT = " + slideNumber + "]");
    }

    function sdLazy(type, dist, wait) {
        var lazyElements = $(".sdLazy"),
            type = type || "recurring",
            dist = dist || 100,
            wait = wait || 50,
            arr = [],
            total,
            elementsDone;

        windowFunctions("scrollTopVal");

        lazyElements
            .each(function () {
                var $this = $(this),
                    topDist = $this.offset().top,
                    threshold = topDist + dist;

                var objecter = new lazyObject($this, threshold, topDist);
                arr.push(objecter);
            })
            .promise()
            .done(fader());

        function lazyObject(ele, thd, top) {
            this.element = ele;
            this.vis = thd;
            this.elementTop = top;
        }

        function fader() {
            total = arr.length;

            var efficientFader = throttle(function () {
                var screenBottom = scrollTopVal + $window.outerHeight();

                for (var i = 0; i < total; i++) {
                    if (screenBottom > arr[i].vis) {
                        arr[i].element.addClass("sdLazyVisible");
                        elementsDone = $(".sdLazyVisible").length;
                    }
                    if (type == "recurring") {
                        if (screenBottom < arr[i].elementTop) {
                            arr[i].element.removeClass("sdLazyVisible");
                        }
                    }
                }

                if (type == "once") {
                    if (total == elementsDone) {
                        $window.off("scroll", fader());
                        console.info("{sdLazy} [COMPLETED -- TOTAL = " + total + "]");
                    }
                }
            }, wait);

            $window.on("scroll load", efficientFader);
        }
    }

    function exists(paramName) {
        return window.location.search.indexOf(paramName) > -1;
    }

    function get(paramName) {
        var searchParts = window.location.search.substring(1).split("&"); // remove prefixed '?'

        var paramVal = "";
        for (var i = 0; i < searchParts.length; i++) {
            var parts = searchParts[i].split("=");
            if (parts[0] === paramName) {
                paramVal = parts[1] || "";
            }
        }

        return paramVal;
    }

    function attachDropdownWithImageDefaultSelectionHandler() {
        $(".image-dropdown-option").click(function () {
            var selectedText = $(this).data("text");
            var selectedImageUrl = $(this).find("img:first").attr("src");
            $(this).closest("#spanDropdownSelectedText:first", $(this).closest(".image-dropdown")).text(selectedText);
            $(this)
                .closest("#spanDropdownSelectedImage > img:first", $(this).closest(".image-dropdown"))
                .attr("src", selectedImageUrl);
        });
    }

    attachDropdownWithImageDefaultSelectionHandler();

    // Expose globals
    window.debounce = debounce;
    window.sdAccordion = sdAccordion;
    window.sdSlider = sdSlider;
    window.sdLazy = sdLazy;
    window.queryutils = {
        exists: exists,
        get: get,
    };
})(window, window.jQuery);
