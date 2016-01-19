
        // Cached regex + parseInt format
        String.prototype.cachedFormatParseInt = (function (regex, undefined) {
            return function () {
                var args = arguments;
                return this.replace(regex, function (item) {
                    var intVal = parseInt(item.substring(1, item.length - 1));
                    if (intVal >= 0) {
                        return args[intVal] !== undefined ? args[intVal] : "";
                    } else if (intVal === -1) {
                        return "{";
                    } else if (intVal === -2) {
                        return "}";
                    }
                    return "";
                });
            };
        })(new RegExp("{-?[0-9]+}", "g"));
