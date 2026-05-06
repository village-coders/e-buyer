let searchSuggestionsDropdownEnabled = document.querySelector('[id*="SearchSuggestionsDropdownEnabled"]');
if (searchSuggestionsDropdownEnabled != null && searchSuggestionsDropdownEnabled.value == "True") {
    try {
        initialiseSearchSuggestionsDropdown();
    } catch (e) {
        console.error("Unable to initialise search suggestions dropdown");
        console.error(e);
    }
}

function initialiseSearchSuggestionsDropdown() {
    // Basic string formatting
    if (!String.prototype.format) {
        String.prototype.format = function () {
            var formatted = this;
            for (var arg in arguments) {
                formatted = formatted.replaceAll("{" + arg + "}", arguments[arg]);
            }
            return formatted;
        };
    }

    let mostRecentPage = 0;
    let mostRecentFilterCount = 0;
    let mostRecentSearchTerm = null;
    let prevSearchSuggestionDropDownVisibility = null;

    // DOM elements that make up the display
    const display = {
        input: document.querySelector(".search-dropdown__input"),
        close: document.querySelector(".search-suggestions-dropdown__close"),
        search: document.querySelector(".search-dropdown__perform-search"),
        overlay: document.querySelector(".header-overlay"),
        container: document.querySelector("#searchSuggestionsDropdown"),
        brands: {
            title: document.querySelector("#searchDropdownBrandsTitle"),
            list: document.querySelector("#listSearchDropdownBrands"),
        },
        categories: {
            title: document.querySelector("#searchDropdownCategoriesTitle"),
            list: document.querySelector("#listSearchDropdownCategories"),
        },
        suggestions: {
            title: document.querySelector("#searchDropdownSuggestionsTitle"),
            list: document.querySelector("#listSearchDropdownSuggestions"),
        },
        campaigns: {
            title: document.querySelector("#searchDropdownCampaignsTitle"),
            list: document.querySelector("#searchDropdownCampaigns"),
        },
        products: {
            title: document.querySelector("#searchDropdownProductsTitle"),
            list: document.querySelector("#searchDropdownProducts"),
            plpMode: {
                title: document.querySelector("#searchDropdownProductsPlpModeTitle"),
                dropdowns: document.querySelector("#searchDropdownProductsPlpModeDropdowns"),
                selection: document.querySelector("#searchDropdownProductsPlpModeSelection"),
                prevPageButton: document.querySelector("#searchSuggestionsDropdownPrevPage"),
                nextPageButton: document.querySelector("#searchSuggestionsDropdownNextPage"),
            },
        },
    };

    const getTemplate = (template) =>
        document
            .querySelector(`[data-search-suggestions-template="${template}"]`)
            .innerHTML.replaceAll("data-replace-src", "src")
            .replaceAll("data-replace-href", "href");

    // DOM templates for ease of element creation
    const templates = {
        filter: {
            button: getTemplate("FILTER_BUTTON"),
            option: getTemplate("FILTER_OPTION"),
            selected: getTemplate("FILTER_SELECTED"),
        },
        product: {
            main: getTemplate("PRODUCT"),
            partials: {
                price: {
                    regular: getTemplate("PRODUCT_PRICE_REGULAR"),
                    discount: getTemplate("PRODUCT_PRICE_DISCOUNT"),
                },
            },
        },
        campaign: getTemplate("CAMPAIGN"),
        link: getTemplate("LINK"),
    };

    // Configuration from portal settings
    const config = {
        plpMode: display.container.getAttribute("data-plp-mode") === "yes",
        noResultsFound: document.querySelector('[id*="SearchSuggestionsDropdownNoResultsFound"]').value,
        debounceInterval: document.querySelector('[id*="SearchSuggestionsDropdownDebounceInterval"]').value,
        currency: document.querySelector('[id*="SearchSuggestionsDropdownCurrency"]').value,
        algolia: {
            useMultipleQueries:
                document.querySelector('[id*="SearchSuggestionsDropdownUseMultipleQueries"]').value?.toLowerCase() ==
                "true",
            connection: {
                application: document.querySelector('[id*="AlgoliaApplicationId"]').value,
                apiKey: document.querySelector('[id*="AlgoliaSearchApiKey"]').value,
            },
            indexes: {
                brands: {
                    index: document.querySelector('[id*="AlgoliaSuggestionsBrands"]').value,
                    title: document.querySelector('[id*="SearchSuggestionsDropdownBrandsTitle"]').value,
                    count: Number(document.querySelector('[id*="SearchSuggestionsDropdownBrandsCount"]').value),
                },
                categories: {
                    index: document.querySelector('[id*="AlgoliaSuggestionsCategories"]').value,
                    title: document.querySelector('[id*="SearchSuggestionsDropdownCategoriesTitle"]').value,
                    count: Number(document.querySelector('[id*="SearchSuggestionsDropdownCategoriesCount"]').value),
                },
                suggestions: {
                    index: document.querySelector('[id*="AlgoliaSuggestionsIndexName"]').value,
                    title: document.querySelector('[id*="SearchSuggestionsDropdownSuggestionsTitle"]').value,
                    count: Number(document.querySelector('[id*="SearchSuggestionsDropdownSuggestionsCount"]').value),
                },
                products: {
                    index: document.querySelector('[id*="AlgoliaIndexName"]').value,
                    count: Number(document.querySelector('[id*="SearchSuggestionsDropdownProductsCount"]').value),
                    titles: {
                        trending: document.querySelector('[id*="SearchSuggestionsDropdownProductsTrendingTitle"]')
                            .value,
                        search: document.querySelector('[id*="SearchSuggestionsDropdownProductsSearchTitle"]').value,
                    },
                },
                campaigns: {
                    index: document.querySelector('[id*="AlgoliaSuggestionsCampaigns"]').value,
                    title: document.querySelector('[id*="SearchSuggestionsDropdownCampaignsTitle"]').value,
                    count: Number(document.querySelector('[id*="SearchSuggestionsDropdownCampaignsCount"]').value),
                },
            },
        },
    };

    const searchGroupsConfig = {
        enabled: document.querySelector('[id*="AlgoliaSearchByProductGroupEnabled"]').value?.toLowerCase() == "true",
        indexSuffix: document.querySelector('[id*="AlgoliaGroupIndexSuffix"]').value,
        defaultGroup: document.querySelector('[id*="AlgoliaSearchDefaultProductGroup"]').value,
        groupList: document.querySelector('[id*="AlgoliaSearchByProductGroupList"]').value,
    };

    const getGroupSearchClients = (algoliaSearchClient) => {
        const getClientsForIndex = (algoliaSearchClient, baseIndexName) => {
            const groupClients = {};

            searchGroupsConfig.groupList.split(",").forEach((group) => {
                groupClients[group] = algoliaSearchClient.initIndex(
                    baseIndexName + searchGroupsConfig.indexSuffix + group,
                );
            });

            return groupClients;
        };

        const clients = {};
        clients[config.algolia.indexes.suggestions.index] = getClientsForIndex(
            algoliaSearchClient,
            config.algolia.indexes.suggestions.index,
        );
        clients[config.algolia.indexes.products.index] = getClientsForIndex(
            algoliaSearchClient,
            config.algolia.indexes.products.index,
        );
        clients[config.algolia.indexes.campaigns.index] = getClientsForIndex(
            algoliaSearchClient,
            config.algolia.indexes.campaigns.index,
        );
        return clients;
    };

    const getSearchClients = (algoliaSearchClient) => {
        const clients = {};
        clients[config.algolia.indexes.suggestions.index] = algoliaSearchClient.initIndex(
            config.algolia.indexes.suggestions.index,
        );
        clients[config.algolia.indexes.products.index] = algoliaSearchClient.initIndex(
            config.algolia.indexes.products.index,
        );
        clients[config.algolia.indexes.campaigns.index] = algoliaSearchClient.initIndex(
            config.algolia.indexes.campaigns.index,
        );
        clients[config.algolia.indexes.brands.index] = algoliaSearchClient.initIndex(
            config.algolia.indexes.brands.index,
        );
        clients[config.algolia.indexes.categories.index] = algoliaSearchClient.initIndex(
            config.algolia.indexes.categories.index,
        );
        return clients;
    };

    // Set up Algolia search client
    const algolia = (() => {
        const algoliaSearchClient = algoliasearch(
            config.algolia.connection.application,
            config.algolia.connection.apiKey,
        );

        const searchClients = searchGroupsConfig.enabled
            ? getGroupSearchClients(algoliaSearchClient)
            : getSearchClients(algoliaSearchClient);

        const getIndex = (indexName) => {
            if (!searchGroupsConfig.enabled) {
                return searchClients[indexName];
            }

            return {
                indexName,
                search: (term, options) => {
                    const client =
                        searchClients[indexName][getCookie("SearchProductGroup") || searchGroupsConfig.defaultGroup];
                    return client.search(term, options);
                },
            };
        };

        return {
            algoliaSearchClient,
            // Initialise Algolia indexes for the data we need to retrieve
            suggestions: {
                enabled: config.algolia.indexes.suggestions.count > 0,
                index: getIndex(config.algolia.indexes.suggestions.index),
                options: { hitsPerPage: config.algolia.indexes.suggestions.count, attributesToRetrieve: ["query"] },
            },
            brands: {
                enabled: config.algolia.indexes.brands.count > 0,
                index: getIndex(config.algolia.indexes.brands.index),
                options: {
                    hitsPerPage: config.algolia.indexes.brands.count,
                    filters: "isHidden:false AND hasInventory:true",
                    attributesToRetrieve: ["brand"],
                    attributesToHighlight: [],
                    distinct: 1,
                },
            },
            categories: {
                enabled: config.algolia.indexes.categories.count > 0,
                index: getIndex(config.algolia.indexes.categories.index),
                options: { hitsPerPage: config.algolia.indexes.categories.count, attributesToHighlight: [] },
            },
            products: {
                enabled: config.algolia.indexes.products.count > 0,
                index: getIndex(config.algolia.indexes.products.index),
                options: {
                    facets: ["webbrand", "subcategory"],
                    hitsPerPage: config.algolia.indexes.products.count,
                    filters: "isHidden:false AND hasInventory:true",
                    attributesToRetrieve: [
                        "productId",
                        "name",
                        "brand",
                        "productNameWithoutBrand",
                        "mainImage",
                        "colourVariantID",
                        "ticketPrice",
                        "sellingPrice",
                    ],
                    clickAnalytics: true,
                },
            },
            campaigns: {
                enabled: config.algolia.indexes.campaigns.count > 0,
                index: getIndex(config.algolia.indexes.campaigns.index),
                options: {
                    hitsPerPage: config.algolia.indexes.campaigns.count,
                    attributesToRetrieve: ["imageSrc", "imageAlt", "text", "url"],
                },
            },
        };
    })();

    // Utilities
    const utils = {
        // Perform query and pass response to handler
        query: (term, settings, container, handle, dataHandle) => {
            return new Promise(function (resolve, reject) {
                if (!settings.enabled) {
                    resolve("settings Disabled");
                    return;
                }

                container.textContent = "";
                utils.setSearching(container, true);

                // Set up options for the search
                const searchOptions = { ...settings.options, userToken: getAnonymousUserToken() };

                settings.index
                    .search(term, searchOptions)
                    .then((response) => {
                        if (term !== mostRecentSearchTerm) {
                            resolve("no changes");
                            return;
                        }

                        container.textContent = "";
                        utils.setSearching(container, false);

                        handle(container, response);

                        if (dataHandle !== undefined && dataHandle !== null) {
                            dataHandle(response);
                        }
                        resolve("complete");
                    })
                    .catch((e) => {
                        console.error(e);
                        utils.fallback(container);
                        reject(e);
                    });
            });
        },

        // Perform queries and pass responses to handlers
        queryMultiple: (term, queriesConfigArray, containers, handlers, dataHandles) => {
            return new Promise((resolve, reject) => {
                // If all settings disabled, resolve early
                if (queriesConfigArray.every((settings) => !settings.enabled)) {
                    resolve("all settings Disabled");
                    return;
                }

                // Clear all containers and set searching state
                containers.forEach((container) => {
                    container.textContent = "";
                    utils.setSearching(container, true);
                });

                const enabledQueries = queriesConfigArray
                    .map((settings, originalIdx) => ({ settings, originalIdx }))
                    .filter(({ settings }) => settings.enabled);

                const multipleQueries = enabledQueries.map((enabledQuery) => ({
                    indexName: enabledQuery.settings.index.indexName,
                    query: term,
                    params: { ...enabledQuery.settings.options, userToken: getAnonymousUserToken() },
                }));

                algolia.algoliaSearchClient
                    .multipleQueries(multipleQueries)
                    .then((responses) => {
                        if (term !== mostRecentSearchTerm) {
                            resolve("no changes");
                            return;
                        }

                        // Reset containers searching state
                        containers.forEach((container) => {
                            container.textContent = "";
                            utils.setSearching(container, false);
                        });

                        // responses.results is an array of results in same order as multipleQueries
                        responses.results.forEach((response, idx) => {
                            const originalIdx = enabledQueries[idx].originalIdx;

                            const container = containers[originalIdx];
                            const handler = handlers[originalIdx];
                            const dataHandle = dataHandles ? dataHandles[originalIdx] : null;

                            handler(container, response);
                            if (dataHandle) dataHandle(response);
                        });

                        resolve("complete");
                    })
                    .catch((e) => {
                        console.error(e);
                        commonContainers.forEach((container) => utils.fallback(container));
                        reject(e);
                    });
            });
        },

        // Format price as currency
        formatPrice: (value) => {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: config.currency,
            })
                .format(Number(value))
                .replace(".00", "");
        },

        // Handle container-specific fallback
        fallback: (container) => {
            container.setAttribute("data-failed-search-suggestions", "yes");
            container.textContent = "Unable to retrieve suggestions";
        },

        // Enable or disable skeleton animation whilst searching
        setSearching: (container, searching) => {
            container.setAttribute("data-searching", searching ? "yes" : "no");
            container.setAttribute("data-failed-search-suggestions", "no");
        },
    };

    const transformers = {
        // Transform product search response into hits for brands
        getBrands: (response) => {
            if (!response.facets.webbrand) return { hits: [] };

            return {
                hits: Object.getOwnPropertyNames(response.facets.webbrand)
                    .map((v) => ({ displayText: v, relevance: response.facets.webbrand[v] }))
                    .sort((a, b) => b.relevance - a.relevance)
                    .slice(0, config.algolia.indexes.brands.count),
            };
        },

        // Transform product search response into hits for categories
        getCategories: (response) => {
            if (!response.facets.subcategory) return { hits: [] };

            return {
                hits: Object.getOwnPropertyNames(response.facets.subcategory)
                    .map((v) => ({ displayText: v, relevance: response.facets.subcategory[v] }))
                    .sort((a, b) => b.relevance - a.relevance)
                    .slice(0, config.algolia.indexes.categories.count),
            };
        },
    };
    const handlers = {
        // Add links to the DOM
        links: (container, response) => {
            if (response.hits == null || response.hits.length == 0) {
                $(container).append($(`<li>${config.noResultsFound}</li>`));
                return;
            }
            for (let link of response.hits) {
                let text = link.displayText || link.query;
                let url = link.url || `/searchresults?descriptionfilter=${text}`;
                $(container).append($(templates.link.format(url, text)));
            }
        },
        // Add brands to the DOM
        brands: (container, response) => {
            if (response.hits == null || response.hits.length == 0) {
                $(container).append($(`<li>${config.noResultsFound}</li>`));
                return;
            }
            for (let link of response.hits) {
                let text = link.brand || link.query;

                let url = link.url || `/searchresults?descriptionfilter=${text}`;
                if (mostRecentSearchTerm) {
                    let url =
                        link.url ||
                        `/searchresults?descriptionfilter=${mostRecentSearchTerm}&OrderBy=rank&&Filter=ABRA%5E${text}`;
                }

                $(container).append($(templates.link.format(url, text)));
            }
        },
        // Add products to the DOM
        products: (container, response) => {
            if (response.hits == null || response.hits.length == 0) {
                $(container).append($(`<p>${config.noResultsFound}</p>`));
                return;
            }

            container.setAttribute("data-insights-index", config.algolia.indexes.products.index);
            container.setAttribute("data-insights-query-id", response.queryID);

            $(container).append(container);

            let position = 1;
            for (let product of response.hits) {
                let priceInfo =
                    Number(product.sellingPrice) - Number(product.ticketPrice) < 0
                        ? templates.product.partials.price.discount.format(
                              utils.formatPrice(product.sellingPrice),
                              utils.formatPrice(product.ticketPrice),
                          )
                        : templates.product.partials.price.regular.format(utils.formatPrice(product.sellingPrice));

                let newEle = $(
                    templates.product.main.format(
                        `/${SanitizeForUrl(product.name)}-${product.productId}#colcode=${product.colourVariantID}`,
                        product.mainImage || product.colourVariantID,
                        product.brand,
                        product.productNameWithoutBrand,
                        priceInfo,
                    ),
                );
                newEle.attr("data-insights-product-id", product.colourVariantID);
                newEle.attr("data-insights-object-id", product.objectID);
                newEle.attr("data-insights-position", position++);
                newEle.on("click", function () {
                    algoliaUtil.saveSearchAttributes(this, this.getAttribute("data-insights-product-id"));
                });
                $(container).append(newEle);
            }
            display.products.plpMode.title.textContent = `${response.nbHits} products found for "${response.query}"`;
            display.products.plpMode.prevPageButton.style.display = response.page <= 0 ? "none" : "initial";
            display.products.plpMode.nextPageButton.style.display =
                response.page + 1 >= response.nbPages ? "none" : "initial";
        },

        // Add campaigns to the DOM
        campaigns: (container, response) => {
            for (let campaign of response.hits) {
                $(display.campaigns.list).append(
                    $(templates.campaign.format(campaign.url, campaign.imageSrc, campaign.imageAlt, campaign.text)),
                );
            }
        },
    };

    // Helper for PLP mode
    const plpModeHelper = (() => {
        let helper = {};

        // Retrieve facets from either cache or products API
        if (config.plpMode) {
            fetch("/api/products/getfilters", { cache: "default" })
                .then((response) => response.json())
                .then((data) => {
                    helper.facets = data;
                    helper.facetNames = [...data.map((f) => f.facetName)];
                });
        }

        // Generate filters for a given search term
        helper.generateFilters = (term) => {
            if (!(helper.facetNames && helper.facets)) return;
            display.products.plpMode.dropdowns.textContent = "";
            algolia.products.index.search(term, { facets: helper.facetNames }).then(({ facets }) => {
                for (let facetName of Object.getOwnPropertyNames(facets)) {
                    let id = `search-suggestion-dropdown-filter-${facetName}`;
                    let facet = helper.facets.find((x) => x.facetName === facetName);
                    let facetTitle = facet.categoryFacetConfig.title;
                    let options = Object.getOwnPropertyNames(facets[facetName]);
                    let container = $('<div class="search-suggestion-dropdown-filter"></div>');
                    let title = $(templates.filter.button.format(facetTitle));
                    let filters = $(
                        `<div id="${id}" class="search-suggestion-dropdown-filter-options search-suggestion-dropdown-filter-options--hidden"></div>`,
                    );
                    title.on("click", (e) => {
                        e.preventDefault();
                        let isHidden = filters.hasClass("search-suggestion-dropdown-filter-options--hidden");
                        $(".search-suggestion-dropdown-filter-options").toggleClass(
                            "search-suggestion-dropdown-filter-options--hidden",
                            true,
                        );
                        filters.toggleClass("search-suggestion-dropdown-filter-options--hidden", !isHidden);
                    });
                    filters.append(
                        options.map((option, index) => {
                            let filter = $(templates.filter.option.format(index, id, facetName, facetTitle, option));
                            let checkbox = filter.children("input");
                            checkbox.on("change", () => updatePlpProducts());
                            return filter;
                        }),
                    );
                    container.append(title);
                    container.append(filters);
                    $(display.products.plpMode.dropdowns).append(container);
                }
            });
        };

        // Populate product options with selected filters
        helper.getSelectedFilters = () => {
            display.products.plpMode.selection.textContent = "";
            display.container.scrollTo({ top: 0, behavior: "smooth" });
            let selectedFilters = [
                ...document.querySelectorAll(".search-suggestion-dropdown-filter-option input:checked"),
            ];
            let uniqueFacets = [
                ...new Set(selectedFilters.map((selectedFilter) => selectedFilter.getAttribute("data-facet"))),
            ];
            algolia.products.options.facetFilters = uniqueFacets.map((uniqueFacet) => {
                return selectedFilters
                    .filter((selectedFilter) => selectedFilter.getAttribute("data-facet") == uniqueFacet)
                    .map((selectedFilter) => {
                        let title = selectedFilter.getAttribute("data-facet-title");
                        $(display.products.plpMode.selection).append(
                            $(templates.filter.selected.format(title, selectedFilter.value, selectedFilter.id)),
                        );
                        return `${uniqueFacet}:${selectedFilter.value}`;
                    });
            });
            let filterCount = algolia.products.options.facetFilters.length;
            if (filterCount != mostRecentFilterCount) {
                mostRecentPage = 0;
            }
            algolia.products.options.page = mostRecentPage;
            mostRecentFilterCount = filterCount;
        };

        return helper;
    })();

    const responseData = {
        brands: null,
        categories: null,
        suggestions: null,
        campaigns: null,
        products: null,

        setBrands: function (data) {
            this.brands = data.hits;
        },
        setCategories: function (data) {
            this.categories = data.hits;
        },
        setSuggestions: function (data) {
            this.suggestions = data.hits;
        },
        setCampaigns: function (data) {
            this.campaigns = data.hits;
        },
        setProducts: function (data) {
            this.products = data.hits;
        },
    };

    // Search for a term
    function search(term, searchProductGroupChanged = false) {
        if (mostRecentSearchTerm === term && !searchProductGroupChanged) return;
        mostRecentSearchTerm = term;
        mostRecentPage = 0;

        let isTrending = term == "";
        display.products.title.textContent = isTrending
            ? config.algolia.indexes.products.titles.trending
            : config.algolia.indexes.products.titles.search;
        display.products.plpMode.title.style.display = isTrending ? "none" : "block";

        if (config.plpMode) {
            plpModeHelper.generateFilters(term);
            plpModeHelper.getSelectedFilters();
        }

        let searchPromises;

        // If multiple queries enabled, use client.multipleQueries()
        if (config.algolia.useMultipleQueries) {
            searchPromises = utils.queryMultiple(
                term,
                [algolia.brands, algolia.categories, algolia.suggestions, algolia.campaigns, algolia.products],
                [
                    display.brands.list,
                    display.categories.list,
                    display.suggestions.list,
                    display.campaigns.list,
                    display.products.list,
                ],
                [handlers.brands, handlers.links, handlers.links, handlers.campaigns, handlers.products],
                [
                    (data) => responseData.setBrands(data),
                    (data) => responseData.setCategories(data),
                    (data) => responseData.setSuggestions(data),
                    (data) => responseData.setCampaigns(data),
                    (data) => {
                        responseData.setBrands(transformers.getBrands(data));
                        responseData.setCategories(transformers.getCategories(data));
                        responseData.setProducts(data);
                    },
                ],
            );
        } else {
            let brandPromise = utils.query(term, algolia.brands, display.brands.list, handlers.brands, (data) =>
                responseData.setBrands(data),
            );

            let categoriesPromise = utils.query(
                term,
                algolia.categories,
                display.categories.list,
                handlers.links,
                (data) => responseData.setCategories(data),
            );

            let suggestionsPromise = utils.query(
                term,
                algolia.suggestions,
                display.suggestions.list,
                handlers.links,
                (data) => responseData.setSuggestions(data),
            );
            let campaignPromise = utils.query(
                term,
                algolia.campaigns,
                display.campaigns.list,
                handlers.campaigns,
                (data) => responseData.setCampaigns(data),
            );
            let productsPromise = utils.query(
                term,
                algolia.products,
                display.products.list,
                handlers.products,
                (data) => {
                    responseData.setBrands(transformers.getBrands(data));
                    responseData.setCategories(transformers.getCategories(data));
                    responseData.setProducts(data);
                },
            );

            searchPromises = Promise.all([
                brandPromise,
                categoriesPromise,
                suggestionsPromise,
                campaignPromise,
                productsPromise,
            ]);
        }

        searchPromises.then((_) => {
            if (term) {
                trackSearchSuggestionViewedEvent(
                    term,
                    responseData.brands,
                    responseData.suggestions,
                    responseData.categories,
                    responseData.products,
                );
                BindTrackingEventsToLinks(term, display.suggestions.list, "popular_searches");
                BindTrackingEventsToLinks(term, display.categories.list, "category");
                BindTrackingEventsToLinks(term, display.brands.list, "brands");
                BindTrackingEventsToProductLinks(display.products.list);
            }
        });
    }

    // Position dropdown based on the heading size and position
    function positionDropdown() {
        handleMobileSearchSuggestionContainerHeight();

        // Determine how far down the page to push the dropdown container based on the closest '.row' top and height
        let topNavBar = $(display.container).closest(".TopNavBar");
        let topNavBarRect = topNavBar[0].getBoundingClientRect();
        let fixedTop = topNavBarRect.top + topNavBarRect.height + "px";
        display.container.style.setProperty("--top", fixedTop);
    }

    // Toggle dropdown visibility
    function toggleDropdownVisibility(visible) {
        if (prevSearchSuggestionDropDownVisibility == visible) return;

        document.body.classList.toggle("searchFocus", visible);
        display.overlay.classList.toggle("activeOverlay", visible);
        display.container.setAttribute("data-visible", visible ? "yes" : "no");
        prevSearchSuggestionDropDownVisibility = visible;

        handleMobileSearchSuggestionContainerHeight();
    }

    function handleMobileSearchSuggestionContainerHeight() {
        const toggleContainerHeight = document.body.classList.contains("touchenabled") && window.outerWidth <= 1021;

        display.container.classList.toggle("search-suggestions-mobile-max-height", toggleContainerHeight);
    }

    function closeSliderMenu() {
        if (!document.getElementById("BodyWrap").classList.contains("PullMenuActive")) return;

        document.querySelector("#mobMenuContainer #trigger.menu-trigger").click();
    }

    // Debounce function
    function debounce(timeout, func) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        };
    }

    function navigateSearchPage() {
        let searchQuery = (display.input.value || "").trim();
        if (!!searchQuery) {
            window.location.href = `/searchresults?descriptionfilter=${searchQuery}`;
        } else {
            display.input.focus();
        }
    }

    // When typing in search field, perform search
    $(display.input).on(
        "keyup change",
        debounce(Number(config.debounceInterval), function (e) {
            // Do not perform search if pressing enter
            // close if pressing escape
            if (e && e.keyCode && (e.keyCode === 13 || e.keyCode === 27)) {
                if (e.keyCode === 13) {
                    navigateSearchPage();
                } else {
                    toggleDropdownVisibility(false);
                    e.target.blur();
                }
            } else {
                search(display.input.value);
            }
        }),
    );

    // When focusing on search field, toggle dropdown to show and perform search if term has changed
    $(display.input).on("focus", function (e) {
        closeSliderMenu();
        toggleDropdownVisibility(true);
        if (display.input.value !== mostRecentSearchTerm) {
            search(display.input.value);
        }
    });

    // When clicking on the close button, toggle dropdown to hide
    $(display.close).on("click", function (e) {
        e.preventDefault();
        toggleDropdownVisibility(false);
    });

    // Stop propagation of click events within the search container
    $(".search").on("click", function (e) {
        e.stopPropagation();
    });

    //
    document
        .querySelectorAll("#searchSuggestionsDropdown .algolia-filter-buttons .algolia-filter-button")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const algoliaSearchProductGroup = button.getAttribute("data-value");
                const algoliaSearchProductGroupValueChanged =
                    getCookie("SearchProductGroup") !== algoliaSearchProductGroup;

                if (!algoliaSearchProductGroupValueChanged) return;

                window.document.cookie = `SearchProductGroup=${algoliaSearchProductGroup}`;
                search(display.input.value, true);
            });
        });

    // Toggle dropdown to hide when clicking outside the search container
    $(document).on("click", function (e) {
        if (document.activeElement == display.input) return;
        toggleDropdownVisibility(false);
    });

    positionDropdown();
    $(window).on("resize", positionDropdown);

    // By default on page load, toggle dropdown to hide
    toggleDropdownVisibility(false);

    // Set default titles
    display.brands.title.textContent = config.algolia.indexes.brands.title;
    display.categories.title.textContent = config.algolia.indexes.categories.title;
    display.suggestions.title.textContent = config.algolia.indexes.suggestions.title;
    display.campaigns.title.textContent = config.algolia.indexes.campaigns.title;
    display.products.title.textContent = config.algolia.indexes.products.titles.trending;

    // Handle clicks on the search button (magnifying glass icon)
    display.search.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        navigateSearchPage();
    });

    function updatePlpProducts() {
        plpModeHelper.getSelectedFilters();
        utils.query(mostRecentSearchTerm, algolia.products, display.products.list, handlers.products);
    }

    // Bind pagination for PLP mode
    if (config.plpMode) {
        display.products.plpMode.prevPageButton.addEventListener("click", (e) => {
            e.preventDefault();
            mostRecentPage--;
            updatePlpProducts();
        });

        display.products.plpMode.nextPageButton.addEventListener("click", (e) => {
            e.preventDefault();
            mostRecentPage++;
            updatePlpProducts();
        });
    }

    function trackSearchSuggestionViewedEvent(query, brands, popular_searches, categories, products) {
        try {
            var segment = window.segment;
            if (!(segment && typeof segment.getTrackingEnabled === "function" && segment.getTrackingEnabled())) return;
            const brandsArr = [];
            brands.forEach((row) => brandsArr.push(row.displayText));

            const popular_searchesArr = [];
            popular_searches.forEach((row) => popular_searchesArr.push(row.query));

            const categoriesArr = [];
            categories.forEach((row) => categoriesArr.push(row.displayText));
            const productsArr = [];
            for (let product of products) {
                let pRow = populateProductRow(product);
                productsArr.push(pRow);
            }

            var eventData = new segment.SearchSuggestionViewed(
                query,
                brandsArr,
                popular_searchesArr,
                categoriesArr,
                productsArr,
            );
            segment.trackSearchSuggestionViewed(eventData);
        } catch (e) {
            console.error(e);
        }
    }

    function populateProductRow(row) {
        //return array of products
        let pRows = [];
        let pRow = CreateNewProductRow(row);

        if (Object.hasOwn(row._highlightResult, "colourName")) {
            pRow.color = row._highlightResult.colourName.value.replace(/(<([^>]+)>)/gi, "");
        }

        pRow.image_url = $("img[src*=" + row.productId + "]:eq(0)").attr("src");

        if (row._highlightResult.webcat) {
            for (let rowCat of row._highlightResult.webcat) {
                for (let rowSub of row._highlightResult.subcategory) {
                    for (let rowAct of row._highlightResult.activity) {
                        let rowData = CreateNewProductRow(row);
                        rowData.category = rowCat.value.replace(/(<([^>]+)>)/gi, "");
                        rowData.sub_category = rowSub.value.replace(/(<([^>]+)>)/gi, "");
                        rowData.activity = rowAct.value.replace(/(<([^>]+)>)/gi, "");
                        rowData.color = pRow.color;
                        rowData.image_url = pRow.image_url;
                        pRows.push(rowData);
                    }
                }
            }
        }

        if (pRows.length === 0) {
            pRows.push(pRow);
        }
        return pRows;
    }

    function CreateNewProductRow(row) {
        return {
            product_id: row.productId,
            is_full_price: row.sellingPrice == row.ticketPrice,
            price: row.sellingPrice,
            brand: row.brand,
            name: row.productNameWithoutBrand,
        };
    }

    function BindTrackingEventsToLinks(query, docElements, type) {
        $(docElements)
            .find("a")
            .on("click", function () {
                let ele = $(this);
                var eventData = new segment.SearchSuggestionClicked(query, ele.attr("href"), query, type);
                segment.trackSearchSuggestionClicked(eventData);
                return true;
            });
    }

    function BindTrackingEventsToProductLinks(docElements) {
        $(docElements)
            .find("a")
            .on("click", function () {
                let ele = $(this);
                let product = responseData.products.find((r) => r.productId == ele.attr("data-product-id"));
                let pRows = populateProductRow(product);

                for (let row of pRows) {
                    segment.trackSearchProductSuggestionClicked(row);
                }

                return true;
            });
    }

    function SanitizeForUrl(s) {
        const _invalidUrlCharRegex = /[^a-zA-Z0-9À-ž/-]+/g;
        const _whiteSpaceRegex = /\s+/g;
        s = s.trim().replace("&", "and");
        s = s.replace(_whiteSpaceRegex, "-");
        s = s.replace(_invalidUrlCharRegex, "");

        return s.toLowerCase();
    }
}
