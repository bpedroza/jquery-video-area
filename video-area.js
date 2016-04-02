/*
The MIT License (MIT)

Copyright (c) 2016 Bryan Pedroza

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/** jQuery videoArea Plugin
 * @author Bryan Pedroza
 * @version 1.0.0
 * This plugin will allow you to add a video as a background to anything.
 * Known limitations - you can only have one video area with a youtube background.
 * onYouTubePlayerReady not fired when console open in chrome (yt videos fail to load when console open).
 * Mute does not work on html video in firefox
 */
;
(function ($, window) {
    $.fn.videoArea = function (options) {
        $base = $(this);
        $base.url = '';
        $base.error = false;
        $base.settings = {};
        $.fn.videoArea.defaults = {
            objectId: 'videoAreaContainer',
            player: 'youtube',
            video: '36m1o-tM05g',
            aspectRatio: '16:9',
            failMarkup: '<p>Failed to load video background</p>',
            mute: true,
            loop: true
        };

        $base.init = function () {
            return $base.each(
                    function () {
                        var settings = $.extend({}, $.fn.videoArea.defaults, options);
                        // Setup
                        $base.css({'position': 'relative', 'overflow': 'hidden'});
                        // Wrap original markup in something with higher z-index than video
                        $base.html('<div style="position:absolute;z-index:3">' + $base.html() + '</div>');
                        switch (settings.player) {
                            case 'youtube':
                                settings.url = 'http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=' + settings.objectId + '&version=3&controls=0&showinfo=0&autoplay=1';
                                initYoutube(settings);
                                break;
                            case 'html5':
                                inithtml5(settings);
                                resizeArea(settings);
                                break;
                            default:
                                break;
                        }
                        $(window).resize(function () {
                            resizeArea(settings);
                        });

                    });
        };
        // Method to resize video area based on container aspect ratio and video aspect ratio
        var resizeArea = function (settings) {
            // Don't resize on error.
            if ($base.error)
                return;
            $('#' + settings.objectId).css({'position': 'absolute', 'z-index': '1'});
            ratioParts = settings.aspectRatio.split(':');
            if (typeof (ratioParts[0]) == 'undefined' || typeof (ratioParts[1]) == 'undefined')
            {
                console.log('Video Ratio must be be in the format width:height.');
                return;
            }

            origHeight = ratioParts[1];
            origWidth = ratioParts[0];
            contWidth = $base.width();
            contHeight = $base.height();
            containerRatio = contWidth / contHeight;
            vidRatio = ratioParts[0] / ratioParts[1];
            if (containerRatio > vidRatio) {
                $('#' + settings.objectId + ', ' + '#' + settings.objectId + ' source').css('width', contWidth + 'px');
                changeRatio = contWidth / origWidth;
                newHeight = origWidth * changeRatio;
                $('#' + settings.objectId + ', ' + '#' + settings.objectId + ' source').css('height', newHeight + 'px');
                moveUp = (newHeight - contHeight) / 2
                $('#' + settings.objectId).css('top', '-' + moveUp + 'px');
            } else {
                $('#' + settings.objectId + ', ' + '#' + settings.objectId + ' source').css('height', contHeight + 'px');
                changeRatio = contHeight / origHeight;
                newWidth = origWidth * changeRatio;
                $('#' + settings.objectId + ', ' + '#' + settings.objectId + ' source').css('width', newWidth + 'px');
                moveRight = (newWidth - contWidth) / 2
                $('#' + settings.objectId).css('right', '-' + moveRight + 'px');
            }

        };

        // Method to setup for flash players
        var initFlashPlayer = function (settings, callback) {
            $base.prepend('<div id="' + settings.objectId + 'Cover" style="position:absolute;top:0;left:0;bottom:0;right:0;z-index:2;"></div>');
            $base.prepend('<div id="' + settings.objectId + '">' + settings.failMarkup + '</div>');
            // Embed the video
            $.getScript("//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js", function () {
                window.swfobject.embedSWF(
                        settings.url,
                        settings.objectId,
                        $base.width(),
                        $base.height(),
                        "8",
                        null,
                        null,
                        {allowScriptAccess: "always", 'wmode': 'opaque'},
                        {id: settings.objectId},
                        callback
                        );
            });

        };

        // Method to setup youtube player
        var initYoutube = function (settings) {
            initFlashPlayer(settings, function (obj) {
                // Youtube player setup
                window.ytPlayer;
                window.onYouTubePlayerReady = function () {
                    window.ytPlayer = document.getElementById(settings.objectId);
                    window.ytPlayer.loadVideoById(settings.video);
                    window.ytPlayer.addEventListener("onError", "ytPlayerError");
                    window.ytPlayerError = function (err) {
                        console.log(err);
                        triggerError();
                    };
                    window.ytPlayer.addEventListener("onStateChange", "ytPlayerChange");
                    window.ytPlayerChange = function (vState) {
                        if (vState === 0 && settings.loop)
                            window.ytPlayer.seekTo(0);
                    };

                    if (settings.mute)
                        window.ytPlayer.mute();
                    $base.resizeArea(settings);
                };
                // Check for errors.
                $base.swfCallback(obj);
            });
        };

        // Method to setup html5 player
        var inithtml5 = function (settings) {
            html5Markup = '<video id="' + settings.objectId + '" autoplay ' + (settings.loop ? 'loop="true"' : '') + (settings.mute ? 'muted volume="0" ': '') + '> \
							  <source src="' + settings.video + '" type="video/mp4"> \
							' + settings.failMarkup + ' \
							</video>  ';
            $base.prepend(html5Markup);
            // Can't put this in the markup for some reason, firefox does not respect the muted attribute
            if(settings.mute) {
                $('#' + settings.objectId).attr('muted',true);     
                $('#' + settings.objectId).attr('volume',0);
            }
            
            document.getElementById(settings.objectId).addEventListener('error', function (e) {
                triggerError(settings);
            }, true);
        };

        // Method to check flash object creation
        $base.swfCallback = function (obj) {
            if (!obj.success)
                $base.error = true;
        };

        // Method to handle an error.
        var triggerError = function (settings) {
            $('#' + settings.objectId).remove();
            $base.prepend('<div style="position:absolute;"id="' + settings.objectId + '">' + settings.failMarkup + '</div>');
            $base.error = true;
        };
        $base.init();
    };

})(jQuery, window);
