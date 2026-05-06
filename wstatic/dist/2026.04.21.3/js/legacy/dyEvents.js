function pollGlobalVariable(variables, interval = 100, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const intervalId = setInterval(() => {
            let foundVariable;

            foundVariable = variables.find(
                (variableName) => window.hasOwnProperty(variableName) && "getAll" in window[variableName],
            );

            if (!foundVariable) {
                foundVariable = variables.find((variableName) => typeof window[variableName] !== "undefined");
            }

            if (foundVariable && typeof window[foundVariable].getAll === "function") {
                clearInterval(intervalId);
                resolve(foundVariable);
            }

            if (Date.now() - startTime >= timeout) {
                clearInterval(intervalId);
                reject(new Error("Timeout: Global variable not found within the specified time."));
            }
        }, interval);
    });
}

function _dyGaSendEvent(trackerName, category, action, label, options) {
    const newEventName = trackerName + ".send";

    __dyGa(newEventName, "event", category, action, label, {
        nonInteraction: options && options.nonInteraction ? options.nonInteraction : true,
    });
}

function _dyGaGetTrackingName(analyticsId, trackers) {
    const isTrackers = trackers && trackers.length >= 1;

    let trackingName;

    if (isTrackers) {
        trackers.forEach((tracker) => {
            const trackingId = tracker.get("trackingId");

            if (trackingId === analyticsId) {
                trackingName = tracker.get("name");
            }
        });
    } else {
        trackingName = trackers[0].get("name");
    }

    return trackingName;
}
