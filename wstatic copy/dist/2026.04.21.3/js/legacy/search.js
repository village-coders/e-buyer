$(document).ready(function () {
    const searchSettings = {
        useInpSearchOptimisation: document.getElementById("UseInpSearchOptimisation")?.value.toLowerCase() === "true",
    };

    var config = {
        searchCookieName: "SearchTermOriginal",
    };

    function ieVersion() {
        var match = /\b(MSIE |Trident.*?rv:|Edge\/)(\d+)/.exec(navigator.userAgent);
        if (match) return parseInt(match[2]);
    }

    function configureSearchInputEvents(isMobile) {
        const txtSearch = isMobile ? document.getElementById("MobtxtSearch") : document.getElementById("txtSearch");

        if (!txtSearch) return;

        const activeOverlay = document.querySelector(".header-overlay");
        const searchContainer = document.querySelector(".dvSearch");

        txtSearch.addEventListener("focus", () => {
            activeOverlay?.classList.add("activeOverlay");
            searchContainer?.classList.add("active");
            document.body.classList.add("searchFocus");
        });

        txtSearch.addEventListener("blur", () => {
            activeOverlay?.classList.remove("activeOverlay");
            searchContainer?.classList.remove("active");
            document.body.classList.remove("searchFocus");
        });
    }

    function setSearchTextBoxEventsWhenNonMenuLightBoxesEnabled(isMobile) {
        if (searchSettings.useInpSearchOptimisation) {
            configureSearchInputEvents(isMobile);
            return;
        }

        var txtSearch = $("#txtSearch");
        if (isMobile) {
            txtSearch = $("#MobtxtSearch");
        }
        var body = $("body");
        txtSearch.on("focus", function () {
            $(".header-overlay").addClass("activeOverlay");
            $(this).closest(".dvSearch").addClass("active");
            body.addClass("searchFocus");
        });
        txtSearch.on("blur", function () {
            $(".header-overlay").removeClass("activeOverlay");
            $(this).closest(".dvSearch").removeClass("active");
            body.removeClass("searchFocus");
        });
    }

    var openSearchSuggestionsOnFocus = $("#OpenTrendingTermsOnFocus").val() === "True";
    var isAutocompleteEnabled =
        document.querySelector('[id*="AutoSearchSuggestionEnabled"]') != null &&
        document.querySelector('[id*="AutoSearchSuggestionEnabled"]').value == "True"; // && document.querySelector('[id*="AutoSuggestionBaseEncodedResponse"]').value == "text"; - temp removed as causing bug.
    var autoSuggestionPinnedUrlsShowWhenNotMatchingSearchTerm =
        $("#AutoSuggestionPinnedUrlsShowWhenNotMatchingSearchTerm").val() == "True";

    if (!isAutocompleteEnabled) return;

    //Get search terms beforehand to speed up initail on focous
    if (openSearchSuggestionsOnFocus && isAutocompleteEnabled) {
        var datatype = $("#AutoSuggestionBaseEncodedResponse").val();
        getSearchSuggestions(datatype);
    }

    var nonMenuLightBoxesEnabled = $("#hdnLightboxNonMenuEnabled").val() === "True";
    var nonMenuLightBoxesEnabledMobile = $("#hdnLightboxNonMenuMobileEnabled").val() === "True";
    if (nonMenuLightBoxesEnabled) {
        setSearchTextBoxEventsWhenNonMenuLightBoxesEnabled(false);
    }
    if (nonMenuLightBoxesEnabledMobile) {
        setSearchTextBoxEventsWhenNonMenuLightBoxesEnabled(true);
    }
    (function () {
        var mobileSearchTriggerBtn = $("#mobileSearchTriggerBtn");
        var divMobSearch;
        if (mobileSearchTriggerBtn.length > 0) {
            divMobSearch = $("#divMobSearch");
            mobileSearchTriggerBtn[0].addEventListener("click", toggleMobileSearch);
            var searchClose = $('<a id="ModSearchClose" class="col-xs-3 removeX"></a>');
            searchClose.click(function (e) {
                e.preventDefault();
                closeMobileSearch();
            });
            divMobSearch.find(".dvSearchWrap").append(searchClose);
            //Close the search drop down on click or scroll
            $(document).click(closeMobileSearch);
            //...but don't close when the search drop down is clicked
            divMobSearch.click(function (e) {
                e.stopPropagation();
            });
        }

        function toggleMobileSearch(e) {
            e.stopPropagation();
            e.preventDefault();
            if (divMobSearch.hasClass("open")) {
                closeMobileSearch();
            } else {
                openMobileSearch();
            }
        }

        const headerTopSpacer = document.querySelector(".HeaderTopSpacer");
        const contentWrapper = document.querySelector(".ContentWrapper");
        function closeMobileSearchOptimised() {
            headerTopSpacer?.classList.remove("SearchActive");
            contentWrapper?.classList.remove("SearchActive");
            document.body.classList.remove("body-search-open");
            divMobSearch.removeClass("open");
        }

        function closeMobileSearch() {
            if (searchSettings.useInpSearchOptimisation) {
                closeMobileSearchOptimised();
                return;
            }

            $(".HeaderTopSpacer").removeClass("SearchActive");
            $(".ContentWrapper").removeClass("SearchActive");
            $("body").removeClass("body-search-open");
            divMobSearch.removeClass("open");
        }
        function openMobileSearch() {
            $(".HeaderTopSpacer").addClass("SearchActive");
            $(".ContentWrapper").addClass("SearchActive");
            $("body").addClass("body-search-open");
            divMobSearch.addClass("open");
            $("#MobtxtSearch").focus();
        }
    })();

    if ($(".searchDropdownClose").length != 0) {
        var txtSearch = $("#txtSearch");
        var searchClose = $(".searchDropdownClose");
        var $headerGroup = $("#HeaderGroup");
        var headerElements = $("#topMenuWrapper, .IconBagandWish, .bsheaderIcons, .bsLanguageCurrency");
        txtSearch.on("click", function (e) {
            e.stopPropagation();
            $headerGroup.addClass("searchActive");
        });
        searchClose.on("click", function (e) {
            e.stopPropagation();
            $headerGroup.removeClass("searchActive");
        });
        headerElements.on("mouseover", function () {
            $headerGroup.removeClass("searchActive");
            $(".header-overlay").removeClass("activeOverlay");
            txtSearch.blur();
            $("body").removeClass("searchFocus");
        });
        $(document).on("click", function (e) {
            $headerGroup.removeClass("searchActive");
        });
    }

    var tags;
    function getSearchSuggestions(dataType) {
        var enforceSingleSectionSearchSuggestion = $("#SearchSuggestionEnforceSingleSectionMode").val();

        $.ajax({
            cache: true,
            type: "GET",
            url:
                "/api/productlist/v1/searchsuggestions?enforceSingleSectionSearchSuggestion=" +
                enforceSingleSectionSearchSuggestion,
            dataType: dataType,
            success: function (data) {
                if (!$.isArray(data)) {
                    try {
                        data = Encoded.decode(data);
                        tags = JSON.parse(data);
                    } catch (e) {
                        tags = "";
                    }
                } else {
                    tags = data;
                }

                //Remove if breadcrumb is NOT enabled
                if ($("#AutoSuggestionCategoryBreadcrumbEnabled").length == 0) {
                    tags.forEach(function (item) {
                        if (item && item.l && item.c == "C" && item.l.length > 0) {
                            var label = item.l;
                            var i = label.lastIndexOf(">");
                            if (i > 0 && i < label.length) {
                                label = label.substr(i + 1, label.length - i).trim();
                                item.l = label;
                            }
                        }
                    });
                }
            },
        });
    }

    function autoCompleteItemOnClickOverride() {
        var data = $(this).data("autocompletedata");
        searchOptions.doSearchForItemizedAutoSuggest(data); //doSearchForItemizedAutoSuggest handles all modes so there is no point for doSearch is this scenario
    }

    function getAutoSearchSuggestionSettings(prefix) {
        return {
            autoSuggestionSplitListEnabled: document.getElementById(prefix + "AutoSuggestionSplitListEnabled") != null,
            autoSuggestionListSize: document.getElementById(prefix + "AutoSuggestionListSize")?.value,
            autoSuggestionSearchTermName: document.getElementById(prefix + "AutoSuggestionSearchTermName")?.value,
            autoSuggestionCategoryName: document.getElementById(prefix + "AutoSuggestionCategoryName")?.value,
            autoSuggestionCategoryListSize: document.getElementById(prefix + "AutoSuggestionCategoryListSize")?.value,
            autoSuggestionBrandName: document.getElementById(prefix + "AutoSuggestionBrandName")?.value,
            autoSuggestionBrandListSize: document.getElementById(prefix + "AutoSuggestionBrandListSize")?.value,
            autoSuggestionHelpName: document.getElementById(prefix + "AutoSuggestionHelpName")?.value,
            autoSuggestionPinnedUrlsName: document.getElementById(prefix + "AutoSuggestionPinnedUrlsName")?.value,
            autoSuggestionHelpListSize: document.getElementById(prefix + "AutoSuggestionHelpListSize")?.value,
            autoSuggestionSectionsOrder: document.getElementById(prefix + "AutoSuggestionSectionsOrder")?.value,
        };
    }

    function autoComplete_source_optimised(request, response, prefix, showStaticUrls, showBrands) {
        if (tags == null) return;

        let term = $.ui.autocomplete.escapeRegex(request.term);
        if (term == "") {
            const searchTerm = document.getElementById(prefix + "txtSearch")?.value || "";
            term = $.ui.autocomplete.escapeRegex(searchTerm);
        }

        const suggestionSettings = getAutoSearchSuggestionSettings(prefix);
        const wordMatcher = new RegExp("\\b" + term, "i");
        let cleanedResults = [];

        if (!suggestionSettings.autoSuggestionSplitListEnabled) {
            cleanedResults = getFilteredResults(wordMatcher, "S", "", suggestionSettings.autoSuggestionListSize);
        } else {
            let brandResults = [];
            let staticUrlResults = [];

            let searchResults = getFilteredResults(
                wordMatcher,
                "S",
                suggestionSettings.autoSuggestionSearchTermName,
                suggestionSettings.autoSuggestionListSize,
            );

            let trendingResults = getFilteredResults(
                wordMatcher,
                "T",
                "Trending",
                suggestionSettings.autoSuggestionListSize,
            );

            let categoryResults = getFilteredResults(
                wordMatcher,
                "C",
                suggestionSettings.autoSuggestionCategoryName,
                suggestionSettings.autoSuggestionCategoryListSize,
            );

            let helpResults = getFilteredResults(
                wordMatcher,
                "A",
                suggestionSettings.autoSuggestionHelpName,
                suggestionSettings.autoSuggestionHelpListSize,
            );

            if (showBrands) {
                brandResults = getFilteredResults(
                    wordMatcher,
                    "B",
                    suggestionSettings.autoSuggestionBrandName,
                    suggestionSettings.autoSuggestionBrandListSize,
                );
            }

            if (showStaticUrls) {
                staticUrlResults = getFilteredResults(
                    wordMatcher,
                    "U",
                    suggestionSettings.autoSuggestionPinnedUrlsName,
                    1000,
                );
            }

            if (suggestionSettings.autoSuggestionSectionsOrder?.length > 0) {
                var sortOrder = suggestionSettings.autoSuggestionSectionsOrder.split(",");
                if (sortOrder.length > 0) {
                    while (sortOrder.length > 0) {
                        var next = sortOrder.shift();

                        switch (next) {
                            case "Popular": {
                                cleanedResults = cleanedResults.concat(searchResults);
                                searchResults = [];
                                break;
                            }
                            case "Trending": {
                                cleanedResults = cleanedResults.concat(trendingResults);
                                trendingResults = [];
                                break;
                            }
                            case "Category": {
                                cleanedResults = cleanedResults.concat(categoryResults);
                                categoryResults = [];
                                break;
                            }
                            case "Brand": {
                                cleanedResults = cleanedResults.concat(brandResults);
                                brandResults = [];
                                break;
                            }
                            case "StaticUrls": {
                                cleanedResults = cleanedResults.concat(staticUrlResults);
                                staticUrlResults = [];
                                break;
                            }
                            case "Help": {
                                cleanedResults = cleanedResults.concat(helpResults);
                                helpResults = [];
                                break;
                            }
                        }
                    }
                }
            }

            //If somethig still has a value after inserting in a certain order add this on the end of the search suggestion
            cleanedResults = cleanedResults.concat(
                searchResults,
                trendingResults,
                categoryResults,
                brandResults,
                staticUrlResults,
                helpResults,
            );
        }

        response(cleanedResults);
    }

    function autoComplete_source(request, response, prefix, showStaticUrls, showBrands) {
        if (searchSettings.useInpSearchOptimisation) {
            autoComplete_source_optimised(request, response, prefix, showStaticUrls, showBrands);
            return;
        }

        prefix = "#" + prefix;
        var term = $.ui.autocomplete.escapeRegex(request.term);
        if (term == "") {
            term = $.ui.autocomplete.escapeRegex($(prefix + "txtSearch").val());
        }

        var wordMatcher = new RegExp("\\b" + term, "i");
        var cleanedResults = [];

        if (tags == null) return;

        if ($(prefix + "AutoSuggestionSplitListEnabled").length == 0) {
            cleanedResults = getFilteredResults(wordMatcher, "S", "", $(prefix + "AutoSuggestionListSize").val());
        } else {
            var searchResults = getFilteredResults(
                wordMatcher,
                "S",
                $(prefix + "AutoSuggestionSearchTermName").val(),
                $(prefix + "AutoSuggestionListSize").val(),
            );
            var trendingResults = getFilteredResults(
                wordMatcher,
                "T",
                "Trending",
                $(prefix + "AutoSuggestionListSize").val(),
            );
            var categoryResults = getFilteredResults(
                wordMatcher,
                "C",
                $(prefix + "AutoSuggestionCategoryName").val(),
                $(prefix + "AutoSuggestionCategoryListSize").val(),
            );
            var brandResults = [];
            var staticUrlResults = [];

            if (showBrands) {
                var brandResults = getFilteredResults(
                    wordMatcher,
                    "B",
                    $(prefix + "AutoSuggestionBrandName").val(),
                    $(prefix + "AutoSuggestionBrandListSize").val(),
                );
            }
            var helpResults = getFilteredResults(
                wordMatcher,
                "A",
                $(prefix + "AutoSuggestionHelpName").val(),
                $(prefix + "AutoSuggestionHelpListSize").val(),
            );

            if (showStaticUrls) {
                staticUrlResults = getFilteredResults(
                    wordMatcher,
                    "U",
                    $(prefix + "AutoSuggestionPinnedUrlsName").val(),
                    1000,
                );
            }

            var sectionsOrderElem = $(prefix + "AutoSuggestionSectionsOrder");
            if (sectionsOrderElem.length > 0) {
                var sortOrder = sectionsOrderElem.val().split(",");
                if (sortOrder.length > 0) {
                    while (sortOrder.length > 0) {
                        var next = sortOrder.shift();

                        switch (next) {
                            case "Popular": {
                                cleanedResults = cleanedResults.concat(searchResults);
                                searchResults = [];
                                break;
                            }
                            case "Trending": {
                                cleanedResults = cleanedResults.concat(trendingResults);
                                trendingResults = [];
                                break;
                            }
                            case "Category": {
                                cleanedResults = cleanedResults.concat(categoryResults);
                                categoryResults = [];
                                break;
                            }
                            case "Brand": {
                                cleanedResults = cleanedResults.concat(brandResults);
                                brandResults = [];
                                break;
                            }
                            case "StaticUrls": {
                                cleanedResults = cleanedResults.concat(staticUrlResults);
                                staticUrlResults = [];
                                break;
                            }
                            case "Help": {
                                cleanedResults = cleanedResults.concat(helpResults);
                                helpResults = [];
                                break;
                            }
                        }
                    }
                }
            }
            //If somethig still has a value after inserting in a certain order add this on the end of the search suggestion
            cleanedResults = cleanedResults.concat(
                searchResults,
                trendingResults,
                categoryResults,
                brandResults,
                staticUrlResults,
                helpResults,
            );
        }

        response(cleanedResults);
    }

    if (isAutocompleteEnabled) {
        $("#txtSearch").focus(function () {
            //if openSearchSuggestionsOnFocus is true then we request on document.load
            if (!tags && !openSearchSuggestionsOnFocus) {
                var datatype = $("#AutoSuggestionBaseEncodedResponse").val();
                getSearchSuggestions(datatype);
            } else if (openSearchSuggestionsOnFocus) {
                $(this).autocomplete("search", "");
            }
        });

        function clearSearchSuggestionOverrides(prefix) {
            var searchSuggestionRenderOverride = $("#" + prefix + "searchSuggestionRenderOverride");
            if (searchSuggestionRenderOverride.length > 0) {
                destinationElement = searchSuggestionRenderOverride;
                destinationElement.empty();
            }
        }

        function fixSearchSuggestionDropDownOnOverride(element, prefix) {
            var searchSuggestionRenderOverride = $("#" + prefix + "searchSuggestionRenderOverride");
            //Fix for empty drop down while search suggestion override on page
            if (searchSuggestionRenderOverride.length > 0) {
                $(element).autocomplete("close");
            }
        }

        function originalRenderItem(ul, item) {
            var prefix = "";
            if (this.element[0].id === "MobtxtSearch") prefix = "Mob";
            if (this.element[0].id === "FoottxtSearch") prefix = "Foot";

            var searchSuggestionRenderOverride = $("#" + prefix + "searchSuggestionRenderOverride");

            var destinationElement = searchSuggestionRenderOverride.length > 0 ? searchSuggestionRenderOverride : ul;

            var isSplitListEnabled =
                $("#AutoSuggestionSplitListEnabled").length > 0 ||
                $("#MobAutoSuggestionSplitListEnabled").length > 0 ||
                $("#FootAutoSuggestionSplitListEnabled").length > 0;
            var splitListClassName = isSplitListEnabled ? "autocomplete-split-enabled" : "";

            var markedUpItem;
            var term = $.ui.autocomplete.escapeRegex(this.term);
            if (item.category != "H" && term != "") {
                markedUpItem = item.label.replace(new RegExp("(\\b" + term + ")", "gi"), function (match) {
                    return "<strong>" + match + "</strong>";
                });
            } else {
                markedUpItem = item.label;
            }

            if (item.category == "H") {
                return $('<li class="' + splitListClassName + '"></li>')
                    .data("item.autocomplete", item)
                    .append('<span class="header">' + markedUpItem + "</span>")
                    .appendTo(destinationElement);
            } else {
                var className = "";
                var classNameLi = "";
                switch (item.category) {
                    case "U":
                        className = "autocompleteStaticUrl";
                        classNameLi = "staticUrl";
                        break;
                    case "B":
                        className = "autocompleteBrand";
                        break;
                    case "C":
                        className = "autocompleteCategory";
                        break;
                    case "A":
                        className = "autocompleteHelp";
                        break;
                }

                //When we use overriden autocomplete then we need to control selection of the each item ourselfs.
                var element;
                if (searchSuggestionRenderOverride.length > 0) {
                    element = $(
                        "<a data-autocompletedata='" +
                            JSON.stringify(item).replace(/'/g, "&apos;") +
                            "' class='" +
                            className +
                            "'>" +
                            markedUpItem +
                            "</a>",
                    );
                    element.click(autoCompleteItemOnClickOverride);
                } else {
                    element = $("<a class='" + className + "'>" + markedUpItem + "</a>");
                }

                return $("<li class='" + splitListClassName + " " + classNameLi + "'></li>")
                    .data("item.autocomplete", item)
                    .append(element)
                    .appendTo(destinationElement);
            }
        }

        function optimisedRenderItem(ul, item) {
            const prefix = "";
            if (this.element[0].id === "MobtxtSearch") prefix = "Mob";
            if (this.element[0].id === "FoottxtSearch") prefix = "Foot";

            const searchSuggestionRenderOverride = document.getElementById(prefix + "searchSuggestionRenderOverride");
            if (!searchSuggestionRenderOverride && (!ul || ul.length === 0)) return;

            const destinationElement = searchSuggestionRenderOverride || ul[0];
            const isSplitListEnabled = document.getElementById(prefix + "AutoSuggestionSplitListEnabled");
            const splitListClassName = isSplitListEnabled ? "autocomplete-split-enabled" : "";
            const term = $.ui.autocomplete.escapeRegex(this.term);
            let markedUpItem;

            if (item.category != "H" && term != "") {
                markedUpItem = item.label.replace(new RegExp("(\\b" + term + ")", "gi"), function (match) {
                    return "<strong>" + match + "</strong>";
                });
            } else {
                markedUpItem = item.label;
            }

            if (item.category == "H") {
                const li = document.createElement("li");
                li.className = splitListClassName;

                const span = document.createElement("span");
                span.className = "header";
                span.innerHTML = markedUpItem;

                li.appendChild(span);
                destinationElement.appendChild(li);

                return $(li).data("item.autocomplete", item);
            } else {
                let className = "";
                let classNameLi = splitListClassName;
                switch (item.category) {
                    case "U":
                        className = "autocompleteStaticUrl";
                        classNameLi = classNameLi + " staticUrl";
                        break;
                    case "B":
                        className = "autocompleteBrand";
                        break;
                    case "C":
                        className = "autocompleteCategory";
                        break;
                    case "A":
                        className = "autocompleteHelp";
                        break;
                }

                //When we use overriden autocomplete then we need to control selection of the each item ourselfs.
                const element = document.createElement("a");
                element.className = className;
                element.innerHTML = markedUpItem;

                if (searchSuggestionRenderOverride) {
                    element.dataset.autocompletedata = JSON.stringify(item).replace(/'/g, "&apos;");
                    element.addEventListener("click", autoCompleteItemOnClickOverride);
                }

                const li = document.createElement("li");
                li.className = classNameLi;

                li.appendChild(element);
                destinationElement.appendChild(li);

                return $(li).data("item.autocomplete", item);
            }
        }

        if (searchSettings.useInpSearchOptimisation) {
            $.ui.autocomplete.prototype._renderItem = optimisedRenderItem;
        } else {
            $.ui.autocomplete.prototype._renderItem = originalRenderItem;
        }

        $("#txtSearch").autocomplete({
            source: function (request, response) {
                autoComplete_source(request, response, "", true, true);
            },
            search: function (event, ui) {
                clearSearchSuggestionOverrides("");
            },
            open: function () {
                fixSearchSuggestionDropDownOnOverride(this, "");
                $(this).autocomplete("widget").css("z-index", $("#AutoSuggestionZIndex").val());
                $(this).autocomplete("widget").css("position", "absolute");
                return false;
            },
            minLength: openSearchSuggestionsOnFocus ? 0 : $("#AutoSuggestionMinLength").val(),
            delay: $("#AutoSuggestionKeyStrokeDelay").val(),

            focus: function (event, ui) {
                if (event.keyCode !== undefined && event.target.id === "txtSearch") {
                    if (!ui.item.category || ui.item.category !== "H") {
                        this.value = ui.item.label;
                        var txtSearch = $("#txtSearch");
                        txtSearch.attr["category"] = ui.item.category;
                        txtSearch.attr["href"] = ui.item.href;
                    }
                }
                event.preventDefault();
            },

            select: function (event, ui) {
                this.value = ui.item.label;
                this.item = ui.item;
                if ($("#AutoSuggestionSplitListEnabled").length == 0) {
                    searchOptions.doSearch("#txtSearch");
                } else {
                    searchOptions.doSearchForItemizedAutoSuggest(ui.item);
                }
                return false; // prevent default postback on pressing enter in textbox
            },
        });

        function getFilteredResults(matcher, type, title, size) {
            var result = $.grep(tags, function (item) {
                if (item.c == "U" && type == "U" && autoSuggestionPinnedUrlsShowWhenNotMatchingSearchTerm)
                    //static urls should always be returned
                    return true;
                return matcher.test(item.l) && item.c == type;
            });
            result = result.splice(0, size);

            if (result.length > 0 && title.length > 0) result.unshift({ l: title, c: "H" });

            return result.map(function (item) {
                return { label: item.l, category: item.c, href: item.u };
            });
        }

        // setup resposnive Footer search if defined
        if ($("#FoottxtSearch").length) {
            // it exists
            $("#FoottxtSearch").focus(function () {
                if (!tags) {
                    var datatype = $("#AutoSuggestionBaseEncodedResponse").val();
                    getSearchSuggestions(datatype);
                }
            });

            $("#FoottxtSearch").autocomplete({
                source: function (request, response) {
                    autoComplete_source(request, response, "Foot", false, false);
                },
                search: function (event, ui) {
                    clearSearchSuggestionOverrides("Foot");
                },
                open: function () {
                    fixSearchSuggestionDropDownOnOverride(this, "Foot");
                    $(this).autocomplete("widget").css("z-index", $("#FootAutoSuggestionZIndex").val());
                    $(this).autocomplete("widget").css("position", "absolute");
                    $(this).autocomplete("widget").addClass("FootSearchDropDown");
                    return false;
                },
                minLength: openSearchSuggestionsOnFocus ? 0 : $("#FootAutoSuggestionMinLength").val(),
                delay: $("#FootAutoSuggestionKeyStrokeDelay").val(),

                focus: function (event, ui) {
                    if (event.target.id === "FoottxtSearch") {
                        if (!ui.item.category || ui.item.category !== "H") {
                            this.value = ui.item.label;
                            var txtSearch = $("#FoottxtSearch");
                            txtSearch.attr["category"] = ui.item.category;
                            txtSearch.attr["href"] = ui.item.href;
                        }
                    }
                    event.preventDefault();
                },
                select: function (event, ui) {
                    this.value = ui.item.label;
                    this.item = ui.item;
                    if ($("#FootAutoSuggestionSplitListEnabled").length > 0) {
                        searchOptions.doSearchForItemizedAutoSuggest(ui.item);
                    } else {
                        searchOptions.doSearch("#FoottxtSearch");
                    }

                    return false; // prevent default postback on pressing enter in textbox
                },
            });
        }
    }

    if (
        $("#MobAutoSearchSuggestionEnabled").length != 0 &&
        !(window.isIE() && ieVersion() <= 8 && $("#MobAutoSuggestionBaseEncodedResponse").val() == "text")
    ) {
        // setup resposnive mobile search if defined
        if ($("#MobtxtSearch").length) {
            // it exists
            $("#MobtxtSearch").focus(function () {
                if (!tags && !openSearchSuggestionsOnFocus) {
                    var datatype = $("#MobAutoSuggestionBaseEncodedResponse").val();
                    getSearchSuggestions(datatype);
                } else if (openSearchSuggestionsOnFocus) {
                    $(this).autocomplete("search", "");
                }
            });

            $("#MobtxtSearch").autocomplete({
                source: function (request, response) {
                    autoComplete_source(request, response, "Mob", true, true);
                },
                search: function (event, ui) {
                    clearSearchSuggestionOverrides("Mob");
                },
                open: function () {
                    fixSearchSuggestionDropDownOnOverride(this, "Mob");
                    $(this).autocomplete("widget").css("z-index", $("#MobAutoSuggestionZIndex").val());
                    $(this).autocomplete("widget").css("position", "absolute");
                    $(this).autocomplete("widget").addClass("MobSearchDropDown");
                    return false;
                },
                minLength: openSearchSuggestionsOnFocus ? 0 : $("#MobAutoSuggestionMinLength").val(),
                delay: $("#MobAutoSuggestionKeyStrokeDelay").val(),

                focus: function (event, ui) {
                    if (event.target.id === "MobtxtSearch") {
                        if (!ui.item.category || ui.item.category !== "H") {
                            this.value = ui.item.label;
                            var txtSearch = $("#MobtxtSearch");
                            txtSearch.attr["category"] = ui.item.category;
                            txtSearch.attr["href"] = ui.item.href;
                        }
                    }
                    event.preventDefault();
                },

                select: function (event, ui) {
                    this.value = ui.item.label;
                    this.item = ui.item;
                    if ($("#MobAutoSuggestionSplitListEnabled").length > 0) {
                        searchOptions.doSearchForItemizedAutoSuggest(ui.item);
                    } else {
                        searchOptions.doSearch("#MobtxtSearch");
                    }
                    return false;
                },
            });
        }
    }

    var searchOptions = new Search(config);

    // setup search
    $("#cmdSearch").click(function (e) {
        e.preventDefault(); // preventing default postback for linkbutton
        searchOptions.doSearch("#txtSearch");
    });

    $("#txtSearch").keydown(function (e) {
        if (e.which == 13) {
            if ($("#AutoSuggestionSplitListEnabled").length > 0) {
                var txtInput = $("#txtSearch");
                searchOptions.doSearchForItemizedAutoSuggest({
                    label: txtInput.val(),
                    category: txtInput.attr["category"],
                    href: txtInput.attr["href"],
                });
            } else {
                searchOptions.doSearch("#txtSearch");
            }

            return false; // prevent default postback on pressing enter in textbox
        } else return true;
    });

    // setup resposnive mobile search if defined
    if ($("#MobtxtSearch").length) {
        // it exists

        // setup mobile search
        $("#MobcmdSearch").click(function (e) {
            e.preventDefault(); // preventing default postback for linkbutton
            searchOptions.doSearch("#MobtxtSearch");
        });

        $("#MobtxtSearch").keydown(function (e) {
            if (e.which == 13) {
                searchOptions.doSearch("#MobtxtSearch");
                return false; // prevent default postback on pressing enter in textbox
            } else return true;
        });
    }

    // setup resposnive footer search if defined
    if ($("#FoottxtSearch").length) {
        // setup Footer search
        $("#FootcmdSearch").click(function (e) {
            e.preventDefault(); // preventing default postback for linkbutton
            searchOptions.doSearch("#FoottxtSearch");
        });

        $("#FoottxtSearch").keydown(function (e) {
            if (e.which == 13) {
                searchOptions.doSearch("#FoottxtSearch");
                return false; // prevent default postback on pressing enter in textbox
            } else return true;
        });
    }

    var searchCookie = getCookie(config.searchCookieName);
    if (searchCookie != null && searchCookie.length > 0) {
        var result = window.parent.dataLayer.filter(function (obj) {
            return obj.siteSearchTerm !== undefined && obj.siteSearchTerm.toLowerCase() == searchCookie.toLowerCase();
        });

        if (result == null || result.length == 0) {
            window.parent.dataLayer.push({
                event: "siteSearch",
                siteSearchTermOriginal: searchCookie,
            });
        }

        segmentTrackProductsSearchedEvent(decodeURIComponent(searchCookie));

        setCookieValue(config.searchCookieName, "", 1);
    }

    function segmentTrackProductsSearchedEvent(searchTerm) {
        try {
            if (!(segment && typeof segment.getTrackingEnabled === "function" && segment.getTrackingEnabled())) return;

            var eventData = new segment.ProductsSearchedData(searchTerm);
            segment.trackProductsSearched(eventData);
        } catch (e) {
            console.error(e);
        }
    }

    $(window).resize(function () {
        if ($(".ui-autocomplete.ui-widget:visible").length > 0) {
            $("#txtSearch").autocomplete("search");
        }
    });
});

// search related
var Search = function (config) {
    this.getColourFilterQuery = function (searchTerm) {
        if ($("#AutoApplyColourFilterEnabled").length != 0) {
            var searchTermArray = searchTerm.split(/[^a-zA-Z]+/);

            var cleanColourList = $("#AutoApplyColourFilterColours").val().toLowerCase();
            var cleanColourArray = cleanColourList.split(/[^a-z]+/);

            var colourMatches = new Array();
            var i;

            for (i = 0; i < searchTermArray.length; ++i) {
                var currentTerm = searchTermArray[i].toLowerCase();

                if (jQuery.inArray(currentTerm, cleanColourArray) > -1) {
                    colourMatches[colourMatches.length] = currentTerm;
                }
            }

            if (colourMatches.length > 0) {
                filterQuery = "#dcp=1&dppp=24&OrderBy=rank&Filter=ACOL%5E" + colourMatches.join(",");
            }

            return filterQuery;
        }
        return "";
    };

    this.getSearchHref = function (searchTerm) {
        var filterQuery = this.getColourFilterQuery(searchTerm);
        searchTerm = encodeURIComponent(searchTerm);
        setCookieValue(config.searchCookieName, searchTerm, 1);
        return "/searchresults?descriptionfilter=" + searchTerm + filterQuery;
    };

    this.doSearchForItemizedAutoSuggest = function (item) {
        if (!item || !item.label) {
            return;
        }

        var label = item.label;
        var href = item.href;
        var categoryPrefix = item.category;
        var category = "";

        if (categoryPrefix) {
            switch (item.category) {
                case "U":
                    category = "Specials";
                    break;
                case "B":
                    category = "Brand";
                    break;
                case "C":
                    category = "Category";
                    break;
                case "A":
                    category = "Help";
                    break;
                case "T":
                    href = this.getSearchHref(label);
                    category = "Trending";
                    break;
                case "S":
                    href = this.getSearchHref(label);
                    category = "Popular";
                    break;
                default:
                    href = this.getSearchHref(label);
                    category = "";
                    break;
            }
        } else {
            href = this.getSearchHref(label);
            category = "";
        }

        if (href) {
            if (category != "") {
                window.parent.dataLayer.push({
                    event: "searchAutoSuggestion",
                    eventAction: "click",
                    eventLabel: category != "" ? category + "-" + label : label,
                });
            }

            window.location.href = href;
        }
    };

    this.doSearch = function (searchInputId) {
        var $searchInput = $(searchInputId);
        var searchTerm = $searchInput.val();

        if (searchTerm.length > 0 && searchTerm != $searchInput.attr("placeholder")) {
            window.location.href = this.getSearchHref(searchTerm);
        }
    };
};

var Encoded = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }

        output = Encoded._utf8_decode(output);

        return output;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = (c1 = c2 = 0);

        while (i < utftext.length) {
            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if (c > 191 && c < 224) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }

        return string;
    },
};
