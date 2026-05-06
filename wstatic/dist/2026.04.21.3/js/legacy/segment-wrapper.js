(function (namespace, analytics, undefined) {
    if (typeof segmentData == "undefined") return;

    var events = {
        productViewed: "Product Viewed",
        productListViewed: "Product List Viewed",
        minicartViewed: "Minicart Viewed",
        applePayCancelled: "Apple Pay Cancelled",
        applePayOpened: "Apple Pay Opened",
        productClicked: "Product Clicked",
        productsSearched: "Products Searched",
        pageNotFound: "Page Not Found",
        externalLinkClicked: "External Link Clicked",
        promotionViewed: "Promotion Viewed",
        promotionClicked: "Promotion Clicked",
        searchSuggestionViewed: "Search Suggestion Viewed",
        searchSuggestionClicked: "Search Suggestion Clicked",
        searchProductSuggestionClicked: "Search Product Suggestion Clicked",
        addedToCart: "Added to Cart",
    };

    var productListViewedExcludeProperties = ["currency", "quantity"];
    var productViewedExcludeProperties = ["position", "quantity"];
    var productClickedExcludeProperties = ["position", "quantity"];
    var miniCartViewedExcludeProperties = ["position"];

    var shopCode = segmentData.branchCode;
    var fascia = segmentData.shortCode;
    var userSignedIn = segmentData.userSignedIn === "true";
    var webUserId = userSignedIn ? segmentData.customerId : null;
    var fasciaId = userSignedIn ? segmentData.fasciaId : null;

    /**
     * Check if Segment tracking is enabled
     * @returns {boolean}
     */
    function getTrackingEnabled() {
        return analytics !== undefined && typeof analytics.track === "function";
    }

    function track(eventName, data, options = {}) {
        if (getTrackingEnabled()) {
            addWebUserDetails();
            addFasciaId(data);
            segmentPageController.getGclid(data);

            try {
                if (window.segmentInitComplete) window.analytics.track(eventName, data, addTrackOptions(options));
                else if (!window.segmentInitFailed) enqueue(eventName, data, addTrackOptions(options));
            } catch (e) {
                console.error(e);
            }
        }
    }

    function enqueue(eventName, data, options) {
        window.addEventListener(
            "segmentInitComplete",
            () => {
                window.analytics.track(eventName, data, addTrackOptions(options));
            },
            { once: true },
        );
    }

    function addTrackOptions(options) {
        var context = {
            sourcePlatform: "FGP",
            ...(options || {}),
            sessionId: segmentData.sessionId,
            experienceId: segmentData.experienceId,
        };
        return context;
    }

    function addFasciaId(data) {
        if (fasciaId) {
            data.fascia_id = fasciaId;
        }
    }

    function addWebUserDetails() {
        if (webUserId)
            analytics.ready(function () {
                window.analytics.user().id(webUserId);
            });
    }

    function getActiveCurrency() {
        var currency = "GBP";
        try {
            return _currencyFormatter.ActiveCurrency || "";
        } catch (e) {
            console.error(e);
        }
        return currency;
    }

    function excludeProperties(dataList, propertiesToExclude) {
        if (dataList === undefined || dataList == null || !Array.isArray(dataList)) return;
        $.each(dataList, function (index, item) {
            $.each(propertiesToExclude, function (i, v) {
                if (item.hasOwnProperty(v)) $(item).removeProp(v);
            });
        });
    }

    /**
     * @param {any} json
     * @returns {Product}
     */
    function productFactory(json) {
        return new Product(
            json.brand,
            json.category,
            json.categoryId,
            json.colour,
            json.imageUrl,
            json.isFullPrice,
            json.name,
            json.position,
            json.price,
            json.priceInBaseUnit,
            json.productId,
            json.quantity,
            json.sku,
            json.subCategory,
            json.variant,
            json.activity,
            json.activityGroup,
            json.budgetCurve,
            json.promotionId,
            json.targetUrl,
        );
    }

    /**
     * @constructor
     * @param {string} brand
     * @param {string} category
     * @param {string} categoryId
     * @param {string} colour
     * @param {any} imageUrl
     * @param {any} isFullPrice
     * @param {string} name
     * @param {number} position
     * @param {number} price
     * @param {number} priceInBaseUnit
     * @param {string} productId
     * @param {number} quantity
     * @param {string} sku
     * @param {string} subCategory
     * @param {string} variant
     * @param {string} activity
     * @param {string} activityGroup
     * @param {string} budgetCurve
     * @param {string} promotionId
     * @param {string} targetUrl
     */
    function Product(
        brand,
        category,
        categoryId,
        colour,
        imageUrl,
        isFullPrice,
        name,
        position,
        price,
        priceInBaseUnit,
        productId,
        quantity,
        sku,
        subCategory,
        variant,
        activity,
        activityGroup,
        budgetCurve,
        promotionId,
        targetUrl,
    ) {
        this.brand = brand;
        this.category = category;
        this.category_id = categoryId;
        this.color = colour;
        this.currency = getActiveCurrency();
        this.image_url = imageUrl;
        this.is_full_price = isFullPrice;
        this.name = name;
        this.position = position;
        this.price = price;
        this.price_gbp = priceInBaseUnit;
        this.product_id = productId;
        this.colour_code = sku?.substring(0, 8) ?? "";
        this.quantity = quantity;
        this.sku = sku;
        this.sub_category = subCategory;
        this.variant = variant;
        this.activity = activity;
        this.activity_group = activityGroup;
        if (budgetCurve) {
            this.budget_curve = budgetCurve;
        }
        if (promotionId) {
            this.promotion_id = promotionId;
        }
        this.target_url = targetUrl;
    }

    /**
     * @constructor
     * @param {Product} product
     */
    function ProductViewedData(product) {
        Product.call(
            this,
            product.brand,
            product.category,
            product.category_id,
            product.color,
            product.image_url,
            product.is_full_price,
            product.name,
            product.position,
            product.price,
            product.price_gbp,
            product.product_id,
            product.quantity,
            product.sku,
            product.sub_category,
            product.variant,
            product.activity,
            product.activity_group,
            product.budget_curve,
            product.promotion_id,
        );
        this.fascia = null;
        this.shop_code = null;
    }

    ProductViewedData.prototype = Object.create(Product.prototype);
    ProductViewedData.prototype.constructor = ProductViewedData;

    /**
     * @class
     * @constructor
     * @param {string} category
     * @param {string} listId
     * @param {Array<Product>} products
     */
    function ProductListViewedData(category, products, categoryId, listId) {
        this.category = category;
        this.category_id = categoryId;
        this.products = products;
        this.list_id = listId;
        this.fascia = null;
        this.shop_code = null;
        this.currency = null;
    }

    /**
     * @class
     * @constructor
     * @param {boolean} applePayVisible
     * @param {string} cartId
     * @param {Array<Product>} products
     */
    function CartViewedData(
        basketId,
        coupon,
        discount,
        discountGbp,
        duty,
        dutyGbp,
        loyaltyDiscount,
        loyaltyDiscountGbp,
        productDiscount,
        productDiscountGbp,
        products,
        subTotal,
        subTotalGbp,
        tax,
        taxGbp,
        total,
        totalGbp,
    ) {
        this.fascia = null;
        this.shop_code = null;
        this.currency = null;

        this.cart_id = basketId;
        this.coupon = coupon;
        this.discount = discount;
        this.discount_gbp = discountGbp;
        this.duty = duty;
        this.duty_gbp = dutyGbp;
        this.loyalty_discount = loyaltyDiscount;
        this.loyalty_discount_gbp = loyaltyDiscountGbp;
        this.product_discount = productDiscount;
        this.product_discount_gbp = productDiscountGbp;
        this.products = products;
        this.subtotal = subTotal;
        this.subtotal_gbp = subTotalGbp;
        this.tax = tax;
        this.tax_gbp = taxGbp;
        this.total = total;
        this.total_gbp = totalGbp;
    }

    /**
     * @class
     * @constructor
     * @param {string} cartId
     * @param {string} location
     * @param {string} message
     */
    function ApplePayData(cartId, location, message) {
        this.cart_id = cartId;
        this.location = location;
        this.message = message;
        this.fascia = null;
        this.shop_code = null;
    }

    /**
     * @class
     * @constructor
     * @param {string} query
     */
    function ProductsSearchedData(query) {
        this.query = query;
        this.fascia = null;
        this.shop_code = null;
    }

    /**
     * @class
     * @constructor
     * */
    function PageNotFoundData() {
        this.fascia = null;
        this.shop_code = null;
    }

    /**
     * @class
     * @constructor
     * */
    function LinkClickedData(target, url) {
        this.target = target;
        this.url = url;
        this.fascia = null;
        this.shop_code = null;
    }

    /**
     * @constructor
     */
    function PromotionViewedData(creative, name, position, promotion_id) {
        this.creative = creative;
        this.name = name;
        this.position = position;
        this.promotion_id = promotion_id;
    }

    /**
     * @constructor
     */
    function PromotionClickedData(creative, name, position, promotion_id) {
        this.creative = creative;
        this.name = name;
        this.position = position;
        this.promotion_id = promotion_id;
    }

    function SearchSuggestionViewed(query, brands, popular_searches, categories, products) {
        this.query = query;
        this.brands = brands;
        this.popular_searches = popular_searches;
        this.categories = categories;
        this.products = products;
    }

    function SearchSuggestionClicked(title, url, alt, type) {
        this.title = title;
        this.url = url;
        this.alt = alt;
        this.type = type;
        this.shop_code = null;
        this.fascia_id = null;
    }

    function SearchSuggestionProductClicked(product) {
        this.ProductViewedData(product);
    }

    function SearchSuggestionContentViewed(creative, name, position, content_id) {
        this.creative = creative;
        this.name = name;
        this.position = position;
        this.content_id = content_id;
    }

    function SearchSuggestionContentClicked(creative, name, position, content_id) {
        this.creative = creative;
        this.name = name;
        this.position = position;
        this.content_id = content_id;
    }

    // public classes
    namespace.Product = Product;
    namespace.ProductViewedData = ProductViewedData;
    namespace.ProductListViewedData = ProductListViewedData;
    namespace.CartViewedData = CartViewedData;
    namespace.ApplePayData = ApplePayData;
    namespace.ProductsSearchedData = ProductsSearchedData;
    namespace.PageNotFoundData = PageNotFoundData;
    namespace.LinkClickedData = LinkClickedData;
    namespace.PromotionViewedData = PromotionViewedData;
    namespace.PromotionClickedData = PromotionClickedData;
    namespace.SearchSuggestionViewed = SearchSuggestionViewed;
    namespace.SearchSuggestionClicked = SearchSuggestionClicked;
    namespace.SearchSuggestionProductClicked = SearchSuggestionProductClicked;
    namespace.SearchSuggestionContentViewed = SearchSuggestionContentViewed;
    namespace.SearchSuggestionContentClicked = SearchSuggestionContentClicked;

    // public methods
    namespace.getTrackingEnabled = getTrackingEnabled;
    namespace.productFactory = productFactory;

    // events
    namespace.events = events;

    /**
     * @function
     * @param {ProductViewedData} data
     */
    namespace.trackProductViewed = function (data, options) {
        data.fascia = fascia;
        data.shop_code = shopCode;
        excludeProperties([data], productViewedExcludeProperties);
        track(events.productViewed, data, options);
    };

    /**
     * @function
     * @param {ProductViewedData} data
     */
    namespace.trackProductClicked = function (data) {
        data.fascia = fascia;
        data.shop_code = shopCode;
        excludeProperties([data], productClickedExcludeProperties);
        track(events.productClicked, data);
    };

    /**
     * @function
     * @param {ProductListViewedData} data
     */
    namespace.trackProductListViewed = function (data) {
        data.fascia = fascia;
        data.shop_code = shopCode;
        data.currency = getActiveCurrency();
        excludeProperties(data.products, productListViewedExcludeProperties);
        track(events.productListViewed, data);
    };

    /**
     * @function
     * @param {CartViewedData} data
     */
    namespace.trackMinicartViewed = function (data) {
        data.currency = getActiveCurrency();
        data.fascia = fascia;
        data.shop_code = shopCode;
        if (fasciaId) {
            data.fascia_id = fasciaId;
        }
        excludeProperties(data.products, miniCartViewedExcludeProperties);
        track(events.minicartViewed, data);
    };

    /**
     * @function
     * @param {ApplePayData} data
     */
    namespace.trackApplePayOpened = function (data) {
        data.fascia = fascia;
        data.shop_code = shopCode;
        track(events.applePayOpened, data);
    };

    /**
     * @function
     * @param {ApplePayData} data
     */
    namespace.trackApplePayCancelled = function (data) {
        data.fascia = fascia;
        data.shop_code = shopCode;
        track(events.applePayCancelled, data);
    };

    /**
     * @function
     * @param {ProductsSearchedData} data
     */
    namespace.trackProductsSearched = function (data) {
        data.fascia = fascia;
        data.shop_code = shopCode;
        track(events.productsSearched, data);
    };

    namespace.trackPageNotFound = function (data) {
        data.fascia = fascia;
        data.shop_code = shopCode;
        track(events.pageNotFound, data);
    };

    /**
     * @function
     * @param {LinkClickedData} data
     */
    namespace.trackExternalLinkClicked = function (data) {
        data.fascia = fascia;
        data.shop_code = shopCode;
        track(events.externalLinkClicked, data);
    };

    /**
     * @function
     * @param {PromotionViewedData} data
     */
    namespace.trackPromotionViewed = function (data) {
        track(events.promotionViewed, data);
    };

    /**
     * @function
     * @param {PromotionClickedData} data
     */
    namespace.trackPromotionClicked = function (data, options) {
        track(events.promotionClicked, data, options);
    };

    namespace.trackSearchSuggestionViewed = function (data) {
        this.trackSearchSuggestionEvent(data, events.searchSuggestionViewed);
    };

    namespace.trackSearchSuggestionClicked = function (data) {
        this.trackSearchSuggestionEvent(data, events.searchSuggestionClicked);
    };

    namespace.trackSearchProductSuggestionClicked = function (data) {
        track(events.searchProductSuggestionClicked, data);
    };

    namespace.trackAddedToCartEvent = function (data, options) {
        data.fascia = fascia;
        data.shop_code = shopCode;
        data.currency = getActiveCurrency();
        track(events.addedToCart, data, options);
    };

    namespace.trackSearchSuggestionEvent = function (data, eventName) {
        data.fascia = fascia;
        data.fascia_id = segmentData.fasciaId;
        data.shop_code = shopCode;
        data.referrer = document.referrer;
        track(eventName, data);
    };
})((window.segment = window.segment || {}), window.analytics);
