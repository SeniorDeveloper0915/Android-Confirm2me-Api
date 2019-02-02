const   mysql                   = require('mysql');
const   config                  = require('../config/config');
const   bcrypt                  = require('bcryptjs');
const   fs                      = require('fs');
const   formidable              = require('formidable');
const   randomstring            = require("randomstring");
const   path                    = require('path');
const   dateFormat              = require('dateformat');
const   date                    = require('date-and-time');
const   FCM                     = require('fcm-call');
const   nodemailer              = require('nodemailer');
const   mail                    = require('nodemailer').mail;

const   connection              = mysql.createConnection({
        host            : config.host,
        user            : config.user,
        password        : config.password,
        database        : config.database
});

var smtpTransport = nodemailer.createTransport("SMTP", {
                  service : 'gmail',
                        auth :  {
                                user : 'jin.cheng.19900915@gmail.com',
                                pass : 'jincheng0915'
                        }
                });


var Task = {
        /*
                users Table
        */

        registerUser : function(res, Task, callback) {
console.log(Task);
                var data = {
                        userName                : Task.userName,
                        password                : Task.password,
                        email                   : Task.email,
                        firstname               : Task.firstname,
                        lastname                : Task.lastname,
                        phonenumber             : Task.phonenumber,
                        PIN                     : Task.PIN,
                        FCM_Token               : Task.Token
                };

                return connection.query("SELECT * FROM users where userName = ?", [Task.userName], function(err, results) {


                        if (!err){
                                if (results.length > 0) {
                                        res.json({
                                                Code    : 400,
                                                Success : false,
                                                Message : "UserName is conflicted."
                                        });
                                } else {
                                        connection.query("SELECT * FROM users where email = ?", [Task.email], function(err, results) {
                                                if (!err) {
                                                        if (results.length > 0) {
                                                                res.json({
                                                                        Code    : 401,
                                                                        Success : false,
                                                                        Message : "Email is conflicted."
                                                                });
                                                        } else {
                                                                connection.query("INSERT INTO users set ?", data , function(error, results, fields) {
                                                                        if (!error) {
                                                                                res.json({
                                                                                        Code            : 200,
                                                                                        Success         : true,
                                                                                        Message         : "Register Success"
                                                                                });
                                                                        }
                                                                });
                                                        }
                                                }
                                        });

                                }
                        } else {
                                res.json({
                                        Code : 403,
                                        Success : false,
                                        Message : "error ocurred"
                                });
                        }
                });
        },

        login : function(Task, res, callback) {
                var username = Task.userName;
                var password = Task.password;

                return connection.query('SELECT * FROM users WHERE userName = ?', [username], function(error, results, fields) {

                        if (error) {
                                res.json({
                                        Code    : 403,
                                        Success : false,
                                        Message : "error ocurred"
                                });
                        } else {
                                if ( results.length > 0 ){
                                        if (password  === results[0].password) {
                                                res.json({
                                                        Code    : 200,
                                                        Success : true,
                                                        Message : "login successfull",
                                                        User    : results
                                                });
                                        } else {
                                                res.json({
                                                        Code    : 401,
                                                        Success : false,
                                                        Message : "Password does not match"
                                                });
                                        }
                                } else {
                                        res.json({
                                                Code    : 402,
                                                Success : false,
                                                Message : "User does not exits"
                                        });
                                }
                        }
                })
        },

        findByPhoneNumber :  function(phonenumber, res, callback) {
                connection.query("SELECT * from users where phonenumber = ?", [phonenumber], function(error, results, fields) {
                        if (error) {
                                res.json({
                                        Success : false,
                                        Message : "error ocurred"
                                });

                        } else {
                                if ( results.length > 0 ){
                                        res.json({
                                                Success : true,
                                                User : results
                                        });
                                } else {
                                        res.json({
                                                Success : false,
                                                Message : "User does not exits"
                                        });
                                }
                        }
                })
        },

        getUserbyRequester :  function(requester, provider, res, callback) {
                let rEquester, pRovider;

                connection.query("SELECT firstname, lastname, FCM_Token from users where userName = ?", [requester], function(error, results, fields) {
                        if (error) {
                                res.json({
                                        Success : false,
                                        Message : "error ocurred"
                                });

                        } else {
                                if ( results.length > 0 ){
                                        rEquester = results;
                                        connection.query("SELECT * from users where userName = ?", [provider], function(error, results, fields) {
                                                if (error) {
                                                        res.json({
                                                                Success :  false,
                                                                Message : "error ocurred"
                                                        });
                                                } else {
                                                        if (results.length > 0) {
                                                                pRovider = results;
                                                                res.json({
                                                                        Success : true,
                                                                        Requester : rEquester,
                                                                        Provider : results
                                                                });
                                                        }
                                                }
                                        });
                                } else {
                                        res.json({
                                                Success : false,
                                                Message : "User does not exits"
                                        });
                                }
                        }
                });
        },

        getUserByProvider :  function(name, res, callback) {
                connection.query("SELECT * from users where userName = ?", [name], function(error, results, fields) {
                        if (error) {
                                res.json({
                                        Success : false,
                                        Message : "error ocurred"
                                });
                        } else {
                                if ( results.length > 0 ){
                                        res.json({
                                                Success : true,
                                                User : results
                                        });
                                } else {
                                        res.json({
                                                Success : false,
                                                Message : "User does not exits"
                                        });
                                }
                        }
                })
        },

        getUserByEmail :   function(email, res, callback) {


                connection.query("SELECT * from users where email = ?", [email], function(error, results, fields) {
                        if (error) {
                                res.json({
                                        Success : false,
                                        Message : "error ocurred"
                                });
                        } else {
                                if ( results.length > 0 ){
                                        console.log(results[0].email);
                                        var link = "http://18.235.201.14/ResetPasswordHtml/index.php?token=" + results[0].FCM_Token;
                                        var data = {
                                                from : 'Confirm2Me  <noreply@confirm2me.com>',
                                                to : results[0].email,
                                                subject : 'Password help has arrived!',
                                                html : '<a href="' + link + '">Click here to rest password</a>'
                                        };
                                        smtpTransport.sendMail(data, function(err, response) {

                                                if (!err) {
                                                        console.log('response->', response);
                                                        res.json({
                                                                Success : true
                                                        });
                                                } else  {
                                                        console.error('was an error: ', err);
                                                        res.json({
                                                                Success : false,
                                                                Message : err
                                                        });
                                                }
                                        });
/*
                                        var link = "http://18.235.201.14/ResetPasswordHtml/index.php?token=" + results[0].FCM_Token;
                                        mail({
                                                          from : 'Confirm2Me  <noreply@confirm2me.com>',                                                to : results[0].email,
                                                subject : 'Password help has arrived!',
                                                text : 'ajksdajfkasdfjkajklasdjfkasdfjkjasdkfjsadkfj;saidfj;kljkasdfjklasdjf;ajsdfkljasdfjalksdfja;lsdkfjalskdjfasjdfajdlfja;sdfkjasdkfj;asdkjflasdkjflasdjfksjadflkjsdflkjasdlkfjsaldkfjlaskdfjlasdjflkasdjflkasdfjasdflkjasdlkfjlsadf',
                                                html : "<b> Hello there </b>"
                                        }, function(err) {
                                                if (err)
                                                        res.json({
                                                                Success : false,
                                                                Message : err
                                                        });
                                                else
                                                        res.json({
                                                                Success : true
                                                        });
                                        });
*/
                                } else {
                                        res.json({
                                                Success : false,
                                                Message : "User does not exits"
                                        });
                                }
                        }
                })
        },
        updateUser : function(Task, callback) {
                const salt = bcrypt.genSaltSync(10);
                console.log(Task);
                var newUser = {
                        userName                : Task.userName,
                        password                : Task.password,
                        email                   : Task.email,
                        firstname               : Task.firstname,
                        lastname                : Task.lastname,
                        phonenumber     : Task.phonenumber,
                        PIN                     : Task.PIN
                }
                return connection.query("UPDATE users SET ? where id = ?", [newUser, Task.idx], callback);
        },

        resetPassword : function(Task, callback) {
                return connection.query("UPDATE users SET password = ? where FCM_Token = ?", [Task.password, Task.token], callback);
        },

        /*
                requests Table
        */
        newRequest : function(Task, callback) {
                let now = new Date();
                const request = {
                        Requester                               : Task.Requester,
                        affidavit_category              : Task.affidavit_category,
                        affidavit_description   : Task.affidavit_description,
                        sender_status                   : Task.sender_status,
                        receiver_status                 : Task.receiver_status,
                        sender_mail_unread              : Task.sender_mail_unread,
                        receiver_mail_unread    : Task.receiver_mail_unread,
                        provider_pNumber                : Task.provider_pNumber,
                        video                                   : "",
                        updated_at                      : date.format(now, 'MMM/DD/YYYY')
                };

                return connection.query("INSERT INTO requests set ?", request , callback);
        },

        deleteRequest : function(idx, callback) {
                return connection.query("DELETE FROM requests where id = ?", [idx], callback);
        },

        getAllRequest : function(res, callback) {
                connection.query("SELECT * from requests", function(error, results, fields) {
                        if (error) {
                                res.json({
                                        Success : false,
                                        Message : "Failed"
                                });
                        } else {
                                if ( results.length  > 0) {
                                        res.json({
                                                Success  : true,
                                                Requests : results
                                        });
                                } else {
                                        res.json({
                                                Success : false,
                                                Message : "There is no requests"
                                        });
                                }
                        }
                });
        },

        getRequestsByRequester : function(requester, res, callback) {
                connection.query("SELECT * from requests where Requester = ? ORDER BY updated_at", [requester], function(error, results, fields) {
                        if (error) {
                                res.json({
                                        Code    : 403,
                                        Success : false,
                                        Message : "error ocurred"
                                });
                        } else {
                                if ( results.length > 0 ){
                                        res.json({
                                                Code     : 200,
                                                Success  : true,
                                                Requests : results
                                        });
                                } else {
                                        res.json({
                                                Code     : 401,
                                                Success  : true,
                                                Message  : "There is no requests"
                                        });
                                }
                        }
                });
        },

        getRequestsByProvider : function(provider, res, callback) {
                connection.query("SELECT * from requests where provider_pNumber = ? ORDER BY updated_at", [provider], function(error, results, fields) {
                        if (error) {
                                res.json({
                                        Code    : 403,
                                        Success : false,
                                        Message : "error ocurred"
                                });
                        } else {
                                if ( results.length > 0 ){
                                        res.json({
                                                Code     : 200,
                                                Success  : true,
                                                Requests : results
                                        });
                                } else {
                                        res.json({
                                                Code     : 401,
                                                Success  : true,
                                                Message  : "There is no requests"
                                        });
                                }
                        }
                });
        },

        CountBySenderMail : function(requester, res, callback) {
                connection.query("SELECT * from requests where Requester = ? and sender_mail_unread = ?", [requester, 0], function(error, results, fields) {
                        if (error) {
                                res.json({
                                        Success : false,
                                        Message : error
                                });
                        } else {
                                console.log(results.length);
                                res.json({
                                        Success : true,
                                        Count   : results.length
                                });
                        }
                });
        },

        CountByReceiverMail : function(provider, res, callback) {
                connection.query("SELECT * from requests where provider_pNumber = ? and receiver_mail_unread = ?", [provider, 0], function(error, results, fields) {
                        if (error) {
                                res.json({
                                        Success : false,
                                        Message : "error ocurred"
                                });
                        } else {
                                res.json({
                                        Success : true,
                                        Count   : results.length
                                });
                        }
                });
        },

        updateSenderMailUnread : function(idx, callback) {
                return connection.query("UPDATE requests SET sender_mail_unread = ? where id = ?", [true, idx], callback);
        },

        updateReceiverMailUnread : function(idx, callback) {
                return connection.query("UPDATE requests SET receiver_mail_unread = ? where id = ?", [true, idx], callback);
        },

        updateSenderStatus : function(Task, callback) {
                return connection.query("UPDATE requests SET sender_status = ?, receiver_mail_unread = ? where id = ?", [Task.status, true, Task.idx], callback);
        },

        updateReceiverStatus : function(Task, callback) {
                return connection.query("UPDATE requests SET receiver_status = ?, sender_mail_unread = ? where id = ?", [Task.status, true, Task.idx], callback);
        },
        addVideo : function(Task, callback) {
                return connection.query("UPDATE requests SET receiver_status = ?, sender_mail_unread = ?, video = ? where id = ?", [Task.status, true, Task.video, Task.idx], callback);

        },

        uploadVideo : function(req, res, callback) {
                var form = new formidable.IncomingForm();
                form.parse(req, function(err, fields, files) {
                        var oldpath = files.filetoupload.path;
                        var filename = randomstring.generate(7);
                        var newpath = "./" + filename + ".mp4";
                        fs.rename(oldpath, newpath, function(err) {
                                if (err)
                                        throw err;
                                res.send({
                                        filename : filename
                                });
                                res.end();
                        });
                });
        },

        downloadVideo : function(req, res, callback) {
                fs.exists(req.query.filename, function(exist) {
                        if (!exist) {
                                console.log('Not Found');
                                res.statusCode = 404;
                                res.end('Not Found!');
                                return ;
                        }
                        var path = req.query.filename;
                        var stat = fs.statSync(path);
                        var total  = stat.size;
                        if (req.headers.range) {   // meaning client (browser) has moved the forward/back slider
                                                   // which has sent this request back to this server logic ... cool
                                var range = req.headers.range;
                                var parts = range.replace(/bytes=/, "").split("-");
                                var partialstart = parts[0];
                                var partialend = parts[1];

                                var start = parseInt(partialstart, 10);
                                var end = partialend ? parseInt(partialend, 10) : total-1;
                                var chunksize = (end-start)+1;

                                var file = fs.createReadStream(path, {start: start, end: end});
                                res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
                                file.pipe(res);

                        } else {

                                res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
                                fs.createReadStream(path).pipe(res);
                        }

                });
        },

        /*
                categories Table
        */

        addCategory : function(Task, callback) {
                var category = {
                        no                              : Task.no,
                        category                : Task.category,
                        description     : Task.description,
                        owner                   : Task.owner
                };
                return connection.query("INSERT INTO affidavits set ?", category , callback);
        },

        getCategories : function(res, callback) {
                connection.query("SELECT * FROM affidavits", function(error, results) {
                        if (error) {
                                res.json({
                                        Success : false,
                                        Message : "Failed"
                                });
                        } else {
                                if ( results.length  > 0) {
                                        res.json({
                                                Success         : true,
                                                Categories  : results
                                        });
                                } else {
                                        res.json({
                                                Success : false,
                                                Message : "There is no categories"
                                        });
                                }
                        }
                });
        },

        getSortedCategories : function(owner, res, callback) {
                connection.query("select * from affidavits where owner = ? or owner is null order by no ASC", [owner], function(error, results) {
                        if (error != null) {
                                res.json({
                                        Code    : 403,
                                        Success : false,
                                        Message : "Error Ocurred"
                                });
                        } else {
                                if ( results.length  > 0) {
                                        res.json({
                                                Code            : 200,
                                                Success         : true,
                                                Categories  : results
                                        });
                                } else {
                                        res.json({
                                                Code    : 401,
                                                Success : true,
                                                Message : "There is no categories"
                                        });
                                }
                        }
                });
        },

        getCategoriesByOwner : function(Owner, res, callback) {
                connection.query("SELECT * FROM affidavits where owner = ?", [Owner], function(error, results) {
                        if (error) {
                                res.json({
                                        Success : false,
                                        Message : "Failed"
                                });
                        } else {
                                if ( results.length  > 0) {
                                        res.json({
                                                Success    : true,
                                                Categories : results
                                        });
                                } else {
                                        res.json({
                                                Success : false,
                                                Message : "There is no categories"
                                        });
                                }
                        }
                });
        },

        pushNotification(res, Task, callback) {
                return connection.query("UPDATE users SET FCM_Token  = ? where id = ?", [Task.Token, Task.idx], callback);
        },
};

module.exports = Task;

