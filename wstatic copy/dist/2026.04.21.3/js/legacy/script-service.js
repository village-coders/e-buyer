(function (window, undefined) {
    "use strict";

    var scripts = {};

    function load(scriptFileName, callback, normalExecution) {
        if (!scripts[scriptFileName]) {
            // Script hasn't been loaded
            var sharedJsPathElement = document.getElementById("hdnSharedJsPath");
            var script = document.createElement("script");
            script.src = sharedJsPathElement.value + "/" + scriptFileName;
            script.async = !normalExecution;
            if (callback && typeof callback === "function") {
                script.onload = function () {
                    scripts[scriptFileName] = {
                        loading: false,
                        loaded: true,
                    };
                    callback();
                };
            }
            document.body.appendChild(script);
            scripts[scriptFileName] = {
                loading: true,
                loaded: false,
            };
        } else if (callback && typeof callback === "function" && scripts[scriptFileName].loaded) {
            // Script has been previously loaded so execute callback immediately
            callback();
        }
    }

    // Expose globals
    window.scriptService = {
        load: load,
    };
})(window);
