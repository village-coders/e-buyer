function sendToDataLayer(metric) {
    const { name, value, rating, delta, entries, attribution, id } = metric;

    const eventParams = {
        value: Math.round(name === "CLS" ? delta * 1000 : delta),
        metric_id: id,
        metric_value: value,
        metric_delta: delta,
    };

    switch (name) {
        case "CLS":
            eventParams.debug_target = attribution.largestShiftTarget;
            break;

        case "FID":
            eventParams.debug_target = attribution.eventTarget;
            break;

        case "INP":
            eventParams.debug_target = attribution.eventEntry.target;
            break;

        case "LCP":
            eventParams.debug_target = attribution.element;
            break;

        case "FCP":
            eventParams.debug_target = attribution.element;
            break;
    }

    window[name] = eventParams;
}

webVitals.onCLS(sendToDataLayer);
webVitals.onFID(sendToDataLayer);
webVitals.onLCP(sendToDataLayer);
webVitals.onINP(sendToDataLayer);
webVitals.onFCP(sendToDataLayer);
