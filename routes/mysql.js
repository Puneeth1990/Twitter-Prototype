var ejs= require('ejs');
var mysql = require('mysql');

//Put your mysql configuration settings - user, password, database and port
function getConnection(){
	var connection = mysql.createConnection({
	    host     : 'localhost',
	    user     : 'root',
	    password : 'Puneeth1990*',
	    database : 'twitter',
	    port	 : 3306
	});
	return connection;
}

// fetchData -- call back to fetch/insert the data from/to the DB
function fetchData(callback,sqlQuery){
	
	console.log("\nSQL Query::"+sqlQuery);
	
	var connection=getConnection();
	
	connection.query(sqlQuery, function(err, rows, fields) {
		if(err){
			console.log("ERROR: " + err.message);
		}
		else 
		{	// return err or result
			console.log("DB Results:"+JSON.stringify(rows));
		}
		callback(err, rows);
	});
	console.log("\nConnection closed..");
	connection.end();
}	

exports.fetchData=fetchData;