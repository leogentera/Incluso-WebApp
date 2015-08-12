(function () {


    //Replaces {n} with params
    if (!String.prototype.format) {
        String.prototype.format = function () {
            var txt = this;
            for (var i = 0; i < arguments.length; i++) {
                var exp = new RegExp('\\{' + (i) + '\\}', 'gm');
                txt = txt.replace(exp, arguments[i]);
            }
            return txt;
        };
    }

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (fn, scope) {
            'use strict';
            var i, len;
            for (i = 0, len = this.length; i < len; ++i) {
                if (i in this) {
                    fn.call(scope, this[i], i, this);
                }
            }
        };
    }

    window.namespace = function (name, separator, container) {
        var i, ns, o, _i, _len;
        ns = name.split(separator || '.');
        o = container || window;
        for (_i = 0, _len = ns.length; _i < _len; _i++) {
            i = ns[_i];
            o = o[i] = o[i] || {};
        }
        return o;
    };

    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    }


    //Returns the date object from date representation in asp.net ajax
    if (!String.prototype.dateFromJson) {
        String.prototype.dateFromJson = function () {
            return new Date(parseInt(this.replace("/Date(", "").replace(")/", ""), 10));
        };
    }

}).call(this);
