const Roll = require("roll");
const roll = new Roll();

exports.takeTurn = (userDiceKept, rollCount, diceRoll, fn) => {
 
    let diceInput;

    // Keep up with number of rolls in turn 
    rollCount++;
    if (rollCount < 3) {
        rollMessage = "Click dice to keep.";
        diceInput = userDiceKept;
    } else if (rollCount === 3) {
        rollMessage = "End of turn. Click section below to log score.";
        diceInput = userDiceKept;
        endTurn = 'Y';
    } else {
        rollMessage = "Click dice to keep.";
        diceInput = [];
        rollCount = 1;
    }

    // Push clicked dice numbers (avoid commas) to array 
    diceKept = [];
    for (let i = 0; i < diceInput.length; i++) {
        if (!isNaN(diceInput[i])) {
            diceKept.push(diceInput[i])
        }
    }

    // Roll only the dice that were not clicked to keep 
    for (let i = 0; i < 5; i++) {
        if (!diceKept.includes(String(i + 1))) {
            diceRoll[i] = roll.roll('1d6').rolled;
        }
    }

    fn(diceKept, diceRoll, rollCount, rollMessage);
}

exports.logScore = (scoreCat, score, scoreCard, yahtzee, fn) => {

    if (yahtzee && Number(scoreCard.yahtzee) === 50) {
        scoreCard.yahtzeeBonus = Number(scoreCard.yahtzeeBonus) + 100;
        scoreCard.lowerTotal = Number(scoreCard.lowerTotal) + 100;
        scoreCard.grandTotal = Number(scoreCard.grandTotal) + 100;
    }

    scoreCard[scoreCat] = score;

    if (scoreCat === "ones" || scoreCat === "twos" || scoreCat === "threes" || scoreCat === "fours" || scoreCat === "fives" || scoreCat === "sixes") {
        scoreCard.upperSubtotal = Number(scoreCard.upperSubtotal) + Number(score);
        scoreCard.upperTotal = Number(scoreCard.upperTotal) + Number(score);

        if (scoreCard.upperSubtotal >= 63 && scoreCard.upperBonus === 0) {
            scoreCard.upperBonus = 35;
            scoreCard.upperTotal = Number(scoreCard.upperTotal) + 35;
            scoreCard.grandTotal = Number(scoreCard.grandTotal) + 35;
        }

    } else {
        scoreCard.lowerTotal = Number(scoreCard.lowerTotal) + Number(score);
    }

    scoreCard.grandTotal = Number(scoreCard.grandTotal) + Number(score);

    
    fn(scoreCard);
}

exports.calcScore = (scoreCat, dice, fn) => {
    let score = 0;
    let yahtzee = false;

    diceRoll = [];
    for (let i = 0; i < dice.length; i++) {
        if (!isNaN(dice[i])) {
            diceRoll.push(Number(dice[i]))
        }
    }

    switch(scoreCat) {
        case "ones":

            diceRoll.forEach(die => {
                if (die === 1) {
                    score = score + die;
                }
            });

            break;

        case "twos":

            diceRoll.forEach(die => {
                if (die === 2) {
                    score = score + die;
                }
            });

            break;

        case "threes":

            diceRoll.forEach(die => {
                if (die === 3) {
                    score = score + die;
                }
            });

            break;

        case "fours":

            diceRoll.forEach(die => {
                if (die === 4) {
                    score = score + die;
                }
            });

            break;

        case "fives":

            diceRoll.forEach(die => {
                if (die === 5) {
                    score = score + die;
                }
            });

            break;

        case "sixes":

            diceRoll.forEach(die => {
                if (die === 6) {
                    score = score + die;
                }
            });

            break;

        case "threeOfAKind":

            countDice(diceRoll, (numOnes, numTwos, numThrees, numFours, numFives, numSixes) => {
                if (numOnes >= 3 || numTwos >= 3 || numThrees >= 3 || numFours >= 3 || numFives >= 3 || numSixes >= 3) {
                    diceRoll.forEach(die => {
                        score = score + die;
                    });
                } 
            });

            break;

        case "fourOfAKind":
            
            countDice(diceRoll, (numOnes, numTwos, numThrees, numFours, numFives, numSixes) => {
                if (numOnes >= 4 || numTwos >= 4 || numThrees >= 4 || numFours >= 4 || numFives >= 4 || numSixes >= 4) {
                    diceRoll.forEach(die => {
                        score = score + die;
                    });
                } 
            });

            break;

        case "fullHouse":
        
            countDice(diceRoll, (numOnes, numTwos, numThrees, numFours, numFives, numSixes) => {
                if ((numOnes === 2 || numTwos === 2 || numThrees === 2 || numFours === 2 || numFives === 2 || numSixes === 2)
                 && (numOnes === 3 || numTwos === 3 || numThrees === 3 || numFours === 3 || numFives === 3 || numSixes === 3)) {
                    score = 25;
                } 
            });

            break;
        
        case "smallStraight":
        
            countDice(diceRoll, (numOnes, numTwos, numThrees, numFours, numFives, numSixes) => {
                if ((numOnes >= 1 && numTwos >= 1 && numThrees >= 1 && numFours >= 1)
                 || (numTwos >= 1 && numThrees >= 1 && numFours >= 1 && numFives >= 1)
                 || (numThrees >= 1 && numFours >= 1 && numFives >= 1 && numSixes >= 1)) {
                    score = 30;
                } 
            });

            break;

        case "largeStraight":
    
            countDice(diceRoll, (numOnes, numTwos, numThrees, numFours, numFives, numSixes) => {
                if ((numOnes === 1 && numTwos === 1 && numThrees === 1 && numFours === 1 && numFives === 1)
                    || (numTwos === 1 && numThrees === 1 && numFours === 1 && numFives === 1 && numSixes === 1)) {
                    score = 40;
                } 
            });

            break;

        case "yahtzee":

            countDice(diceRoll, (numOnes, numTwos, numThrees, numFours, numFives, numSixes) => {
                if (numOnes === 5 || numTwos === 5 || numThrees === 5 || numFours === 5 || numFives === 5 || numSixes === 5) {
                    score = 50;
                } 
            });

            break;

        case "chance":

            diceRoll.forEach(die => {
                score = score + die;
            });

            break;
    }

    // Check if turn earned a yahtzee bonus 
    countDice(diceRoll, (numOnes, numTwos, numThrees, numFours, numFives, numSixes) => {
        if (numOnes === 5 || numTwos === 5 || numThrees === 5 || numFours === 5 || numFives === 5 || numSixes === 5) {
            yahtzee = true;
        } 
    });

    fn(score, yahtzee);
}

function countDice(diceRoll, fn) {

    let numOnes = 0;
    let numTwos = 0;
    let numThrees = 0;
    let numFours = 0;
    let numFives = 0;
    let numSixes = 0;

    diceRoll.forEach(die => {
        switch(die) {
            case 1:
                numOnes++;
                break;
            case 2:
                numTwos++;
                break;
            case 3:
                numThrees++;
                break;
            case 4:
                numFours++;
                break;
            case 5:
                numFives++;
                break;
            case 6:
                numSixes++;
                break;
        }
    });

    fn(numOnes, numTwos, numThrees, numFours, numFives, numSixes);
}