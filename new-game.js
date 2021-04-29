
exports.startNewGame = (fn) => {
    scoreCard = {
        ones: null,
        twos: null, 
        threes: null,
        fours: null,
        fives: null,
        sixes: null,
        threeOfAKind: null,
        fourOfAKind: null,
        fullHouse: null,
        smallStraight: null,
        largeStraight: null,
        chance: null,
        yahtzee: null,
        yahtzeeBonus: 0,
        upperSubtotal: 0,
        upperBonus: 0,
        upperTotal: 0,
        lowerTotal: 0,
        grandTotal: 0
    };

    fn(scoreCard);
}