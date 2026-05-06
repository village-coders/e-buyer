(function (isTouchDevice) {
    "use strict";

    // Feature detection for passive support
    var supportsPassive = false;
    try {
        var opts = Object.defineProperty({}, "passive", {
            get: function () {
                supportsPassive = true;
            },
        });
        window.addEventListener("testPassive", null, opts);
        window.removeEventListener("testPassive", null, opts);
    } catch (e) {}

    /**
     * @function
     * @param {function()} swipeLeft - Function to execute when a 'swipe left' is detected
     * @param {function()} swipeRight - Function to execute when a 'swipe right' is detected
     * @param {boolean} preventsDefault - Define if either callback will call event.preventDefault()
     */
    HTMLElement.prototype.addHorizontalSwipeEventListener = function (swipeLeft, swipeRight, preventsDefault) {
        if (!isTouchDevice()) return;

        // If event.preventDefault() is called then we can't make the listener passive, even if the feature is supported
        var options = supportsPassive && !preventsDefault ? { passive: true } : false;

        this.addEventListener("touchstart", startTouch, options);
        this.addEventListener("touchmove", moveTouch, options);

        var initialX = null;
        var minX = Math.round(20 / window.devicePixelRatio);

        function startTouch(e) {
            initialX = e.touches[0].clientX;
        }

        function moveTouch(e) {
            if (initialX === null) {
                return;
            }

            var currentX = e.touches[0].clientX;
            var diffX = initialX - currentX;
            if (Math.abs(diffX) >= minX) {
                if (diffX > 0) {
                    // Swiped left
                    swipeLeft();
                } else {
                    // Swiped right
                    swipeRight();
                }
            }

            initialX = null;
        }
    };
})(window.isTouchDevice);
