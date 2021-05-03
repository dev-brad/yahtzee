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
const playerNum = Math.random();
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

const player = {
    playerNum: playerNum,
    rollMessage: rollMessage,
    scoreCard: scoreCard,
    scoreCat: scoreCat,
    score: score,
    diceRoll: diceRoll,
    diceKept: diceKept,
    rollCount: rollCount,
    turnCount: turnCount,
    yahtzee: yahtzee,
    endTurn: endTurn
}

// Get Requests 
app.get("/", (req,res) => {

    if (player.playerNum === playerNum) {

        if (player.endTurn === true) {
            player.diceKept = [];
            player.scoreCat = '';
            player.score = null;          
            player.rollCount = 0;
            player.rollMessage = "New turn. Roll to get started."
            player.endTurn = false;
            player.turnCount++;
        }

        if (player.turnCount === 0) {
            newGame.startNewGame( (newScoreCard) => {
                player.scoreCard = newScoreCard
            });
        }

        if (player.turnCount === 13) {
            player.rollMessage = "End of game. Final score is " + scoreCard.grandTotal + "!";
            player.diceRoll = [6,6,6,6,6];
            player.turnCount = 0;
        }

    }

    res.render("game", {rollMessage: player.rollMessage,
        diceRoll: player.diceRoll,
        diceKept: player.diceKept,
        rollCount: player.rollCount,
        scoreCard: player.scoreCard,
        scoreCat: player.scoreCat,
        score: player.score
    });
});

app.post("/", (req,res) => {

    if (player.playerNum === playerNum) {

        if (req.body.rollBtn) {
            player.scoreCat = "";

            turn.takeTurn(req.body.diceKept, player.rollCount, player.diceRoll, (turnDiceKept, turnDiceRoll, turnRollCount, turnRollMessage) => {
                player.diceKept = turnDiceKept;
                player.diceRoll = turnDiceRoll;
                player.rollCount = turnRollCount;
                player.rollMessage = turnRollMessage;
                res.redirect("/");
            });
        } else if (req.body.scoreBtn) {

            if (player.score === null) {
                player.rollMessage = "Select score card category below to log score."
                res.redirect("/");
            } else {
                scoreCat = req.body.scoreCat;
                score = req.body.score;

                turn.logScore(scoreCat, score, player.scoreCard, player.yahtzee, (scoreUpdate) => {
                    player.scoreCard = scoreUpdate;
                    player.endTurn = true;
                    res.redirect("/");
                });
            }
            
        } else {
            player.scoreCat = req.body.scoreCat;
            player.diceCalc = req.body.diceRoll;
            player.diceKept = req.body.diceKept;
            player.rollMessage = "Click to log score."

            turn.calcScore(player.scoreCat, player.diceCalc, (result, bonus) => {
                player.score = result;
                player.yahtzee = bonus;
                res.redirect("/");
            });
        }
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