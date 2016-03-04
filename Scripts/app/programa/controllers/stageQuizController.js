//##############################   Controller for Quizzes   ##############################
//##############################        Version 2.2.1       ##############################
angular
    .module('incluso.stage.quizcontroller', [])
    .controller('stageQuizController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {
            var _loadedResources = false;
            var _pageLoaded = true;

            $scope.$emit('ShowPreloader'); //show preloader
            _httpFactory = $http;
            _location = $location;
            _timeout = $timeout;
            $scope.setToolbar($location.$$path, "");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.scrollToTop();
            $scope.currentPage = 1;
            $scope.setReadOnly = false;
            $scope.showWarning = false;
            $scope.coursemoduleid = 0;
            $scope.like_status = 1;
            $scope.questionTypeCode = [];
            $scope.questionText = [];
            $scope.answers = [];
            $scope.OtroAnswers = [];
            $scope.numOfMultichoiceQuestions = 0;
            $scope.position = {};
            $scope.questionNumOfChoices = [];
            $scope.placeholder = [];
            $scope.maxPages = 0;
            $scope.userprofile = {};
            $scope.userprofile.talents = [];
            $scope.userprofile.values = [];
            $scope.userprofile.habilities = [];
            $scope.userprofile.favoriteSports = [];
            $scope.userprofile.artisticActivities = [];
            $scope.userprofile.hobbies = [];

            var talents = [];
            var values = [];
            var habilities = [];
            var favoriteSports = [];
            var artisticActivities = [];
            var hobbies = [];

            $scope.AnswersResult = { //For storing responses in "Exploración Inicial - Etapa 1"
                "userid": 0,
                "answers": [null, [0, 0, 0, 0, 0], [], null, []],
                "activityidnumber": 0,
                "like_status": 0
            };

            var destinationPath = "";
            $scope.isDisabled = false;
            $scope.activity_identifier = parseInt($routeParams.activityIdentifier);

            $scope.openModal = function (size) {
                var modalInstance = $modal.open({
                    animation: false,
                    backdrop: false,
                    templateUrl: 'openingStageModal.html',
                    controller: 'OpeningStageController',
                    size: size,
                    windowClass: 'user-help-modal opening-stage-modal'
                }).result.finally(function () {
                    $scope.$emit('ShowPreloader');
                    $timeout(function () {
                        $scope.$emit('HidePreloader');
                    }, 1000);
                });
            };


            //#######################################  STARTING POINT ##################################
            getContentAsync();   // get content from drupal
            $scope.openModal();  // turns on robot
            getDataAsync();      // get Quiz data from service

            function getContentAsync() {
                /*IMPORTANT: It gets content only for the closing message*/
                var stageContent = "";
                if ($scope.activity_identifier > 999 && $scope.activity_identifier < 2000)
                    stageContent = "ZonaDeVueloClosing";
                else if ($scope.activity_identifier > 1999 && $scope.activity_identifier < 3000)
                    stageContent = "ZonaDeNavegacionClosing";
                else
                    stageContent = "ZonaDeAterrizajeClosing";

                drupalFactory.Services.GetContent(stageContent, function (data, key) {
                        _loadedResources = true;
                        $scope.closingContent = data.node;
                        if (_loadedResources && _pageLoaded) {
                            $scope.$emit('HidePreloader');
                        }
                    }, //function () {},
                    function () {
                        _loadedResources = true;
                        if (_loadedResources && _pageLoaded) {
                            $scope.$emit('HidePreloader');
                        }
                    },
                    false);  //it was true
            }

            function syncWithProfile(arr1, arr2, arr3, obj, activityObject) {

                var otherAnswerQuiz = JSON.parse(localStorage.getItem("otherAnswerQuiz/" + $scope.coursemoduleid));

                if (otherAnswerQuiz === null) {//Create this object if it doesn't exists...
                    var otherAnswerQuiz = obj;
                }

                //Modify & save the new "answerQuiz/71" object.
                var codedAnswers = [[], [], []];
                var j;

                //  Check for arr1. ---------------------------------------------------------
                var setOfLabels = [];
                var otherFound = false;
                var numAnswers = activityObject.questions[0].answers.length;

                for (j = 0; j < numAnswers; j++) {//Get the labels of answers.
                    var label = activityObject.questions[0].answers[j].answer;

                    if (label != "Otro") {//Not including the "Otro" label.
                        setOfLabels.push(label);
                    }
                }

                for (j = 0; j < setOfLabels.length; j++) {//Check if jth-label is an element of arr1...
                    if (arr1.indexOf(setOfLabels[j]) > -1) {
                        codedAnswers[0].push(1);
                    } else {
                        codedAnswers[0].push(0);
                    }
                }

                for (j = 0; j < arr1.length; j++) {//Check if jth-talent is within setOfLabels...
                    if (setOfLabels.indexOf(arr1[j]) == -1) {
                        //It must be the string for the !Other" option...
                        otherFound = true;
                        otherAnswerQuiz[0].answers = [arr1[j]];
                        codedAnswers[0].push(1);
                        activityObject.questions[0].userAnswer = arr1.join("; ") + "; Otro";
                        activityObject.questions[0].other = arr1[j];
                        break;
                    }
                }

                if (!otherFound) {
                    otherAnswerQuiz[0].answers = [""];
                    codedAnswers[0].push(0);
                    activityObject.questions[0].userAnswer = arr1.join("; ");
                    activityObject.questions[0].other = "";
                }

                //  Check for arr2.  ---------------------------------------------------------
                var setOfLabels = [];
                otherFound = false;
                var numAnswers = activityObject.questions[1].answers.length;

                for (j = 0; j < numAnswers; j++) {//Get the labels of answers.
                    var label = activityObject.questions[1].answers[j].answer;

                    if (label != "Otro") {//Not including the "Otro" label.
                        setOfLabels.push(label);
                    }
                }

                for (j = 0; j < setOfLabels.length; j++) {//Check if jth-label is an element of arr2...
                    if (arr2.indexOf(setOfLabels[j]) > -1) {
                        codedAnswers[1].push(1);
                    } else {
                        codedAnswers[1].push(0);
                    }
                }

                for (j = 0; j < arr2.length; j++) {//Check if jth-value is within setOfLabels...
                    if (setOfLabels.indexOf(arr2[j]) == -1) {
                        //It must be the string for the !Other" option...
                        otherFound = true;
                        otherAnswerQuiz[1].answers = [arr2[j]];
                        codedAnswers[1].push(1);
                        activityObject.questions[1].userAnswer = arr2.join("; ") + "; Otro";
                        activityObject.questions[1].other = arr2[j];
                        break;
                    }
                }

                if (!otherFound) {
                    otherAnswerQuiz[1].answers = [""];
                    codedAnswers[1].push(0);
                    activityObject.questions[1].userAnswer = arr2.join("; ");
                    activityObject.questions[1].other = "";
                }

                //  Check for arr3.  ---------------------------------------------------------
                var setOfLabels = [];
                otherFound = false;
                var numAnswers = activityObject.questions[2].answers.length;

                for (j = 0; j < numAnswers; j++) {//Get the labels of answers.
                    var label = activityObject.questions[2].answers[j].answer;

                    if (label != "Otro") {//Not including the "Otro" label.
                        setOfLabels.push(label);
                    }
                }

                for (j = 0; j < setOfLabels.length; j++) {//Check if jth-label is an element of arr3...
                    if (arr3.indexOf(setOfLabels[j]) > -1) {
                        codedAnswers[2].push(1);
                    } else {
                        codedAnswers[2].push(0);
                    }
                }

                for (j = 0; j < arr3.length; j++) {//Check if jth-hability is within setOfLabels...
                    if (setOfLabels.indexOf(arr3[j]) == -1) {
                        //It must be the string for the !Other" option...
                        otherFound = true;
                        otherAnswerQuiz[2].answers = [arr3[j]];
                        codedAnswers[2].push(1);
                        activityObject.questions[2].userAnswer = arr3.join("; ") + "; Otro";
                        activityObject.questions[2].other = arr3[j];
                        break;
                    }
                }

                if (!otherFound) {
                    otherAnswerQuiz[2].answers = [""];
                    codedAnswers[2].push(0);
                    activityObject.questions[2].userAnswer = arr3.join("; ");
                    activityObject.questions[2].other = "";
                }

                _setLocalStorageJsonItem("answersQuiz/" + $scope.coursemoduleid, codedAnswers);
                _setLocalStorageJsonItem("otherAnswerQuiz/" + $scope.coursemoduleid, otherAnswerQuiz);
                _setLocalStorageJsonItem("activity/" + $scope.coursemoduleid, activityObject);
                $scope.activityObject = activityObject;
            }

            function getDataAsync() {
                // Quizes: 1001, 1005, 1006, 1007, 1009; 2001, 2009, 2025, 2023; 3101, 3601.
                // Non editable quizzes: 1001, 1009, 2001, 2023, 3101, 3601.
                // Quizes with Other: 1001, 1005, 1006, 2001, 2023, 3101, 3601.
                // Quizes with Child activity: 2007, 2016.
                $scope.startingTime = moment().format('YYYY:MM:DD HH:mm:ss');
                var parentActivity = getActivityByActivity_identifier($scope.activity_identifier);

                //Making up path to redirect user to the proper dashboard
                var stageNameFromURL = $location.path().split("/")[1];
                var userCurrentStage = localStorage.getItem("userCurrentStage");
                var owlIndex = localStorage.getItem("owlIndex");
                destinationPath = "/" + stageNameFromURL + "/Dashboard/" + userCurrentStage + "/" + owlIndex;

                var childActivity = null;

                if (parentActivity != null) {

                    $scope.activityPoints = parentActivity.points;

                    if (parentActivity.activities) {//The activity HAS a "child" activity

                        childActivity = parentActivity.activities[0];
                        $scope.coursemoduleid = childActivity.coursemoduleid;
                        $scope.activityname = childActivity.activityname;
                        $scope.activity_status = childActivity.status;

                    } else {//The activity has no "child" activity
                        $scope.coursemoduleid = parentActivity.coursemoduleid;
                        $scope.activityname = parentActivity.activityname;
                        $scope.activity_status = parentActivity.status;
                    }

                    $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                    $scope.userprofile = JSON.parse(localStorage.getItem("Perfil/" + localStorage.getItem("userId")));
                    var otherAnswerQuiz = JSON.parse(localStorage.getItem("otherAnswerQuiz/" + $scope.coursemoduleid));

                    $scope.activity = parentActivity;
                    $scope.parentActivity = parentActivity;
                    $scope.childActivity = childActivity;

                    //Try to get Questions from Local Storage.
                    var localAnswers = null;
                    var activityObject = JSON.parse(_getItem("activity/" + $scope.coursemoduleid));

                    if (activityObject !== null) {
                        //Change format of 'answers' key from Object to Array.
                        for (var i = 0; i < activityObject.questions.length; i++) {
                            var newAnswer = [];
                            for (var key in activityObject.questions[i].answers) {
                                if (activityObject.questions[i].answers.hasOwnProperty(key)) {
                                    newAnswer.push(activityObject.questions[i].answers[key]);
                                }
                            }

                            activityObject.questions[i].answers = newAnswer;
                        }

                        $scope.activityObject = activityObject; //Get object in the right 'answers' format.
                    }

                    if ($scope.activity_status === 1) {//If the activity is currently finished, try get it from Local Storage first...

                        //Load the arrays for 'Mis Cualidades' and 'Mis Gustos' from "Perfil/nnn".
                        if ($scope.activity_identifier === 1005 && activityObject !== null) { //Mis Cualidades.
                            var talents = $scope.userprofile.talents;
                            var values = $scope.userprofile.values;
                            var habilities = $scope.userprofile.habilities;

                            var obj = [
                                {"questionid": 16, "answers": []},
                                {"questionid": 17, "answers": []},
                                {"questionid": 18, "answers": []}
                            ];

                            syncWithProfile(talents, values, habilities, obj, activityObject);

                        } else if ($scope.activity_identifier === 1006 && activityObject !== null) {//Mis Gustos.

                            var favoriteSports = $scope.userprofile.favoriteSports;
                            var artisticActivities = $scope.userprofile.artisticActivities;
                            var hobbies = $scope.userprofile.hobbies;

                            var obj = [
                                {"questionid": 43, "answers": []},
                                {"questionid": 44, "answers": []},
                                {"questionid": 45, "answers": []}
                            ];

                            syncWithProfile(favoriteSports, artisticActivities, hobbies, obj, activityObject);
                        }

                        localAnswers = JSON.parse(_getItem("answersQuiz/" + $scope.coursemoduleid));

                        if (localAnswers !== null) {
                            $scope.answers = localAnswers;
                        }

                        if (activityObject == null) {// If activity does not exists in Local Storage...get it from Server.
                            // GET request; example: http://incluso.definityfirst.com/RestfulAPI/public/activity/150?userid=656
                            //moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, $scope.currentUser.token, loadModelVariables, errorCallback, true);
                            $location.path('/');

                        } else {//Both Questions and Answer SHOULD BE in Local Storage; Angular-bind the object in the respective HTML template
                            loadModelVariables($scope.activityObject);
                        }

                    } else {//The Quiz has not been finished yet.
                        if (activityObject === null) {//If the questions are not in Local Storage, then...
                            // ...bring the questions from the Service. The -1 is for making up a GET request without the userid; for example:
                            // http://incluso.definityfirst.com/RestfulAPI/public/activity/150
                            //moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, -1, $scope.currentUser.token, loadModelVariables, errorCallback, true);
                            $location.path('/');
                        } else {//The questions were found in Local Storage.

                            //Load the arrays for 'Mis Cualidades' and 'Mis Gustos' from "Perfil/nnn".
                            if ($scope.activity_identifier === 1005 && activityObject !== null) { //Mis Cualidades.
                                var talents = $scope.userprofile.talents;
                                var values = $scope.userprofile.values;
                                var habilities = $scope.userprofile.habilities;

                                var obj = [
                                    {"questionid": 16, "answers": []},
                                    {"questionid": 17, "answers": []},
                                    {"questionid": 18, "answers": []}
                                ];

                                syncWithProfile(talents, values, habilities, obj, activityObject);

                            } else if ($scope.activity_identifier === 1006 && activityObject !== null) {//Mis Gustos.

                                var favoriteSports = $scope.userprofile.favoriteSports;
                                var artisticActivities = $scope.userprofile.artisticActivities;
                                var hobbies = $scope.userprofile.hobbies;

                                var obj = [
                                    {"questionid": 43, "answers": []},
                                    {"questionid": 44, "answers": []},
                                    {"questionid": 45, "answers": []}
                                ];

                                syncWithProfile(favoriteSports, artisticActivities, hobbies, obj, activityObject);
                            }

                            loadModelVariables($scope.activityObject);
                        }
                    }

                } else {
                    $location.path("/" + stageNameFromURL + "/Dashboard/" + userCurrentStage + "/" + 0);
                }

            }


            function loadModelVariables(activityObject) {

                $scope.activityObject = activityObject;

                // Check if the Quiz is non editable (attempts == 1) AND it has been finished.
                $scope.attempts = $scope.activityObject.attempts;
                if ($scope.attempts === 1 && $scope.activity_status === 1) {
                    $scope.setReadOnly = true; //It will not be possible to edit answers.
                }

                _setLocalStorageJsonItem("activity/" + $scope.coursemoduleid, $scope.activityObject);

                if ($scope.activityObject != null) {

                    var question;
                    var i, index;
                    var questionNumOfChoices;

                    $scope.numOfOthers = 0;
                    var localOtrosAnswers = null;
                    $scope.placeholder = [];
                    var numQuestions = $scope.activityObject.questions.length;
                    $scope.maxPages = numQuestions;  //Important. Used in View to know the total number of questions.

                    //Count the number of "Other" options in current Quiz.
                    for (index = 0; index < numQuestions; index++) {

                        question = $scope.activityObject.questions[index];
                        questionNumOfChoices = question.answers.length;
                        var hasOther = false;

                        if (questionNumOfChoices > 0) {
                            hasOther = question.answers[questionNumOfChoices - 1].answer == "Otro"; //the last question.answers object.
                        }

                        $scope.placeholder[index] = question.tag;  //Set the values for the placeholder strings within UI textareas.
                        var questionType = question.questionType || question.questiontype;   //Contains the type of question.

                        if (questionType == "multichoice" && questionNumOfChoices > 2 && hasOther) {
                            $scope.numOfOthers++;
                        }
                    }

                    if ($scope.numOfOthers > 0) {//If the current Quiz has questions including the 'Other' option, then get them from LS
                        if ($scope.childActivity) {
                            localOtrosAnswers = JSON.parse(_getItem("otherAnswerQuiz/" + $scope.childActivity.coursemoduleid));
                        } else {
                            localOtrosAnswers = JSON.parse(_getItem("otherAnswerQuiz/" + $scope.parentActivity.coursemoduleid));
                        }
                    }

                    $scope.OtroAnswers = localOtrosAnswers;

                    if ($scope.OtroAnswers == null) {
                        $scope.OtroAnswers = [];
                    }

                    //Load the arrays for 'Mis Cualidades' and 'Mis Gustos'.
                    var answerLabel;

                    if ($scope.activity_identifier === 1005) {

                        //Load array for Talents
                        question = $scope.activityObject.questions[0];  //First question
                        questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            talents.push(answerLabel);
                        }

                        //Load array  for Values
                        question = $scope.activityObject.questions[1];  //First question
                        questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            values.push(answerLabel);
                        }

                        //Load array for Habilities
                        question = $scope.activityObject.questions[2];  //First question
                        questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            habilities.push(answerLabel);
                        }
                    }

                    if ($scope.activity_identifier === 1006) {

                        //Load array for favoriteSports
                        question = $scope.activityObject.questions[0];  //First question
                        questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            favoriteSports.push(answerLabel);
                        }

                        //Load array  for artisticActivities
                        question = $scope.activityObject.questions[1];  //First question
                        questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            artisticActivities.push(answerLabel);
                        }

                        //Load array for Hobbies
                        question = $scope.activityObject.questions[2];  //First question
                        questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            hobbies.push(answerLabel);
                        }
                    }

                    for (index = 0; index < numQuestions; index++) {
                        question = $scope.activityObject.questions[index];
                        renderQuestionsAndAnswers(index, question);
                        _setLocalStorageJsonItem("answersQuiz/" + $scope.coursemoduleid, $scope.answers);
                    }


                } else {
                    $scope.warningMessage = "Las respuestas del quiz no se pueden mostrar en este momento";
                    $scope.showWarning = true;
                }
            }


            function errorCallback() {
                $scope.$emit('HidePreloader');
            }


            //#######################################  SECTION FOR DATA-BINDING FUNCTIONS ##################################
            $scope.updateOtherField = function (index, otherIndex, checkLabel) {

                var multichoiceIndex = $scope.position[index];

                //Section for updating the value of the key userAnswer for each question.
                var numOptions = $scope.activityObject.questions[index].answers.length;
                var userAnswerString = "";
                var k;
                var longUserAnswerString;

                for (k = 0; k < numOptions; k++) {
                    if ($scope.answers[index][k] == 1) {
                        userAnswerString += $scope.activityObject.questions[index].answers[k].answer;
                    }

                    if (k < numOptions - 1 && $scope.answers[index][k] == 1) {
                        userAnswerString += "; ";
                    }
                }

                userAnswerString = userAnswerString.trim();
                longUserAnswerString = userAnswerString.length;

                if (userAnswerString[longUserAnswerString - 1] == ";") {//If the last character is ;, then remove it.
                    userAnswerString = userAnswerString.substring(0, longUserAnswerString - 1);
                }

                $scope.activityObject.questions[index].userAnswer = userAnswerString;

                //-------------

                // The checkbox for 'Other' is clicked.
                if (checkLabel === "Otro" && $scope.answers[index][otherIndex]) {//The "Otro" checkbox has been checked.
                    addHeight($("multichoice" + index)); //Add room for the TextArea
                }

                if (checkLabel === "Otro" && !$scope.answers[index][otherIndex]) {//The "Otro" checkbox has been unchecked.

                    $scope.activityObject.questions[index].other = "";  //First, do "other=''" for the respective questions object.
                    var indexOfOtro = $scope.activityObject.questions[index].userAnswer.indexOf("; Otro"); //Second, remove "Otro" value from the "userAnswer" for the respective questions object.
                    $scope.activityObject.questions[index].userAnswer = $scope.activityObject.questions[index].userAnswer.substring(0, indexOfOtro);
                    $scope.OtroAnswers[multichoiceIndex].answers[0] = ""; //Third, delete user answer from the OtroAnswers object.

                    removeHeight($("multichoice" + index)); //Finally, adjust the size of the UI.
                }

            };


            function renderQuestionsAndAnswers(questionIndex, question) {
                var i, index;
                var userAnswers;
                var userAnswer;
                var otherObjectItem = {};
                var indexUserAnswers;
                var questionOption;

                var questionNumOfChoices = question.answers.length;
                $scope.questionNumOfChoices[questionIndex] = questionNumOfChoices;

                var hasOther = false;

                if (questionNumOfChoices > 0) {
                    hasOther = question.answers[questionNumOfChoices - 1].answer == "Otro";
                }

                var questionCode = "";

                var questionText = question.question; //Contains the text for question.
                var questionType = question.questionType || question.questiontype;   //Contains the type of question.

                if (questionType == "shortanswer") {
                    questionCode = "shortanswer";
                }

                if (questionType == "essay") {
                    questionCode = "essay";
                }

                if (questionType == "multichoice" && questionNumOfChoices == 2 || questionType == "truefalse") {
                    questionCode = "binary";
                }

                if (questionType == "multichoice" && questionNumOfChoices > 2 && hasOther) {
                    questionCode = "multichoice";

                    $scope.numOfMultichoiceQuestions++;
                    $scope.position[questionIndex] = $scope.numOfMultichoiceQuestions - 1;

                    if ($scope.OtroAnswers.length < $scope.numOfOthers) {//continue adding items to the array
                        otherObjectItem.questionid = question.id;
                        otherObjectItem.answers = [""];
                        $scope.OtroAnswers.push(otherObjectItem);
                    }
                }

                if (questionType == "multichoice" && questionNumOfChoices > 2 && !hasOther) {
                    questionCode = "simplechoice";
                }

                if (questionType == "multichoice" && question.id == 124) {
                    questionCode = "multichoicewo";
                }

                if (questionType == "multichoice" && question.id == 120) {
                    questionCode = "multichoicewo";
                }

                if (questionType == "multichoice" && question.id == 119) {
                    questionCode = "simplechoice";
                }

                $scope.questionTypeCode.push(questionCode);
                $scope.questionText.push(questionText);

                switch (questionCode) {

                    case "binary":

                        if (question.answers[0].answer == question.userAnswer) {
                            $scope.answers[questionIndex] = "0";  //The user answered the first option
                        }

                        if (question.answers[1].answer == question.userAnswer) {
                            $scope.answers[questionIndex] = "1";  //The user answered the second option
                        }

                        break;

                    case "multichoice":

                        if ($scope.answers[questionIndex] == undefined) {
                            $scope.answers[questionIndex] = []; //Adding room for first answer
                        }

                        if (question.userAnswer !== null && question.userAnswer.length > 0) {
                            userAnswers = question.userAnswer.split(";");

                            for (indexUserAnswers = 0; indexUserAnswers < userAnswers.length; indexUserAnswers++) {
                                userAnswer = cleanText(userAnswers[indexUserAnswers]).trim();

                                for (index = 0; index < question.answers.length; index++) {
                                    questionOption = cleanText(question.answers[index].answer).trim();

                                    if (questionOption == userAnswer) {//For checked options...
                                        $scope.answers[questionIndex][index] = 1;

                                        if (userAnswer == "Otro") {//The user checked the "Otros" option, among others...
                                            $scope.OtroAnswers[$scope.position[questionIndex]].answers[0] = question.other;
                                            //_setLocalStorageJsonItem("otherAnswerQuiz/" + $scope.activity.coursemoduleid, $scope.OtroAnswers);
                                        }
                                    }
                                }
                            }
                        }

                        for (index = 0; index < question.answers.length; index++) {
                            if ($scope.answers[questionIndex][index] !== 1) {
                                $scope.answers[questionIndex][index] = 0;
                            }
                        }

                        break;

                    case "multichoicewo":

                        if ($scope.answers[questionIndex] == undefined) {
                            $scope.answers[questionIndex] = [];  //Adding room for first answer
                        }

                        if (question.userAnswer !== null && question.userAnswer.length > 0) {
                            userAnswers = question.userAnswer.split(";");

                            for (indexUserAnswers = 0; indexUserAnswers < userAnswers.length; indexUserAnswers++) {

                                userAnswer = cleanText(userAnswers[indexUserAnswers]).trim(); //Get each selected option

                                for (index = 0; index < question.answers.length; index++) {
                                    questionOption = cleanText(question.answers[index].answer).trim();

                                    if (questionOption == userAnswer) {//For checked options...
                                        $scope.answers[questionIndex][index] = 1;
                                    }
                                }
                            }
                        }

                        for (index = 0; index < question.answers.length; index++) {
                            if ($scope.answers[questionIndex][index] !== 1) {
                                $scope.answers[questionIndex][index] = 0;
                            }
                        }

                        break;


                    case "shortanswer":
                        if ($scope.answers[questionIndex] === undefined) {
                            $scope.answers[questionIndex] = []; //Adding room for first answer
                        }

                        if (question.userAnswer != "") {

                            userAnswers = question.userAnswer.split('\n');

                            if ($scope.answers[questionIndex].length < userAnswers.length) {
                                for (i = 0; i < userAnswers.length; i++) {
                                    $scope.answers[questionIndex].push(userAnswers[i]);
                                }
                            }
                        }

                        break;

                    case "simplechoice":
                        userAnswer = question.userAnswer.replace("\n", "");

                        for (i = 0; i < questionNumOfChoices; i++) {
                            if (question.answers[i].answer == question.userAnswer) {
                                $scope.answers[questionIndex] = i.toString();
                            }
                        }

                        break;

                    case "essay":
                        if ($scope.answers[questionIndex] === undefined) {
                            $scope.answers[questionIndex] = [];   //Adding room for first answer
                        }

                        if (question.userAnswer != "") {
                            userAnswers = question.userAnswer.split(';');
                            if ($scope.answers[questionIndex].length < userAnswers.length) {
                                for (i = 0; i < userAnswers.length; i++) {
                                    $scope.answers[questionIndex].push(userAnswers[i]);
                                }
                            }
                        }

                        break;

                    default:
                        break;
                }

            }


            //############################## CODE CALLED WHEN USER FINISHES ACTIVITY ###################################
            $scope.finishActivity = function () {

                $scope.$emit("ShowPreloader");

                //This is to avoid killing the preloader up starting.
                $timeout(function () {

                    if ($scope.childActivity) {
                        $scope.parentActivity.status = 1;
                        $scope.childActivity.status = 1;
                        $scope.AnswersResult.activityidnumber = $scope.childActivity.coursemoduleid;
                    } else {
                        $scope.parentActivity.status = 1;
                        $scope.AnswersResult.activityidnumber = $scope.parentActivity.coursemoduleid;
                    }

                    $scope.isDisabled = true;
                    $scope.AnswersResult.userid = $scope.userprofile.id;
                    $scope.AnswersResult.like_status = $scope.like_status;
                    $scope.AnswersResult.updatetype = 1;
                    $scope.showWarning = false;

                    var updatedActivityOnUsercourse;
                    if ($scope.childActivity) {  //Update status of Quiz ("child") activity
                        updatedActivityOnUsercourse = updateSubActivityStatus($scope.childActivity.coursemoduleid);  //actualizar arbol
                        _setLocalStorageJsonItem("usercourse", updatedActivityOnUsercourse);
                    }

                    updatedActivityOnUsercourse = updateActivityStatus($scope.activity_identifier);

                    //Update local storage and activities status array
                    _setLocalStorageJsonItem("usercourse", updatedActivityOnUsercourse);

                    if ($scope.childActivity) {
                        updateActivityStatusDictionary($scope.childActivity.activity_identifier);
                        updateActivityStatusDictionary($scope.parentActivity.activity_identifier);
                    } else {
                        updateActivityStatusDictionary($scope.parentActivity.activity_identifier);
                    }

                    $scope.AnswersResult.answers = $scope.answers;

                    var activityModel = {
                        "usercourse": updatedActivityOnUsercourse,
                        "answersResult": $scope.AnswersResult,
                        "userId": $scope.userprofile.id,
                        "startingTime": $scope.startingTime,
                        "endingTime": new Date(),
                        "token": $scope.currentUser.token,
                        "others": $scope.OtroAnswers
                    };

                    activityModel.answersResult.dateStart = activityModel.startingTime;
                    activityModel.answersResult.dateEnd = activityModel.endingTime;
                    activityModel.answersResult.others = $scope.OtroAnswers;

                    $scope.activityObject.status = 1;

                    //Section for Updating the "userAnswer" key on each question object for the Quiz.
                    var qIndex;

                    for (qIndex = 0; qIndex < $scope.questionTypeCode.length; qIndex++) {
                        switch ($scope.questionTypeCode[qIndex]) {

                            case "binary":
                                $scope.activityObject.questions[qIndex].userAnswer = $scope.activityObject.questions[qIndex].answers[$scope.answers[qIndex]].answer;
                                break;

                            case "simplechoice":
                                $scope.activityObject.questions[qIndex].userAnswer = $scope.activityObject.questions[qIndex].answers[$scope.answers[qIndex]].answer;
                                break;

                            case "multichoice":
                                $scope.activityObject.questions[qIndex].other = $scope.OtroAnswers[$scope.position[qIndex]].answers[0];
                                break;

                            case "shortanswer":
                                var userAnswerString = "";
                                var longUserAnswerString;
                                var k;

                                for (k = 0; k < $scope.answers[qIndex].length; k++) {

                                    userAnswerString += $scope.answers[qIndex][k];

                                    if (k < $scope.answers[qIndex].length - 1) {
                                        userAnswerString += "; ";
                                    }
                                }

                                userAnswerString = userAnswerString.trim();
                                longUserAnswerString = userAnswerString.length;

                                if (userAnswerString[longUserAnswerString - 1] == ";") {//If the last character is ;, then remove it.
                                    userAnswerString = userAnswerString.substring(0, longUserAnswerString - 1);
                                }

                                $scope.activityObject.questions[qIndex].userAnswer = userAnswerString;
                                break;

                            case "essay":
                                userAnswerString = "";
                                longUserAnswerString = 0;

                                for (k = 0; k < $scope.answers[qIndex].length; k++) {
                                    userAnswerString += $scope.answers[qIndex][k];

                                    if (k < $scope.answers[qIndex].length - 1) {
                                        userAnswerString += "; ";
                                    }
                                }

                                userAnswerString = userAnswerString.trim();
                                longUserAnswerString = userAnswerString.length;

                                if (userAnswerString[longUserAnswerString - 1] == ";") {//If the last character is ;, then remove it.
                                    userAnswerString = userAnswerString.substring(0, longUserAnswerString - 1);
                                }

                                $scope.activityObject.questions[qIndex].userAnswer = userAnswerString;
                                break;

                            default:
                                break;
                        }
                    }


                    // Write Updated objects to Local Storage for later recovery.
                    if ($scope.childActivity) {
                        _setLocalStorageJsonItem("answersQuiz/" + $scope.childActivity.coursemoduleid, $scope.AnswersResult.answers);
                        _setLocalStorageJsonItem("UserTalents/" + $scope.childActivity.coursemoduleid, $scope.AnswersResult.answers);
                        _setLocalStorageJsonItem("activity/" + $scope.childActivity.coursemoduleid, $scope.activityObject);  //SAVE activity with status 1.
                    } else {
                        _setLocalStorageJsonItem("answersQuiz/" + $scope.parentActivity.coursemoduleid, $scope.AnswersResult.answers);
                        _setLocalStorageJsonItem("UserTalents/" + $scope.parentActivity.coursemoduleid, $scope.AnswersResult.answers);
                        _setLocalStorageJsonItem("activity/" + $scope.parentActivity.coursemoduleid, $scope.activityObject); //SAVE activity with status 1.
                    }

                    //If the activity quiz has a checkbox for the "Otro" answer, then save it to Local Storage
                    if ($scope.numOfOthers > 0) {
                        if ($scope.childActivity) {
                            _setLocalStorageJsonItem("otherAnswerQuiz/" + $scope.childActivity.coursemoduleid, $scope.OtroAnswers);
                        } else {
                            _setLocalStorageJsonItem("otherAnswerQuiz/" + $scope.parentActivity.coursemoduleid, $scope.OtroAnswers);
                        }
                    }

                    if ($scope.childActivity) {//Close Quiz activity.
                        activityModel.activityType = "Quiz";
                        activityModel.coursemoduleid = $scope.childActivity.coursemoduleid;

                        _endActivity(activityModel, function () {
                            updateProfile();
                        }, destinationPath);

                        activityModel.activityType = "Assign";
                        activityModel.coursemoduleid = $scope.parentActivity.coursemoduleid;

                        _endActivity(activityModel, function () {
                            updateProfile();
                        }, destinationPath);

                    } else {
                        activityModel.coursemoduleid = $scope.parentActivity.coursemoduleid;
                        activityModel.activityType = "Quiz";

                        _endActivity(activityModel, function () {
                            updateProfile();
                        }, destinationPath);
                    }

                }, 1);

            };


            function updateProfile() {

                var i;

                if ($scope.activity_identifier === 1005) {//Mis Cualidades - Etapa 1 - CourseModuleId = 71

                    $scope.userprofile.talents = [];
                    $scope.userprofile.values = [];
                    $scope.userprofile.habilities = [];

                    //Update Talents
                    for (i = 0; i < $scope.answers[0].length - 1; i++) {
                        if ($scope.answers[0][i]) {// The label is checked
                            $scope.userprofile.talents.push(talents[i]);
                        }
                    }

                    var numOfTalents = $scope.answers[0].length;
                    if ($scope.answers[0][numOfTalents - 1] === 1) {//Other option was selected by the user.
                        $scope.userprofile.talents.push($scope.OtroAnswers[0].answers[0]);
                    }

                    //Update Values
                    for (i = 0; i < $scope.answers[1].length - 1; i++) {
                        if ($scope.answers[1][i]) {
                            $scope.userprofile.values.push(values[i]);
                        }
                    }

                    var numOfValues = $scope.answers[1].length;
                    if ($scope.answers[1][numOfValues - 1] === 1) {
                        $scope.userprofile.values.push($scope.OtroAnswers[1].answers[0]);
                    }

                    //Update Habilities
                    for (i = 0; i < $scope.answers[2].length - 1; i++) {
                        if ($scope.answers[2][i]) {
                            $scope.userprofile.habilities.push(habilities[i]);
                        }
                    }

                    var numOfHabilities = $scope.answers[2].length;
                    if ($scope.answers[2][numOfHabilities - 1] === 1) {
                        $scope.userprofile.habilities.push($scope.OtroAnswers[2].answers[0]);
                    }

                }

                if ($scope.activity_identifier === 1006) {//Mis Gustos - Etapa 1 -  CourseModuleId = 70

                    $scope.userprofile.favoriteSports = [];
                    $scope.userprofile.artisticActivities = [];
                    $scope.userprofile.hobbies = [];

                    //Update favoriteSports
                    for (i = 0; i < $scope.answers[0].length - 1; i++) {
                        if ($scope.answers[0][i]) {// The label is checked
                            $scope.userprofile.favoriteSports.push(favoriteSports[i]);
                        }
                    }

                    var numOfFavoriteSports = $scope.answers[0].length;
                    if ($scope.answers[0][numOfFavoriteSports - 1] === 1) {//Other option was selected by the user.
                        $scope.userprofile.favoriteSports.push($scope.OtroAnswers[0].answers[0]);
                    }

                    //Update artisticActivities
                    for (i = 0; i < $scope.answers[1].length - 1; i++) {
                        if ($scope.answers[1][i]) {
                            $scope.userprofile.artisticActivities.push(artisticActivities[i]);
                        }
                    }

                    var numOfArtisticActivities = $scope.answers[1].length;
                    if ($scope.answers[1][numOfArtisticActivities - 1] === 1) {
                        $scope.userprofile.artisticActivities.push($scope.OtroAnswers[1].answers[0]);
                    }

                    //Update Hobbies
                    for (i = 0; i < $scope.answers[2].length - 1; i++) {
                        if ($scope.answers[2][i]) {
                            $scope.userprofile.hobbies.push(hobbies[i]);
                        }
                    }

                    var numOfHobbies = $scope.answers[2].length;
                    if ($scope.answers[2][numOfHobbies - 1] === 1) {
                        $scope.userprofile.hobbies.push($scope.OtroAnswers[2].answers[0]);
                    }

                }

                if ($scope.activity_identifier === 1005 || $scope.activity_identifier === 1006) {
                    $scope.userId = moodleFactory.Services.GetCacheObject("userId");

                    moodleFactory.Services.PutAsyncProfile($scope.userId, $scope.userprofile,

                        function (responseData) {

                            $scope.numOfMultichoiceQuestions = 0;
                            $scope.numOfOthers = 0;

                            //Update Activity Log Service
                            if ($scope.activity_status == 0) {
                                $scope.activity_status = 1;

                                updateUserStars($scope.parentActivity.activity_identifier);
                            }

                            $scope.$emit("HidePreloader");
                            $location.path(destinationPath);
                        },
                        function (responseData) {

                        }
                    );

                } else {

                    $scope.numOfMultichoiceQuestions = 0;
                    $scope.numOfOthers = 0;

                    //Update Activity Log Service.
                    if ($scope.activity_status == 0) {//Update stars only for non-finished activities
                        $scope.activity_status = 1;
                        updateUserStars($scope.parentActivity.activity_identifier);
                    }

                    $scope.$emit("HidePreloader");
                    $location.path(destinationPath);
                }

            }


            // ##################################### VALIDATING USER ANSWERS ##################################################
            $scope.validateQuiz = function () {

                var index, b, i;
                var numAnswered = 0;
                var numQuestions = $scope.activityObject.questions.length;

                for (index = 0; index < numQuestions; index++) {

                    switch ($scope.questionTypeCode[index]) {

                        case "binary":
                            if ($scope.answers[index] != null) {//The user filled in the question.
                                numAnswered++;
                            }

                            break;

                        case "multichoice":
                            var repeated = false;
                            //Validation: the multichoice must have some 'true' value...
                            if (($scope.answers[index]).indexOf(1) > -1) {
                                //...and Other is 'true' and has a non empty string in the input
                                var userInput = $scope.OtroAnswers[$scope.position[index]].answers[0].replace(/\r?\n|\r/g, " ").trim();

                                if (($scope.answers[index][$scope.questionNumOfChoices[index] - 1] && userInput != '') || !$scope.answers[index][$scope.questionNumOfChoices[index] - 1]) {

                                    if ($scope.answers[index][$scope.questionNumOfChoices[index] - 1] && userInput != '') {
                                        var opt;
                                        var numAnswers = $scope.activityObject.questions[index].answers.length;

                                        for (var k = 0; k < numAnswers; k++) {
                                            opt = $scope.activityObject.questions[index].answers[k].answer.toLowerCase();

                                            if (opt == userInput.toLowerCase()) {
                                                $scope.OtroAnswers[$scope.position[index]].answers[0] = "";
                                                $scope.answers[index][$scope.questionNumOfChoices[index] - 1] = 0;
                                                $scope.answers[index][k] = 1;
                                            }
                                        }

                                    }

                                    numAnswered++;
                                }
                            }

                            //Unanswered questions should be equal to 0.
                            for (i = 0; i < $scope.activityObject.questions[index].answers.length; i++) {
                                if ($scope.answers[index][i] != 1) {
                                    $scope.answers[index][i] = 0;
                                }
                            }

                            break;

                        case "multichoicewo":
                            //Validation: the multichoice must have some 'true' value...
                            if (($scope.answers[index]).indexOf(1) > -1) {
                                numAnswered++;
                            }

                            for (i = 0; i < $scope.activityObject.questions[index].answers.length; i++) {

                                if ($scope.answers[index][i] != 1) {
                                    $scope.answers[index][i] = 0;
                                }
                            }

                            break;

                        case "shortanswer":

                            //Remove repeated entries and blanks in the question.
                            $scope.answers[index] = $scope.answers[index].filter(function (item, pos) {
                                return item.trim().length > 0 && $scope.answers[index].indexOf(item) == pos;
                            });

                            //Correction for the '\n' reserved character.
                            for (b = 0; b < $scope.answers[index].length; b++) {
                                $scope.answers[index][b] = $scope.answers[index][b].replace(/\r?\n|\r/g, " ").trim();
                            }

                            //Check is some of the questions has an invalid answer
                            if ($scope.answers[index].length > 0) {
                                numAnswered++;
                            }

                            break;

                        case "simplechoice":
                            if ($scope.answers[index] != null) {  //The user filled in the question.
                                numAnswered++;
                            }

                            break;

                        case "essay":
                            //Remove repeated entries and blanks in the question.
                            var numAnswers = $scope.answers[index].length;
                            var remained;
                            var j;
                            $scope.validAnswers = [];

                            for (j = 0; j < $scope.answers[index].length; j++) {
                                if ($scope.answers[index][j].trim().length > 0) {
                                    //Remove the empty string
                                    $scope.validAnswers.push($scope.answers[index][j]);
                                }
                            }

                            $scope.answers[index] = $scope.validAnswers;
                            //Check if the "TERMINAR" button is in current question
                            if (index == $scope.maxPages - 1) {
                                remained = numAnswers - $scope.validAnswers.length;
                                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                                angular.element("div.owl-wrapper-outer").css('height', containerHeight - 147 * remained);
                            }

                            $scope.answers[index] = $scope.answers[index].filter(function (item, pos) {
                                return $scope.answers[index].indexOf(item) == pos;
                            });

                            //Correction for the '\n' reserved character.
                            for (b = 0; b < $scope.answers[index].length; b++) {
                                $scope.answers[index][b] = $scope.answers[index][b].replace(/\r?\n|\r/g, " ").trim();
                            }

                            //Check is some of the questions has an invalid answer
                            if ($scope.answers[index].length > 0) {
                                numAnswered++;
                            }

                            break;

                        default:
                            break;
                    }

                }

                if (numAnswered == numQuestions) {//The Quiz questions are all completed.
                    $scope.showWarning = false;

                    if ($scope.activityname == "Exploración final") {
                        setFinalEvaluation();
                    }

                    $scope.navigateToPage(2);
                    $scope.scrollToTop();

                } else {
                    $scope.warningMessage = "Asegúrate de contestar todas las preguntas antes de guardar";
                    $scope.showWarning = true;

                    if ($scope.activityname == "Exploración final") {

                    }
                    showWarningAndGoToTop();
                }

            };


            function setFinalEvaluation() {

                var i, j;
                $scope.questionIsCorrect = [];
                $scope.answerIsCorrect = [];
                $scope.chosenByUserAndWrong = [];
                $scope.correctIndex = [];
                var totalScore = 0;
                var attainedScore = 0;
                var questionObj;

                if ($scope.activityObject != null) {

                    for (i = 0; i < $scope.activityObject.questions.length; i++) {

                        questionObj = $scope.activityObject.questions[i]; //The n-th question
                        $scope.chosenByUserAndWrong[i] = [];
                        $scope.answerIsCorrect[i] = [];

                        for (j = 0; j < questionObj.answers.length; j++) {

                            if ($scope.questionTypeCode[i] == 'binary') {
                                //Add item for binary object to finalResult array
                                totalScore = totalScore + parseInt(questionObj.answers[j].fraction);

                                if (j === parseInt($scope.answers[i])) {// User choice; $scope.answers[i] =  0 or 1
                                    attainedScore = attainedScore + parseInt(questionObj.answers[j].fraction);

                                    if (parseInt(questionObj.answers[j].fraction) === 1) {//The user selected the right option.
                                        $scope.questionIsCorrect[i] = true;
                                        $scope.chosenByUserAndWrong[i][j] = false;

                                    } else {//The user selected the wrong option.
                                        $scope.questionIsCorrect[i] = false;
                                        $scope.chosenByUserAndWrong[i][j] = true;
                                    }
                                } else {
                                    $scope.chosenByUserAndWrong[i][j] = false;
                                }

                            }

                            if ($scope.questionTypeCode[i] == 'simplechoice') {
                                //Add item for simplechoice object to finalResult array
                                totalScore = totalScore + parseInt(questionObj.answers[j].fraction);

                                if (parseInt(questionObj.answers[j].fraction) > 0) {
                                    $scope.correctIndex[i] = j;
                                }

                                if (j === parseInt($scope.answers[i])) {//$scope.answers[i] = 0, 1, 2, ..., n
                                    attainedScore = attainedScore + parseInt(questionObj.answers[j].fraction);

                                    if (parseInt(questionObj.answers[j].fraction) === 1) {
                                        $scope.questionIsCorrect[i] = true;
                                        $scope.chosenByUserAndWrong[i][j] = false;

                                    } else {
                                        $scope.questionIsCorrect[i] = false;
                                        $scope.chosenByUserAndWrong[i][j] = true;
                                    }
                                } else {
                                    $scope.chosenByUserAndWrong[i][j] = false;
                                }
                            }

                            if ($scope.questionTypeCode[i] == 'multichoice' || $scope.questionTypeCode[i] == 'multichoicewo') {
                                //Add item for multichoice object to finalResult array
                                totalScore = totalScore + parseFloat(questionObj.answers[j].fraction);
                                $scope.questionIsCorrect[i] = true;
                                $scope.chosenByUserAndWrong[i][j] = false;

                                if (1 === parseInt($scope.answers[i][j])) {//The j-th checkbox was selected.

                                    attainedScore = attainedScore + parseFloat(questionObj.answers[j].fraction);
                                }
                            }

                            if ($scope.questionTypeCode[i] == 'shortanswer') {
                                //Add item for multichoice object to finalResult array
                                $scope.questionIsCorrect[i] = true;
                                $scope.chosenByUserAndWrong[i][j] = false;
                                totalScore = totalScore + parseInt(questionObj.answers[j].fraction);
                                attainedScore = attainedScore + parseInt(questionObj.answers[j].fraction);
                            }

                        }
                    }

                    $scope.score = attainedScore * 100 / totalScore;
                }
            }


            //################################################## UTILITY FUNCTIONS #########################################
            function cleanText(userAnswer) {
                var result = userAnswer.replace(/\r/g, "").replace(/<br>/g, "").replace(/<p>/g, "").replace(/<\/p>/g, "").replace(/\n/g, "");
                return result;
            }

            function showWarningAndGoToTop() {
                $scope.showWarning = true;
                $scope.$emit('scrollTop');
            }

            $scope.answerIndex = 1;

            function addHeight(elem) {
                var elemHeight = angular.element(elem).height();
                var containerHeight = angular.element("div.owl-wrapper-outer").height();

                if (containerHeight < 750) {
                    angular.element(".owl-wrapper-outer").css('height', containerHeight + 100);
                    angular.element(elem).css('height', elemHeight + 100);
                }
            }

            function removeHeight(elem) {
                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                angular.element("div.owl-wrapper-outer").css('height', containerHeight - 100);
            }

            function addHeightEssay(elem) {
                var elemHeight = angular.element(elem).height();
                var containerHeight = angular.element("div.owl-wrapper-outer").height();
                angular.element(".owl-wrapper-outer").css('height', containerHeight + 147);
                angular.element(elem).css('height', elemHeight + 147);
            }

            function removeHeightEssay(elem) {
                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                angular.element("div.owl-wrapper-outer").css('height', containerHeight - 147);
            }

            //This function is activated from Template, with ESSAY type questions
            $scope.addAbility = function (elem, index) {
                addHeightEssay(elem);
                $scope.answers[index].push("");
            };

            //This function is activated from Template, with ESSAY type questions
            $scope.deleteAbility = function (elem, index, innerIndex) {
                removeHeightEssay(elem);
                $scope.answers[index].splice(innerIndex, 1);
            };

            $scope.hideWarning = function () {
                $scope.showWarning = false;
            };

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
            };

            $scope.cancel = function () {
                $scope.numOfMultichoiceQuestions = 0;
                $scope.numOfOthers = 0;
                $location.path(destinationPath);
            };

        }
    ]).controller('OpeningStageController', function ($scope, $modalInstance, $routeParams) {

        if ($routeParams.activityIdentifier) {
            drupalFactory.Services.GetContent($routeParams.activityIdentifier, function (data, key) {
                _loadedResources = true;
                if (data.node != null) {
                    $scope.title = data.node.titulo_quiz;
                    $scope.instructions = data.node.instrucciones;
                }
            }, function () {
                _loadedResources = true;
            }, false);  //BEFORE OFLINE: function () { }, true);  //put to:
        }
        $scope.cancel = function () {
            $scope.$emit('ShowPreloader');
            $modalInstance.dismiss('cancel');
        };

    })
    .controller('videoCollapsiblePanelController', function ($scope) {
        $scope.isCollapsed = false;
    }).directive("owlCarousel", function () {
        //Source: http://stackoverflow.com/questions/29157623/owl-carousel-not-identifying-elements-of-ng-repeat

        return {
            restrict: 'E',
            transclude: false,
            link: function ($scope) {
                $scope.initCarousel = function (element) {
                    // provide any default options you want
                    var currPage;
                    var prevPage;
                    var defaultOptions = {
                        navigation: false,
                        pagination: false,
                        goToFirstSpeed: 2000,
                        singleItem: true,
                        autoHeight: true,
                        mouseDrag: false,
                        touchDrag: false,
                        dots: false,
                        navRewind: true,
                        transitionStyle: "fade",
                        afterAction: function (el) {

                            //add class active
                            $scope.answerIndex = this.currentItem + 1;
                            prevPage = $("#index").html();
                            $("#index").html($scope.answerIndex);
                        }
                    };

                    var customOptions = $scope.$eval({});

                    // combine the two options objects
                    for (var key in customOptions) {
                        defaultOptions[key] = customOptions[key];
                    }

                    // init carousel
                    $(element).owlCarousel(defaultOptions);
                };
            }
        };
    })
    .directive('owlCarouselItem', [function () {
        return {
            restrict: 'A',
            transclude: false,
            link: function (scope, element) {
                // wait for the last item in the ng-repeat then call init
                if (scope.$last) {
                    scope.initCarousel(element.parent());
                }
            }
        };
    }]);


