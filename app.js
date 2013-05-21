/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , path = require('path');

var app = express();

// connect to mongodb
mongoose.connect('mongodb://localhost/test');

// get the db connection handle
var db = mongoose.connection;

// Add some error handler
db.on('error', console.error.bind(console, 'connection error:'));

// just to make sure we are connected to db
db.on('open', function () {
  console.log('Connected to DB');
});

// lets define a scheme to use with mongoose
var userSchema = mongoose.Schema({
  username: String,
  password: String
});

// add a validate password method to schema
userSchema.methods.validPassword = function (password) {
  return !!(password === this.password);
};

// alright now register a user model via the userSchema
var User = mongoose.model('User', userSchema);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// add express cookieParser and session
app.use(express.cookieParser());
app.use(express.session({ secret: 'keyboard cat' }));

// now add the passport initialization and session
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// for managing session in passport the following code is required
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

//setup local strategy
passport.use(new LocalStrategy(function (username, password, done) {
    User.findOne({username: username}, function (err, user) {
      if (err) return done(err);

      if (!user) return done(null, false, {message: 'Incorrect username.'});

      if (!user.validPassword(password)) return done(null, false, {message: 'Incorrect password.'});

      return done(null, user);
    });
  }
));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/login', user.login);
app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: false
  })
);
app.get('/home', function (req, res) {
  res.send('This is home');
});


http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
