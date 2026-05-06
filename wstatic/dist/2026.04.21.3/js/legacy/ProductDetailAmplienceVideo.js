(function (window) {
    const checkDownloadSpeed = async () => {
        let speed = 0;

        try {
            const response = await fetch("https://eu.httpbin.org/stream-bytes/500000");

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const startTime = new Date().getTime();
            const reader = response.body.getReader();
            let bytesRead = 0;
            let done = false;

            // Read the stream
            while (!done) {
                const { value, done: streamDone } = await reader.read();
                if (value) {
                    bytesRead += value.length;
                }
                done = streamDone;
            }

            const endTime = new Date().getTime();
            const duration = (endTime - startTime) / 1000;
            const bitsLoaded = bytesRead * 8;
            const bps = (bitsLoaded / duration).toFixed(2);
            const kbps = (bps / 1000).toFixed(2);
            const mbps = (kbps / 1000).toFixed(2);

            speed = mbps;
        } catch (error) {
            console.warn("Error fetching the file:", error);
        }

        return speed;
    };

    const getVideoUrlBasedOnSpeed = (videoId, speed, baseVideoUrl) => {
        let quality;

        switch (true) {
            case speed >= 0.1 && speed < 1.1:
                quality = "240p";
                break;
            case speed >= 5:
                quality = "720p";
                break;
            default:
                quality = "480p";
                break;
        }

        return `${baseVideoUrl}${videoId}/mp4_${quality}`;
    };

    const setVideoSources = async (baseVideoUrl) => {
        const videoElements = document.querySelectorAll("video[data-video-id]");
        const speed = await checkDownloadSpeed();

        videoElements.forEach((video) => {
            const videoId = video.getAttribute("data-video-id");
            const videoUrl = getVideoUrlBasedOnSpeed(videoId, speed, baseVideoUrl);
            const videoContainer = video.closest(".video-slide");

            video.setAttribute("src", videoUrl);
            video.load();
            video.muted = true;
            video.play();
            videoContainer?.querySelector(".swiper-lazy")?.remove();
            videoContainer?.querySelector(".swiper-lazy-preloader")?.remove();
            video.classList.remove("hide");
        });
    };

    const buildVideoHtml = async (baseVideoUrl) => {
        const videoUrl = productDetailsShared.getSelectedColourVariantValue();
        const speed = await checkDownloadSpeed();
        const fullVideoUrl = getVideoUrlBasedOnSpeed(videoUrl, speed, baseVideoUrl);
        const videoElement = document.createElement("video");

        videoElement.controls = true;
        videoElement.muted = true;
        videoElement.setAttribute("muted", "muted");
        videoElement.playsInline = true;
        videoElement.loop = true;
        videoElement.autoplay = true;
        videoElement.src = fullVideoUrl;

        return videoElement;
    };

    const showVideoModal = async (baseVideoUrl) => {
        const videoControl = document.querySelector(".videoControl");
        const videoData = videoControl?.getAttribute("data-videos");
        if (!videoData) return;

        const videoUrl = getVideoUrl();

        if (!videoUrl) return;

        const videoHtml = await buildVideoHtml(baseVideoUrl);
        const modalTitle = videoControl.getAttribute("data-videotitle");

        productDetailsShared.openPopUpModalWithContent(
            {
                titleHtml: modalTitle,
                wrapperClass: "video-modal",
            },
            videoHtml.outerHTML,
            (modal) => {
                modal[0].querySelector(".modal-body").innerHTML = "";
            },
        );
    };

    const bindVideoPlayButtons = (baseVideoUrl) => {
        document.querySelectorAll(".productDetailPlayButton")?.forEach((button) => {
            button.addEventListener("click", () => {
                showVideoModal(baseVideoUrl);
            });
        });
    };

    const getVideoUrl = (colVarId) => {
        const videoControl = document.querySelector(".videoControl");
        const videoData = videoControl?.getAttribute("data-videos");

        const removeExtension = (colour) => colour.replace(".mp4", "");
        const videoDataArray = JSON.parse(videoData)?.map(removeExtension);
        const selectedColour = !colVarId ? productDetailsShared.getSelectedColourVariantValue() : colVarId;
        const videoUrl = videoDataArray.find((x) => {
            return x == selectedColour;
        });

        return videoUrl;
    };

    const toggleVideoButtonDisplay = (colVarId) => {
        const productImageGrid = document.getElementById("productImageGrid");
        const productTwoImageCarousel = document.getElementById("productTwoImageCarousel");
        if (productImageGrid || productTwoImageCarousel) return;

        const videoUrl = getVideoUrl(colVarId);
        const videoPlayButtons = document.querySelectorAll(".productDetailPlayButton");

        if (!videoUrl) {
            videoPlayButtons.forEach((button) => button.classList.add("hide"));
        } else {
            videoPlayButtons.forEach((button) => button.classList.remove("hide"));
        }
    };

    const initVideoHandler = (baseVideoUrl) => {
        const productImageGrid = document.getElementById("productImageGrid");
        const productTwoImageCarousel = document.getElementById("productTwoImageCarousel");

        if (productImageGrid || productTwoImageCarousel) {
            setVideoSources(baseVideoUrl);
        } else {
            bindVideoPlayButtons(baseVideoUrl);
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        const baseVideoUrl = document.querySelector("[data-video-base-url]").getAttribute("data-video-base-url");
        if (!baseVideoUrl) return;

        initVideoHandler(baseVideoUrl);
    });

    window.ProductDetailAmplienceVideo = {
        toggleVideoButtonDisplay: toggleVideoButtonDisplay,
    };
})(window);
