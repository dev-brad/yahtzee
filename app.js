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
const newGame = require(__dirname + "/new-game");
const turn = require(__dirname + "/turn");

// Create instances 
const app = express();
const roll = new Roll();

// Use modules
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended: true}));

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

// Global variables
var rollMessage = "Welcome! Roll dice to begin.";
// var scoreCard;
var scoreCat;
var score = null;
var diceRoll = [1,2,3,4,5];   // the dice that were rolled and will display on page
var diceKept = [];            // the dice that were kept and need to be highlighted on page
var rollCount = 0;            // the roll count for turn       

// Get Requests 
app.get("/", (req,res) => {

    if (req.session.endTurn === true) {
        req.session.diceKept = [];
        req.session.scoreCat = '';
        req.session.score = null;          
        req.session.rollCount = 0;
        req.session.rollMessage = "New turn. Roll to get started."
        req.session.endTurn = false;
        req.session.turnCount++;
        req.session.save();
    }

    if (!req.session.sessionID || req.session.restartGame) {

        req.session.sessionID = req.sessionID;
        req.session.restartGame = false;
        
        newGame.startNewGame( (newScoreCard) => {
            req.session.scoreCard = newScoreCard;
            req.session.turnCount = 0;
            req.session.endTurn = false;
            req.session.rollMessage = rollMessage;
            req.session.diceRoll = diceRoll;
            req.session.diceKept = diceKept;
            req.session.rollCount = rollCount;
            req.session.scoreCat = scoreCat;
            req.session.score = score;
            req.session.save();
        });
    }

    if (req.session.turnCount === 13) {
        req.session.rollMessage = "End of game. Final score is " + req.session.scoreCard.grandTotal + "!";
        req.session.diceRoll = [6,6,6,6,6];
        req.session.turnCount = 0;
        req.session.restartGame = true;
        req.session.save();
    }

    res.render("game", {
        rollMessage: req.session.rollMessage,
        diceRoll: req.session.diceRoll,
        diceKept: req.session.diceKept,
        rollCount: req.session.rollCount,
        scoreCard: req.session.scoreCard,
        scoreCat: req.session.scoreCat,
        score: req.session.score
    });

});

app.post("/", (req,res) => {

    if (req.body.restartBtn) {

        req.session.restartGame = true;
        req.session.save();

        res.redirect("/");

    } else if (req.body.rollBtn) {
        req.session.scoreCat = "";

        turn.takeTurn(req.body.diceKept, req.session.rollCount, req.session.diceRoll, (turnDiceKept, turnDiceRoll, turnRollCount, turnRollMessage) => {
            req.session.diceKept = turnDiceKept;
            req.session.diceRoll = turnDiceRoll;
            req.session.rollCount = turnRollCount;
            req.session.rollMessage = turnRollMessage;
            req.session.save();

            res.redirect("/");
        });

    } else if (req.body.scoreBtn) {

        if (req.session.score === null) {
            req.session.rollMessage = "Select score card category below to log score.";
            req.session.save();

            res.redirect("/");
        } else {
            req.session.scoreCat = req.body.scoreCat;
            req.session.score = req.body.score;

            turn.logScore(req.session.scoreCat, req.session.score, req.session.scoreCard, req.session.yahtzee, (scoreUpdate) => {
                req.session.scoreCard = scoreUpdate;
                req.session.endTurn = true;
                req.session.save();
                
                res.redirect("/");
            });
        }
        
    } else {
        req.session.scoreCat = req.body.scoreCat;
        req.session.diceCalc = req.body.diceRoll;
        req.session.diceKept = req.body.diceKept;
        req.session.rollMessage = "Click to log score."
        req.session.save();

        turn.calcScore(req.session.scoreCat, req.session.diceCalc, (result, bonus) => {
            req.session.score = result;
            req.session.yahtzee = bonus;
            req.session.save();

            res.redirect("/");
        });
    }
});

// Spin up the server 
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, () => {
    console.log("Server has started successfully.")
});