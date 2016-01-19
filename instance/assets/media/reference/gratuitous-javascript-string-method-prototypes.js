
        String.prototype.manualReplace = function (replaceThis, withThis) {
            var replaceThisChar = replaceThis.charAt(0),
                idx, len, charAt, out;
            if (this.indexOf(replaceThisChar) < 0) return ""+this;
            idx = 1; len = this.length + 1; charAt = this.charAt(0); out = "";
            for (; idx < len; charAt = this.charAt(idx++)) {
        		out += charAt === replaceThisChar ? withThis : charAt;
            }
            return out;
        }

        String.prototype.manualReplaceOnce = function (replaceThis, withThis) {
            var indexOf = this.indexOf(replaceThis.charAt(0));
            if (indexOf < 0) return ""+this;
            return this.slice(0, indexOf) + withThis + this.slice(indexOf + 1, this.length);
        }

        var a = "123.456", aprime = "123,456", ar = ",",
            b = "123.456", bprime = "123456", br = "",
            c = "123.456", cprime = "123e456", cr = "e",
            rx = /\./, rxg = /\./, rxgi = /\./gi;