jQuery(document).ready(function () {
    var backToTopDiv = jQuery(".back-to-top");
    if (backToTopDiv.length === 0) return;

    jQuery(window).scroll(function () {
        if (jQuery(this).scrollTop() > 220) {
            document.body.classList.add("show-back-to-top");
        } else {
            document.body.classList.remove("show-back-to-top");
        }
    });

    backToTopDiv.click(function (event) {
        event.preventDefault();
        jQuery("html, body").animate({ scrollTop: 0 }, 500);
        return false;
    });
});
