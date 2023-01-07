
/**
 * Modules dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars')


var homepage = require('./routes/homepage');

// Example route
// var user = require('./routes/user');

var app = express();
app.configure(function () {
  app.use(express.bodyParser());
});

// all environments
app.set('port', process.env.PORT || 5005);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('Intro HCI secret key'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Add routes here
app.get('/', homepage.initialize);
app.get('/home', homepage.initialize);
app.get('/upload', homepage.upload);
app.get('/report', homepage.report);
app.get('/tasks', homepage.tasks);
app.get('/tasks_archived', homepage.archived);
app.get('/adminlogin', homepage.login);
app.get('/adminsignupHQpcRnRBy1FWcwD', homepage.signup);
app.get('/dealerdata', homepage.dealer);
app.get('/login', homepage.dealerlogin);
app.get('/signup', homepage.dealersignup);
app.get('/airfreight', homepage.airfreight);
app.get('/forwarder', homepage.forwarder);






http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
app.listen(8080)
