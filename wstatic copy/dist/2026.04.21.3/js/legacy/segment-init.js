if (typeof segmentData != "undefined") {
    !(function () {
        var analytics = (window.analytics = window.analytics || []);
        if (!analytics.initialize)
            if (analytics.invoked) window.console && console.error && console.error("Segment snippet included twice.");
            else {
                analytics.invoked = !0;
                analytics.methods = [
                    "trackSubmit",
                    "trackClick",
                    "trackLink",
                    "trackForm",
                    "pageview",
                    "identify",
                    "reset",
                    "group",
                    "track",
                    "ready",
                    "alias",
                    "debug",
                    "page",
                    "once",
                    "off",
                    "on",
                    "addSourceMiddleware",
                    "addIntegrationMiddleware",
                    "setAnonymousId",
                    "addDestinationMiddleware",
                ];
                analytics.factory = function (e) {
                    return function () {
                        var t = Array.prototype.slice.call(arguments);
                        t.unshift(e);
                        analytics.push(t);
                        return analytics;
                    };
                };
                for (var e = 0; e < analytics.methods.length; e++) {
                    var key = analytics.methods[e];
                    analytics[key] = analytics.factory(key);
                }

                analytics.load = function (key, e) {
                    var t = document.createElement("script");
                    t.type = "text/javascript";
                    t.async = !0;
                    if (segmentData.segmentClientAlwaysRun == true) {
                        t.setAttribute("data-ot-ignore", "");
                        t.setAttribute("class", "optanon-category-C0001");
                    }

                    t.src = "https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";
                    var n = document.getElementsByTagName("script")[0];
                    n.parentNode.insertBefore(t, n);
                    analytics._loadOptions = e;
                };
                analytics._writeKey = segmentData.clientKey;
                analytics.SNIPPET_VERSION = "4.13.2";

                if (typeof window.withFgpOneTrust === "function") {
                    var ga4Enabled = !!segmentData.googleAnalyticsDestinationEnabled;
                    withFgpOneTrust(analytics).load(segmentData.clientKey, {
                        integrations: { "Google Analytics 4 Web": ga4Enabled },
                    });
                } else {
                    analytics.load(segmentData.clientKey);
                }
            }
    })();

    // If the Segment analytics object exists and if analytics.user is a function.
    // Note: analytics.user may not exist if an ad-blocker is being used
    analytics.ready(function () {
        try {
            if (!analytics || typeof analytics.user !== "function") {
                console.error("Segment initialization failed. Analytics library not ready.");
                return;
            }

            const webUserId = segmentData.customerId;
            const userSignedIn = segmentData.userSignedIn === "true";
            const segmentAnonymousId = segmentData.cdpAnonymousId;

            if (segmentAnonymousId) {
                expireCookie("ajs_anonymous_id");
                analytics.user().anonymousId(segmentAnonymousId);
            } else {
                console.error("Segment Anonymous ID not found.");
            }

            if (userSignedIn && webUserId) {
                analytics.user().id(webUserId);
            } else {
                analytics.user().id(null);
            }

            segmentPageController.init(window.location.href);

            if (!!segmentData.zitchaIntegrationEnabled) {
                analytics.addSourceMiddleware(({ payload, next }) => {
                    payload.obj.context.features = payload.obj.context.features || {};
                    payload.obj.context.features.zitcha = true;

                    next(payload);
                });

                analytics.register(zitchaIntegration());
                analytics.isZitchRegistered = true;
            }

            analytics.page(
                document.title,
                segmentPageController.getPageProperties(),
                segmentPageController.getPageOptions(),
            );

            window.segmentInitComplete = true;
            dispatchEvent(new CustomEvent("segmentInitComplete"));

            function expireCookie(name) {
                document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
            }
        } catch (e) {
            console.error("Segment initialization failed", e);
            window.segmentInitFailed = true;
        }
    });
}
