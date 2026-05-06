document.addEventListener("DOMContentLoaded", () => {
    const algoliaFilterButtonsSlider = document.querySelectorAll(".algolia-filter-buttons");

    if (algoliaFilterButtonsSlider == null) return;

    const algoliaPlpFilters = document.querySelectorAll(".productFilter.algolia-filters .FilterListItem");

    function _setAlgoliaProductGroupCookie(algoliaSearchProductGroup, button) {
        if (!_isPlpPage(button)) return;

        const currentAlgoliaProductGroupCookieValue = getCookie("SearchProductGroup");

        if (currentAlgoliaProductGroupCookieValue === algoliaSearchProductGroup) return;

        window.document.cookie = `SearchProductGroup=${algoliaSearchProductGroup}`;
    }

    function _isPlpPage(button) {
        return button.closest(".s-maincontent-container") != null;
    }

    function _reloadPage(button) {
        if (!_isPlpPage(button)) return;

        window.location.reload();
    }

    function _setSelectedButton(button) {
        if (button.classList.contains("is-selected")) return;

        Array.from(button.parentNode.children).forEach((child) => child.classList.remove("is-selected"));
        button.classList.add("is-selected");
    }

    function _bindEvents() {
        algoliaPlpFilters?.forEach((filter) => {
            filter.addEventListener("click", (x) => {
                const algoliaSearchProductGroup = x.currentTarget.querySelector('[type="radio"]').value;

                _setAlgoliaProductGroupCookie(algoliaSearchProductGroup, filter);
                _reloadPage(filter);
            });
        });

        algoliaFilterButtonsSlider.forEach((slider) => {
            slider.makeSlidable();

            Array.from(slider.children).forEach((button) => {
                button.addEventListener("click", () => {
                    const algoliaSearchProductGroup = button.getAttribute("data-value");

                    _setSelectedButton(button);
                    _setAlgoliaProductGroupCookie(algoliaSearchProductGroup, button);
                    _reloadPage(button);
                });
            });
        });
    }

    function _init() {
        _bindEvents();
    }

    _init();
});
