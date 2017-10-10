
/*
 * GET home page.
 */

exports.index = function(req, res){
	// render the index page	
	res.render('index', { title: 'Twitter' });
};

