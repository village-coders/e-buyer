(function () {
    document.addEventListener("DOMContentLoaded", () => {
        const analyticsEnabled = typeof analytics !== 'undefined';

        if (!analyticsEnabled) return;

        analytics.ready(() => {
            var zitchaRegistered = typeof analytics.isZitchRegistered !== 'undefined' && !!analytics.isZitchRegistered;

            if (!zitchaRegistered) return;

            initCmsTracking();
        });
    });

    function initCmsTracking() {
        const banners = document.querySelectorAll('[data-sponsored-banner-id]');

        if (!banners?.length) return;

        banners.forEach(banner => {

            bannerViewed(banner);

            banner.addEventListener('click', () => {
                bannerClicked(banner);
            });

        });
    }

    function bannerViewed(banner) {
        const bannerId = banner?.attributes?.getNamedItem('data-sponsored-banner-id')?.value;
        const adId = banner?.attributes?.getNamedItem('data-sponsored-banner-ad-id')?.value;
        const targetUrl = banner?.querySelector('a')?.getAttribute('href');

        if (bannerId && adId) {
            let promotionViewedEventData = new segment.PromotionViewedData(
                'Sponsored Banner',
                'Sponsored Banner',
                bannerId,
                adId);
            promotionViewedEventData.target_url = targetUrl;

            segment.trackPromotionViewed(promotionViewedEventData);
        }
    }

    function bannerClicked(banner) {
        const bannerId = banner?.attributes?.getNamedItem('data-sponsored-banner-id')?.value;
        const adId = banner?.attributes?.getNamedItem('data-sponsored-banner-ad-id')?.value;

        if (bannerId && adId) {
            segment.trackPromotionClicked({
                promotion_id: adId,
                name: "Sponsored Banner",
                creative: "Sponsored Banner",
                clickId: crypto?.randomUUID() ?? "",
                position: bannerId
            });
        }
    }
})();
