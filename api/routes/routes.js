'use strict';

const auth              = require('basic-auth');
const jwt               = require('jsonwebtoken');
const express   = require('express');
const router    = express.Router();
const task              = require('../models/task');


router.get('/', function (req, res) {
        // body...
        res.send('Welcome to Confirm2ME');
});

/*
        users Table
*/
router.post('/api/v1/registration', function(req, res, next) {
        task.registerUser(res, req.query, function(err) {
        });

});

router.get('/api/v1/login', function(req, res, next) {
        task.login(req.query, res, function(err) {
        });
});


router.get('/api/v1/findbyphone', function(req, res, next) {
        task.findByPhoneNumber(req.query.phonenumber, res, function(err, count) {
        });
});

router.get('/api/v1/userbyrequester', function(req, res, next) {
        task.getUserbyRequester(req.query.requester, req.query.provider, res, function(err, count) {
        });
});


router.get('/api/v1/userbyprovider', function(req, res, next) {
        task.getUserByProvider(req.query.name, res, function(err, count) {
        });
});

router.put('/api/v1/updateuser', function(req, res, next) {
        task.updateUser(req.query, function(err) {
                if (err) {
                        res.json({
                                Success : false,
                                Message : err
                        });
                } else {
                        res.json({
                                Success : true,
                                Message : "Update Success"
                        });
                }
        });
}) 


/*
        requets Table
*/
router.post('/api/v1/newrequest', function(req, res, next) {
        task.newRequest(req.query, function(err) {
                if (err) {
                        res.json({
                                Success : false,
                                Message : err
                        });
                } else {
                        res.json({
                                Success : true,
                                Message : "New Request Success"
                        });
                }
        });
});

router.delete('/api/v1/deleterequest', function(req, res, next) {
        console.log("AAA : ", req.query.idx);
        task.deleteRequest(req.query.idx, function(err) {
                if (err) {
                        res.json({
                                Success : false,
                                Message : err
                        });
                } else {
                        res.json({
                                Success : true,
                                Message : "Delete Request Success"
                        });
               }
        });
});

router.get('/api/v1/getallrequests', function(req, res, next) {
        task.getAllRequest(res, function(err) {
        });
});

router.get('/api/v1/requestsbyrequester', function(req, res, next) {
        task.getRequestsByRequester(req.query.Requester, res, function(err, rows) {
        });
});

router.get('/api/v1/requestsbyprovider', function(req, res, next) {
        task.getRequestsByProvider(req.query.Provider, res, function(err, rows) {
        });
});

router.get('/api/v1/CountbySenderMail', function(req, res, next) {
        task.CountBySenderMail(req.query.requester, res, function(err, rows) {
        });
});

router.get('/api/v1/CountbyReceiverMail', function(req, res, next) {
        task.CountByReceiverMail(req.query.provider, res, function(err, rows) {
        });
});

router.put('/api/v1/updatesendermail', function(req, res, next) {
        task.updateSenderMailUnread(req.query.idx, function(err) {
                if (err) {
                        res.json({
                                Success : false,
                                Message : err
                        });
                } else {
                        res.json({
                                Success : true,
                                Message : "Update Success"
                        });
                }
        });
});

router.put('/api/v1/updatereceivermail', function(req, res, next) {
        task.updateReceiverMailUnread(req.query.idx, function(err) {
                if (err) {
                        res.json({
                                Success : false,
                                Message : err
                        });
                } else {
                        res.json({
                                Success : true,
                                Message : "Update Success"
                        });
                }
        });
});

router.put('/api/v1/addvideo', function(req, res, next) {
        task.addVideo(req.query, function(err){
                if (err) {
                        res.json({
                                                Success : false,
                                                Message : err
                                        });
                } else {
                        res.json({
                                                Success : true,
                                                Message : "Added Success"
                                        });
                }
        });
});

router.put('/api/v1/updatesenderstatus', function(req, res, next) {
        task.updateSenderStatus(req.query, function(err) {
                if (err) {
                        res.json({
                                Success : false,
                                Message : err
                        });
                } else {
                        res.json({
                                Success : true,
                                Message : "Update Success"
                        });
                }
        });
});

router.post('/api/v1/upload', function(req, res, next) {
        task.uploadVideo(req, res, function(err) {
        });
        });

router.get('/api/v1/download', function(req, res, next) {
        task.downloadVideo(req, res, function(err) {
        });
});

/*
        affidavits Table
*/

router.post('/api/v1/addcategory', function(req, res, next) {
        task.addCategory(req.query, function(err) {
                if (err) {
                        res.json({
                                Success : false,
                                Message : err
                        });
                } else {
                        res.json({
                                Success : true,
                                Message : "Add Category Success"
                        });
                }
        });
});

router.get('/api/v1/getcategories', function(req, res, next) {
        task.getCategories(res, function(err) {
        });
});

router.get('/api/v1/getsortedcategories/:owner', function(req, res, next) {
        task.getSortedCategories(req.query.owner, res, function(err) {
        });
});

router.get('/api/v1/getcategorybyowner/:owner', function(req, res, next) {
        task.getCategoriesByOwner(req.query.owner, res, function(err) {
        });
});

module.exports.router = router;
