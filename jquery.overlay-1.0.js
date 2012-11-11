/**
 * Author: Mohammad Milad Naseri (m.m.naseri@gmail.com)
 * Date: 2012/11/8, 15:49
 *
 * Copyright 2012 M. M. Naseri and associated organization(s)
 * Released under the MIT license.
 */

(function ($) {
    /**
     * Generates an overlay covering the selected elements
     * @param options hash|function
     *  in case of specifying a function as the options specifier, the function will be passed the
     *  current element and is expected tp return a hash describing the options
     *
     *  Available options include:
     *
     *      className       string  the classname used for the overlay object (default: overlay)
     *      id              string  the unique ID of the overlay object (default: auto generation)
     *      monitor         boolean whether the size of the overlayed object should be monitored (default: false)
     *      closeOnClick    boolean whether clicking on the overlay would close it (default: false)
     *
     * @return {*}
     */
    $.fn.overlay = function (options) {
        var context = $(this);
        context.each(function () {
            if (!options) {
                options = {};
            }
            if (!$.isFunction(options)) {
                var value = options;
                options = function () {
                    return value;
                };
            }
            var element = $(this);
            var config = options(element.get(0));
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
            if (config.monitor) {
                overlay.get(0).interval = setInterval(function () {
                    overlay.update();
                }, 1);
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
    /**
     * This method will add an overlay to the inner rectangle of the window object,
     * monitoring its size and adjusting to it continually, also allowing for multiple
     * calls to the overlay function to be handled properly.
     *
     * If the overlay function has been called 3 times, then it has to be closed 3 times
     * for it to truly close
     * @param options
     */
    $.overlay = function (options) {
        var id = "body-overlay";
        var bodyOverlay = $("#" + id);
        var body = $("body").get(0);
        if (bodyOverlay.length == 0) {
            $(body.lastChild).after("<div id='" + id + "'></div>");
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
                options = options.call(body);
            }
            var closeOnClick = options.closeOnClick;
            options.monitor = true;
            options.closeOnClick = false;
            bodyOverlay.css('z-index', parseInt(bodyOverlay.css('z-index')) + 1000);
            function updateSize() {
                bodyOverlay.css('display', 'block');
                bodyOverlay.css('position', 'absolute');
                bodyOverlay.css('left', $(window).scrollLeft());
                bodyOverlay.css('top', $(window).scrollTop());
                bodyOverlay.css('width', $(window).width() + "px");
                bodyOverlay.css('height', $(window).height() + "px");
            }
            updateSize();
            bodyOverlay.on('overlayed',function () {
                if (closeOnClick) {
                    bodyOverlay.get(0).overlay.click(function () {
                        bodyOverlay.get(0).count--;
                        if (bodyOverlay.get(0).count == 0) {
                            bodyOverlay.get(0).overlay.close();
                            clearInterval(bodyOverlay.get(0).interval);
                        }
                    });
                }
            }).on('overlayClosed',function () {
                    bodyOverlay.remove();
                }).overlay(options);
            $(window).resize(function () {
                updateSize();
            });
            $(window).scroll(function () {
                updateSize();
            });
        }
    };
})(jQuery);