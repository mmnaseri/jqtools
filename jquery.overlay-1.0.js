/**
 * Author: Mohammad Milad Naseri (m.m.naseri@gmail.com)
 * Date: 2012/11/8, 15:49
 *
 * Copyright 2012 M. M. Naseri and associated organization(s)
 * Released under the MIT license.
 */

(function ($) {
    $.fn.overlay = function (options) {
        var context = $(this);
        context.each(function () {
            if (!options) {
                options = {};
            }
            if (!$.isFunction(options)) {
                options.call = function () {
                    return options;
                };
            }
            var element = $(this);
            var config = options.call(element.get(0));
            if (!config) {
                config = {};
            }
            if (!config.className) {
                config.className = "overlay";
            }
            element.trigger('beforeOverlay');
            element.identify();
            var id = config.id ? config.id : element.get(0).id + "-overlay";
            element.trigger("overlaying");
            element.after("<div class='" + config.className + "' id='" + id + "'></div>");
            var overlay = $("#" + id);
            overlay.css('display', 'block');
            overlay.css('position', 'absolute');
            overlay.update = function () {
                var box = {
                    left:element.offset().left,
                    top:element.offset().top,
                    width:element.get(0).offsetWidth,
                    height:element.get(0).offsetHeight
                };
                overlay.css('left', box.left + "px");
                overlay.css('top', box.top + "px");
                overlay.css('width', box.width + "px");
                overlay.css('height', box.height + "px");
                overlay.trigger('update');
            };
            overlay.close = function () {
                element.trigger('overlayClosing');
                overlay.trigger('closing');
                if (config.monitor) {
                    clearInterval(overlay.get(0).interval);
                }
                overlay.remove();
                element.trigger('overlayClosed');
                element.unidentify();
            };
            element.get(0).overlay = overlay;
            overlay.update();
            element.trigger("overlayed");
            if (element.get(0).nodeName.toLowerCase() == 'body') {
                window.x = config;
            }
            if (config.monitor) {
                overlay.get(0).interval = setInterval(function () {
                    overlay.update();
                }, 100);
            }
            if (config.closeOnClick) {
                overlay.addClass('clickable');
                overlay.click(function () {
                    overlay.close();
                });
            }
        });
        return context;
    };
})(jQuery);

(function ($) {
    function getWindowSize() {
        var width = 0, height = 0;
        if (typeof(window.innerWidth) == 'number') {
            //Non IE
            width = window.innerWidth;
            height = window.innerHeight;
        }
        if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            //IE 6+ in 'standards compliant mode'
            width = Math.max(document.documentElement.clientWidth, width);
            height = Math.max(document.documentElement.clientHeight, height);
        }
        if (document.body && ( document.body.clientWidth || document.body.clientHeight )) {
            //IE 4 compatible
            width = Math.max(document.body.clientWidth, width);
            height = Math.max(document.body.clientHeight, height);
        }
        return {
            width:width,
            height:height
        };
    }

    $.overlay = function (options) {
        var id = "body-overlay";
        var bodyOverlay = $("#" + id);
        if (bodyOverlay.length == 0) {
            $($("body").get(0).lastChild).after("<div id='" + id + "'></div>");
            bodyOverlay = $("#" + id);
            bodyOverlay.get(0).count = 1;
        } else {
            bodyOverlay.get(0).count++;
        }
        if (bodyOverlay.get(0).count == 1) {
            if (!options) {
                options = {};
            }
            if ($.isFunction(options)) {
                options = options.call($("body").get(0));
            }
            var closeOnClick = options.closeOnClick;
            options.monitor = true;
            options.closeOnClick = false;
            function updateSize() {
                var windowSize = getWindowSize();
                bodyOverlay.css('display', 'block');
                bodyOverlay.css('position', 'absolute');
                bodyOverlay.css('left', '0');
                bodyOverlay.css('top', '0');
                bodyOverlay.css('width', windowSize.width + "px");
                bodyOverlay.css('height', windowSize.height + "px");
            }
            updateSize();
            bodyOverlay.on('overlayed',function () {
                if (closeOnClick) {
                    bodyOverlay.get(0).overlay.click(function () {
                        bodyOverlay.get(0).count --;
                        if (bodyOverlay.get(0).count == 0) {
                            bodyOverlay.get(0).overlay.close();
                            clearInterval(bodyOverlay.get(0).interval);
                        }
                    });
                }
            }).on('overlayClosed', function () {
                bodyOverlay.remove();
            }).overlay(options);
            $(window).resize(function () {
                updateSize();
            });
            bodyOverlay.get(0).interval = setInterval(function () {
                updateSize();
            }, 20);
        }
    };
})(jQuery);