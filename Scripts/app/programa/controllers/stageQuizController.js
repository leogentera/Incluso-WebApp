//##############################   Controller for Quizzes   ##############################
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
            $scope.userprofile.social = [];
            $scope.userprofile.emprendedor = [];
            $scope.activityTitle = [];
            $scope.profileDisabled = [];
            $rootScope.cancelDisabled = false;

            var talents = [];
            var values = [];
            var habilities = [];
            var favoriteSports = [];
            var artisticActivities = [];
            var hobbies = [];
            var social = [];
            var emprendedor = [];

            $scope.AnswersResult = { //For storing responses.
                "userid": 0,
                "answers": [null, [0, 0, 0, 0, 0], [], null, []],
                "activityidnumber": 0,
                "like_status": 0
            };

            $scope.isDisabled = false;
            $scope.activity_identifier = parseInt($routeParams.activityIdentifier);

            //########################################  ENTRY POINT  ###################################
            getDataAsync();      // get Quiz data from service
            //##########################################################################################

            function getContentAsync() {
                /*IMPORTANT: It gets content only for the closing message*/
                var stageContent = "";

                if ($scope.activity_identifier > 999 && $scope.activity_identifier < 2000) {
                    stageContent = "ZonaDeVueloClosing";
                } else if ($scope.activity_identifier > 1999 && $scope.activity_identifier < 3000) {
                    stageContent = "ZonaDeNavegacionClosing";
                } else {
                    stageContent = "ZonaDeAterrizajeClosing";
                }

                drupalFactory.Services.GetContent(stageContent, function (data, key) {
                    _loadedResources = true;
                    $scope.closingContent = data.node;
                },
                function () {
                },
                false);
            }

            function syncWithProfile(userKeysContent, obj, activityObject) {

                var otherAnswerQuiz = JSON.parse(localStorage.getItem("otherAnswerQuiz/" + $scope.coursemoduleid));
                var questionId;

                if (otherAnswerQuiz === null) {//Create this object if it doesn't exists...
                    var otherAnswerQuiz = obj;
                }

                //Modify & save the new "answerQuiz/71" object.
                var codedAnswers = [];
                for (var i = 0; i < userKeysContent.length; i++) {
                    codedAnswers.push([]);
                }

                var i, j;
                for (i = 0; i < userKeysContent.length; i++) {
                    var setOfLabels = [];
                    var otherFound = false;
                    var numAnswers = activityObject.questions[i].answers.length;

                    for (j = 0; j < numAnswers; j++) {//Get the label for answers for each question.
                        var label = activityObject.questions[i].answers[j].answer;

                        if (label != "Otro") {//Not including the "Otro" label.
                            setOfLabels.push(label);
                        }
                    }

                    for (j = 0; j < setOfLabels.length; j++) {//Check if jth-label is an element of userKeysContent[i]...
                        if (userKeysContent[i].indexOf(setOfLabels[j]) > -1) {
                            codedAnswers[i].push(1);  //Check the corresponding answer label.
                        } else {
                            codedAnswers[i].push(0); //Uncheck the answer label.
                        }
                    }

                    for (j = 0; j < userKeysContent[i].length; j++) {//Check if jth-user talent is within setOfLabels...
                        if (setOfLabels.indexOf((userKeysContent[i][j]).replace(/\r/g, " ").trim()) == -1) {//...if not, then that answer must be the "other" option value.
                            //It must be the string for the "Other" option...
                            otherFound = true;
                            questionId = activityObject.questions[i].id;

                            //Update the "answers" key that corresponds to this question, as defined by questionId.
                            for (var k = 0; k < otherAnswerQuiz.length; k++) {
                                if (otherAnswerQuiz[k].questionid == +questionId) {
                                    otherAnswerQuiz[k].answers = [userKeysContent[i][j]];
                                }
                            }

                            //otherAnswerQuiz[i].answers = [userKeysContent[i][j]];
                            codedAnswers[i].push(1);
                            activityObject.questions[i].userAnswer = userKeysContent[i].join("; ") + "; Otro";
                            activityObject.questions[i].other = userKeysContent[i][j];
                            break;
                        }
                    }

                    if (!otherFound) {//The question has "other" option empty.
                        otherAnswerQuiz[i].answers = [""];
                        codedAnswers[i].push(0);
                        activityObject.questions[i].userAnswer = userKeysContent[i].join("; ");
                        activityObject.questions[i].other = "";
                    }
                }
                console.log($scope.coursemoduleid, codedAnswers);
                _setLocalStorageJsonItem("answersQuiz/" + $scope.coursemoduleid, codedAnswers);
                _setLocalStorageJsonItem("otherAnswerQuiz/" + $scope.coursemoduleid, otherAnswerQuiz);
                _setLocalStorageJsonItem("activity/" + $scope.coursemoduleid, activityObject);
                $scope.activityObject = activityObject;
            }

            function getArrayForOther(activityObject) {
                var obj = [];
                for (var i = 0; i < activityObject.questions.length; i++) {
                    if (activityObject.questions[i].questionType == "multichoice") {
                        obj.push({ "questionid": +activityObject.questions[i].id, "answers": [] });
                    }
                }

                return obj;
            }

            function getDataAsync() {
                // Quizes: 1001, 1005, 1006, 1007, 1009; 2001, 2009, 2025, 2023; 3101, 3601.
                // Non editable quizzes: 1001, 1009, 2001, 2023, 3101, 3601.
                // Quizes with Other: 1001, 1005, 1006, 2001, 2023, 3101, 3601.
                // Quizes with Child activity: 2007, 2016.
                $scope.startingTime = moment().format('YYYY:MM:DD HH:mm:ss');
                var parentActivity = getActivityByActivity_identifier($scope.activity_identifier);
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

                    //Adaptation for the "Sueña" activity
                    if ($scope.activityname.toLowerCase() == "sueña") {
                        $scope.activityname = "Mi sueño es:";
                    }

                    $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                    $scope.userprofile = JSON.parse(localStorage.getItem("Perfil/" + $scope.currentUser.userId));
                    var otherAnswerQuiz = JSON.parse(localStorage.getItem("otherAnswerQuiz/" + $scope.coursemoduleid));

                    $scope.activity = parentActivity;
                    $scope.parentActivity = parentActivity;
                    $scope.childActivity = childActivity;

                    //Try to get Questions from Local Storage.
                    var localAnswers = null;
                    var activityObject = JSON.parse(localStorage.getItem("activity/" + $scope.coursemoduleid));

                    if (activityObject !== null) {

                        $scope.activityObject = activityObject; //Get object in the right 'answers' format.

                        if ($scope.activity_status && $scope.activity_status === 1) {//If the activity is currently finished, try get it from Local Storage first...

                            localAnswers = JSON.parse(_getItem("answersQuiz/" + $scope.coursemoduleid));

                            if (localAnswers !== null) {
                                $scope.answers = localAnswers;
                            }

                            //Both Questions and Answer SHOULD BE in Local Storage; Angular-bind the object in the respective HTML template
                            loadModelVariables();

                        } else {
                            //The Quiz has not been finished yet.

                            //Sync 'Mis Cualidades' and 'Mis Gustos' with "Perfil/nnn".
                            if ($scope.activity_identifier === 1005 && activityObject !== null) { //Mis Cualidades.
                                var keysToSync = ["talents", "values", "habilities"];
                                var userKeysContent = [];

                                //Get user items in keysToSync from Perfil/nnn.
                                for (var i = 0; i < keysToSync.length; i++) {
                                    userKeysContent[i] = $scope.userprofile[keysToSync[i]];
                                }

                                //Get questions Id's
                                var objForOtherAnswer = getArrayForOther(activityObject);
                                syncWithProfile(userKeysContent, objForOtherAnswer, activityObject);

                            } else if ($scope.activity_identifier === 1006 && activityObject !== null) {//Mis Gustos.
                                var keysToSync = ["favoriteSports", "artisticActivities", "hobbies", "social", "emprendedor"];
                                var userKeysContent = [];

                                //Get user items in keysToSync from Perfil/nnn.
                                for (var i = 0; i < keysToSync.length; i++) {
                                    userKeysContent[i] = $scope.userprofile[keysToSync[i]];
                                }

                                //Get questions Id's
                                var objForOtherAnswer = getArrayForOther(activityObject);
                                syncWithProfile(userKeysContent, objForOtherAnswer, activityObject);
                            }

                            loadModelVariables();
                        }

                    } else {//The activityObject is null
                        $location.path(pathToRedirect());
                    }
                } else {//The parentActivity is null
                    $location.path(pathToRedirect());
                }
            }


            function loadModelVariables() {
                // Check if the Quiz is non editable (attempts == 1) AND it has been finished.
                $scope.attempts = $scope.activityObject.attempts;

                if ($scope.attempts == 1 && $scope.activity_status === 1) {
                    $scope.setReadOnly = true; //It will not be possible to edit answers.
                }

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
                    $scope.activityTitle[index] = $scope.activityObject.questions[index].title;
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
                        localOtrosAnswers = JSON.parse(localStorage.getItem("otherAnswerQuiz/" + $scope.childActivity.coursemoduleid));
                    } else {
                        localOtrosAnswers = JSON.parse(localStorage.getItem("otherAnswerQuiz/" + $scope.parentActivity.coursemoduleid));
                    }
                }

                $scope.OtroAnswers = localOtrosAnswers;

                if ($scope.OtroAnswers === null) {
                    $scope.OtroAnswers = [];
                }

                //Load the arrays for 'Mis Habilidades' and 'Mis Gustos'.
                var answerLabel;

                if ($scope.activity_identifier === 1005) {//Mis Habilidades

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

                if ($scope.activity_identifier === 1006) {//Mis Gustos

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

                    //Load array for Social
                    question = $scope.activityObject.questions[3];  //First question
                    questionNumOfChoices = question.answers.length;  //Number of choices
                    for (i = 0; i < questionNumOfChoices; i++) {
                        answerLabel = question.answers[i].answer;
                        social.push(answerLabel);
                    }

                    //Load array for Emprendedor
                    question = $scope.activityObject.questions[4];  //First question
                    questionNumOfChoices = question.answers.length;  //Number of choices
                    for (i = 0; i < questionNumOfChoices; i++) {
                        answerLabel = question.answers[i].answer;
                        emprendedor.push(answerLabel);
                    }
                }

                for (index = 0; index < numQuestions; index++) {
                    question = $scope.activityObject.questions[index];
                    renderQuestionsAndAnswers(index, question);
                    //_setLocalStorageJsonItem("answersQuiz/" + $scope.coursemoduleid, $scope.answers);
                }
            }


            //##################################  SECTION FOR DATA-BINDING FUNCTIONS #############################
            $scope.updateOtherField = function (index, otherIndex, checkLabel) {

                var multichoiceIndex = $scope.position[index];

                //Section for updating the value of the key userAnswer for each question.
                var numOptions = $scope.activityObject.questions[index].answers.length;
                var userAnswerString = "";
                var k;
                var longUserAnswerString;
                var profileId = [];
                //var longProfileId;

                for (k = 0; k < numOptions; k++) {
                    if ($scope.answers[index][k] == 1) {
                        userAnswerString += $scope.activityObject.questions[index].answers[k].answer;
                        profileId.push(parseInt($scope.activityObject.questions[index].answers[k].profileid));
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
                $scope.activityObject.questions[index].profileid = profileId;

                // The checkbox for 'Other' is clicked.
                if (checkLabel === "Otro" && $scope.answers[index][otherIndex]) {
                    addHeight($("multichoice" + index)); //Add room for the TextArea
                }

                if (checkLabel === "Otro" && !$scope.answers[index][otherIndex]) {//The "Otro" checkbox has been unchecked.

                    $scope.activityObject.questions[index].other = "";  //First, do "other=''" for the respective questions object.
                    var indexOfOtro = $scope.activityObject.questions[index].userAnswer.indexOf("; Otro"); //Second, remove "Otro" value from the "userAnswer" for the respective questions object.
                    $scope.activityObject.questions[index].userAnswer = $scope.activityObject.questions[index].userAnswer.substring(0, indexOfOtro);
                    $scope.OtroAnswers[multichoiceIndex].answers[0] = ""; //Third, delete user answer from the OtroAnswers object.
                    removeHeight($("multichoice" + index)); //Finally, adjust the size of the UI.
                }

                //This section is only for "Mis Habilidades" and "Mis Gustos"
                if (checkLabel === "Ninguno" && $scope.answers[index][otherIndex]) {//The "Ninguno" checkbox has been checked.

                    $scope.profileDisabled[multichoiceIndex] = true; //Disable all checkboxes

                    if ($scope.answers[index][numOptions - 1]) {
                        removeHeight($("multichoice" + index)); //Finally, adjust the size of the UI.
                    }

                    //Uncheck all answers, except "Ninguno"
                    for (k = 0; k < numOptions; k++) {
                        if (k != numOptions - 2) {//The "Ninguno" checkbox
                            $scope.answers[index][k] = 0;
                        }
                    }

                    //Update answer objects
                    $scope.activityObject.questions[index].other = "";  //First, do "other=''" for the respective questions object.
                    $scope.activityObject.questions[index].userAnswer = "Ninguno"; //Second, make "Ninguno" the only value.
                    $scope.activityObject.questions[index].profileid = 0;
                    $scope.OtroAnswers[multichoiceIndex].answers[0] = ""; //Third, delete user answer from the OtroAnswers object.
                }

                if (checkLabel === "Ninguno" && !$scope.answers[index][otherIndex]) {//The "Ninguno" checkbox has been checked.
                    $scope.profileDisabled[multichoiceIndex] = false; //Remove disabling
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

                if ((questionType == "multichoice" && questionNumOfChoices == 2) || questionType == "truefalse") {
                    questionCode = "binary";
                }

                if (questionType == "multichoice" && questionCode != "binary"){
                    if(question.single == "1") {
                        questionCode = "simplechoice";
                    }else{
                        questionCode = "multichoicewo";
                    }
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

                    if (question.userAnswer == "Ninguno") {
                        $scope.profileDisabled.push(true);  //Disable questions with "Ninguno" checked.
                    } else {
                        $scope.profileDisabled.push(false);
                    }

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

                $scope.$emit('HidePreloader'); //show preloader
            }


            //##################### CODE CALLED WHEN USER FINISHES ACTIVITY ##################
            $scope.finishActivity = function () {

                $scope.$emit("ShowPreloader");

                //This is to avoid killing the preloader up starting.
                $timeout(function () {

                    //Section for Updating the "userAnswer" key on each question object for the Quiz.
                    var qIndex;

                    for (qIndex = 0; qIndex < $scope.questionTypeCode.length; qIndex++) {
                        switch ($scope.questionTypeCode[qIndex]) {

                            case "binary":
                                $scope.activityObject.questions[qIndex].userAnswer = $scope.activityObject.questions[qIndex].answers[$scope.answers[qIndex]].answer;
                                $scope.activityObject.questions[qIndex].profileid = parseInt($scope.activityObject.questions[qIndex].answers[$scope.answers[qIndex]].profileid);
                                break;

                            case "simplechoice":
                                $scope.activityObject.questions[qIndex].userAnswer = $scope.activityObject.questions[qIndex].answers[$scope.answers[qIndex]].answer;
                                $scope.activityObject.questions[qIndex].profileid = parseInt($scope.activityObject.questions[qIndex].answers[$scope.answers[qIndex]].profileid);
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
                                $scope.activityObject.questions[qIndex].profileid = 0;
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
                                $scope.activityObject.questions[qIndex].profileid = 0;
                                break;

                            default:
                                break;
                        }
                    }

                    //get profile points from the quiestion's answers.
                    if ($scope.childActivity && $scope.childActivity.status == 0) {
                        calculateProfilePoints($scope.activityObject.questions);
                    }
                    if ($scope.parentActivity && $scope.parentActivity.status == 0) {
                        calculateProfilePoints($scope.activityObject.questions);
                    }


                    if ($scope.childActivity) {
                        $scope.parentActivity.status = 1;
                        $scope.childActivity.status = 1;
                        $scope.AnswersResult.activityidnumber = $scope.childActivity.coursemoduleid;
                    } else {
                        $scope.parentActivity.status = 1;
                        $scope.AnswersResult.activityidnumber = $scope.parentActivity.coursemoduleid;
                    }

                    $scope.isDisabled = true;
                    $scope.AnswersResult.userid = $scope.currentUser.userId;
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
                        "userId": $scope.currentUser.userId,
                        "startingTime": $scope.startingTime,
                        "endingTime": new Date(),
                        "token": $scope.currentUser.token,
                        "others": $scope.OtroAnswers
                    };

                    activityModel.answersResult.dateStart = activityModel.startingTime;
                    activityModel.answersResult.dateEnd = activityModel.endingTime;
                    activityModel.answersResult.others = $scope.OtroAnswers;
                    $scope.activityObject.status = 1;

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

                        }, function(obj) {//Error handler
                           $scope.$emit('HidePreloader');
                                        if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                          $timeout(function () {
                                            $location.path('/Offline'); //This behavior could change
                                          }, 1);
                                        } else {//Another kind of Error happened
                                          $timeout(function () {
                                              $scope.$emit('HidePreloader');
                                              $location.path('/connectionError');
                                          }, 1);
                                        }  

                        });

                        activityModel.activityType = "Assign";
                        activityModel.coursemoduleid = $scope.parentActivity.coursemoduleid;

                        _endActivity(activityModel, updateProfile, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });

                    } else {
                        activityModel.coursemoduleid = $scope.parentActivity.coursemoduleid;
                        activityModel.activityType = "Quiz";

                        _endActivity(activityModel, updateProfile, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });
                    }

                }, 1);
            };



            function calculateProfilePoints(questions) {
                var profilePoints = [];

                var profiles = JSON.parse(localStorage.getItem("profileCatalogs")).profiles;
                var profileNone = _.where(profiles, { profilename: "None" }).id || 1;
                for (var i = 0; i < questions.length; i++) {
                    if (questions[i].profileid && questions[i].profileid != profileNone) {
                        var profileId = questions[i].profileid;
                        if (profileId.length > 0) {
                            for (var j = 0; j < profileId.length; j++) {
                                var pointsByAnswer = { "profileid": profileId[j], "score": 1 };
                                profilePoints.push(pointsByAnswer);
                            }
                        } else {
                            var pointsByAnswer = { "profileid": profileId, "score": 1 };
                            profilePoints.push(pointsByAnswer);
                        }
                    }
                };

                var groupedProfiles = _(profilePoints).groupBy('profileid');
                var sumOfGroupedProfiles = _(groupedProfiles).map(function (g, key) {
                    return {
                        profileid: key,
                        score: _(g).reduce(function (m, x) { return m + x.score }, 0),
                        moduleid: $scope.coursemoduleid
                    };
                });

                fillProfilePoints(sumOfGroupedProfiles);
            }

            function updateProfile() {

                var i;

                if ($scope.activity_identifier === 1005) {//Mis Habilidades - Etapa 1 - CourseModuleId = 71

                    $scope.userprofile.talents = [];
                    $scope.userprofile.values = [];
                    $scope.userprofile.habilities = [];

                    //Update Habilidades
                    for (i = 0; i < $scope.answers[0].length - 1; i++) {
                        if ($scope.answers[0][i]) {// The label is checked
                            $scope.userprofile.talents.push(talents[i]);
                        }
                    }

                    var numOfTalents = $scope.answers[0].length;
                    if ($scope.answers[0][numOfTalents - 1] === 1) {//Other option was selected by the user.
                        $scope.userprofile.talents.push($scope.OtroAnswers[0].answers[0]);
                    }

                    //Update Destrezas Sociales
                    for (i = 0; i < $scope.answers[1].length - 1; i++) {
                        if ($scope.answers[1][i]) {
                            $scope.userprofile.values.push(values[i]);
                        }
                    }

                    var numOfValues = $scope.answers[1].length;
                    if ($scope.answers[1][numOfValues - 1] === 1) {
                        $scope.userprofile.values.push($scope.OtroAnswers[1].answers[0]);
                    }

                    //Update Actitudes
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
                    $scope.userprofile.social = [];
                    $scope.userprofile.emprendedor = [];

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

                    //Update Social
                    for (i = 0; i < $scope.answers[3].length - 1; i++) {
                        if ($scope.answers[3][i]) {
                            $scope.userprofile.social.push(social[i]);
                        }
                    }

                    var numOfSocial = $scope.answers[3].length;
                    if ($scope.answers[3][numOfSocial - 1] === 1) {
                        $scope.userprofile.social.push($scope.OtroAnswers[3].answers[0]);
                    }

                    //Update Emprendedor
                    for (i = 0; i < $scope.answers[4].length - 1; i++) {
                        if ($scope.answers[4][i]) {
                            $scope.userprofile.emprendedor.push(emprendedor[i]);
                        }
                    }

                    var numOfOthers = $scope.answers[4].length;
                    if ($scope.answers[4][numOfOthers - 1] === 1) {
                        $scope.userprofile.emprendedor.push($scope.OtroAnswers[4].answers[0]);
                    }
                }

                if ($scope.activity_identifier === 1005 || $scope.activity_identifier === 1006) {

                    moodleFactory.Services.PutAsyncProfile($scope.currentUser.userId, $scope.userprofile, function (responseData) {

                            $scope.numOfMultichoiceQuestions = 0;
                            $scope.numOfOthers = 0;

                            //Update Activity Log Service
                            if ($scope.activity_status == 0) {
                                $scope.activity_status = 1;

                            updateUserStars($scope.parentActivity.activity_identifier, null, function (obj) {
                                    $scope.$emit('HidePreloader');
                                    if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                      $timeout(function () {
                                        $location.path('/Offline'); //This behavior could change
                                      }, 1);
                                    } else {//Another kind of Error happened
                                      $timeout(function () {
                                          console.log("Another kind of Error happened");
                                          $scope.$emit('HidePreloader');
                                          $location.path('/connectionError');
                                      }, 1);
                                    }
                                });
                            }
                            $timeout(function () {                                      
                                $scope.$emit('HidePreloader');
                                var path = pathToRedirect();
                                $location.path(path);
                            }, 1);
                            
                            $location.path(pathToRedirect());
                        }, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });

                } else {

                    $scope.numOfMultichoiceQuestions = 0;
                    $scope.numOfOthers = 0;

                    //Update Activity Log Service.
                    if ($scope.activity_status == 0) {//Update stars only for non-finished activities
                        $scope.activity_status = 1;
                        updateUserStars($scope.parentActivity.activity_identifier,null, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });
                    }

                    var path = pathToRedirect();
                    if ($scope.activity_identifier === 3601) {
                        localStorage.setItem("fromLastQuiz/" + $scope.currentUser.userId, "true");
                    }
                    $timeout(function () {                                      
                        $scope.$emit('HidePreloader');
                        $location.path(path);
                    }, 1);
                    
                }
                
                
            }


            // ##################################### VALIDATING USER ANSWERS ###############################
            $scope.validateQuiz = function () {

                var index, b, i;
                var numAnswered = 0;
                var numQuestions = $scope.activityObject.questions.length;

                //Adaptation for the "Sueña" activity
                if ($scope.activityname == "Mi sueño es:") {
                    $scope.activityname = "Sueña";
                }

                for (index = 0; index < numQuestions; index++) {

                    switch ($scope.questionTypeCode[index]) {

                        case "binary":
                            if ($scope.answers[index] != null) {//The user filled in the question.
                                numAnswered++;
                            }

                            break;

                        case "multichoice":
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
                                    $scope.validAnswers.push($scope.answers[index][j]);
                                }
                            }

                            $scope.answers[index] = $scope.validAnswers;

                            $scope.answers[index] = $scope.answers[index].filter(function (item, pos) {
                                return $scope.answers[index].indexOf(item) == pos;
                            });

                            //Check if the "TERMINAR" button is in current question
                            if (index == $scope.maxPages - 1) {
                                remained = numAnswers - $scope.answers[index].length;
                                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                                angular.element("div.owl-wrapper-outer").css('height', containerHeight - 147 * remained);
                            }

                            //Correction for the '\n' reserved character.
                            for (b = 0; b < $scope.answers[index].length; b++) {
                                $scope.answers[index][b] = $scope.answers[index][b].replace(/\r?\n|\r/g, " ").trim();
                            }

                            //Check if question has valid answers.
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

                    if ($scope.activityname.toLowerCase() == "exploración final") {
                        setFinalEvaluation();
                    }

                    getContentAsync();

                    $scope.navigateToPage(2);
                    $scope.scrollToTop();

                } else {//The Quiz questions were not completed.
                    $scope.warningMessage = "Asegúrate de contestar todas las preguntas antes de guardar";
                    $scope.showWarning = true;

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


            //################################# UTILITY FUNCTIONS ################################
            function cleanText(userAnswer) {
                var result = userAnswer.replace(/\r?\n|\r/g, "").trim();

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
                angular.element(".owl-wrapper-outer").css('height', containerHeight + 100);
                angular.element(elem).css('height', elemHeight + 100);
            }

            function removeHeight(elem) {
                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                angular.element("div.owl-wrapper-outer").css('height', containerHeight - 100);
            }

            function addHeightEssay(elem) {
                var containerWidth = angular.element("div.owl-wrapper-outer").width();
                var containerHeight = angular.element("div.owl-wrapper-outer").height();
                angular.element(".owl-wrapper-outer").css('height', containerHeight + 0.462 * containerWidth + 'px');
            }

            function removeHeightEssay(elem) {
                var containerWidth = angular.element("div.owl-wrapper-outer").width();
                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                angular.element("div.owl-wrapper-outer").css('height', containerHeight - 0.462 * containerWidth);
            }

            //This function is activated from Template, with ESSAY type questions
            $scope.addItem = function (elem, index) {
                addHeightEssay(elem);
                $scope.answers[index].push("");
            };

            $scope.checkCharacter = function (event, ele, question, index) {
                if (event.keyCode == 13) {
                    event.preventDefault();
                }
            };

            $scope.autoSize = function (ele, question, index) {
                var elem = $("#" + ele + question + "-" + index);
                autosize(elem);

                elem.on('autosize:resized', function () {//This event fires when height changes
                    var containerHeight = angular.element('div.owl-wrapper-outer');
                    var questionContainer = angular.element("#" + ele + question);

                    containerHeight.height(questionContainer.height() + 0.27 * $(window).width());
                    questionContainer.css('height', 'auto');
                });
            };

            //This function is activated from Template, with ESSAY type questions
            $scope.deleteItem = function (elem, index, innerIndex) {
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
                $location.path(pathToRedirect());
            };

            function pathToRedirect() {
                //Making up path to redirect user to the proper dashboard
                var stageNameFromURL = $location.path().split("/")[1];
                var userCurrentStage;
                var owlIndex;
                var destinationPath;

                if ($scope.activity_identifier > 1000 && $scope.activity_identifier < 2000) {
                    userCurrentStage = 1;
                }
                if ($scope.activity_identifier > 2000 && $scope.activity_identifier < 3000) {
                    userCurrentStage = 2;
                }
                if ($scope.activity_identifier > 3000) {
                    userCurrentStage = 3;
                }

                switch ($scope.activity_identifier) {
                    case 1001:  //Expl. Inicial
                        owlIndex = 0;
                        break;
                    case 1005:  //Mis Cualidades
                        owlIndex = 3;
                        break;
                    case 1006:  //Mis Gustos
                        owlIndex = 3;
                        break;
                    case 1007:  //Sueña
                        owlIndex = 3;
                        break;
                    case 1009:  //Expl. Final
                        owlIndex = 5;
                        break;
                    case 2001:  //Expl. Inicial
                        owlIndex = 0;
                        break;
                    case 2007:  //Tus Ideas
                        owlIndex = 2;
                        break;
                    case 2016:  //1, 3 y 5
                        owlIndex = 4;
                        break;
                    case 2023:  //Expl. Final
                        owlIndex = 6;
                        break;
                    case 3101:  //Expl. Inicial
                        owlIndex = 0;
                        break;
                    case 3601:  //Expl. Final
                        owlIndex = 5;
                        break;
                    default:
                        owlIndex = 0;
                        break;
                }

                destinationPath = "/" + stageNameFromURL + "/Dashboard/" + userCurrentStage + "/" + owlIndex;
                return destinationPath;
            }

        }
    ]).controller('videoCollapsiblePanelController', function ($scope) {
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


