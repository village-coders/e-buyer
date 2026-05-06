var segmentPageController = {
    // properties
    url: null,
    supportedParameters: null,
    parametersObject: null,
    segmentCookieExists: false,

    // methods
    init: function (url) {
        this.url = new URL(url);
        this.supportedParameters = segmentData.segmentSupportedParameters.split(",");

        if (segmentPageController.checkUrlIncludesSupportedParameter()) {
            this.setSegmentCookies();
        }

        this.segmentCookieExists = segmentPageController.checkSegmentCookieExists();

        if (this.segmentCookieExists) {
            this.parametersObject = JSON.parse(decodeURIComponent(this.getSegmentCookie("segmentParams")));
            this.modifyURL();
        }
    },

    getPageProperties: function () {
        var pageProps = {
            shop_code: segmentData.branchCode,
            fascia: segmentData.shortCode,
        };

        if (segmentData.userSignedIn === "true") {
            pageProps.fascia_id = segmentData.fasciaId;
        }

        if (this.segmentCookieExists) {
            pageProps.search = this.url.search;
            pageProps.url = this.url.toString();
        }

        return pageProps;
    },

    getPageOptions: function () {
        var pageContext = {
            language: segmentData.language,
            type: segmentData.pageType,
        };

        const parameters = this.parametersObject || {};
        let captiv8Campaign = null;

        if (parameters.utm_source?.toLowerCase() === "c8") {
            captiv8Campaign = parameters;
        }

        const result = {
            context: {
                sourcePlatform: "FGP",
                page: pageContext,
                sessionId: segmentData.sessionId,
                experienceId: segmentData.experienceId,
                ...(captiv8Campaign && {
                    campaign: {
                        id: captiv8Campaign.c8cid,
                        content: captiv8Campaign.utm_content,
                        medium: captiv8Campaign.utm_medium,
                        name: captiv8Campaign.utm_campaign,
                        source: captiv8Campaign.utm_source,
                    },
                }),
            },
        };

        return result;
    },

    getGclid: function (data) {
        if (this.parametersObject && this.parametersObject.gclid) {
            data.gclid = this.parametersObject.gclid;
        }
    },

    setSegmentCookies: function () {
        document.cookie = `segmentParams=${encodeURIComponent(this.convertQueryStringToJSONString())}`;
    },

    getSegmentCookie: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    checkUrlIncludesSupportedParameter: function () {
        if (this.supportedParameters.some((param) => this.url.search.includes(param))) {
            return true;
        }
        return false;
    },

    checkSegmentCookieExists: function () {
        if (document.cookie.match(/^(.*;)?\s*segmentParams\s*=\s*[^;]+(.*)?$/)) {
            return true;
        }
        return false;
    },

    modifySearchParams: function () {
        var modifiedUrlParams = new URLSearchParams(this.url.search);

        Object.entries(this.parametersObject).forEach(([key, value]) => {
            if (this.supportedParameters.includes(key)) {
                modifiedUrlParams.set(key, value);
            }
        });

        return modifiedUrlParams;
    },

    modifyURL: function () {
        this.url.search = this.modifySearchParams().toString();
    },

    convertQueryStringToJSONString: function () {
        var pairs = location.search.slice(1).split("&");

        var result = {};
        pairs.forEach(function (pair) {
            pair = pair.split("=");
            result[pair[0]] = decodeURIComponent(pair[1] || "");
        });

        return JSON.stringify(result);
    },
};
