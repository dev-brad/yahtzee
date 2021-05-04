// Require external modules
require('dotenv').config();
const express = require("express");
const path = require("path");
const Roll = require("roll");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

// Require internal modules 
const gameRoutes = require(__dirname + '/routes/game.route.js');

// Create instances 
const app = express();
const roll = new Roll();

// Use modules
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended: true}));

// Connect to MongoDB for Session data store 
const uri = process.env.DB_URI;

mongoose.connect(uri, {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true
});

app.use(session({
    store: MongoStore.create({ mongoUrl: uri}),
    secret: "yahtzee",
    resave: false,
    saveUninitialized: true
}));

// Needed for EJS Template 
app.set("view engine", "ejs");     


// ROUTES 
app.use('/', gameRoutes);


// Spin up the server 
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, () => {
    console.log("Server has started successfully.")
});
