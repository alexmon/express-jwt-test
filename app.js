require('dotenv').load();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var app = express();

// use mongoose to connect to MongoDB
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:'+ process.env.MONGO_PORT + '/' + process.env.MONGO_DB);
var User = require('./models/user.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var apiRoutes = express.Router(); 

/**
 * /api/authenticate
 * get JWT token
 */
apiRoutes.post(
    '/authenticate',
    function (req, res) {
        User.findOne(
            {
                email : req.body.email
            },
            function (err, user) {
                if (err) {
                    res.json({error : 'no user found with email ' + email})
                }
                else {
                    if (user.password != req.body.password) {
                        res.json({error : 'no password match for user ' + email})
                    }
                    else {
                        var token = jwt.sign(
                            user, 
                            process.env.SECRET, 
                            {
                                expiresInMinutes: 1440 // expires in 24 hours
                            }
                        );
                    
                        res.json(
                            {
                                token : token
                            }
                        );
                    }
                }
            }
        ); 
    }  
);

/**
 * /api
 * 
 * public accessible
 */
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'This API call needs no token' });
});

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
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

/**
 * /api/users
 *  
 * protected needs a token
 * prints json list of all users 
 */
apiRoutes.get('/users', function(req, res, next) {
    var users = User.find(
        {},
        function (err, docs) {
            res.json(docs);
        }
    );
});

app.use('/api', apiRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
