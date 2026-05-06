(function (window, undefined) {
    "use strict";

    function deserialiseLocation(coerce) {
        if (!window.location.hash) {
            return {};
        }
        // Removes the '#' at index 0
        return deserialiseParams(window.location.hash.substring(1), coerce);
    }

    function deserialiseParams(params, coerce) {
        var pieces = params.split("&"),
            data = {},
            i,
            parts;
        for (i = 0; i < pieces.length; i++) {
            parts = pieces[i].split("=");
            if (parts.length < 2) {
                parts.push("");
            }
            var value = decodeURIComponent(parts[1]);
            if (coerce) {
                switch (value.toLowerCase()) {
                    case "null":
                        value = null;
                        break;
                    case "undefined":
                        value = undefined;
                        break;
                    case "true":
                        value = true;
                        break;
                    case "false":
                        value = false;
                        break;
                    default:
                        if (!isNaN(value)) {
                            value = Number(value);
                        }
                }
            }
            data[decodeURIComponent(parts[0])] = value;
        }
        return data;
    }

    // Expose globals
    window.hashService = {
        deserialiseLocation: deserialiseLocation,
        deserialiseParams: deserialiseParams,
    };
})(window);
