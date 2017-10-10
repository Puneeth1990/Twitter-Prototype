
/**
 * Module dependencies.
 */

var express 	= require('express');
var routes 		= require('./routes');
var http 		= require('http');
var path 		= require('path');
var login 		= require('./routes/login');
var register 	= require('./routes/register');
var session 	= require('client-sessions');
var bodyParser  = require('body-parser');

var app = express();

// all environments
app.use(session({
	  cookieName: 		'session',
	  secret: 			'random_string_goes_here', // string to encrypt the cookie
	  duration: 		30 * 60 * 1000, // how long the session lives in milliseconds
	  activeDuration: 	5 * 60 * 1000,  // duration of the session to be live after logging-in
	}));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// GET
app.get('/', routes.index);
app.get('/login', login.login);
app.get('/logout', login.logout);
app.get('/forgot', login.forgot);
app.get('/register', register.register);
app.get('/viewProf*', login.viewProf);
app.get('/home', login.returnLogin);
app.get('/getTweets*', login.getTweets);
app.get('/getFollow', login.getFollowSuggestions);
app.get('/countTweets*', login.getTweetsCnt);
app.get('/getFollowersCnt*', login.getFollowersCnt);
app.get('/getFollowingCnt*', login.getFollowingCnt);
app.get('/loginFail', login.loginFail);
app.get('/getUserDetails', login.getUserDetails);

// POST
app.post('/afterForgot', login.afterForgot);
app.post('/afterSignup', register.afterSignup);
app.post('/loginNew', login.handleTweetForm);
app.post('/postFollow', login.postFollow);
app.post('/authenticate', login.authenticate);
app.post('/editProf', login.editProf);
app.post('/postRetweet', login.postRetweet);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
