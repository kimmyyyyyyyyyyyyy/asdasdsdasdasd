/**
 * @author Batch Themes Ltd.
 */
(function() {
    'use strict';

    $(function() {
        var layout = window.location.pathname == '/dealerdata' ? 'none' : 'collapsed-sidebar';
        var config = {
            name: 'Marino',
            theme: 'palette-5',
            palette: getPalette('palette-5'),
            layout: layout,
            direction: 'ltr', //ltr or rtl
            colors: getColors()
        };


        $.localStorage['config'] = config;

        var el = $('.main');
        var wh = $(window).height();
        el.css('min-height', wh + 'px');

        var el2 = $('.main-view');
        el2.css('min-height', (wh - 54) + 'px');


    });
})();
