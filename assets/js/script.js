/**
 * Created by WardVdd on 22/03/2017.
 */
var selectedCountries = null;
var indexQuestion = 0;
var currentScore = 0;
var currentRegion;
var formErrors = 0;
var formErrorMessages = [];

//QUESTIONS ZONE

function getQuestions(){
    currentRegion = $(this).attr("data-region");
    currentRegion = currentRegion.toLowerCase();

    var url = 'https://restcountries.eu/rest/v2/region/' + currentRegion;

    fetch(url)
        .then(function(response) {
            response.json().then(function(responseJson) {
                setQuestions(responseJson);
            });
        });
}

function setQuestions(questions){
    selectedCountries = getRandom(questions,20);
    selectedCountries = selectedCountries
                            .map(removeUnnessecaryInformation)
                            .map(correctLongNames);
    toggleRegions();
    displayQuestion();
}

function displayQuestion(){
    if(selectedCountries != null){
        if(indexQuestion < selectedCountries.length){
            $('#solution').remove();
            var questionAsDiv = questionToDiv(selectedCountries[indexQuestion]);
            $('div.wrapper').append(questionAsDiv);
            $('#returnHomeFromQuestion').on('click', returnHomeFromQuestion);
            setEventHandlerQuestion();
        } else{
            //game finished
            compareScoreRegion();
            showEndMessage();
        }
    }
}

function questionToDiv(question){
    var possibleAnswers = getPossibleAnswers();
    var div = "<div class='question'>";
    div += "<img src='images/home-white.png' id='returnHomeFromQuestion' title='home button' alt='home button'/>";
    div += "<h3>Question " + (indexQuestion + 1) + " of " + selectedCountries.length + "</h3>";
    div += question.img;
    div += "<div id=possAnswers>";
    for(var i = 0; i < possibleAnswers.length; i++){
        div += "<button type='button' class='btn btn-secondary answer'>" + possibleAnswers[i].name + "</button>";
    }
    div += "</div>";
    div += "</div>";

    return div;
}

function setEventHandlerQuestion(){
    $('#possAnswers button').on('click', checkInput);
}

function checkInput(){
    var flagUrl = $("#currentFlag").attr('src');
    var solution = selectedCountries.filter(q => q.flag == flagUrl)[0].name.toLowerCase();
    var answer = $(this).text().toLowerCase();

    if(solution === answer){
        showSolution("correct", solution);
        currentScore++;
    } else{
        showSolution("incorrect", solution);
    }
    indexQuestion++;
}

function showSolution(status, answer){
    $('div.question').remove();

    var solution = "<div id='solution'>";
    solution += "<img src='images/home-white.png' id='returnHomeFromQuestion' title='home button' alt='home button'/>";

    if(status === "correct") {
      solution += "<img src='images/correct.png' class='solutionImage' title='correct answer' alt='correct answer'/>";
      solution += "<h2 class='correct'>CORRECT!</h2>";
    } else{
      solution += "<img src='images/incorrect.png' class='solutionImage' title='incorrect answer' alt='incorrect answer'/>";
      solution += "<h2 class='incorrect'>INCORRECT</h2>";
      solution += "<p class='correctAnswer'>Solution: " + answer + "</p>";
    }

    solution += "<button id='continue' class='btn btn-secondary'>Continue</button>";
    solution += "</div>";

    $('div.wrapper').append(solution);

    $('#returnHomeFromQuestion').on('click', returnHomeFromSolution);
    $('#continue').on('click',displayQuestion);
}

function getPossibleAnswers(){
    var answers = getRandom(selectedCountries, 4);
    var goodAnswer = selectedCountries[indexQuestion];
    while(answers.indexOf(goodAnswer) < 0){
        answers = getRandom(selectedCountries, 4);
    }
    return answers;
}

function showEndMessage(){
    $('#solution').remove();

    var message = "<div id='endMessage'>";
    message += "<figure class='trophy'><img src='images/trophy.png' alt='trophy' title='trophy'/>";
    message += "<figcaption class='endGame'>Congratulations!</figcaption>";
    message += "</figure>";
    message += "<p class='endScore'>You scored " + currentScore + " out of 20 questions</p>";
    message += "<button type='button' class='btn btn-secondary' id='homeButton' name='homeButton'>Home</button>";
    message += "</div>";

    $('div.wrapper').append(message);

    $('#homeButton').on('click', function(){
        $('#endMessage').remove();
        indexQuestion = 0;
        $('#options').toggleClass("hide");
    })

}

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function removeUnnessecaryInformation(item){
    var updatedItem = {name: item.name, flag: item.flag, img: getImage(item.flag, item.name)};
    return updatedItem;
}

function correctLongNames(item){
    var itemSplittedOnSpace = item.name.split(" ");
    if(itemSplittedOnSpace.length > 1){
        if(itemSplittedOnSpace[1] === "and" || itemSplittedOnSpace[1] === "of" || itemSplittedOnSpace[1][0] === "(")
        {
            item.name = itemSplittedOnSpace[0];
        } else{
            item.name = itemSplittedOnSpace[0] + " " + itemSplittedOnSpace[1];
        }
    }
    return item;
}

function getImage(flagUrl, name){
    var img = "<img id='currentFlag' src='" + flagUrl + "' alt='flag'>";
    return img;
}

//Indexed DB

window.indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB;

var request = window.indexedDB.open("scoreDatabase", 1);
var db = null;

request.onerror = function(e){
    alert("Something went wrong!");
};

request.onupgradeneeded = function(e){
    db = e.target.result;
    var os = db.createObjectStore("scores", {keyPath: "region"});
};

request.onsuccess = function(e){
    db = e.target.result;
};

//HIGHSCORES

function saveScore(){
    var score = {
        region: currentRegion, value: currentScore, date: getCurrentDate()
    };

    var trans = db.transaction("scores", "readwrite");
    var os = trans.objectStore("scores");
    os.add(score);

    console.log("score saved");
}

function clearScore(){
    currentRegion = null;
    currentScore = 0;
}

function compareScoreRegion(){
    var trans = db.transaction("scores", "readwrite");
    var os = trans.objectStore("scores");
    var objectStore = os.get(currentRegion);

    objectStore.onsuccess = function(e){
            if(e.target.result != null){
                if(currentScore > e.target.result.value){
                    //score moet vervangen worden
                    deleteScoreOfRegion();
                    saveScore();
                }
            } else{
                saveScore();
            }
            clearScore();
        }
}
function deleteScoreOfRegion(){
    var trans = db.transaction("scores", "readwrite");
    var os = trans.objectStore("scores");

    os.delete(currentRegion);
}

function getScoreRegion(element){
    var region = element.getAttribute("data-region");

    var trans = db.transaction("scores", "readwrite");
    var os = trans.objectStore("scores");
    var objectStore = os.get(region);

    objectStore.onsuccess = function(e){
        var score = "<div class='score'>";
        score += "<h2>Highest score</h2>";

        if(e.target.result != undefined){
            score += "<p>"+ e.target.result.value + " out of 20 questions</p>";
            score += "<h2>Date created</h2>";
            score += "<p>" + e.target.result.date + "</p>";
        } else{
            score += "<p>None</p>";
        }

        score += "</div>";
        $(element).append(score);
    }
}

function getCurrentDate(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    }

    if(mm<10) {
        mm = '0'+mm
    }

    today = dd + '/' + mm + '/' + yyyy;
    return today;
}

function showHighscores(){
    $('#highscores').toggleClass('hide');

    $( "div.highscore" ).each(function( index ) {
        getScoreRegion(this);
    });
}

//FORM & JSON SCHEMA
var nameJsonSchema = {
    "title": "Full name validation",
    "type": "string",
    "minLength": 1,
    "pattern": "^[A-Za-z\\s]*$"
};

var emailJsonSchema = {
    "title": "Email validation",
    "type": "string",
    "pattern": "^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$",
    "format": "email"
};

var phoneJsonSchema = {
    "title": "Phone validation",
    "type": "string",
    "pattern": "^[0-9]{10}$"
};

var questionJsonSchema = {
    //de textarea mag simpelweg gewoon niet leeg gelaten worden
    "title": "Question validation",
    "minLength": 1
};

function showInputFields(){
    $('#inputClient').toggleClass("hide");
}

function handleForm(e){
    e.preventDefault();
    $('ul.bulletPoints').remove();

    var needValidation = [$('#fullName'), $('#email'), $('#phone'), $('#question')];
    for(var i = 0; i<needValidation.length;i++){
        if(i == 0) validateField(nameJsonSchema, needValidation[i]);
        else if(i == 1)validateField(emailJsonSchema, needValidation[i]);
        else if(i == 2)validateField(phoneJsonSchema, needValidation[i]);
        else if(i == 3)validateField(questionJsonSchema, needValidation[i]);
    }

    if(formErrors != 0){
        var errorMessages = "<ul class='bulletPoints'>";
        formErrorMessages.forEach(function(item, index){
            errorMessages += "<li>" + item + "</li>";
        });
        errorMessages += "</ul>";
        $('#errorMessages').append(errorMessages);
    } else{
        $('#errorMessages').empty();
        $('#inputClient').toggleClass('hide');
        $('#options').toggleClass('hide');
    }
    formErrorMessages = [];
    formErrors = 0;
}

function validateField(schema, field){
    var ajv = new Ajv();
    var valid = ajv.validate(schema, $(field).val());
    if(!valid){
        console.log(ajv.errors);
        var labelText = $(field).parent().find("label").text();
        formErrorMessages.push(labelText + " is not valid.");
        formErrors++;
    }
}

//NAVIGATING

function toggleMenu(){
    $('#options').toggleClass('hide');
}

function toggleRegions(){
    $('#regions').toggleClass('hide');
}

function returnToHomePageFromScores(){
    $('#highscores').toggleClass('hide');
    $('#options').toggleClass('hide');
    $('div.score').remove();
}

function returnToHomePageFromForm(){
    $('#inputClient').toggleClass('hide');
    $('#options').toggleClass('hide');
}

function returnHomeFromQuestion(){
    $('div.question').remove();
    indexQuestion = 0;
    $('#options').toggleClass('hide');
}

function returnHomeFromSolution(){
    $('#solution').remove();
    $('div.question').remove();
    indexQuestion = 0;
    $('#options').toggleClass('hide');
}

function returnToHomePageFromRegions(){
    $('#regions').toggleClass('hide');
    $('#options').toggleClass('hide');
}

//RESOURCE LOADING

function preloadResources() {
    var resources = [
        '/images/home-white.png',
        '/images/imageNotLoaded.png',
        '/images/correct.png',
        '/images/incorrect.png'
    ];
    var apiResources = [
        "https://restcountries.eu/rest/v2/region/europe",
        "https://restcountries.eu/rest/v2/region/asia",
        "https://restcountries.eu/rest/v2/region/africa",
        "https://restcountries.eu/rest/v2/region/americas"
    ];

    resources.forEach(function(r,i){
        fetch(r);
    });

    apiResources.forEach(function(r, i)
    {
        fetch(r)
            .then(function (response) {
                response.json()
                    .then(function (responseJson) {
                        responseJson.forEach(function(q, i)
                        {
                            fetch(q.flag); //in every question there is one flag that needs to be fetched
                        })
                    })
            })
    })
}

$(document).ready(function(){
    $('#play').on('click', function(){
        toggleMenu();
        toggleRegions();
    });

    $('#scores').on('click', function(){
        toggleMenu();
        showHighscores();
    });

    $('#insertQuestion').on('click', function(){
        toggleMenu();
        showInputFields();
    });

    $('#returnArrowScores').on('click', returnToHomePageFromScores);
    $('#returnArrowForm').on('click', returnToHomePageFromForm);
    $('#returnArrowRegions').on('click', returnToHomePageFromRegions);
    $('#regions figure').on('click', getQuestions);
    $('#questionClient').on('submit', handleForm);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function() { console.log('Service Worker Registered'); })
            .then(preloadResources);
    }
});
