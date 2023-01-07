
$(document).ready(function(event) {

	authenticateUserIfNecessary(function (status,userEmail,admins){
		if(status == 'success'){

			 $('.profile-title').text(userEmail);



			var emailKey = userEmail.replace('@','_').replace(/\./g,'_').toLowerCase();

	        if(!admins[emailKey]){
	          window.location.href = 'login';
	        }
	    	var date = $.urlParam('date');
			var region = $.urlParam('region') ? $.urlParam('region') : 'master';
			registerBulkActionEventHandler();
			fetchOrdersFiltered(region,null,date);
			$('.changeDate').on('click', function (e){
		        $('#date-picker').toggleClass('hidden');
		    });
		    $('#date-picker').datepicker({
		            orientation: 'bottom left',
		            startDate : '2/2/2017'
		    });
		    $('#date-picker').on('change', function (e){ 
		        
		          var d = new Date($(this).val());
		          var dateKey = (d.getMonth()+1) + '_' + d.getDate() + '_' + d.getFullYear() ;
		          window.location.href= window.location.pathname + '?date=' + dateKey;
		    });

		} else if(status == 'not-loggedin') {
			window.location.href = 'adminlogin';
		}
		console.log(status);
	});
	

	//fetchOrdersFiltered(region,null);
});



