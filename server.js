const dotenv = require('dotenv').config()
//const dotenvres = dotenv.config()
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID;

if(dotenv.error) throw dotenv.error;

console.log(dotenv.parsed);

const MONGO_USER = process.env.MONGO_USER;

const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

const MONGO_URL = 'mongodb://'+MONGO_USER+':'+MONGO_PASSWORD+'@ds237409.mlab.com:37409/darknessprevails';

var db

var current_user_server;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

MongoClient.connect(MONGO_URL, (err, client) => {
    if (err) return console.log(err)
    db = client.db('darknessprevails')
    app.listen(process.env.PORT || 3000, function () {
        console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
    })
})
console.log('May Node be with you')

/* app.listen(process.env.PORT || 3000, function (){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
}) */

app.use(express.static(__dirname + '/public'));

//navigation
app.get('/', function(req, res){
    //res.send('Hello World')
    res.sendFile(__dirname + '/pages/submit.html')
})

app.get('/login.html', function (req, res) {
    //res.send('Hello World')
    res.sendFile(__dirname + '/pages/login.html')
})

app.get('/submit.html', function (req, res) {
    db.collection('users').find({ 'username': req.query.username, 'email': req.query.email, 'salt': sha1(req.query.salt) }).toArray((err, results) => {
        if (results.length) {
            res.sendFile(__dirname + '/pages/submit.html', results[0])
        } else {
            res.sendFile(__dirname + '/pages/submit.html')
        }
    })
})

app.get('/read.html', function (req, res) {
    //res.send('Hello World')
    res.sendFile(__dirname + '/pages/read.html', { 'id': req.query.id })
    console.log(req.query)
})

app.get('/feed.html', function (req, res) {
    //res.send('Hello World')
    res.sendFile(__dirname + '/pages/feed.html')
})

//API controllers
app.get('/feedinfo', (req,res) => {
    db.collection('darknessprevailssubmissions').find().sort({ 'submitdate': -1 }).toArray((err, results) => {
        if(results.length) {
            res.contentType('application/json');
            var data = JSON.stringify(results)
            res.header('Content-Length', data.length);
            res.end(data);
        }
    })
})

app.post('/obtainstory', (req, res) => {
    console.log(req.body.id);
    db.collection('darknessprevailssubmissions').find({'_id': new ObjectID(req.body.id)}).toArray((err, results) => {
        if (results.length) {
            res.contentType('application/json');
            var data = JSON.stringify(results);
            res.header('Content-Length', data.length);
            res.end(data);
        }
    })
})

app.post('/obtainvotes', (req, res) => {
    //console.log(req.body)
    db.collection('darknessprevailssubmissions').find({ '_id': new ObjectID(req.body.id) }).toArray((err, results) => {
        if (results.length) {
            res.contentType('application/json');
            var data = JSON.stringify(results)
            res.header('Content-Length', data.length);
            console.log(data);  
            res.end(data);
        }
    })
})

app.post('/obtaincomments', (req, res) => {
    //console.log(req.body);
    var resultsss = db.collection('comments').find({ 'storyid': req.body.id })
    if (resultsss == null){
        res.end('No Comments');
    }
    else {
        db.collection('comments').find({ 'storyid': req.body.id }).toArray((err, results) => {
            if (err) {
                res.end('No Comments');
            }

            if (results.length) {
                res.contentType('application/json');
                var data = JSON.stringify(results);
                res.header('Content-Length', data.length);
                res.end(data);
            } else {
                res.end('No Comments');
            }

            
        })
    } 
})

app.post('/updatevotes', (req, res) => {
    console.log(req.body)
    db.collection('darknessprevailssubmissions').update(
        { '_id': new ObjectID(req.body.id) },
        {
            $set:
                {
                    "votes": req.body.votes, "voters": req.body.voters, "votetype": req.body.votetype
                }
        }, (err, results) => {
            if (results.length) {
                res.contentType('application/json');
                var data = JSON.stringify(results)
                res.header('Content-Length', data.length);
                console.log(data);
                res.end(data);
            }
        }
    )
})

app.post('/updateviews', (req, res) => {
    console.log(req.body)
    db.collection('darknessprevailssubmissions').update(
        { '_id': new ObjectID(req.body.id) },
        {
            $set:
                {
                    "views": req.body.views
                }
        }, (err, results) => {
            if (results.length) {
                res.contentType('application/json');
                var data = JSON.stringify(results)
                res.header('Content-Length', data.length);
                console.log(data);
                res.end(data);
            }
        }
    )
})

app.post('/getlogin', (req, res) => {
    finduserwithemail(req.body, res); 
})

app.post('/posts', (req,res) => {
    console.log(JSON.stringify(req.body));
    db.collection('darknessprevailssubmissions').save(req.body, (err, result) => {
        if (err) return console.log(err)

        console.log('saved submission to database');
        console.log(result.ops[0]._id);

        //req.method = 'get';
        res.contentType('application/json');
        var data = JSON.stringify('/read.html?id=' + result.ops[0]._id)
        res.header('Content-Length', data.length);
        res.end(data); 


    })
})

app.post('/comments', (req, res) => {
    console.log(JSON.stringify(req.body));
    db.collection('comments').save(req.body, (err, result) => {
        if (err) return console.log(err)

        console.log('saved submission to database');
        console.log(result.ops[0]._id);

        //req.method = 'get';
        res.contentType('application/json');
        var data = JSON.stringify('/read.html?id=' + result.ops[0]._id)
        res.header('Content-Length', data.length);
        res.end(data);


    })
})

//helper functions

function finduserwithemail(data, res){
    db.collection('users').find({'email': data.email}).toArray((err,results) => {
        console.log(results[0]._id);
        if (results.length) updateusersalt(data, results[0]._id, res);
        else finduserwithusername(data, res);
    })
}

function finduserwithusername(data, res) {
    db.collection('users').find({ 'username': data.username }).toArray((err, results) => {
        if (results.length) updateusersalt(data, results[0]._id, res);
        else createnewuser(data, res);
    })
}

function createnewuser(data, res) {
    db.collection('users').save({'username': data.username, 'email': data.email, 'salt': sha1(data.salt)}, (err,results) => {
        if(results.length){
            res.contentType('application/json');
            var data = JSON.stringify(results)
            res.header('Content-Length', data.length);
            res.end(data);
        }
    })
}

function updateusersalt(data, id, res){
    db.collection('users').update(
        {'_id': new ObjectID(id)},
        { $set: 
            {
                "salt" : sha1(data.salt)
            }
        }, (err, results) => {
            if(results.length) {
                res.contentType('application/json');
                var data = JSON.stringify(results)
                res.header('Content-Length', data.length);
                res.end(data);
            }
        }    
    )
}

function sha1(msg) //borrowed from 'https://softwareengineering.stackexchange.com/questions/76939/why-almost-no-webpages-hash-passwords-in-the-client-before-submitting-and-hashi'
{
    function rotl(n, s) { return n << s | n >>> 32 - s; }
    function tohex(i) { for (var h = "", s = 28; ; s -= 4) { h += (i >>> s & 0xf).toString(16); if (!s) return h; } }
    var H0 = 0x67452301, H1 = 0xEFCDAB89, H2 = 0x98BADCFE, H3 = 0x10325476, H4 = 0xC3D2E1F0, M = 0x0ffffffff;
    var i, t, W = new Array(80), ml = msg.length, wa = new Array();
    msg += String.fromCharCode(0x80);
    while (msg.length % 4) msg += String.fromCharCode(0);
    for (i = 0; i < msg.length; i += 4) wa.push(msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3));
    while (wa.length % 16 != 14) wa.push(0);
    wa.push(ml >>> 29), wa.push((ml << 3) & M);
    for (var bo = 0; bo < wa.length; bo += 16) {
        for (i = 0; i < 16; i++) W[i] = wa[bo + i];
        for (i = 16; i <= 79; i++) W[i] = rotl(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        var A = H0, B = H1, C = H2, D = H3, E = H4;
        for (i = 0; i <= 19; i++) t = (rotl(A, 5) + (B & C | ~B & D) + E + W[i] + 0x5A827999) & M, E = D, D = C, C = rotl(B, 30), B = A, A = t;
        for (i = 20; i <= 39; i++) t = (rotl(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & M, E = D, D = C, C = rotl(B, 30), B = A, A = t;
        for (i = 40; i <= 59; i++) t = (rotl(A, 5) + (B & C | B & D | C & D) + E + W[i] + 0x8F1BBCDC) & M, E = D, D = C, C = rotl(B, 30), B = A, A = t;
        for (i = 60; i <= 79; i++) t = (rotl(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & M, E = D, D = C, C = rotl(B, 30), B = A, A = t;
        H0 = H0 + A & M; H1 = H1 + B & M; H2 = H2 + C & M; H3 = H3 + D & M; H4 = H4 + E & M;
    }
    return tohex(H0) + tohex(H1) + tohex(H2) + tohex(H3) + tohex(H4);
}
