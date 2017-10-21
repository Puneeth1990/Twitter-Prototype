var ejs 	= require('ejs');
var mysql 	= require('./mysql');

exports.login = function(req,res) {
	ejs.renderFile('./views/login.ejs',{ title: 'Twitter' },function(err, result) {
		if (!err) {
			console.log("In login page")
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.logout = function(req,res) {
	ejs.renderFile('./views/login.ejs',{ title: 'Twitter' },function(err, result) {
		if (!err) {
			// kill the session
			req.session.destroy();
			req.session = {};
			res.end(result);
		}
		else
			res.end('An error occurred');
	});
};

exports.getFollowersCnt = function(req, res){
	var urlParts = req.url.split("/");
	var getFollowersCntQry = "SELECT COUNT(DISTINCT user_id) AS followerscnt from  twitter.tweetfollowers WHERE follower_ID='"+urlParts[2]+"'";
	mysql.fetchData(function(error, results) {
		if(error) throw error;
		else {
			res.send(results);
			res.end();
		}
	}, getFollowersCntQry);
}

exports.getFollowingCnt = function(req, res){
	var urlParts = req.url.split("/");
	var getFollowingCntQry = "SELECT COUNT(DISTINCT follower_id) AS followingcnt from  twitter.tweetfollowers WHERE user_ID='"+urlParts[2]+"'";
	mysql.fetchData(function(error, results) {
		if(error) throw error;
		else { 
			res.send(results);
			res.end();
		}
	}, getFollowingCntQry);
}

exports.getTweetsCnt = function(req, res){
	var urlParts = req.url.split("/");
	var gettweetCntQry = "SELECT COUNT(tweet_msg) AS tweetscnt from  twitter.tweet WHERE tweeted_by='"+urlParts[2]+"'";
	mysql.fetchData(function(error, results) {
		if(error) throw error;
		else { 
			res.send(results);
			res.end();
		}
	}, gettweetCntQry);
}

// this is required to disable browser caching; this makes browser not pick a webpage
// from its cache after user is logged out
exports.authenticate = function(req, res){
	var selectLoginDetails ="select * from twitter.login where emailId='"+req.param('emailId')+"' and password='"+req.param('password')+"'";
	var authenticateResults;
	mysql.fetchData(function(error, results) {
		if(error)
			throw error;
		else {
			// handle login fail - 2 characters '[', ']'
			if(JSON.stringify(results).length > 2){
				// initialize a session
				req.session.userID = req.param('emailId');
				// update the result JSON
				authenticateResults = {"status" : "SUCCESS", "emailId" : results[0]["emailId"]};
				// send the JSON response
				res.send(authenticateResults);
				res.end();
			} else {
				// update the result JSON
				authenticateResults = {"status" : "FAIL", "emailId" : req.param('emailId')};
				// send the JSON response
				res.send(authenticateResults);
				console.log(authenticateResults);
				res.end();
			}
		}
	}, selectLoginDetails);
}

// direct to login failure page
exports.loginFail = function(req, res) {
	ejs.renderFile('./views/loginFail.ejs', { title: 'Twitter' }, function(err, result){
		if (!err)
			res.end(result);
		else
			console.log(err);
	});
}

// this function is called after login details are authenticated
// and caching is not enabled on this page; every time reloads from server not from browser cache
exports.returnLogin = function(req,res) {	
	if(req.session.userID)
	{
		var selectLoginDetails ="select * from twitter.login where emailId='"+req.session.emailId+"'";
		// set no-caching on this file, when user is logged-in
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		mysql.fetchData(function(error, results) {
			if(error)
				throw error;
			else {
				ejs.renderFile('./views/loginNew.ejs', { title: 'Twitter', emailId: results[0]["emailId"], emailI: results[0].emailId}, function(err, result) {
					if (!err)
						res.end(result);
					else
						res.end('An error occurred');
				});
			}
		}, selectLoginDetails);
	}
	else
		res.redirect('/login');
};

exports.forgot = function(req,res) {
	ejs.renderFile('./views/forgot.ejs',{ title: 'Twitter' },function(err, result) {
		if (!err)
			res.end(result);
		else
			res.end('An error occurred');
	});
};

// FIXME: AG: Extend forgot pw functionality
exports.afterForgot = function(req, res){
	var selectLoginDetails ="select * from twitter.login where emailId='"+req.param('emailId')+"'";
	
	mysql.fetchData(function(error,results) {
		if(error)
		{
			throw error;
		}
		else{
			// handle login fail - 2 characters '[', ']'
			if(JSON.stringify(results).length > 2)
				ejs.renderFile('./views/login.ejs', { title: 'Twitter'}, function(err, result) {
					// render on success
					if (!err) {
						res.end(result);
					}
					// render or error
					else {
						res.end('An error occurred');
						console.log(err);
					}
				});
			else
				ejs.renderFile('./views/loginFail.ejs', { title: 'Twitter' }, function(err, result) {
					// render on success
					if (!err) {
						res.end(result);
					}
					// render or error
					else {
						res.end('An error occurred');
						console.log(err);
					}
				});
				
		}
	}, selectLoginDetails);
};

exports.viewProf = function(req,res) {
	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
	                  "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
	
	var urlParts = req.url.split("/");
	
	var getUserProfile = "";
	var getMyTweetsQry = "";
	
	if(urlParts.length == 2) {
		getUserProfile = "select * from twitter.login where emailId='"+req.session.emailId+"'";
		getMyTweetsQry = "select * from twitter.tweet where tweeted_by='"+req.session.userID+"' order by tweet_id desc limit 10";
	}
	else {
		getUserProfile = "select * from twitter.twitterprototype where user_ID='"+urlParts[2]+"'";
		getMyTweetsQry = "select * from twitter.tweet where tweeted_by='"+urlParts[2]+"' order by tweet_id desc limit 10";
	}
	
	var profileResults;
	
	mysql.fetchData(function(error,results) {
		if(error)
			throw error;
		else {
			profileResults = results;
			ejs.renderFile('./views/viewProf.ejs', { title: 'Twitter',
				 userName: profileResults[0]["userName"],
				 emailId: profileResults[0].emailId},
				 function(err, result) {
					 // render on success
					 if (!err) {
						 console.log("PROF DETAILS::"+JSON.stringify(results));
						 res.end(result);
					 }
					 // render or error
					 else {
						 res.end('An error occurred');
						 console.log(err);
					 }
				 });
		}
	}, getUserProfile);
};

exports.handleTweetForm = function(req,res){
	var insertTweetMsg = "insert into twitter.tweet (tweeted_by, tweet_msg, tweet_date) values('"
		+ req.session.userID
		+ "','" 
		+ req.body.tweetMsg
		+ "'," 
		+ "NOW()"
		+ ")";
	var getTweetsQry = "select * from twitter.tweet order by tweet_id desc limit 10";
	mysql.fetchData(function(error,results) {
		if(error)
			throw error;
		else{
			ejs.renderFile('./views/loginNew.ejs', { title: 'Twitter', user_name: req.session.user_name, user_ID: req.session.user_ID }, function(err, result) {
				// render on success
				if (!err) {
					res.end();
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});
		} 		
	}, insertTweetMsg);
};

exports.postRetweet = function(req, res){
	var insertRetweetQry = "INSERT INTO twitter.tweet (tweeted_by, tweet_msg, tweet_date, retweet, comments, retweeted_by) VALUES ('"
							+ req.session.userID
							+ "','" 
							+ req.body.retweetMsg
							+ "'," 
							+ "NOW()"
							+ ", 1"
							+ ", '"
							+ req.body.comments
							+ "', '"
							+ req.body.retweet_by
							+ "')";
	console.log("Got retweet Msg"+req.body.retweetMsg);
	mysql.fetchData(function(error,results) {
		if(error)
			throw error;
		else{
			ejs.renderFile('./views/loginNew.ejs', { title: 'Twitter', user_name: req.session.user_name, user_ID: req.session.user_ID }, function(err, result) {
				// render on success
				if (!err) {
					res.end();
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});
		} 		
	}, insertRetweetQry);
};

exports.getTweets = function(req, res){
	var getTweetsQry = "";
	var urlParts = req.url.split("/");
	if(urlParts.length == 2)
		getTweetsQry = "SELECT * FROM twitter.tweet WHERE tweeted_by IN ( SELECT follower_id from twitter.tweetfollowers WHERE user_id = '"+
		req.session.userID+"') ORDER BY tweet_date DESC, tweet_id DESC";
	else
		getTweetsQry = "select * from twitter.tweet where tweeted_by='"+urlParts[2]+"' order by tweet_id desc limit 10";
	mysql.fetchData(function(error, results) {
		if(error) {
			throw error;
		}
		else {
			console.log("Got the top 5 tweets "+JSON.stringify(results));
			res.send(results);
			res.end();
		}
	}, getTweetsQry);
};

exports.getFollowSuggestions = function(req, res){
	var getFollowQry = "SELECT * FROM twitter.twitterprototype WHERE twitterprototype.user_id !='"+ req.session.userID +"' AND twitterprototype.user_ID NOT IN " +
						"((SELECT tweetfollowers.follower_id FROM twitter.tweetfollowers WHERE tweetfollowers.user_id = '" 
						+ req.session.userID 
						+"')" 
						 
						+") LIMIT 4";
	
	mysql.fetchData(function(error, results) {
		if(error) throw error;
		else {
			console.log("getFollowSuggestions: results:"+JSON.stringify(results));
			// filter the data
			res.send(results);
			res.end();
		}
	}, getFollowQry);
};

exports.postFollow = function(req, res){
	var postFollowQry = "INSERT INTO twitter.tweetfollowers (user_id, follower_id) values('"
		+ req.session.userID
		+ "','" 
		+ req.body.user_id
		+ "')";
	mysql.fetchData(function(error, results) {
		if(error) throw error;
		else {
			res.end();
		}
	}, postFollowQry);
	
};

exports.getUserDetails = function(req, res){
	var getUserDetailsQry = "SELECT fullName, emailId, phoneNumber FROM twitter.register WHERE userName = '"+req.session.userName+"';"
	mysql.fetchData(function(error, results) {
		if(error) throw error;
		else {
			console.log("getUserDetails: results:"+JSON.stringify(results));
			// filter the data
			res.send(results);
			res.end();
		}
	}, getUserDetailsQry);
};


exports.editProf = function(req, res){
	var editProfQry = "UPDATE twitter.twitterprototype SET "
					  + "user_name = '"
					  + req.param('userName')
					  + "', email_id = '"
					  + req.param('emailId')
					  + "', phone_num = '"
					  + req.param('phoneNum')
					  + "' WHERE user_ID = '"
					  + req.param('userID')
					  + "';"	 
	mysql.fetchData(function(error, results) {
		if(error) throw error;
		else {
			res.send({ 	title: 'Twitter',
						statusMsg: {
							message: "Saved!",  
						}
					});
			res.end();
		}
	}, editProfQry);
};






