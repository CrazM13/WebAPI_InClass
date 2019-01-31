const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');

const app = express();
const router = express.Router();

const port = 5000;

// - Get Rid Of Warning For Mongoose -|
//mongoose.Promise = global.Promise;//|
// -----------------------------------|

// Connect To MongoDB Using Mongoose
mongoose.connect("mongodb://localhost:27017/gameentries", {
	useMongoClient:true
}).then(function () {
	console.log("MongoDB Connected");
}).catch(function(err) {
	console.log(err);
});

// Load In Entry Model
require('./models/Entry');
var Entry = mongoose.model('Entries');

// Use Template Engine
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Functions Needed To Run Body Parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Route To Index
// router.get('/', function (req, res) {
// 	res.render('index');
// });

// Route To The Entries
router.get('/entries', function (req, res) {
	res.render('gameentries/addgame');
});

// Route To The Log In
router.get('/login', function (req, res) {
	res.render('login');
});

app.get('/', function(req, res) {
	Entry.find({}).then(function(entries) {
		//res.send({entries:entries});
		res.render('index', {
			entries:entries
		});
	});
});

// Post From Form On Index
app.post('/addgame', function(req, res) {
	var newEntry = {
		title: req.body.title,
		genre: req.body.genre
	};
	new Entry(newEntry).save().then(function(entry) {
		res.redirect('/');
	});
});

// Delete Game Entry
app.post('/:id', function(req, res) {
	Entry.remove({_id:req.params.id}).then(function () {
		//res.flash("Game Removed");
		res.redirect('/');
	});
});

// Routes For Paths
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/scripts'));
app.use('/', router);
// Start Server
app.listen(port, function() {
	console.log("Server is running on port " + port.toString());
});
