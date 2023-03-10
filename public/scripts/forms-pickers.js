/**
 * @author Batch Themes Ltd.
 */
(function() {
    'use strict';

    $(function() {
        var config = {
            name: 'Marino',
            theme: 'palette-5',
            palette: getPalette('palette-5'),
            layout:  window.location.pathname == '/dealerdata' ? 'none' : 'collapsed-sidebar',
            direction: 'ltr', //ltr or rtl
            colors: getColors()
        };
        $('body').attr('data-layout', config.layout);
        $('body').attr('data-palette', config.theme);
        $('body').attr('data-direction', config.direction);

        $('#date-picker1').datepicker({
            orientation: 'bottom left'
        });

        $('#date-picker2').datepicker({
            orientation: 'left'
        });

        $('#date-picker3').datepicker({
            orientation: 'top left'
        });

        $('.demo1').colorpicker().on('changeColor.colorpicker', function(event) {
            console.log(event.color.toHex());
        });

        $('.demo2').colorpicker().on('changeColor.colorpicker', function(event) {
            console.log(event.color.toRGB());
        });
    });

})();
