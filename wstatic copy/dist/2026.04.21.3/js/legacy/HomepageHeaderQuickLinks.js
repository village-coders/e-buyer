document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector(".homepage-header-quick-links");

    if (slider == null || window.isTouchDevice()) return;

    const sliderLinks = slider.querySelectorAll("a");
    let isDown = false;
    let startX;
    let scrollLeft;
    let velX = 0;
    let momentumID;

    //Prevent Firefox being able to drag the "a" tags causing bad UI/UX by setting draggable to false
    sliderLinks.forEach((a) => a.setAttribute("draggable", "false"));

    slider.addEventListener("mousedown", (e) => {
        isDown = true;
        slider.classList.add("active");
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        cancelMomentumTracking();
    });

    slider.addEventListener("mouseleave", (e) => {
        isDown = false;
        e.preventDefault();
        slider.classList.remove("active");
    });

    slider.addEventListener("mouseup", () => {
        isDown = false;
        slider.classList.remove("active");
        beginMomentumTracking();
    });

    slider.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = x - startX; //scroll-fast
        var prevScrollLeft = slider.scrollLeft;
        slider.scrollLeft = scrollLeft - walk;
        velX = slider.scrollLeft - prevScrollLeft;
    });

    slider.addEventListener("wheel", (e) => {
        cancelMomentumTracking();
    });

    function beginMomentumTracking() {
        cancelMomentumTracking();
        momentumID = requestAnimationFrame(momentumLoop);
    }

    function cancelMomentumTracking() {
        cancelAnimationFrame(momentumID);
    }

    function momentumLoop() {
        slider.scrollLeft += velX * 2;
        velX *= 0.95;
        if (Math.abs(velX) > 0.5) {
            momentumID = requestAnimationFrame(momentumLoop);
        }
    }
});
