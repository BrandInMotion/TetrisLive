/* Some global vars */

var canvasLoaded = false;
var gamePlaying = false;

var initialPage = "welcome";
var loggedIn = false;
var debug = false;
var currentPage;

var friendList = [];
var lookupID = [];
var autoComp;
var autoCompPages;
var challengedFriendID;
var challengedFriendName;
var shareCopy = "I’ve just played the Shoprite Yellow Packet Tetris game and I am addicted! Plus, there are loads of awesome prizes still up for grabs! Play now and challenge my high score.";
var shareHeading = "Shoprite Yellow Packet Tetris";

var fbid = "";
var user = [];
var fbUser;
var updatedUserId;
var accessToken;
var playguid = "";
var voucher = false;
var postUserInfo;
var winner = false;
var shareImage;
var optin1 = false;
var firstPlay = true;
var backgroundMusic = new SeamlessLoop();
var isMuted = false;

// Game vars
var packetWidth = 509, 
	packetHeight = 486,
	packetLeft = 68,
	packetRight = 87,
	packetBottom = 59,
	packetTop = 0,
	gameWrapper,
	ypTetris = null;

// Document Bindings
$(document).ready(init);

function resizeHandler(e) {
	gameWrapper.height(gameWrapper.width());
	ypTetris.blockrain("updateSizes");
}

// Facebook tracking pixel

(function() {
  var _fbq = window._fbq || (window._fbq = []);
  if (!_fbq.loaded) {
    var fbds = document.createElement('script');
    fbds.async = true;
    fbds.src = '//connect.facebook.net/en_US/fbds.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(fbds, s);
    _fbq.loaded = true;
  }
})();
window._fbq = window._fbq || [];
window._fbq.push(['track', '6024519172430', {'value':'0.01','currency':'ZAR'}]);

function facebookPixel(pixel_id, value) {
	$(document.body).append('<img height="1" width="1" alt="" style="display:none" src="https://www.facebook.com/tr?ev=6024519172430&amp;cd%5bvalue%5d=0.01&amp;cd%5bcurrency%5d=ZAR&amp;noscript=1" />');
}

// General functions

function getAndroidVersion(ua) {
    ua = (ua || navigator.userAgent).toLowerCase(); 
    var match = ua.match(/android\s([0-9\.]*)/);
    return match ? match[1] : false;
};

/*
* function to handle showing and hiding of pages
* function accepts 1 parameter
* toShow is the page you want to show
* all other slide will be hidden
*/
function goToPage(toShow) {
	console.log("toshow: " + toShow);
  // hide all pages

  if (toShow!=="contact") {
  	currentPage = toShow;
  }

  $(".page").hide();
  // scroll to top of page on page change
  $("html, body").scrollTop(0);
  // show the parsed page
  $(".page." + toShow).show();

	// Google tracking

  var gaPage = location.pathname+"_"+toShow;
 // ga('send', 'pageview', {'page': gaPage});

  if (toShow=="html5") {
  	gamePlaying = true;
  	//setLoser();
  	if (ypTetris == null) {
	  	ypTetris = $('#cover-tetris').blockrain({
		    autoplay: false,
		    autoplayRestart: false,
		    speed: 10,
		    blockWidth: 10,
		    autoBlockWidth: false,
		    autoBlockSize: 50,
		    theme: 'candy'
	  	});

	  	$(window).resize(resizeHandler);
	  	resizeHandler();

	  	backgroundMusic.addUri(dataURI,9050,"bgMusic"); // dataURI is defined inside music.js
	  	//backgroundMusic.start("bgMusic"); // Uncomment this
	  } else {
	  	ypTetris.blockrain("start");
	  }

  } else {
  	$(window).resize(function(){});
  	gamePlaying = false;
  	//if (ypTetris!==null) ypTetris.blockrain("pause");
  }
  
  // If going to entry page or loser page
  if (toShow=="entry") {
	 prepForm();

  }

}

/* Construct called functions */

function setWinner() {
	console.log("Setting winner");
	$('body').removeClass('loser').addClass('winner');
	winner = true;
	shareImage = "https://sc.socialpanel.co.za/App_Themes/ShopriteCheckersChirpy/images/share-winner.jpg";
	shareCopy = "I WON! I WON! Play the Shoprite Yellow Packet Tetris game and YOU could WIN your share of R100 000 too! Think you can beat my awesome high score? Go ahead.";
}

function setLoser() {
	winner = false;
	shareImage = "https://sc.socialpanel.co.za/App_Themes/ShopriteCheckersChirpy/images/share-loser.jpg";
	$('body').removeClass('winner').addClass('loser');
}

function setEntry() {
	$('body').removeClass('challenge').removeClass('enquiry').addClass('enter');
}

function setChallenge() {
	$('body').removeClass('enter').removeClass('enquiry').addClass('challenge');
}

function setEnquiry() {
	$('body').removeClass('enter').removeClass('challenge').addClass('enquiry');
}

/*
* function to prepare form on load
*/
function prepForm() {
  //console.log("Calling prepForm()");
  $(".entry-form input[type=text]").removeClass("error");
  $('.terms-conditions').removeClass('terms-error');
  $('.form-errors').hide();
  $('#firstname').val(fbUser.first_name);
  $('#surname').val(fbUser.last_name);
  $('#email').val(fbUser.email);
  $('.terms-conditions input[type=checkbox]').prop('checked', false);
}

/*
*  function to handle form submission
*/
function submitForm() {
	console.log("form submit");
	// create variables for all data we'll be gathering from the form
	// and a variable to store whether the form data is valid or not
	var firstName;
	var lastName;
	var emailAddress;
	var cellPhone;
	var go = true;

	// validate the first name and get the data
	if ($(".entry-form #firstname").val() == "") {
		// no data means the form won't validate
		go = false;
		// show error
		$(".entry-form #firstname").addClass("error");
	} else {
		// remove error(s)
		$(".entry-form #firstname").removeClass("error");
		// save the data from the field
		firstName = $(".entry-form #firstname").val();
	}

	// validate the last name (surname)
	if ($(".entry-form #surname").val() == "") {
		// no data means the form won't validate
		go = false;
		// show the error
		$(".entry-form #surname").addClass("error");
	} else {
		// remove the error(s)
		$(".entry-form #surname").removeClass("error");
		// save the data from the field
		lastName = $(".entry-form #surname").val();
	}

	// validate the email address
	// first check if the field is empty
	if ($(".entry-form #email").val() == "") {
		// data didn't validate
		go = false;
		// show the error
		$(".entry-form #email").addClass("error");
	} else {
		// if it's not empty
		// then check that it is a valid email address
		// create regular expression to validate with
		var emailCheck = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		// check the email against the reg-exp
		// if it doesn't validate
		if(!emailCheck.test($('.entry-form #email').val())) {
			// data didn't validate
			go = false;
			// show error(s)
			$(".entry-form #email").addClass("error");
		} else {
			// data is valid
			// remove the error
			$(".entry-form #email").removeClass("error");
			// save data
			emailAddress = $(".entry-form #email").val();
		}
	}

	// validate the cellphone
	// check if the field is empty
	if ($(".entry-form #cell").val() == "") {
		// data didn't validate
		go = false;
		// show error
		$(".entry-form #cell").addClass("error");
	} else {
		// field is not empty, check against reg-exp
		// create regular expression
		var cellCheck = /^(0[6789][123456789][0-9]{7})$/;
		// test the data
		if(!cellCheck.test($('.entry-form #cell').val())) {
			// data did not validate
			go = false;
			// show error
			$(".entry-form #cell").addClass("error");
		} else {
			// data is valid
			// remove the error
			$(".entry-form #cell").removeClass("error");
			// save the data
			cellPhone = $(".entry-form #cell").val();
		}
	}

	// validate terms and conditions
	// check if the box is checked
	if ($('.terms-conditions input[type=checkbox]').is(':checked') != true) {
		$('.terms-conditions').addClass('terms-error');
		go = false;
	} else {
		$('.terms-conditions').removeClass('terms-error');
	}

	// print out values in console
	////console.log("firstName: " + firstName);
	////console.log("lastName: " + lastName);
	////console.log("emailAddress: " + emailAddress);
	////console.log("cellPhone: " + cellPhone);
	////console.log("agreed: " + $('.terms #newsletter').is(':checked'));
	////console.log("go: " + go);

 	// if we are all good to go
 	if (go == true || debug) {
 		$('.form-errors').hide();
	  	postUserInfo = new Object();
	    postUserInfo.FirstName = firstName;
	    postUserInfo.LastName = lastName;
	    postUserInfo.Phone = cellPhone;
	    postUserInfo.Email = emailAddress;
	    optin1 = $('#newsletter').is(':checked');
	    updateUser();
  } else {
  	 $('.form-errors').show();
  }
}

function submitContactForm() {
	////console.log("form submit");
	// create variables for all data we'll be gathering from the form
	// and a variable to store whether the form data is valid or not
	var firstName;
	var lastName;
	var emailAddress;
	var cellPhone;
	var message;
	var browser;
	var device;
	var go = true;

	// validate the first name and get the data
	if ($(".contact-entry-form #firstname").val() == "") {
		// no data means the form won't validate
		go = false;
		// show error
		$(".contact-entry-form #firstname").addClass("error");
	} else {
		// remove error(s)
		$(".contact-entry-form #firstname").removeClass("error");
		// save the data from the field
		firstName = $(".contact-entry-form #firstname").val();
	}

	// validate the last name (surname)
	if ($(".contact-entry-form #surname").val() == "") {
		// no data means the form won't validate
		go = false;
		// show the error
		$(".contact-entry-form #surname").addClass("error");
	} else {
		// remove the error(s)
		$(".contact-entry-form #surname").removeClass("error");
		// save the data from the field
		lastName = $(".contact-entry-form #surname").val();
	}

	// validate the email address
	// first check if the field is empty
	if ($(".contact-entry-form #email").val() == "") {
		// data didn't validate
		go = false;
		// show the error
		$(".contact-entry-form #email").addClass("error");
	} else {
		// if it's not empty
		// then check that it is a valid email address
		// create regular expression to validate with
		var emailCheck = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		// check the email against the reg-exp
		// if it doesn't validate
		if(!emailCheck.test($('.contact-entry-form #email').val())) {
			// data didn't validate
			go = false;
			// show error(s)
			$(".contact-entry-form #email").addClass("error");
		} else {
			// data is valid
			// remove the error
			$(".contact-entry-form #email").removeClass("error");
			// save data
			emailAddress = $(".contact-entry-form #email").val();
		}
	}

	// validate the cellphone
	// check if the field is empty
	if ($(".contact-entry-form #cell").val() == "") {
		// data didn't validate
		go = false;
		// show error
		$(".contact-entry-form #cell").addClass("error");
	} else {
		// field is not empty, check against reg-exp
		// create regular expression
		var cellCheck = /^0[678][1234567890][0-9]{7}/;
		// test the data
		if(!cellCheck.test($('.contact-entry-form #cell').val())) {
			// data did not validate
			go = false;
			// show error
			$(".contact-entry-form #cell").addClass("error");
		} else {
			// data is valid
			// remove the error
			$(".contact-entry-form #cell").removeClass("error");
			// save the data
			cellPhone = $(".contact-entry-form #cell").val();
		}
	}

	if ($(".contact-entry-form #message").val() == "") {
		// data didn't validate
		go = false;
		// show error
		$(".contact-entry-form #message").addClass("error");
	} else {
		$(".contact-entry-form #message").removeClass("error");
		message = $(".contact-entry-form #message").val();
	}

	if ($(".contact-entry-form #browser").val() == "") {
		// data didn't validate
		go = false;
		// show error
		$(".contact-entry-form #browser").addClass("error");
	} else {
		$(".contact-entry-form #browser").removeClass("error");
		browser = $(".contact-entry-form #browser").val();
	}

	if ($(".contact-entry-form #device").val() == "") {
		// data didn't validate
		go = false;
		// show error
		$(".contact-entry-form #device").addClass("error");
	} else {
		$(".contact-entry-form #device").removeClass("error");
		device = $(".contact-entry-form #device").val();
	}

 	// if we are all good to go
 	if (go == true || debug) {
 		$('.form-errors').hide();
 		var contactUser = new Object();
	    contactUser.FirstName = firstName;
	    contactUser.LastName = lastName;
	    contactUser.Phone = cellPhone;
	    contactUser.Email = emailAddress;
	    contactUser.Issue = message;
	    contactUser.Browser = browser;
	    contactUser.Device = device;
	    contactUser.UserAgent = navigator.userAgent;

	   // console.log(contactUser);
	    
	    // Post to API
	    $.ajax({
        type: "POST",
        url: "https://sc.socialpanel.co.za/api/formentry/YellowPacketContactUs_1/newentry",
        data: JSON.stringify(contactUser),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic U0NFYXN0ZXJBUEk6ZWFzVGVyIzk=");
            showBusy("");
        },
        success: function (response) {
        	hideBusy();
	        setEnquiry();
		    goToPage('thanks');
        },
        error: function (xhr, textStatus, errorThrown) {
            hideBusy();
            alert("There was a problem submitting your message. Please try again in a while, or contact us via email.")
        }
    });

	    
  } else {
  	 $('.contact .form-errors').show();
  }
}

function cancelContactForm() {
	goToPage(currentPage);
}

function fbLogin(scopes) {
	showBusy("");
    FB.login(function (response) {
    	//console.log(response);
        if (response.authResponse) {// connected
            accessToken = response.authResponse.accessToken;
           // console.log(accessToken);
            fbid = response.authResponse.userID;
            loggedIn = true;
            FB.api('/me', function(response) {
		       fbUser = response;
		       $('body').addClass('logged-in');
		       setGameSession();
           	   return true;
		     });
        } else {
        	hideBusy();
        	alert("There was a problem logging you into Facebook. Unfortunately this is required to play Yellow Packet Tetris.")
            return false;
        }
    }, { scope: scopes});
}

function setGameSession() {
	var urlToPost = '/BrandIgniter/FacebookLogin.ashx';
    urlToPost += '?access_token=' + accessToken;

    var d = new Date();
    $.ajax({
        async: false,
        cache: false,
        url: urlToPost,
        dataType: 'json',
        success: function (data) {
 			getUser();
        }
    });
}

/* Call this when game starts*/
function start() {
	//console.log("calling start()");
	$.ajax({
		type: "POST",
		url: "https://sc.socialpanel.co.za/api/game/yellow/start",
		data: "{}",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Basic U0NZZWxsb3dQYWNrZXRBUEk6eWVsbG9wYWNrZXQxMjM=");
			showBusy("");
		},
		success: function (response) {
			////console.log(response);
			checkWinner();
		},
		error: function (xhr, textStatus, errorThrown) {
			////console.log(xhr)
			//window.alert("Hi! It looks like you're using Safari in Private Browsing mode. Please disable Private Browsing to play Yellow Packet Tetris on Safari. Thanks!");
			hideBusy();
			alert("There was a problem starting your game: "+xhr.responseJSON);
		}
	});
}

function checkWinner() {
	//console.log("Calling checkWinner()");
	voucher = false;
	$.ajax({
        type: "POST",
        url: "https://sc.socialpanel.co.za/api/game/yellow/iswinner",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic U0NZZWxsb3dQYWNrZXRBUEk6eWVsbG9wYWNrZXQxMjM=");
        },
        success: function (response) {
        	hideBusy();
        	//console.log(response);
            if (response==true) {
            	try {
	            	localStorage.setItem('voucher','true');
	            	voucher = true;
	            	console.log("Got voucher");
	            	setWinner();
	            	if (firstPlay) {
            			goToPage('how-to-play'); 
            		} else {
            			goToPage('html5');
            		}
	            } catch(e) {
	            	alert("It looks like you're using Safari in private browsing mode. Please disable private browsing to play Yellow Packet Tetris.");
	            }
            } else {
            	try {
	            	localStorage.setItem('voucher','false');
	            	voucher = false;
	            	console.log("No voucher for you!");
	            	setLoser();
            		if (firstPlay) {
            			goToPage('how-to-play'); 
            		} else {
            			goToPage('html5');
            		}
            	 } catch(e) {
	            	alert("It looks like you're using Safari in private browsing mode. Please disable private browsing to play Yellow Packet Tetris.");
	            }
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            alert("There was a problem checking if you're a winner: "+xhr.responseJSON);
            voucher = false;
            hideBusy();
        }
    });
}

function postChallenge(_id) {
	var challangeInfo = new Object();
    challangeInfo.playguid = playguid;
    challangeInfo.challengeefbid = _id;
    challangeInfo.challengeename = challengedFriendName;

    $.ajax({
        type: "POST",
        url: "https://sc.socialpanel.co.za/api/game/yellow/sendchallenge",
        data: JSON.stringify(challangeInfo),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic U0NZZWxsb3dQYWNrZXRBUEk6eWVsbG9wYWNrZXQxMjM=");
            showBusy("");
        },
        success: function (response) {
        	hideBusy();
        	setLoser();
            setChallenge();
            goToPage('thanks');
        },
        error: function (xhr, textStatus, errorThrown) {
            //console.log(xhr)
			alert("There was a problem submitting your challenge. Please try again in a while.")
            hideBusy();
        }
    });

}

function postShare(_postID) {
	var shareInfo = new Object();
    shareInfo.postid = _postID;
    shareInfo.sharerfbid = fbid;


    $.ajax({
        type: "POST",
        url: "https://sc.socialpanel.co.za/api/game/yellow/sendshare",
        data: JSON.stringify(shareInfo),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic U0NZZWxsb3dQYWNrZXRBUEk6eWVsbG9wYWNrZXQxMjM=");
            showBusy("");
        },
        success: function (response) {
        	hideBusy();
        },
        error: function (xhr, textStatus, errorThrown) {
            hideBusy();
        }
    });

}

function getUser() {
	//console.log("Calling getUser()");
	$.ajax({
        type: "POST",
        url: "https://sc.socialpanel.co.za/api/game/yellow/getuser",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic U0NZZWxsb3dQYWNrZXRBUEk6eWVsbG9wYWNrZXQxMjM=");
        },
        success: function (response) {
            //console.log(response);
            user = response;
            
            start();
            
        },
        error: function (xhr, textStatus, errorThrown) {
            alert("There was a problem getting your user information: "+xhr.responseJSON);
            hideBusy();
        }
    });

}

function endGame() {
	var endGameInfo = new Object();
    endGameInfo.canclaimprize = voucher;
    endGameInfo.optin1 = optin1;

    //console.log(endGameInfo);

    $.ajax({
        type: "POST",
        url: "https://sc.socialpanel.co.za/api/game/yellow/end",
        data: JSON.stringify(endGameInfo),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic U0NZZWxsb3dQYWNrZXRBUEk6eWVsbG9wYWNrZXQxMjM=");
            if (firstPlay) {
            	showBusy("");
            }
        },
        success: function (response) {
        	playguid = response.playguid;
        	if(firstPlay || winner) {
        		if (response.prizeclaimrefno) {
        			$('.thanks .reference').html(response.prizeclaimrefno);
        		}
        		hideBusy();
        		firstPlay = false;
        		goToPage('thanks');

        	} else {
        		hideBusy();
        		goToPage('play-again');
        	}
        },
        error: function (xhr, textStatus, errorThrown) {
            alert("There was a problem ending your game: "+xhr.responseJSON);
            hideBusy();
        }
    });

}

function postPoints() {
	var packetPoints = localStorage.getItem('yellowscore');
	//console.log(packetPoints);
	var hash = CryptoJS.MD5(fbid + accessToken + packetPoints).toString();
	console.log(hash);
    var postPointsInfo = new Object();
    postPointsInfo.totalpoints = packetPoints;
    postPointsInfo.topnleaders = 5;
    postPointsInfo.hashcheck = hash;

    //console.log(postPointsInfo);

    $.ajax({
        type: "POST",
        url: "https://sc.socialpanel.co.za/api/game/yellow/postpoints",
        data: JSON.stringify(postPointsInfo),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
        	showBusy("");
            xhr.setRequestHeader("Authorization", "Basic U0NZZWxsb3dQYWNrZXRBUEk6eWVsbG9wYWNrZXQxMjM=");
        },
        success: function (response) {
            //console.log(response);
            if (winner || firstPlay) {
            	hideBusy();
            	goToPage('entry');
        	} else {
        		submitForm();
        	}   
        },
        error: function (xhr, textStatus, errorThrown) {
            alert("There was a problem saving your score: "+xhr.responseJSON);
            hideBusy();
        }
    });

}

function updateUser() {
	$.ajax({
        type: "POST",
        url: "https://sc.socialpanel.co.za/api/user/updateconnecteduser",
        data: JSON.stringify(postUserInfo),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic U0NZZWxsb3dQYWNrZXRBUEk6eWVsbG9wYWNrZXQxMjM=");
            if (firstPlay) {
            	showBusy("");
            }
        },
        success: function (response) {
            updatedUserId = response.userid;
            //console.log(response);
            
            setEntry();
    		endGame();
        },
        error: function (xhr, textStatus, errorThrown) {
        	$('.entry .form-errors').html(xhr.responseText).show();
        	hideBusy();
        	//alert("There was a problem with your game session. Please refresh the page and try again.")
            //console.log(xhr)
        }
    });
}

function buildFriendList(_list) {
	for (var index in _list) {
		var _tempObj = {'value':_list[index].name, 'data':_list[index].id};
		lookupID[index] = _tempObj;
		friendList[index] = _tempObj;
	}
	autoComp = $('#nominate-person-input').autocomplete(
		{
			minChars:2,
			lookup: friendList,
			lookupLimit: 10,
			onSelect: function(entry, data){ 
				challengedFriendID = entry.data;
				challengedFriendName = entry.value;
			},
		}
	);
}

function showBusy(_message) {
	//console.log("showing busy for "+_message);
	$('#busy .message').html(_message);
	$('#busy').fadeIn(100);
}

function hideBusy() {
	            	//console.log("Hiding busy")
	$('#busy').fadeOut(100);
}

function init() {
	/*
  * document is loaded and ready
  */
	gameWrapper = $('.game-wrapper');

  if (navigator.userAgent.indexOf("Blackberry") !== -1 || parseInt(getAndroidVersion(), 10) < 4) {
  	////console.log("We're on Blackberry");
  	$('body').addClass('blackberry');
  } else if (navigator.userAgent.indexOf("CriOS") !== -1) {
  	initialPage = "crios";
  } else if ($('html').hasClass('no-canvas')) {
  	initialPage = "nohtml5";
  } else {
  	initialPage = "welcome";
  }

  /*
  * prepare game on load
  * hide all pages except the first
  */
  setLoser();
  setEntry();
  goToPage(initialPage);

  /*
  *  Button Bindings
  */
  
  $('.button.play').click(function() {
	fbLogin('email');
	});

  $('.button.play-again').click(function() {
	if (firstPlay) {
			fbLogin('email');
		} else {
			showBusy("");
			setGameSession();
		}
	  });

  $('.button.top-scores').click(function() {
	 goToPage('leaderboard'); 
  });

  $('.button.start').click(function() {
  	goToPage('html5');
  });

  $('.button.submit').click(submitForm);

  $('.button.submit-contact').click(submitContactForm);

  $('.button.submit-cancel').click(cancelContactForm);
  
  $('.button.challenge').click(function() {
  	if (winner) {
  		shareToWall('https://sc.socialpanel.co.za/Chirpy-S/Home.aspx?winner=true')
  	} else {
  		shareToWall('https://sc.socialpanel.co.za/Chirpy-S/Home.aspx');
  	}
	/*showBusy("Connecting ...");
	FB.ui({
		method: 'feed',
		link: 'https://sc.socialpanel.co.za/Chirpy-S/Home.aspx',
		picture: shareImage,
		name: shareHeading,
		description: shareCopy
	},
	  function(response) {
	  //	console.log(response);
	    if (response && !response.error_code) {
	    	hideBusy();
	    } else {
	       alert("There was a problem posting to Facebook. Please try again.");
	       hideBusy();
	    }
	  })*/
  });

	$('.button.deals').click(function(e) {
	 	window.open("http://www.shoprite.co.za/Pages/specials.aspx?utm_source=Chirpy%20Bird&utm_medium=webgame&utm_campaign=Easter","_blank");
	});

	$('.fb-share').click(function(e){
		if (winner) {
	  		shareToWall('https://sc.socialpanel.co.za/Chirpy-S/Home.aspx?winner=true')
	  	} else {
	  		shareToWall('https://sc.socialpanel.co.za/Chirpy-S/Home.aspx');
	  	}
		/*showBusy("Connecting ...");
		FB.ui({
			method: 'feed',
			link: 'https://sc.socialpanel.co.za/Chirpy-S/Home.aspx',
			picture: shareImage,
			name: shareHeading,
			description: shareCopy
		},
		  function(response) {
		  	//console.log(response);
		    if (response && !response.error_code) {
		    	hideBusy();
		    } else {
		       alert("There was a problem posting to Facebook. Please try again.");
		       hideBusy();
		    }
		  })*/
	});

	$('.contact-us').click(function(e){
		e.preventDefault();
		goToPage('contact');
	})

	$('.mute').click(function(e){
		isMuted = !isMuted;
		if (isMuted) {
			$(this).find('img').attr('src','./images/unmute.png');
			backgroundMusic.volume(0);
		} else {
			backgroundMusic.volume(1);
			$(this).find('img').attr('src','./images/mute.png');
		}
		
	})
};