/**
 * @author Batch Themes Ltd.
 */
(function() {
    'use strict';

    $(function() {

        var config = $.localStorage['config'];
        $('body').attr('data-layout', config.layout);
        $('body').attr('data-palette', config.theme);
        $('body').attr('data-direction', config.direction);

  
    });

})();
