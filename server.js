var config = require('./config');
var express = require('express');

var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');

var jwt = require('jsonwebtoken');
var user = require('./app/models/user');
var db = require('./db');

var port = process.env.PORT || 3000;

app.set('superSecret', config.SECRET);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function (req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// get an instance of the router for api routes
var apiRoutes = express.Router();

// we do not guard this route and not checkin the token
apiRoutes.post('/authenticate', function (req, res) {
    user.getUserByEmail(req.body.email, function (err, user) {
        if (err) {
            throw err
        }

        if (!user) {
            res.send({success: false, message: 'User not found'})
        } else if (user) {
            if (user.password !== req.body.password) {
                res.send({success: false, message: 'Authentication failed. Wrong password.'});
            } else {
                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresIn: 1440
                });

                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        }
    });
});


apiRoutes.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});


apiRoutes.get('/', function (req, res) {
    res.json({message: 'Welcome to the coolest API on earth!'});
});

apiRoutes.get('/users', function (req, res) {
    db.query('SELECT * FROM users', function (err, results, fields) {
        if (err) {
            console.log(err);
        }

        res.send(results);
    });
});

app.use('/api', apiRoutes);

app.listen(port);
console.log('Magic happens at http://localhost:' + port);