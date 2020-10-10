var express = require("express"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	bodyParser = require("body-parser"),
	User = require("./models/user"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose");



mongoose.connect("mongodb://localhost/authentication_demo", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
	secret: "Rusty is the best",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//================================================
//ROUTES

app.get("/", function (req, res) {
	res.render("home.ejs");
});

app.get("/secret", isLoggedIn, function (req, res) {
	res.render("secret.ejs");
});
//===============================================




//===============================================
//Auth ROUTES

//Страница регистрации
app.get("/register", function (req, res) {
	res.render("register.ejs");
});

//Регистрация нового пользователя в БД
app.post("/register", function (req, res) {
	User.register(new User({ username: req.body.username }), req.body.password, function (err, newUser) {
		if (err) {
			console.log(err);
			return res.render("register.ejs"); //change to -> res.redirect("/register"); ???
		} else {
			passport.authenticate("local")(req, res, function () {
				res.redirect("/secret");
			});
		}
	});
});


//LOGIN form

//Страница авторизации
app.get("/login", function (req, res) {
	res.render("login.ejs");
});

//Авторизация существующего пользователя
//middlware
app.post("/login", passport.authenticate("local", {
	successRedirect: "/secret",
	failureRedirect: "/login"
}), function (req, res) {
});

app.get("/logout", function (req, res) {
	req.logout();
	res.redirect("/");
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect("/login");
	}
}

//===============================================

app.listen(3000, function () {
	console.log("Server is running...");
});
