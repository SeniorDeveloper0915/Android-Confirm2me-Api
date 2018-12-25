/*
 * Moudel dependencies
 */

var     express                 = require("express");
var     app                     = express();
var     bodyParser              = require('body-parser');
var     cookieParser    = require('cookie-parser');
const   logger                  = require('morgan');
const   router                  = express.Router();
var     port                    = process.env.PORT || 8080;
const   mysql                   = require('mysql');
var     routes                  = require('./api/routes/routes').router;
const   config                  = require('./api/config/config');

const   connection              = mysql.createConnection({
        host            : config.host,
        user            : config.user,
        password        : config.password
});

const   tmpCon                  = mysql.createConnection({
        host            : config.host,
        user            : config.user,
        password        : config.password,
        database        : config.database
});


connection.connect(function (err, result) {
        // body...
        // if (err.database == undefined)
        if (err == null || err.code == null || err.database){
                connection.query( "CREATE DATABASE confirm2me", function(err, result) {
                        if (err)
                        {
                                return;
                        }
                        console.log("Database Created");
                        console.log("no error");
                        var users = "CREATE TABLE users (id INT AUTO_INCREMENT KEY, userName VARCHAR(20), password VARCHAR(20), email VARCHAR(30), firstname VARCHAR(20), lastname VARCHAR(20), phonenumber VARCHAR(20), PIN VARCHAR(10))";
                        var requests = "CREATE TABLE requests (id INT AUTO_INCREMENT KEY, Requester VARCHAR(20), affidavit_category VARCHAR(20), affidavit_description VARCHAR(200), sender_status VARCHAR(20), receiver_status VARCHAR(20), sender_mail_unread BOOLEAN, receiver_mail_unread BOOLEAN, provider_pNumber VARCHAR(20), video VARCHAR(100), updated_at VARCHAR(20))";
                        var affidavits = "CREATE TABLE affidavits (id INT AUTO_INCREMENT KEY, no INT, category VARCHAR(20), description VARCHAR(255), owner VARCHAR(20))";
                        tmpCon.connect(function(err) {
                                tmpCon.query(users, function(err, result) {
                                        if (err){
                                                console.log(err);
                                                return;
                                        }
                                });
                                tmpCon.query(requests, function(err) {
                                        if (err) {
                                                console.log(err);
                                                return;
                                        }
                                });
                                tmpCon.query(affidavits, function(err) {
                                        if (err) {
                                                console.log(err);
                                                return;
                                        }
                                });
                        });
                });

        }
});

app.use(cookieParser());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
        extended: false
}));


app.use('/', routes);

app.use(logger('dev'));

app.listen(port);

console.log('APP runs on : ' + port);
module.exports = app;