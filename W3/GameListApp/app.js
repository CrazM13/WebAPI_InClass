const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');

const {ensureAuthenticated} = require('./helpers/auth');

const app = express();
const router = express.Router();

const port = process.env.PORT || 5000;

// Configuers Routes
const users = require('./routes/users');

const db = require('./config/database');

// PassportJS Config Route
require('./config/passport')(passport);

// - Get Rid Of Warning For Mongoose -|
//mongoose.Promise = global.Promise;//|
// -----------------------------------|

// Connect To MongoDB Using Mongoose
mongoose.connect(db.mongoURI, {
	useMongoClient:true
}).then(function () {
	console.log("MongoDB Connected");
}).catch(function(err) {
	console.log(err);
});

// Load In Entry Model
require('./models/Entry');
var Entry = mongoose.model('Entries');

require('./models/Users');
var User = mongoose.model('Users');

// Use Template Engine
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Functions Needed To Run Body Parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Express Session
app.use(session({
	secret: "secret",
	resave: true,
	saveUninitialized: true
}));

// Setup Passport
app.use(passport.initialize());
app.use(passport.session());

// Confiure Flash
app.use(flash());
// Global Variables
app.use(function(req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

// Method Override Code
app.use(methodOverride('_method'));

// Route To The Entries
router.get('/entries', ensureAuthenticated, function (req, res) {
	res.render('gameentries/addgame');
});

// Route To Edit Entries
router.get('/gameentries/edit/:id', function (req, res) {
	
	Entry.findOne({
		_id: req.params.id
	}).then(function (entry) {
		res.render('gameentries/editgame', {entry: entry});
	});
});

// Route To Put Edit
router.put('/editgame/:id', function(req, res) {
	Entry.findOne({
		_id: req.params.id
	}).then(function(entry) {
		entry.title = req.body.title;
		entry.genre = req.body.genre;

		entry.save().then(function(idea) {
			res.redirect('/gamers');
		});
	});
});

router.get('/userlist/:id', function(req, res) {
	Entry.find({
		user: req.params.id
	}).then(function (entries) {
		res.render('userlist', {entries: entries});
	});
})

// Route To The Log In
router.get('/login', function (req, res) {
	res.render('login');
});

router.post('/login', function (req, res, next) {
	passport.authenticate('local', {
		successRedirect: '/gamers',
		failureRedirect: '/login',
		failureFlash: true
	})(req, res, next);
});

router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success_msg', "Successfully Logged Out!");
	res.redirect('/login');
});

// Gamers Route
app.get('/gamers', ensureAuthenticated, function(req, res) {
	Entry.find({user: req.user.id}).then(function(entries) {
		res.render('index', {
			entries:entries
		});
	});
});

// Index Route
app.get('/', function(req, res) {
	User.find({}).then(function(users) {
		res.render('gamers', {users: users});
	});
});

// Post From Form On Index
app.post('/addgame', function(req, res) {
	var newEntry = {
		title: req.body.title,
		genre: req.body.genre,
		user: req.user.id
	};
	new Entry(newEntry).save().then(function(entry) {
		res.redirect('/gamers');
	});
});

// Delete Game Entry
app.delete('/:id', function(req, res) {
	Entry.remove({_id:req.params.id}).then(function () {
		req.flash('success_msg', "Game Removed");
		res.redirect('/gamers');
	});
});

// Routes For Paths
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/scripts'));
app.use('/users', users);
app.use('/', router);
// Start Server
app.listen(port, function() {
	console.log("Server is running on port " + port.toString());
});
