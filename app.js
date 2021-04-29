// Require external modules
const express = require("express");
const path = require("path");
const Roll = require("roll");
const bodyParser = require("body-parser");

// Require internal modules 
const newGame = require(__dirname + "/new-game");
const turn = require(__dirname + "/turn");

// Create instances 
const app = express();
const roll = new Roll();

// Use modules
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended: true}));

// Needed for EJS Template 
app.set("view engine", "ejs");

// Global variables
var rollMessage = "Welcome! Roll dice to begin.";
var scoreCard;
var scoreCat;
var score = null;
var diceRoll = [1,2,3,4,5];   // the dice that were rolled and will display on page
var diceKept = [];            // the dice that were kept and need to be highlighted on page
var rollCount = 0;            // the roll count for turn
var turnCount = 0;            // keep up with turn count, max of 13
var yahtzee;                  // yahtzee bonus flag
var endTurn = false;          // flag to check if turn has ended

// Get Requests 
app.get("/", (req,res) => {

    if (endTurn === true) {
        diceKept = [];
        scoreCat = '';
        score = null;          
        rollCount = 0;
        rollMessage = "New turn. Roll to get started."
        endTurn = false;
        turnCount++;
    }

    if (turnCount === 0) {
        newGame.startNewGame( (newScoreCard) => {
            scoreCard = newScoreCard
        });
    }

    if (turnCount === 13) {
        rollMessage = "End of game. Final score is " + scoreCard.grandTotal + "!";
        diceRoll = [6,6,6,6,6];
        turnCount = 0;
    }

    res.render("game", {rollMessage: rollMessage,
    diceRoll: diceRoll,
    diceKept: diceKept,
    rollCount: rollCount,
    scoreCard: scoreCard,
    scoreCat: scoreCat,
    score: score});

});

app.post("/", (req,res) => {

    if (req.body.rollBtn) {
        scoreCat = "";

        turn.takeTurn(req.body.diceKept, rollCount, diceRoll, (turnDiceKept, turnDiceRoll, turnRollCount, turnRollMessage) => {
            diceKept = turnDiceKept;
            diceRoll = turnDiceRoll;
            rollCount = turnRollCount;
            rollMessage = turnRollMessage;
            res.redirect("/");
        });
    } else if (req.body.scoreBtn) {

        if (score === null) {
            rollMessage = "Select score card category below to log score."
            res.redirect("/");
        } else {
            scoreCat = req.body.scoreCat;
            score = req.body.score;

            turn.logScore(scoreCat, score, scoreCard, yahtzee, (scoreUpdate) => {
                scoreCard = scoreUpdate;
                endTurn = true;
                res.redirect("/");
            });
        }
        
    } else {
        scoreCat = req.body.scoreCat;
        diceCalc = req.body.diceRoll;
        diceKept = req.body.diceKept;
        rollMessage = "Click to log score."

        turn.calcScore(scoreCat, diceCalc, (result, bonus) => {
            score = result;
            yahtzee = bonus;
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