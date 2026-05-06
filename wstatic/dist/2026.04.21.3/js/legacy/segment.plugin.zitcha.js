const zitchaIntegration = () => {
    let user;

    function getCustomerIdentifiers() {
        return [
            {
                type: "customer_id",
                value: segmentData.externalCustomerId,
                system: "global",
            },
        ];
    }

    function getPageLocation(relativeUrl) {
        const slash = relativeUrl.startsWith("/") ? "" : "/";
        return window.location.origin + slash + relativeUrl;
    }

    function isValidZitchaEventType(event) {
        switch (event?.properties?.name?.toString().toLowerCase()) {
            case 'sponsored product':
            case 'sponsored banner':
                return true;
            default:
                return false;
        }
    }

    function getAdFormat(event) {
        switch (event.properties.name.toLowerCase()) {
            case 'sponsored product':
                return 'native_product';
            case 'sponsored banner':
                return 'native_banner';
            default:
                return null;
        }
    }

    function handlePromotionClicked(context) {
        if (!isValidZitchaEventType(context.event)) return;

        const adFormat = getAdFormat(context.event);

        context.updateEvent("integrations.zitcha", {
            data: {
                customer_identifiers: getCustomerIdentifiers(),
                page_view_id: segmentData.pageViewId,
                page_location: getPageLocation(context.event.context.page.url),
                ad_format: adFormat,
                ad_id: context.event.properties.promotion_id,
                click_id: context.event.properties.clickId,
                placement_id: context.event.properties.position,
                source: "web",
            },
            schema: "iglu:com.zitcha/ad_click/jsonschema/1-0-5",
        });

        delete context.event.properties.clickId;
    }

    function handlePromotionViewed(context) {
        if (!isValidZitchaEventType(context.event)) return;

        const adFormat = getAdFormat(context.event);

        context.updateEvent("integrations.zitcha", {
            data: {
                customer_identifiers: getCustomerIdentifiers(),
                page_view_id: segmentData.pageViewId,
                page_location: context.event.context.page.url,
                placement_id: context.event.properties.position,
                ad_id: context.event.properties.promotion_id,
                target_url: getPageLocation(context.event.properties.target_url),
                ad_format: adFormat,
                source: "web",
            },
            schema: "iglu:com.zitcha/ad_impression/jsonschema/1-0-4",
        });
    }

    function handlePageView(context) {
        var zitchaData = {
            data: {
                customer_identifiers: getCustomerIdentifiers(),
                page_view_id: segmentData.pageViewId,
                page_location: context.event.context.page.url,
                language: context.event.context.page.language ?? "",
                locale: context.event.context.locale,
                source: "web",
            },
            schema: "iglu:com.zitcha/page_view/jsonschema/1-0-8",
        };

        const pageType = getPageType(context.event);
        if (!!pageType) {
            zitchaData.data.page_type = pageType;
        }

        context.updateEvent("integrations.zitcha", zitchaData);
    }

    function getPageType(event) {
        const pageType = event.context.page.type?.toLowerCase() ?? "";
        const isSearch = event.context.search != null && event.context.search != "";

        switch (pageType) {
            case "browse":
            case "browsepl":
            case "searchnoresults":
            case "categorylist":
                return isSearch ? "search" : "category";
            case "productdetail":
                return "details";
            case "brands":
            case "brandstore":
                return "branded";
            case "basket":
            case "checkout":
                return "cart";
            case "orderconfirmation":
                return "conversion";
            case "address":
            case "accountinformation":
            case "orderhistory":
            case "orderdetals":
            case "wishlistevent":
                return "account";
            case "contact":
            case "storefinder":
            case "storefindersearch":
            case "storedetails":
                return "about";
            default:
                return "";
        }
    }

    const zitcha = {
        // Identifies your plugin in the Plugins stack.
        // Access `window.analytics.queue.plugins` to see the full list of plugins
        name: "Zitcha Integrations",
        // Defines where in the event timeline a plugin should run
        type: "enrichment",
        version: "1.0.0",

        // use the `load` hook to bootstrap your plugin
        // The load hook will receive a context object as its first argument
        // followed by a reference to the analytics.js instance from the page
        load: (ctx, ajs) => {
            user = ajs.user();
        },

        // Used to signal that a plugin has been property loaded
        isLoaded: () =>
            segment &&
            typeof segment.getTrackingEnabled === "function" &&
            segment.getTrackingEnabled() &&
            user !== undefined,

        // Applies the plugin code to every `page` call in Analytics.js
        // You can override any of the existing types in the Segment Spec.
        page: (ctx) => {
            try {
                handlePageView(ctx);
            } catch (e) {
                console.error("Zitcha Plugin", e);
            }
        },

        track: (ctx) => {
            try {
                switch (ctx.event.event) {
                    case segment.events.promotionClicked:
                        handlePromotionClicked(ctx);
                        break;
                    case segment.events.promotionViewed:
                        handlePromotionViewed(ctx);
                        break;
                }
            } catch (e) {
                console.error("Zitcha Plugin", e);
            }

            return ctx;
        },
    };

    return zitcha;
};
