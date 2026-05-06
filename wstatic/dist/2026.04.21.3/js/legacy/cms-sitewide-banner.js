window.addEventListener("DOMContentLoaded", function () {
    let isCmsSitewideEnabled = document.querySelector("body").classList.contains("cms-sitewide-banner-enabled");
    if (!isCmsSitewideEnabled) return;

    const sitewideBanner = document.querySelector(".sitewide-banner");
    const slides = sitewideBanner.querySelectorAll(".sitewide-banner_slide");
    const navigationLeft = sitewideBanner.querySelector(".sitewide-banner_navigation-left");
    const navigationRight = sitewideBanner.querySelector(".sitewide-banner_navigation-right");
    const slideCount = slides.length;
    let currentSlide = 0;
    let timer;

    //Do not run code after this point if there is only one slide
    if (slideCount > 1) {
        const moveSlide = (prevSlide = false) => {
            slides[currentSlide].classList.remove("active-slide");
            currentSlide = prevSlide ? (currentSlide - 1 + slideCount) % slideCount : (currentSlide + 1) % slideCount;
            slides[currentSlide].classList.add("active-slide");
        };

        const startSlideTimer = () => {
            timer = setInterval(() => {
                moveSlide();
            }, 5000);
        };

        // Higher up to start timer earlier
        startSlideTimer();

        const handleNavigationClick = (isPrev = false) => {
            clearInterval(timer);
            moveSlide(isPrev);
            startSlideTimer();
        };

        if (navigationRight) {
            navigationRight.addEventListener("click", () => handleNavigationClick());
        }

        if (navigationLeft) {
            navigationLeft.addEventListener("click", () => handleNavigationClick(true));
        }
    }

    //Countdowns
    function sitewideCountdowns() {
        const countdownElements = document.querySelectorAll(".sitewide-banner_countdown");

        countdownElements.forEach((element) => {
            const targetDateStr = element.getAttribute("data-targettime");
            const targetDate = new Date(targetDateStr);
            const abbreviateDate = element.getAttribute("data-abbreviatedtime") == "True";

            function updateCountdown() {
                const now = new Date();
                const timeRemaining = targetDate - now;

                if (timeRemaining <= 0) {
                    clearInterval(intervalId);
                    element.style.display = "none";
                    return;
                }

                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                abbreviateDate
                    ? (element.textContent = `${days} days, ${hours} hrs, ${minutes} mins, ${seconds} secs`)
                    : (element.textContent = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
            }

            const intervalId = setInterval(updateCountdown, 1000);
        });
    }

    // Start all countdowns
    sitewideCountdowns();
});
