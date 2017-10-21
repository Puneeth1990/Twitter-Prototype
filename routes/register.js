var ejs = require('ejs');
var mysql = require('./mysql');

exports.register = function(req,res) {
	ejs.renderFile('./views/register.ejs',{ title: 'Twitter' },function(err, result) {
		if (!err) {
			console.log("In register page")
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.afterSignup = function(req,res) {
	var insertSignupDetails = "insert into twitter.register values('"
								+ req.param('fullName')
								+ "','" 
								+ req.param('password')
								+ "','"
								+ req.param('emailId') 
								+ ")";
	mysql.fetchData(function(error,results) {
		if(error) {
			if(error.code == "ER_DUP_ENTRY") {
				ejs.renderFile('./views/afterSignup.ejs', 
					{ 	title: 'Twitter',
						statusMsg: {
							message1: "Registration failed!",
							message2: "This username already exists."  
						}
					},
					function(err, result) {
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
			} else 
				throw error;
		}
		else {
			ejs.renderFile('./views/afterSignup.ejs',
					{ 	title: 'Twitter',
						statusMsg: {
							message1: "Registration successful!",
							message2: "Please login now."  
						}
					},
					function(err, result) {
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
	}, insertSignupDetails);
};