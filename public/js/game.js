const validDicePos = /^[1-5]+$/;
var keepArray = [];
var playerNum;

// set number for unique plater sessions 
// if (sessionStorage.playerNum) {
//     playerNum = sessionStorage.getItem('playerNum');
// } else {
//     playerNum = Math.floor(Math.random() * 10000);
//     sessionStorage.setItem('playerNum', playerNum);
// }
// $('form').attr("action", "/" + playerNum);

for (let i=1; i < 6; i++) {
    if ($('#dice' + i).attr('class') === "dice-img pressed") {

        var clickedDie = $("#dice" + i).attr('id')[4];

        keepArray = buildKeepArray(clickedDie);
        $('.dice-kept').attr('value', keepArray); 
    }
}

dynamicScoreStyling();

if ($('.roll-msg').text() === "Welcome! Roll dice to begin." || 
    $('.roll-msg').text() === "New turn. Roll to get started.") {
        $('.score-btn').attr('disabled', 'disabled');
        $('.score-btn').addClass('disabled');
} else {

    // To understand code below, study closure in for-loops
    if ($(".roll-msg").html() != "Roll dice to begin.") {

        for (let i=1; i < 6; i++) {
            (function () {
                $("#dice" + i).on("click", () => {
            
                    $("#dice" + i).toggleClass("pressed");

                    var clickedDie = $("#dice" + i).attr('id')[4];

                    keepArray = buildKeepArray(clickedDie);
                    $('.dice-kept').attr('value', keepArray);                
                });
            })();
        }
    }
}

function buildKeepArray(clickedDie) {

    if ($('.dice-kept').attr('value')) {
        keepArray = initArray($('.dice-kept').attr('value'));
    } else {
        keepArray = Array.from($('.dice-kept').attr('value'));
    }

    if ($.inArray(clickedDie, keepArray) === -1) {
        keepArray.push(clickedDie);
    } else {
        keepArray = keepArray.filter(item => item !== clickedDie);
    }

    return keepArray;
}

function initArray(keepArray) {
    var newArray = [];
    for (var i=0; i < keepArray.length; i++) {
        if (keepArray[i].match(validDicePos)) {
            newArray.push(keepArray[i]);
        }
    }

    return newArray;
}

function dynamicScoreStyling() {

    if ($('.roll-msg').text() === "New turn. Roll to get started.") {
        $('.col').removeClass('col-score');
        $('.col').removeClass('col3-score');
    }
    
    $('.col-score').addClass('scored');
    $('.col-score').parent().children(':first-child').addClass('scored');
    
    $('.col3-score').addClass('scored');
    $('.col3-score').parent().children(':nth-child(3n)').addClass('scored');
    
    if ($('.col-score').hasClass('scored') || $('.col3-score').hasClass('scored')) {
        $('#score-btn').addClass('scored');
    }
    
    for (i = 1; i < 14; i++) {
        if ($('#score' + i).text() != '') {
            if ($('#score' + i).hasClass('col-scored')) {
                $('#score' + i).parent().children(':first-child').children(':first-child').attr('disabled', 'disabled');
                $('#score' + i).parent().children(':first-child').children(':first-child').addClass('disabled');
            } else if ($('#score' + i).hasClass('col3-scored')) {
                $('#score' + i).parent().children(':nth-child(3n)').children(':first-child').attr('disabled', 'disabled');
                $('#score' + i).parent().children(':nth-child(3n)').children(':first-child').addClass('disabled');
            }
        }
    }
}
