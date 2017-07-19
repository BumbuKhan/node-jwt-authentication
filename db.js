var mysql = require('mysql');
var config = require('./config');

var connection = mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME
});

connection.connect();

/*connection.query('SELECT 1 + 1 AS solution', function (error, results) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
});*/

module.exports = connection;