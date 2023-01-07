$(document).ready(function(event) {
	var pageType = location.pathname.substring(1);
	if(pageType == 'adminlogin'){
		$('#title').val('Login');
		$('#login').val('Administrator Login');
		$('#dealerPromptLogin').removeClass('hidden');
	} else if (pageType == 'adminsignup'){
		$('#title').text('Sign Up');
		$('#login').text('Sign Up');
		$('#dealerPromptSignup').removeClass('hidden');
	} else if(pageType == 'signup'){
		$('.dealersignup').removeClass('hidden');
		$('#title').text('Dealer Signup');
		$('#login').text('Dealer Sign-up');


	} else if(pageType == 'login'){
		$('#title').text('Dealer Login');
		$('#login').text('Dealer Login');
		$('.dealerlogin').removeClass('hidden');
		
	}

	registerUUIDListener(function(status,userEmail){
		if(status == 'success'){
			$('#loggedin').text('Logged in as ' + userEmail);
            $('#isloggedin').removeClass('hidden');
            $('#myform').addClass('hidden');
		} else {
           $('#isloggedin').addClass('hidden');
           $('#myform').removeClass('hidden');
		}
	});
	

	$('#logout').on('click', function (e){

		logout();
	});

	$('.dashboard').on('click',function (e){
		if(pageType == 'adminlogin' || pageType == 'adminsignup')
			window.location.href = "/";
		else if(pageType == 'login' || pageType == 'signup'){
			var user = firebase.auth().currentUser ? firebase.auth().currentUser.email : localStorage ['userEmail'];
			var dbKey = user.replace('@','_').replace('.','_');
			firebase.database().ref('/dealerusers/' + dbKey ).once('value').then(function(user){
				var dealerUser = user.val();
				var allowedDealers = dealerUser['dealers'];
				var dealerString = allowedDealers.join(", ");
	

				//var first = allowedDealers[0];
				window.location.href = "/dealerdata?filter=" + dealerString;
			});
			
		}
	});

	$('#dealerLoginButton').on('click',function (e){
		window.location.href = "/login";
	});
	$('#dealerSignupButton').on('click',function (e){
		window.location.href = "/signup";
	});

	$('#forgotpassword').on('click', function (e){
		var auth = firebase.auth();
		var emailAddress = $('#email').val();
		$('.signupError').removeClass('hidden');
		auth.sendPasswordResetEmail(emailAddress).then(function() {
		  $('.signupError').text("Reset email sent to " + emailAddress + ".");
		}, function(error) {
		  $('.signupError').text(error);
		});
	});
	$('#login').on('click', function (e){
		console.log('clicked-login');
		if(pageType == 'adminlogin'){
			firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
			  .then(function() {
			    // Existing and future Auth states are now persisted in the current
			    // session only. Closing the window would clear any existing state even
			    // if a user forgets to sign out.
			    // ...
			    // New sign-in will be persisted with session persistence.
			    return firebase.auth().signInWithEmailAndPassword($('#email').val(), $('#password').val());
			  }).catch(function(error) {
				  // Handle Errors here.
				  var errorCode = error.code;
				  var errorMessage = error.message;
				  console.log('firebase login ' + error);
				//   window.location.href = "/";
				  if(error){
					$('.signupError').removeClass('hidden');
					$('.signupError').text(errorMessage);
				  } 
			});
		} else if (pageType == 'adminsignup'){
			firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
			  .then(function() {
			  	return firebase.auth().createUserWithEmailAndPassword($('#email').val(), $('#password').val())
			  }).catch(function(error) {
	 				 // Handle Errors here.
	  				var errorCode = error.code;
			    	var errorMessage = error.message;
	    			if(error){
						$('.signupError').removeClass('hidden');
						$('.signupError').text(errorMessage);
					} 
			
			});
		} else if(pageType == 'signup'){
			firebase.database().ref('/dealers').once('value').then(function(dealers){

			  var dealerId = $('#dealerName').val(), dealerAcct = $('#accountNumber').val();
			  var allDealers = dealers.val();
			  for (var dealr in allDealers){
			  	var dealer = allDealers[dealr];
			  	if(dealer['Dealer_Id'] == dealerAcct && dealer['Dealer_Name']== dealerId){
					firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
					  .then(function() {
					  	return firebase.auth().createUserWithEmailAndPassword($('#email').val(), $('#password').val())
					  }).catch(function(error) {
			 				 // Handle Errors here.
			  				var errorCode = error.code;
					    	var errorMessage = error.message;
							// ...

							if(error){
								$('.signupError').removeClass('hidden');
								$('.signupError').text(errorMessage);
							} 

					});
			  		var dealersAllowed = [];
					dealersAllowed.push($('#dealerName').val());
					var dbKey = $('#email').val().replace('@','_').replace('.','_').toLowerCase();
					if(dbKey)
						firebase.database().ref('/dealerusers/' + dbKey ).set({'dealers' : dealersAllowed });

					return;
			  	}
			  }
	  		
			  $('.signupError').removeClass('hidden');
					
			

			});
		} else if(pageType == 'login'){
			firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
			  .then(function() {
			    // Existing and future Auth states are now persisted in the current
			    // session only. Closing the window would clear any existing state even
			    // if a user forgets to sign out.
			    // ...
			    // New sign-in will be persisted with session persistence.
			    return firebase.auth().signInWithEmailAndPassword($('#email').val(), $('#password').val());
			  }).catch(function(error) {			  // Handle Errors here.
				  var errorCode = error.code;
				  var errorMessage = error.message;
				  console.log('firebase login ' + error);
				  
				  if(error){
				    	$('.signupError').removeClass('hidden');
				    	$('.signupError').text(errorMessage);
				  } else {
				  	window.location.href = "/dealerdata";
				  }
			});
		}
	});

});

