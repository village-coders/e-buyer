(function (epsilon) {
    async function hashStringSHA256(string) {
        if (!string || typeof string !== "string") return null;

        string = string.toLowerCase().trim();
        const utf8 = new TextEncoder().encode(string);
        const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
        return hashHex;
    }

    const categoryStructure = () => {
        const breadcrumbs = document.querySelectorAll("#BreadcrumbGroup li:not(.back, .home, .breadcrumb-seperator)");
        if (breadcrumbs.length === 0) return "";

        const categoryStructureArr = Array.from(breadcrumbs).map(function (item) {
            return item.textContent.trim();
        });

        let categoryParams = "";
        categoryParams += categoryStructureArr[0] ? "&dtmc_department=" + categoryStructureArr[0] : "";
        categoryParams += categoryStructureArr[1] ? "&dtmc_category=" + categoryStructureArr[1] : "";
        categoryParams += categoryStructureArr[2] ? "&dtmc_sub_category=" + categoryStructureArr[2] : "";

        return categoryParams;
    };

    const cacheBuster = () => {
        return new Date().getTime().toString();
    };

    const basketItemMap = (lines) => {
        if (!lines || lines.length === 0) return undefined;
        return lines.map((line) => {
            return {
                product_id: line.id,
                item_quantity: line.qty,
                item_amount: line.price,
            };
        });
    };

    async function trackPageViewScript(promo_id, user_id, email, product_sku, product_brand, url) {
        const epsilon_view = document.createElement("script");
        epsilon_view.src =
            "https://www.sportsdirect.com/tag_path/profile/visit/js/1_0?dtm_cid=84364&dtm_cmagic=16037c&dtm_fid=8594" +
            (promo_id ? "&dtm_promo_id=" + promo_id : "") +
            (user_id ? "&dtm_user_id=" + user_id : "") +
            (email ? "&dtm_email_hash=" + (await hashStringSHA256(email)) : "") +
            categoryStructure() +
            (product_sku ? "&dtmc_product_id=" + product_sku : "") +
            (product_brand ? "&dtmc_brand=" + product_brand : "") +
            "&dtmc_loc=" +
            encodeURIComponent(url) +
            "&cachebuster=" +
            cacheBuster();

        document.head.appendChild(epsilon_view);
    }

    async function trackActionConversionScript(promo_id, user_id, email, transaction_id, url) {
        const cacheBuster_value = cacheBuster();

        const epsilon_action = document.createElement("script");
        epsilon_action.src =
            "https://www.sportsdirect.com/tag_path/profile/visit/js/1_0?dtm_cid=84364&dtm_cmagic=16037c&dtm_fid=8603" +
            (promo_id ? "&dtm_promo_id=" + promo_id : "") +
            (user_id ? "&dtm_user_id=" + user_id : "") +
            (email ? "&dtm_email_hash=" + (await hashStringSHA256(email)) : "") +
            (transaction_id ? "&dtmc_transaction_id=" + transaction_id + cacheBuster_value : "") +
            "&dtmc_loc=" +
            encodeURIComponent(url) +
            "&cachebuster=" +
            cacheBuster_value;

        document.head.appendChild(epsilon_action);
    }

    async function trackConversionScript(
        basket_lines,
        user_id,
        email,
        transaction_id,
        conversion_value,
        conversion_currency,
        conversion_type,
        store_location,
        url,
    ) {
        var basket_items = document.createElement("script");
        basket_items.innerHTML = `var dtm_config = { "dtm_items": ${JSON.stringify(basketItemMap(basket_lines))} };`;

        const epsilon_conversion = document.createElement("script");
        epsilon_conversion.src =
            "https://www.sportsdirect.com/tag_path/profile/visit/js/1_0?dtm_cid=84364&dtm_cmagic=16037c&dtm_fid=8595&dtm_promo_id=100" +
            (user_id ? "&dtm_user_id=" + user_id : "") +
            (email ? "&dtm_email_hash=" + (await hashStringSHA256(email)) : "") +
            (transaction_id ? "&dtmc_transaction_id=" + transaction_id : "") +
            (conversion_value ? "&dtm_conv_val=" + conversion_value : "") +
            (conversion_currency ? "&dtm_conv_curr=" + conversion_currency : "") +
            (conversion_type ? "&dtm_conv_type=" + conversion_type : "") +
            (store_location ? "&dtmc_conv_store_location=" + store_location : "") +
            "&dtmc_loc=" +
            encodeURIComponent(url) +
            "&cachebuster=" +
            cacheBuster();

        document.head.appendChild(basket_items);
        document.head.appendChild(epsilon_conversion);
    }

    epsilon.hashStringSHA256 = hashStringSHA256;
    epsilon.trackPageViewScript = trackPageViewScript;
    epsilon.trackActionConversionScript = trackActionConversionScript;
    epsilon.trackConversionScript = trackConversionScript;
})((window.epsilon = window.epsilon || {}));
