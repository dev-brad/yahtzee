const newGame = require("../new-game");
const turn = require("../turn");


exports.render_game = function (req, res) {
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
            req.session.rollMessage = "Welcome! Roll dice to begin.";
            req.session.diceRoll = [1,2,3,4,5];
            req.session.diceKept = [];
            req.session.rollCount = 0;
            req.session.scoreCat = null;
            req.session.score = null;
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
}


exports.process_turn = function (req, res) {
    if (req.body.restartBtn) {

        req.session.restartGame = true;
        req.session.save();

    } else if (req.body.rollBtn) {
        req.session.scoreCat = "";

        turn.takeTurn(req.body.diceKept, req.session.rollCount, req.session.diceRoll, (turnDiceKept, turnDiceRoll, turnRollCount, turnRollMessage) => {
            req.session.diceKept = turnDiceKept;
            req.session.diceRoll = turnDiceRoll;
            req.session.rollCount = turnRollCount;
            req.session.rollMessage = turnRollMessage;
            req.session.save();
        });

    } else if (req.body.scoreBtn) {

        if (req.session.score === null) {
            req.session.rollMessage = "Select score card category below to log score.";
            req.session.save();
        } else {
            req.session.scoreCat = req.body.scoreCat;
            req.session.score = req.body.score;

            turn.logScore(req.session.scoreCat, req.session.score, req.session.scoreCard, req.session.yahtzee, (scoreUpdate) => {
                req.session.scoreCard = scoreUpdate;
                req.session.endTurn = true;
                req.session.save();
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
        });
    }

    res.redirect("/");
}