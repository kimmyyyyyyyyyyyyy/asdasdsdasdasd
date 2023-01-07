/**
 * @author Batch Themes Ltd.
 */
(function() {
    'use strict';

    $(function() {

        var config = $.localStorage['config']
        $('body').attr('data-layout', 'fullsize-background-image');
        $('body').attr('data-palette', config.theme);
        $('body').attr('data-direction', config.direction);

        var email = $('.lock-screen-page #email');
        email.floatingLabels({
            errorBlock: 'Please enter your username'
           
        });

        var password = $('.lock-screen-page #password');
        password.floatingLabels({
            errorBlock: 'Please enter your password',
            minLength: 6
        });
         var dealerName = $('.lock-screen-page #dealerName');
        dealerName.floatingLabels({
            errorBlock: 'Please enter your dealer name i.e. STUDIO EUROPA',
            
        });
        var acctNumber = $('.lock-screen-page #accountNumber');
        acctNumber.floatingLabels({
            errorBlock: 'Please enter your account name i.e. 907xxxxxxx',
            
        });

		$('.lock-screen-page .btn-lg').click(function(e) {
			e.preventDefault();
			return false;
		});
    });

})();
