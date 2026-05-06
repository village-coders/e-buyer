const handleSashes = () => {
    const sashContainers = document.querySelectorAll("[data-sash-details]:not([data-sash-handled])");
    if (sashContainers.length === 0) return;

    let isPDP = false;

    // Create sash and append as child to container
    const createSash = (container, sash, position) => {
        let sashElement;

        // Sash element is either a link or a span, depending on
        // if the 'Url' property in sash details has a value
        if (!!(sash.Url || sash.url)) {
            sashElement = document.createElement("a");
            sashElement.href = sash.Url || sash.url;
        } else {
            sashElement = document.createElement("span");
        }

        // Set text and colours from sash details
        sashElement.textContent = sash.Text || sash.text;
        sashElement.style.color = sash.TextColour || sash.textColour;
        sashElement.style.backgroundColor = sash.BackgroundColour || sash.backgroundColour;
        if ((sash.BorderWidth || sash.borderWidth) && (sash.BorderColour || sash.borderColour)) {
            sashElement.style.borderStyle = "solid";
            sashElement.style.borderColor = sash.BorderColour || sash.borderColour;
            sashElement.style.borderWidth = `${sash.BorderWidth || sash.borderWidth}px`;
        }

        // Add classes for CSS to style sash correctly based on position
        sashElement.classList.add("product-sash");
        sashElement.classList.add(`product-sash--${position}`);

        // Append sash element as child to container
        container.appendChild(sashElement);
    };

    // Iterate through each sash container that requires initialisation
    sashContainers.forEach((container) => {
        // Set handled to true, to avoid duplicated child elements
        container.setAttribute("data-sash-handled", "true");

        // Get values for required data attributes
        const sashesJson = container.getAttribute("data-sash-details") || "";
        const touchPoint = container.getAttribute("data-sash-touchpoint") || "";

        if (!(sashesJson && touchPoint)) return;

        // Check if PDP
        if (touchPoint == "PDP") isPDP = true;

        // Get top left and bottom sashes based on current touch point
        const sashes = JSON.parse(sashesJson) || {};
        const touchPointSashes = (touchPoint == "PLP" ? sashes.PLP || sashes.plp : sashes.PDP || sashes.pdp) || {};

        // Create top left sash if present
        if (!!(touchPointSashes.TopLeft || touchPointSashes.topLeft)) {
            createSash(container, touchPointSashes.TopLeft || touchPointSashes.topLeft, "top-left");
        }

        // Create bottom sash if present
        if (!!(touchPointSashes.Bottom || touchPointSashes.bottom)) {
            createSash(container, touchPointSashes.Bottom || touchPointSashes.bottom, "bottom");
        }
    });

    // Don't continue with PDP code if not on PDP
    if (!isPDP) return;

    const hideSashesExcept = (productCode, isMainSash = false) => {
        if (isMainSash) {
            document.querySelectorAll("[data-sash-details]").forEach((container) => {
                const mainSash = container.getAttribute("data-sash-main");

                if (mainSash) {
                    container.classList.toggle("hidden", false);
                } else {
                    container.classList.toggle("hidden", true);
                }
            });
        } else {
            document.querySelectorAll("[data-sash-details]").forEach((container) => {
                const sashVariant = container.getAttribute("data-sash-variant");

                if (sashVariant == productCode) {
                    container.classList.toggle("hidden", false);
                } else {
                    container.classList.toggle("hidden", true);
                }
            });
        }
    };

    // Refresh sashes based on selected colours and sizes
    const refreshSashes = () => {
        setTimeout(() => {
            let fallback = true;
            let selectedColourVariantId = "";
            let selectedSizeVariantId = "";

            hideSashesExcept(null);

            // Attempt to determine selected colour from hash
            if (window.location.hash) {
                let hashSplit = window.location.hash.split("colcode=");
                if (hashSplit.length > 1) {
                    selectedColourVariantId = hashSplit[1];
                }
            }

            // If there's a sash applicable for the selected colour, show it and hide all others
            const selectedColour =
                document.querySelector("#ulColourImages li:hover") ||
                document.querySelector("#ulColourImages .variantHighlight");

            if (!!selectedColour || selectedColourVariantId) {
                selectedColourVariantId = selectedColour?.getAttribute("data-colvarid") ?? selectedColourVariantId;

                const selectedColourSashes = document.querySelectorAll(
                    `[data-sash-variant="${selectedColourVariantId}"]`,
                );
                if (!!selectedColourSashes.length) {
                    fallback = false;
                    hideSashesExcept(selectedColourVariantId);
                }
            }

            // If there's a sash applicable for the selected size, show it and hide all others
            const selectedSize =
                document.querySelector("#ulSizes li:hover") || document.querySelector("#ulSizes .sizeVariantHighlight");

            // Check if all size sashes for colour are the same
            let colourSizeVariants = [];
            for (let container of document.querySelectorAll("#ulSizes li")) {
                let variant = container.getAttribute("data-sizevarid");
                if (!variant) continue;
                let sash = document.querySelector(`[data-sash-variant="${selectedColourVariantId}${variant}"]`);
                if (!sash) continue;
                let sashDetails = sash.getAttribute("data-sash-details");
                if (!sashDetails) continue;
                colourSizeVariants.push({ variant, sash, sashDetails });
            }
            if (colourSizeVariants && colourSizeVariants.length > 0) {
                let colourSizeSashesSame = colourSizeVariants.every(
                    (s) => s.sashDetails == colourSizeVariants[0].sashDetails,
                );
                if (colourSizeSashesSame) {
                    selectedSizeVariantId = colourSizeVariants[0].variant;
                }
            }

            if (!!selectedSize || !!selectedSizeVariantId) {
                selectedSizeVariantId = selectedSize?.getAttribute("data-sizevarid") ?? selectedSizeVariantId;
                const selectedSizeSashes = document.querySelectorAll(
                    `[data-sash-variant="${selectedColourVariantId}${selectedSizeVariantId}"]`,
                );
                if (!!selectedSizeSashes.length) {
                    fallback = false;
                    hideSashesExcept(selectedColourVariantId + selectedSizeVariantId);
                }
            }

            // Fallback functionality for main variant
            if (fallback) {
                const mainSash = document.querySelectorAll('[data-sash-main="true"]');
                if (!!mainSash.length) {
                    hideSashesExcept(null, true);
                }
            }
        }, 0);
    };

    // Listen to changes for colours and sizes
    document.querySelectorAll("[data-colvarid]").forEach((a) => {
        a.addEventListener("click", refreshSashes);
        a.addEventListener("mouseover", refreshSashes);
        a.addEventListener("mouseout", refreshSashes);
    });

    document.querySelectorAll("[data-sizevarid]").forEach((a) => {
        a.addEventListener("click", refreshSashes);
    });

    refreshSashes();
};

window.addEventListener("productListUpdated", handleSashes);
window.addEventListener("DOMContentLoaded", handleSashes);
