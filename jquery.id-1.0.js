/**
 * Author: Mohammad Milad Naseri (m.m.naseri@gmail.com)
 * Date: 2012/11/8, 15:49
 *
 * Copyright 2012 M. M. Naseri and associated organization(s)
 * Released under the MIT license.
 */

(function ($) {
    $.generateId = function (prefix) {
        var noise = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
            'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '-', '_'];
        var id = "";
        do {
            var length = Math.ceil(5 + Math.random() * 20);
            id = prefix;
            for (var i = 0; i < length; i ++) {
                if (i < 4 || Math.random() < 0.5) {
                    id += noise[Math.floor(Math.random() * noise.length)];
                } else {
                    id += Math.floor(Math.random() * 10);
                }
            }
        } while (document.getElementById(id));
        return id;
    };
})(jQuery);

(function ($) {
    /**
     * This plugin automatically assign unique CSS/HTML identifiers to selected elements.
     * These identifiers can later be revoked by $.unidentify.
     * @param prefix String|function that indicates whether a prefix should be added to the generated id
     * @return {*}
     */
    $.fn.identify = function (prefix) {
        if (!prefix) {
            prefix = function () {
                return "";
            };
        }
        if (!$.isFunction(prefix)) {
            prefix = function () {
                return prefix;
            }
        }
        var context = $(this);
        context.each(function () {
            var element = $(this);
            element.trigger("identifying");
            if (element.get(0).id) {
                element.trigger("identified");
                //an ID already exists, no need to add another one.
                return;
            }
            //we first mark this element as modified by the extension
            element.get(0).autoIdentified = true;
            element.get(0).id = $.generateId(prefix(element.get(0)));
            element.trigger("identified");
        });
        return context;
    }
})(jQuery);

(function ($) {
    $.fn.unidentify = function () {
        var context = $(this);
        context.each(function () {
            var element = $(this);
            element.trigger('unidentify');
            if (element.get(0).autoIdentified) {
                element.get(0).id = null;
                element.get(0).autoIdentified = null;
                element.trigger('unidentified');
            }
        });
        return context;
    };
})(jQuery);
