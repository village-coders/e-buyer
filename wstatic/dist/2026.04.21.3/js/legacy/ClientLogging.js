(function (window, $, console, undefined) {
    "use strict";

    var levels = {
        info: "info",
        warn: "warn",
        error: "error",
    };
    var errorLoggingEnabled = $("body").data("errorloggingenabled") === true;

    function logMessage(message, level) {
        if (!errorLoggingEnabled && (level === levels.warn || level === levels.error)) {
            return;
        }
        try {
            $.ajax({
                cache: false,
                type: "POST",
                url: "/wcallbacks/log/" + level,
                data: { message: btoa(message) },
                success: function (d) {},
                error: function (xhr, textStatus, errorThrown) {},
            });
        } catch (e) {
            console.error(e);
        }
    }

    // #region Temporary block to log jQuery Migrate warnings
    var originalMigrateMute = $.migrateMute;
    $.migrateMute = false;
    var originalWarn = console.warn;
    console.warn = function (data) {
        if (data.indexOf("JQMIGRATE") === -1) {
            // Continue logging warnings to the console
            originalWarn.apply(this, arguments);
        } else {
            var stack = new Error().stack;
            logMessage(window.location.href + "\r\n" + data + "\r\n" + stack, levels.warn);
            if (!originalMigrateMute) {
                // Continue logging warnings to the console when using non-minified library
                originalWarn.apply(this, arguments);
            }
        }
    };
    // #endregion

    // Javascript error logging
    $(window).on("error", function (details) {
        try {
            if (details.originalEvent.message === "Script error.") return; //The error was in an external script

            var message = details.originalEvent.message;
            if (details.originalEvent.error && details.originalEvent.error.stack)
                message += "; stack" + details.originalEvent.error.stack;
            message += "; URL=" + document.URL;
            logMessage(message, levels.error);
        } catch (e) {
            console.error(e);
        }
    });

    var serverLogging = {
        _mode: $("body").data("clientloggingmode"),
        log: function (mode, infoMessage) {
            if (mode !== this._mode) return;
            logMessage(infoMessage, levels.info);
        },
    };

    // Expose globals
    window.logClientScriptException = function (message) {
        logMessage(message, levels.error);
    };
    window.serverLogging = serverLogging;
})(window, window.jQuery, window.console);
