// start here
var tweetApp = angular.module('tweetApp', ['ngRoute', 'ngResource']);

//Custom Service
tweetApp.service('tweetDataService', function(){
 this.dataFromTweets = "";
});

//controller for login form
tweetApp.controller('loginCtrl', ['$scope', '$http', '$window', function($scope, $http, $window){
	console.log("Entered");
	var authenticateStatus = "NOT_OK";
	$scope.loginCredentials = "";
	$scope.submit = function(){
		console.log("Entered Finally");
		$http.post('/authenticate', $scope.loginCredentials).
		then(function(response){
			if(response.data.status == "SUCCESS") {
				$window.location.assign('/home');
			} else if(response.data.status == "FAIL"){
				$window.location.assign('/loginFail');
			} else {
				console.log("Authentication Error!");
			}
		}, function(response){
			console.log("Error while authenticating!")
		});
	}
}]);

// controller for tweets form submit
tweetApp.controller('tweetFormCtrl', ['$scope', '$http', 'tweetDataService', function($scope, $http, tweetDataService) {
	$scope.show = true;
	$scope.dataFromTweets = tweetDataService.dataFromTweets;
	// add a watcher for city 
    $scope.$watch('dataFromTweets', function(){
    	tweetDataService.dataFromTweets = $scope.dataFromTweets;
    });
	$scope.tweetSub = function() {
    	$http.post('/loginNew', $scope.tweetFormData).
        success(function(data) {
            console.log("posted successfully");
        }).error(function(data) {
            console.error("error in posting");
        });
        $scope.tweetFormData = '';
        $http.get('/getTweets').
		then(function(response) {
			$scope.dataFromTweets = response.data;
		});
    }          
}]);

//controller for retweets form submit
tweetApp.controller('retweetFormCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.show = true;
	$scope.retweetFormData = {"retweetComments" : "",
							  "retweetMsg" 		: "",
							  "retweeted_by"    : ""};
	$scope.retweetSub = function() {
		// http post
		$scope.retweetFormData.retweetMsg = document.getElementById('retweet_txt').value;
		console.log("Comments:" + $scope.retweetFormData.retweetComments + " Msg:"+
        		$scope.retweetFormData.retweetMsg + " retweeted_by:" + $scope.retweetFormData.retweeted_by);
        $http.post('/postRetweet', $scope.retweetFormData).
        	  success(function(data) {
        		  console.log("posted successfully");
        	  }).error(function(data) {
        		  console.error("error in posting");
        	  });	
    }  
}]);

// Edit Profile Controller
tweetApp.controller('editProfCtrl', ['$scope', '$http', function($scope, $http){
	$scope.userName 	= "Username";
	$scope.passWord 	= "Password";
	$scope.emailAddr 	= "Email Address";
	$scope.phneNum		= "Phone Number";
	$scope.userID 		= window.user_ID;
	$scope.btnStatus    = "Save Changes";
	
	$scope.getOldFormData = function(){
		$scope.btnStatus = "Save Changes";
		$http.get('/getUserDetails').
		then(function(response) {
			console.log(response);
			$scope.userName  = response.data[0].user_name;
			$scope.emailAddr = response.data[0].email_id;
			$scope.phneNum   = response.data[0].phone_num;
		});
	}
	$scope.editProfSubmit = function(){
		$http.post('/editProf', {"userName"  : $scope.userName,
								 "passWord"  : $scope.passWord,
								 "emailAddr" : $scope.emailAddr,
								 "phneNum"   : $scope.phneNum,
								 "userID"	 : $scope.userID}).
        success(function(data) {
        	console.log("posted successfully");
        	$scope.btnStatus = data.statusMsg.message;
        }).error(function(data) {
            console.error("error in posting");
        });	
	}
}]);

// show controller
tweetApp.controller('tweetsShowCtrl', ['$scope', '$http', 'tweetDataService', function($scope, $http, tweetDataService){
	$scope.dataFromTweets = tweetDataService.dataFromTweets;
	$scope.showTweets = function(){
		$http.get('/getTweets').
		then(function(response) {
			$scope.dataFromTweets = response.data;
		});
	}
}]);

//show controller
tweetApp.controller('profTweetsShowCtrl', ['$scope', '$http', function($scope, $http){
	$scope.user_ID = window.user_ID;
	$scope.showMyTweets = function(){
		$http.get('/getTweets/'+$scope.user_ID).
		then(function(response) {
			$scope.dataFromTweets = response.data;
		});
	}
}]);

// follow controller
tweetApp.controller('followCtrl', ['$scope', '$http', function($scope, $http){
	$scope.followSuggestions = "";
	$scope.showFollowSuggestions = function(){
		$http.get('/getFollow').
		then(function(response){
			$scope.followSuggestions = response.data;
		});
	};
}]);

// tweetPanel directive
tweetApp.directive('tweetPanel', function($http){
  return {
      restrict: 'AE',
      replace : true,
      templateUrl: '/directives/temp.ejs',
      /* always isolated scope prop : '@attributeName*/
      scope: {
          twt : '=', 
          link: '='
      },
      link: function(scope, elem, attrs) {
    	  var temp = "";
    	  scope.link = "/viewProf/"+scope.twt.tweeted_by;
    	  scope.openProfile = function(){
				$http.get(scope.link).
				then(function(response){
					console.log(response);
				});
			};
		  scope.handleretweet = function(twt){
			  var retweetmodal = document.getElementById('retweetModal');
			  retweetmodal.style.display = "block";
			  temp = twt.tweet_msg;
			  console.log("Hey here:"+temp);
			  /*document.getElementById('retweet_txt').value=scope.twt.tweet_msg;*/
		  };
		  scope.retweetSub = function(twt) {
			  var retweetmodal = document.getElementById('retweetModal');
			  var retweetFormData = {"retweetMsg" : scope.twt.tweet_msg,
					  				 "comments"   : scope.twt.comments,
					  				 "retweet_by" : scope.twt.tweeted_by};
			  // http post
			  console.log(twt);
			  $http.post('/postRetweet', retweetFormData).
			  success(function(data) {
				  console.log("posted successfully");
			  }).error(function(data) {
				  console.error("error in posting");
			  });	
		      retweetmodal.style.display = "none";  
		    };
		  scope.close = function() {
			  var retweetmodal = document.getElementById('retweetModal');
			  retweetmodal.style.display = "none";
		  };  
      },
      transclude: true
  };  
});

// followPanel directive
tweetApp.directive('followPanel', function($http){
	return {
		restrict: "AE",
		replace : true,
		templateUrl: "/directives/follow.ejs",
		scope: {
			follow : '=',
			showFollowSuggestions: '&',
			link: '='
		},
		link: function (scope, elem, attrs) {
			scope.link = "/viewProf/"+scope.follow.user_ID;
			scope.followBtn = function(){
				$http.post('/postFollow', {user_id: scope.follow.user_ID}).
		        success(function(data) {
		            console.log("posted successfully");
		        }).error(function(data) {
		            console.error("error in posting");
		        });
				scope.showFollowSuggestions();
			}
			scope.openProfile = function(){
				$http.get(scope.link).
				then(function(response){
					console.log(response);
				});
			}
		}
	};
});

// get follow/followers/tweets count
tweetApp.controller('cntCtrl', ['$scope', '$http', function($scope, $http){
	$scope.followersCnt = 0;
	$scope.followingCnt = 0;
	$scope.tweetsCnt    = 0;
	$scope.user_ID = window.user_ID;
	// followers count
	$scope.getFollowersCnt = function(){
		var followersUrl = '/getFollowersCnt/'+$scope.user_ID;
		$http.get(followersUrl).
		then(function(response){
			$scope.followersCnt = response.data[0]["followerscnt"];
		});
	};
	// following count
	$scope.getFollowingCnt = function(){
		var followingUrl = '/getFollowingCnt/'+$scope.user_ID;
		$http.get(followingUrl).
		then(function(response){
			$scope.followingCnt = response.data[0]["followingcnt"];
		});
	};
	// tweets count
	$scope.getTweetsCnt = function(){
		var tweetsUrl = '/countTweets/'+$scope.user_ID;
		$http.get(tweetsUrl).
		then(function(response){
			$scope.tweetsCnt = response.data[0]["tweetscnt"];
		});
	};
}]);