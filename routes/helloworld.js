/**
 * New node file
 */
exports.getHelloWorld = function(req, res){
	console.log("In getHelloWorld method call");
	var response_string = {"message":"HelloWorld"};
	
	res.send(JSON.stringify(response_string));
	
	res.end();
}