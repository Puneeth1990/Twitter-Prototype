var ejs = require('ejs');
var mysql = require('./mysql');

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

exports.afterLogin = function(req,res) {
	var selectLoginDetails ="select * from test.profiles where user_name='"+req.param('userName')+"' and password='"+req.param('passWord')+"'";
	
	mysql.fetchData(function(error,results) {
		if(error)
		{
			throw error;
		}
		else{
			// handle login fail - 2 characters '[', ']'
			if(JSON.stringify(results).length > 2)
				ejs.renderFile('./views/home.ejs', { title: 'Twitter' }, function(err, result) {
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