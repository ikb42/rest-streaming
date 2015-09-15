/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var http = require('http');
var https = require('https');
var path = require('path');

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var NestStrategy = require('passport-nest').Strategy;
var session = require('express-session');
var openurl = require('openurl');

// Change for production apps.
// This secret is used to sign session ID cookies.
var SUPER_SECRET_KEY = 'keyboard-cat';

// PassportJS options. See http://passportjs.org/docs for more information.
var passportOptions = {
  failureRedirect: '/auth/failure', // Redirect to another page on failure.
};

passport.use(new NestStrategy({
  // Read credentials from your environment variables.
  clientID: process.env.NEST_ID,
  clientSecret: process.env.NEST_SECRET
}));

/**
 * No user data is available in the Nest OAuth
 * service, just return the empty user object.
 */
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var app = express();

app.use(cookieParser(SUPER_SECRET_KEY));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: SUPER_SECRET_KEY,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'third_party')));

/**
 * Listen for calls and redirect the user to the Nest OAuth
 * URL with the correct parameters.
 */
app.get('/auth/nest', passport.authenticate('nest', passportOptions));

/**
 * Upon return from the Nest OAuth endpoint, grab the user's
 * accessToken and set a cookie so browser can access it, then
 * return the user back to the root app.
 */
app.get('/auth/nest/callback', passport.authenticate('nest', passportOptions),
  function(req, res) {
    res.cookie('nest_token', req.user.accessToken);
    res.redirect('/');
});

/**
 * When authentication fails, present the user with
 * an error requesting they try the request again.
 */
app.get('/auth/failure', function(req, res) {
  console.log('Authentication failed. Status code: ' + res.statusCode);
  res.send('Authentication failed. Please try again.');
});

/**
 * When the user requests to log out, deauthorize their token using the Nest
 * deauthorization API then destroy their local session and cookies.
 * See https://goo.gl/f2kfmv for more information.
 */
app.get('/auth/logout', function(req, res) {
  var token = req.cookies['nest_token'];
  if (token) {
    var reqOpts = {
      hostname: 'api.home.nest.com',
      path: '/oauth2/access_tokens/' + token,
      method: 'DELETE'
    };

    https.request(reqOpts, function(revokeRes) {
      console.log('Log out successful.');
      req.session.destroy();
      res.clearCookie('nest_token');
      res.redirect('/');
    }).on('error', function() {
      console.log('An error occurred attempting to revoke token.');
      res.send('Log out failed. Please try again.');
    }).end();
  } else {
    console.log('Not signed in.');
    res.redirect('/');
  }
});

/**
 * Get port from environment and store in Express.
 */
var port = process.env.PORT || 3000;
app.set('port', port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

server.on('listening', function() {
  console.log('Listening on port ' + server.address().port);
  openurl.open('http://localhost:' + port);
});

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
