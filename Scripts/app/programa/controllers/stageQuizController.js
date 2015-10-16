//Controller for Quizzes
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
            //Turn on Preloader
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
            $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

            $scope.questionTypeCode = [];
            $scope.questionText = [];
            $scope.answers = [];
            $scope.OtroAnswers = [];
            $scope.numOfMultichoiceQuestions = 0;
            $scope.position = {};
            var nonEditableQuizzes = ["1001", "1009", "2001", "2023", "3101", "3601"];
            var quizHasOther = ["1001", "1005", "1006", "2001", "2023", "3101", "3601"];
            $scope.questionNumOfChoices = [];
            $scope.placeholder = [];

            $scope.AnswersResult = { //For storing responses in "Exploración Inicial - Etapa 1"
                "userid": 0,
                "answers": [null, [0, 0, 0, 0, 0], [], null, []],
                "activityidnumber": 0,
                "like_status": 0
            };

            var destinationPath = "";

            $scope.isDisabled = false;
            $scope.activity_identifier = parseInt($routeParams.activityIdentifier);  //Gets the coursemoduleid from 'activity' object
            //alert($scope.activity_identifier);

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

            //For 'shortanswer' and 'essay' type questions.

            $scope.robotMessage = "";
            //$scope.activity_identifier = $location.path().split("/")[$location.path().split("/").length - 1];

            $scope.addCaptureField = function (value, check) {
                if (check) {
                    addHeightForOther();

                    switch (value) {
                        case "cualidades1":
                            $('#textoarea1').attr('readonly', false);
                            break;
                        case "cualidades2":
                            $('#textoarea2').attr('readonly', false);
                            break;
                        case "cualidades3":
                            $('#textoarea2').attr('readonly', false);
                            break;
                        case "gustos1":
                            $('#textoarea1').attr('readonly', false);
                            break;
                        case "gustos2":
                            $('#textoarea2').attr('readonly', false);
                            break;
                        case "gustos3":
                            $('#textoarea3').attr('readonly', false);
                            break;
                        default:
                            console.log('Unknow textArea');
                    }
                } else {
                    reduceHeightForOther();

                    switch (value) {
                        case "cualidades1":
                            var index = $scope.userprofile.talents.indexOf($scope.OtroAnswers[0].answers[0]);
                            $scope.userprofile.talents.splice(index, 1);
                            $scope.OtroAnswers[0].answers[0] = '';
                            break;
                        case "cualidades2":
                            var index = $scope.userprofile.values.indexOf($scope.OtroAnswers[1].answers[0]);
                            $scope.userprofile.values.splice(index, 1);
                            $scope.OtroAnswers[1].answers[0] = '';
                            break;
                        case "cualidades3":
                            var index = $scope.userprofile.habilities.indexOf($scope.OtroAnswers[2].answers[0]);
                            $scope.userprofile.habilities.splice(index, 1);
                            $scope.OtroAnswers[2].answers[0] = '';
                            break;
                        case "gustos1":
                            var index = $scope.userprofile.favoriteSports.indexOf($scope.OtroAnswers[0].answers[0]);
                            $scope.userprofile.favoriteSports.splice(index, 1);
                            $scope.OtroAnswers[0].answers[0] = '';
                            break;
                        case "gustos2":
                            var index = $scope.userprofile.artisticActivities.indexOf($scope.OtroAnswers[1].answers[0]);
                            $scope.userprofile.artisticActivities.splice(index, 1);
                            $scope.OtroAnswers[1].answers[0] = '';
                            break;
                        case "gustos3":
                            var index = $scope.userprofile.hobbies.indexOf($scope.OtroAnswers[2].answers[0]);
                            $scope.userprofile.hobbies.splice(index, 1);
                            $scope.OtroAnswers[2].answers[0] = '';
                            break;
                        default:
                            console.log('Unknow textArea');
                    }
                }
            };

            //****************************************  STARTING POINT **************************************************

            $scope.openModal();
            getDataAsync();

            //***********************************************************************************************************
            function getDataAsync() {
                $scope.startingTime = moment().format('YYYY:MM:DD HH:mm:ss');
                var parentActivity = getActivityByActivity_identifier($scope.activity_identifier);  //activity_identifier taken from URL route

                //Making up path to redirect user to the proper dashboard
                var stageNameFromURL = $location.path().split("/")[1];
                var userCurrentStage = localStorage.getItem("userCurrentStage");
                var owlQuizCurrentIndex = localStorage.getItem("owlQuizCurrentIndex");
                destinationPath = "/" + stageNameFromURL + "/Dashboard/" + userCurrentStage + "/" + owlQuizCurrentIndex;
                console.log("Activity identifier: " + $scope.activity_identifier);
                console.log("parentActivity = " + JSON.stringify(parentActivity));

                var childActivity = null;
                if (parentActivity.activities) {
                    childActivity = parentActivity.activities[0];
                }

                if (parentActivity != null || childActivity != null) {

                    if (childActivity) {//The activity HAS a "child" activity
                        $scope.coursemoduleid = childActivity.coursemoduleid;
                        $scope.activityPoints = childActivity.points;
                        $scope.activityname = childActivity.activityname;
                        $scope.activity_status = childActivity.status;

                    } else {//The activity has no "child" activity
                        $scope.coursemoduleid = parentActivity.coursemoduleid;
                        $scope.activityPoints = parentActivity.points;
                        $scope.activityname = parentActivity.activityname;
                        $scope.activity_status = parentActivity.status;
                    }
                    console.log("activityname = " + $scope.activityname);
                    console.log("Activity status = " + $scope.activity_status);

                    $scope.userprofile = JSON.parse(localStorage.getItem("profile/" + localStorage.getItem("userId")));
                    console.log("Starting... " + parentActivity.sectionname);

                    var activityFinished = false;

                    $scope.activity = parentActivity;
                    $scope.parentActivity = parentActivity;
                    $scope.childActivity = childActivity;

                    if ($scope.activity_status == 1) {//If the activity is currently finished, try get it from Local Storage first...
                        activityFinished = true;
                        console.log("The activity status is FINISHED");

                        if (nonEditableQuizzes.indexOf($scope.activity_identifier) > -1) {// If the Quiz is non editable, then...
                            $scope.setReadOnly = true;
                        }
                        console.log("Coursemoduleid de la actividad = " + $scope.coursemoduleid);
                        var localAnswers;
                        var activityObject;

                        if (childActivity) {
                            localAnswers = JSON.parse(_getItem("answersQuiz/" + childActivity.coursemoduleid));
                            activityObject = JSON.parse(_getItem("activityObject/" + childActivity.coursemoduleid));
                        } else {
                            localAnswers = JSON.parse(_getItem("answersQuiz/" + parentActivity.coursemoduleid));
                            activityObject = JSON.parse(_getItem("activityObject/" + parentActivity.coursemoduleid));
                        }

                        //If...the activity quiz has a checkbox for the "Other" answer, then get it from Local Storage
                        var localOtrosAnswers;
                        if (quizHasOther.indexOf($scope.activity_identifier) > -1) {
                            if (childActivity) {
                                localOtrosAnswers = JSON.parse(_getItem("otherAnswQuiz/" + childActivity.coursemoduleid));
                            } else {
                                localOtrosAnswers = JSON.parse(_getItem("otherAnswQuiz/" + parentActivity.coursemoduleid));
                            }
                        }

                        $scope.activityObject = activityObject;
                        $scope.OtroAnswers = localOtrosAnswers;
                        console.log("localAnswers = " + JSON.stringify(localAnswers));
                        console.log("OtroAnswers = " + JSON.stringify(localOtrosAnswers));

                        $scope.activityFinished = activityFinished;

                        if (localAnswers == null || activityObject == null ) {// If activity data not exists in Local Storage...get it from Server

                            console.log("The info for the Quiz IS NOT within Local Storage");
                            // GET request (example) - http://incluso.definityfirst.com/RestfulAPI/public/activity/150?userid=656
                            moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, $scope.currentUser.token, loadModelVariables, errorCallback, true);
                            console.log("The info has been taken from Service...");

                        } else {//Angular-bind the answers in the respective HTML template

                            console.log("The info for the Quiz is within Local Storage");
                            loadModelVariables(activityObject);
                            $scope.answers = localAnswers;

                        }
                    } else {
                        // Bring text for questions for Quiz from the Service for First Time users.
                        // The -1 is for making up a GET request without the userid; for example:
                        // http://incluso.definityfirst.com/RestfulAPI/public/activity/150
                        console.log("Bringing text for a not finished Quiz...");
                        moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, -1, $scope.currentUser.token, successfullCallBack, errorCallback, true);
                    }
                }
                else {
                    console.log("Activity is NOT defined");
                }
                //$scope.$emit('HidePreloader');
            }


            //This callback is invoked for finished activities only
            function loadModelVariables(activityObject) {

                //The activityObject is an object the same type we get eith the following GET request:
                //http://incluso.definityfirst.com/RestfulAPI/public/activity/150?userid=656
                var theCourseModuleId;
                if ($scope.childActivity) {
                    theCourseModuleId = $scope.childActivity.coursemoduleid;
                } else {
                    theCourseModuleId = $scope.parentActivity.coursemoduleid;
                }

                $scope.activityObject = activityObject;
                _setLocalStorageJsonItem("activityObject/" + theCourseModuleId, activityObject);

                if (activityObject != null) {

                    var question = "";
                    var numQuestions = 0;
                    $scope.numOfOthers = 0;

                    if ($scope.OtroAnswers == null) {
                        $scope.OtroAnswers = [];
                    }

                    $scope.placeholder = [];

                    //Count the number of "Other" options in current Quiz.
                    for (var index = 0; index < activityObject.questions.length; index++) {

                        var question = activityObject.questions[index];
                        var questionNumOfChoices = question.answers.length;
                        var hasOther = false;

                        if (questionNumOfChoices > 0) {
                            hasOther = question.answers[questionNumOfChoices - 1].answer == "Otro";
                        }

                        //Set the values for the placeholder strings within UI textareas.
                        $scope.placeholder[index] = question.tag;

                        var questionType = question.questionType || question.questiontype;   //Contains the type of question.

                        if (questionType == "multichoice" && questionNumOfChoices > 2 && hasOther) {
                            $scope.numOfOthers++;
                        }
                    }

                    console.log(":::::::::: Número de preguntas con 'Otro' = " + $scope.numOfOthers);

                    for (var index = 0; index < activityObject.questions.length; index++) {

                        question = activityObject.questions[index];
                        console.log("question no. " + index);
                        numQuestions = activityObject.questions.length;

                        renderQuestionsAndAnswers(index, question);
                        _setLocalStorageJsonItem("answersQuiz/" + theCourseModuleId, $scope.answers);
                    }

                    console.log("Num of multichoice questions = " + $scope.numOfMultichoiceQuestions);
                    //localStorage.setItem("numOfOthers/" + theCourseModuleId, $scope.numOfMultichoiceQuestions);

                }

                else {
                    $scope.warningMessage = "Las respuestas del quiz no se pueden mostrar en este momento";
                    $scope.showWarning = true;
                }
            }


            function errorCallback() {
                $scope.$emit('HidePreloader');
            }


            //#######################################  SECTION FOR DATA-BINDING FUNCTIONS ##################################

            $scope.updateOtherField = function (index, otherIndex) {

                if ($scope.questionNumOfChoices[index] - 1 == otherIndex) {
                    if ($scope.answers[index][otherIndex] == 0) {
                        $scope.OtroAnswers[$scope.position[index]].answers[0] = "";
                        console.log(JSON.stringify($scope.OtroAnswers));
                    }
                }
            };

            function renderQuestionsAndAnswers(questionIndex, question) {
                console.log("Entering the 'renderQuestionsAndAnswers' method...");
                var userAnswers = '';
                var otherObjectItem = {};

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

                        //Add {questionid: ##, answers: [""]} object for the multichoice question
                        otherObjectItem.questionid = question.id;
                        otherObjectItem.answers = [""];
                        $scope.OtroAnswers.push(otherObjectItem);
                    }

                    console.log("$scope.OtroAnswers = " + $scope.OtroAnswers.toString());
                }

                if (questionType == "multichoice" && questionNumOfChoices > 2 && !hasOther) {
                    questionCode = "simplechoice";
                }

                console.log("questionTypeCode = " + questionCode);
                $scope.questionTypeCode.push(questionCode);
                $scope.questionText.push(questionText);

                switch (questionCode) {

                    case "binary":

                        if (question.answers[0].answer == question.userAnswer) {
                            //The user answered the first option
                            $scope.answers[questionIndex] = "0";
                        }

                        if (question.answers[1].answer == question.userAnswer) {
                            //The user answered the second option
                            $scope.answers[questionIndex] = "1";
                        }

                        break;

                    case "multichoice":

                        $scope.answers[questionIndex] = [];
                        var index;
                        if (question.userAnswer !== null && question.userAnswer.length > 0) {
                            userAnswers = question.userAnswer.split(";");
                            for (var indexUserAnswers = 0; indexUserAnswers < userAnswers.length; indexUserAnswers++) {
                                var userAnswer = cleanText(userAnswers[indexUserAnswers]).trim();
                                for (index = 0; index < question.answers.length; index++) {
                                    var questionOption = cleanText(question.answers[index].answer).trim();

                                    if (questionOption == userAnswer) {//For checked options...
                                        console.log("***  The user selected this: " + userAnswer);
                                        $scope.answers[questionIndex][index] = 1;
                                        //console.log("index = " + index + ", value = " + $scope.answers[questionIndex][index]);
                                        if (userAnswer == "Otro") {//The user checked the "Otros" option, among others...

                                            //console.log("The string in the 'Otro' field: " + question.other);
                                            $scope.OtroAnswers[$scope.position[questionIndex]].answers[0] = question.other;
                                            _setLocalStorageJsonItem("otherAnswQuiz/" + $scope.activity.coursemoduleid, $scope.OtroAnswers);
                                        }
                                    }
                                }
                            }

                            for (index = 0; index < question.answers.length; index++) {
                                if ($scope.answers[questionIndex][index] !== 1) {
                                    $scope.answers[questionIndex][index] = 0;
                                }
                            }

                            console.log("$scope.OtroAnswers = " + JSON.stringify($scope.OtroAnswers));
                            console.log("Position = " + JSON.stringify($scope.position));
                            console.log("Index, Position = " + questionIndex + " / " + $scope.position[questionIndex]);

                        }

                        break;

                    case "shortanswer":
                        $scope.answers[questionIndex] = [];
                        if (question.userAnswer != null) {
                            userAnswers = question.userAnswer.split('\n');

                            for (var index = 0; index < userAnswers.length; index++) {
                                var myAnswer = userAnswers[index];
                                $scope.answers[questionIndex].push(myAnswer);
                            }
                        }
                        console.log("shortanswer = " + $scope.answers[questionIndex]);
                        break;

                    case "simplechoice":
                        userAnswer = question.userAnswer.replace("\n", "");

                        for (var i = 0; i < questionNumOfChoices; i++) {
                            if (question.answers[i].answer == question.userAnswer) {
                                $scope.answers[questionIndex] = i;
                            }
                        }

                        break;

                    case "essay":
                        $scope.answers[questionIndex] = [];
                        if (question.userAnswer != null) {
                            userAnswers = question.userAnswer.split(';');
                            for (var index = 0; index < userAnswers.length; index++) {
                                var myAnswer = userAnswers[index];
                                $scope.answers[questionIndex].push(myAnswer);
                            }
                        }

                        break;
                    default:
                        break;
                }

            }


            //****************************** CODE CALLED WHEN USER FINISHES ACTIVITY ************************************
            $scope.finishActivity = function () {
                //Tasks to do when the user presses the "Terminar" button.
                console.log("$scope.OtroAnswers = " + JSON.stringify($scope.OtroAnswers));
                $scope.$emit("ShowPreloader");

                //This is to avoid killing the preloader up starting.
                $timeout(function () {

                    if ($scope.childActivity) {
                        $scope.parentActivity.status = 1;
                        $scope.childActivity.status = 1;
                    } else {
                        $scope.parentActivity.status = 1;
                    }

                    $scope.isDisabled = true;

                    //Update Activity Log Service
                    if ($scope.activity_status == 0) {
                        $scope.activity_status = 1;
                        console.log("Update Activity Log : " + $scope.activity_identifier);
                        updateUserStars($scope.parentActivity.activity_identifier);
                        //updateUserStars($scope.parentActivity.activity_identifier, $scope.activityPoints);
                    }

                    if ($scope.childActivity) {
                        $scope.AnswersResult.activityidnumber = $scope.childActivity.coursemoduleid;
                    } else {
                        $scope.AnswersResult.activityidnumber = $scope.parentActivity.coursemoduleid;
                    }

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
                    console.log("Your answers: " + $scope.answers);
                    console.log("Your other :" + JSON.stringify($scope.OtroAnswers));

                    $scope.AnswersResult.answers = $scope.answers;

                    console.log("Ending activity...");

                    if ($scope.childActivity) {
                        updateActivityStatusDictionary($scope.childActivity.activity_identifier);
                        updateActivityStatusDictionary($scope.parentActivity.activity_identifier);
                    } else {
                        updateActivityStatusDictionary($scope.parentActivity.activity_identifier);
                    }

                    var activityModel = {
                        "usercourse": updatedActivityOnUsercourse,
                        "answersResult": $scope.AnswersResult,
                        "userId": $scope.userprofile.id,
                        "startingTime": $scope.startingTime,
                        "endingTime": $scope.startingTime = moment().format('YYYY-MM-DD HH:mm:ss'),
                        "token": $scope.currentUser.token,
                        "others": $scope.OtroAnswers
                    };

                    activityModel.answersResult.dateStart = activityModel.startingTime;
                    activityModel.answersResult.dateEnd = activityModel.endingTime;

                    if (quizHasOther.indexOf($scope.activity_identifier) > -1) {//Quiz with "Otro" answer option.
                        activityModel.answersResult.others = $scope.OtroAnswers;
                    }

                    console.log("activityModel.answersResult = " + JSON.stringify(activityModel.answersResult));
                    console.log("activityModel.others = " + JSON.stringify(activityModel.others));

                    if ($scope.childActivity) {
                        activityModel.coursemoduleid = $scope.childActivity.coursemoduleid;
                        activityModel.activityType = "Quiz";

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

                    if ($scope.childActivity) {
                        _setLocalStorageJsonItem("answersQuiz/" + $scope.childActivity.coursemoduleid, $scope.AnswersResult.answers);
                        _setLocalStorageJsonItem("UserTalents/" + $scope.childActivity.coursemoduleid, $scope.AnswersResult.answers);
                    } else {
                        _setLocalStorageJsonItem("answersQuiz/" + $scope.parentActivity.coursemoduleid, $scope.AnswersResult.answers);
                        _setLocalStorageJsonItem("UserTalents/" + $scope.parentActivity.coursemoduleid, $scope.AnswersResult.answers);
                    }


                    //If...the activity quiz has a checkbox for the "Other" answer, then save it to Local Storage
                    if (quizHasOther.indexOf($scope.activity_identifier) > -1) {

                        if ($scope.childActivity) {
                            _setLocalStorageJsonItem("otherAnswQuiz/" + $scope.childActivity.coursemoduleid, $scope.OtroAnswers);
                        } else {
                            _setLocalStorageJsonItem("otherAnswQuiz/" + $scope.parentActivity.coursemoduleid, $scope.OtroAnswers);
                        }
                    }


                }, 2000);

            };


            function updateProfile() {

                switch ($scope.activity_identifier) {
                    case "1005": //Mis Cualidades - Etapa 1

                        //For mis cualidades
                        if ($scope.OtroAnswers[0].answers[0] != '') {
                            $scope.userprofile.talents.push($scope.OtroAnswers[0].answers[0]);
                        }

                        //For mis cualidades
                        if ($scope.OtroAnswers[1].answers[0] != '') {
                            $scope.userprofile.values.push($scope.OtroAnswers[1].answers[0]);
                        }

                        //For mis cualidades
                        if ($scope.OtroAnswers[2].answers[0] != '') {
                            $scope.userprofile.habilities.push($scope.OtroAnswers[2].answers[0]);
                        }

                        break;

                    case "1006": //Mis Gustos - Etapa 1
                        //For Mis Gustos
                        if ($scope.OtroAnswers[0].answers[0] != '') {
                            $scope.userprofile.favoriteSports.push($scope.OtroAnswers[0].answers[0]);
                        }

                        //For Mis Gustos
                        if ($scope.OtroAnswers[1].answers[0] != '') {
                            $scope.userprofile.artisticActivities.push($scope.OtroAnswers[1].answers[0]);
                        }

                        //For Mis Gustos
                        if ($scope.OtroAnswers[2].answers[0] != '') {
                            $scope.userprofile.hobbies.push($scope.OtroAnswers[2].answers[0]);
                        }

                        break;
                }

                $scope.userId = moodleFactory.Services.GetCacheObject("userId");

                moodleFactory.Services.PutAsyncProfile($scope.userId, $scope.userprofile,

                    function (responseData) {
                        console.log('Update profile successful...');

                        //Delete the 'otherAnswQuiz' object.
                        if ($scope.childActivity) {
                            //localStorage.removeItem("otherAnswQuiz/" + $scope.childActivity.coursemoduleid);
                        } else {
                            //localStorage.removeItem("otherAnswQuiz/" + $scope.parentActivity.coursemoduleid);
                        }

                        $scope.numOfMultichoiceQuestions = 0;
                        $scope.numOfOthers = 0;

                        console.log("Redirecting to dashboard; destinationPath = " + destinationPath);
                        $location.path(destinationPath);
                    },
                    function (responseData) {
                        console.log('Update profile fail...');
                        //$scope.spinnerVar = false;
                    });
            }

            $scope.toggleSelection = function toggleSelection(stringValue, isChecked, questionArray) {
                var index = -1;
                if (isChecked) {
                    switch (questionArray) {
                        case "talents":
                            var index = $scope.userprofile.talents.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.talents.push(stringValue);
                            }
                            break;
                        case "values":
                            var index = $scope.userprofile.values.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.values.push(stringValue);
                            }
                            break;
                        case "habilities":
                            var index = $scope.userprofile.habilities.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.habilities.push(stringValue);
                            }
                            break;
                        case "favoriteSports":
                            var index = $scope.userprofile.favoriteSports.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.favoriteSports.push(stringValue);
                            }
                            break;
                        case "artisticActivities":
                            var index = $scope.userprofile.artisticActivities.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.artisticActivities.push(stringValue);
                            }
                            break;
                        case "hobbies":
                            var index = $scope.userprofile.hobbies.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.hobbies.push(stringValue);
                            }
                            break;
                        default:
                            console.log('Unknow profile poperty');
                    }
                }
                else {
                    switch (questionArray) {
                        case "talents":
                            var index = $scope.userprofile.talents.indexOf(stringValue);
                            $scope.userprofile.talents.splice(index, 1);
                            break;
                        case "values":
                            var index = $scope.userprofile.values.indexOf(stringValue);
                            $scope.userprofile.values.splice(index, 1);
                            break;
                        case "habilities":
                            var index = $scope.userprofile.habilities.indexOf(stringValue);
                            $scope.userprofile.habilities.splice(index, 1);
                            break;
                        case "favoriteSports":
                            var index = $scope.userprofile.favoriteSports.indexOf(stringValue);
                            $scope.userprofile.favoriteSports.splice(index, 1);
                            break;
                        case "artisticActivities":
                            var index = $scope.userprofile.artisticActivities.indexOf(stringValue);
                            $scope.userprofile.artisticActivities.splice(index, 1);
                            break;
                        case "hobbies":
                            var index = $scope.userprofile.hobbies.indexOf(stringValue);
                            $scope.userprofile.hobbies.splice(index, 1);
                            break;
                        default:
                            console.log('Unknow profile poperty');
                    }
                }
            };


            // ##################################### VALIDATING USER ANSWERS ##################################################

            $scope.validateQuiz = function () {

                var question = "";
                var index;
                var numAnswered = 0;
                var numQuestions = $scope.activityObject.questions.length;

                for (index = 0; index < numQuestions; index++) {

                    switch ($scope.questionTypeCode[index]) {

                        case "binary":
                            if ($scope.answers[index] != null) {
                                //The user filled in the question.
                                numAnswered++;
                            }

                            break;

                        case "multichoice":
                            //Validation: the multichoice must have some 'true' value...
                            if (($scope.answers[index].indexOf(1) > -1)) {
                                //...and Other is 'true' and has a non empty string in the input
                                var userInput = $scope.OtroAnswers[$scope.position[index]].answers[0].replace(/\r?\n|\r/g, " ").trim();
                                if (($scope.answers[index][$scope.questionNumOfChoices[index] - 1] && userInput != '') || !$scope.answers[index][$scope.questionNumOfChoices[index] - 1]) {
                                    numAnswered++;
                                }
                            }

                            break;

                        case "shortanswer":
                            var b;
                            console.log($scope.answers[index]);
                            //Remove repeated entries and blanks in the question.
                            $scope.answers[index] = $scope.answers[index].filter(function (item, pos) {
                                return item.trim().length > 0 && $scope.answers[index].indexOf(item) == pos;
                            });
                            console.log($scope.answers[index]);
                            //Correction for the '\n' reserved character.
                            for (b = 0; b < $scope.answers[index].length; b++) {
                                $scope.answers[index][b] = $scope.answers[index][b].replace(/\r?\n|\r/g, " ").trim();
                            }
                            console.log($scope.answers[index]);
                            //Check is some of the questions has an invalid answer
                            if ($scope.answers[index].length > 0) {
                                numAnswered++;
                            }

                            break;

                        case "simplechoice":
                            if ($scope.answers[index] != null) {
                                //The user filled in the question.
                                numAnswered++;
                            }

                            break;

                        case "essay":
                            var b;

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

                        default:
                            break;
                    }
                }

                if (numAnswered == numQuestions) {
                    $scope.showWarning = false;

                    if ($scope.activityname == "Exploración final") {
                        setFinalEvaluation();
                    }

                    $scope.navigateToPage(2);
                    $scope.scrollToTop();

                } else {
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
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
                var answerObj;

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

                                if (   parseInt(questionObj.answers[j].fraction) > 0) {
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

                            if ($scope.questionTypeCode[i] == 'multichoice') {
                                //Add item for multichoice object to finalResult array
                                totalScore = totalScore + parseInt(questionObj.answers[j].fraction);
                                $scope.questionIsCorrect[i] = true;
                                $scope.chosenByUserAndWrong[i][j] = false;

                                if (1 === parseInt($scope.answers[i][j])) {//The j-th checkbox was selected.
                                    attainedScore = attainedScore + parseInt(questionObj.answers[j].fraction);
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

                    console.log("$scope.questionIsCorrect = " + $scope.questionIsCorrect);
                    console.log("$scope.chosenByUserAndWrong = " + $scope.chosenByUserAndWrong);
                    console.log("$scope.answerIsCorrect = " + $scope.correctIndex);
                    $scope.score = attainedScore * 100 / totalScore;
                }
            }


            //################################################## UTILITY FUNCTIONS #########################################

            function cleanText(userAnswer) {

                var result = userAnswer.replace("\r", "");
                result = userAnswer.replace("<br>", "");
                result = userAnswer.replace("<p>", "");
                result = userAnswer.replace("</p>", "");
                result = userAnswer.replace("\n", "");
                result = userAnswer.replace("\r", "");

                return result;
            }

            function showWarningAndGoToTop() {
                $scope.showWarning = true;
                $scope.$emit('scrollTop');
            }


            $scope.answerIndex = 1;

            $scope.addToAnswerIndex = function (delta, maxPages) {
                $scope.answerIndex = parseInt($('span#index').text());

                if ($scope.answerIndex > maxPages) {
                    $scope.answerIndex = 1;
                }

                if ($scope.answerIndex < 1) {
                    $scope.answerIndex = maxPages;
                }
            };

            function addHeightConsulta(lista, elementQty) {
                $scope.finalHeight = angular.element(lista).height() + (250 * (elementQty));
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            function addHeight(elem) {
                var elemHeight = angular.element(elem).height();
                var containerHeight = angular.element("div.owl-wrapper-outer").height();
                angular.element("div.owl-wrapper-outer").css('height', containerHeight + 177);
                angular.element(elem).css('height', elemHeight + 177);
            }

            function addHeightForOther() {
                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                angular.element("div.owl-wrapper-outer").css('height', containerHeight + 100);
            }

            function reduceHeightForOther() {
                $scope.finalHeight = angular.element('.owl-wrapper-outer').height() - 100;
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            function removeHeight(elem) {
                var listaHeight = angular.element(elem).height();
                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                //angular.element("div.owl-wrapper-outer").css('height', listaHeight - 127);
                angular.element("div.owl-wrapper-outer").css('height', containerHeight - 127);
            }

            $scope.addAbility = function (elem, index) {
                addHeight(elem);
                $scope.answers[index].push("");
                console.log($scope.answers[index]);
            };

            $scope.deleteAbility = function (elem, index, innerIndex) {
                removeHeight(elem);
                $scope.answers[index].splice(innerIndex, 1);
                console.log($scope.answers[index]);
            };

            $scope.addSueno = function (pos) {
                var listaId = pos + 1;
                addHeight("#listaDinamica" + listaId);
                $scope.misSuenosAnswers[pos].push("");
            };

            $scope.deleteSueno = function (index, pos) {
                var listaId = pos + 1;
                removeHeight("#listaDinamica" + listaId);
                $scope.misSuenosAnswers[pos].splice(index, 1);
            };

            $scope.addIdea = function (pos) {
                var listaId = pos + 1;
                addHeight("#listaDinamica" + listaId);
                $scope.misIdeas[pos].push("");
            };

            $scope.deleteIdea = function (index, pos) {
                var listaId = pos + 1;
                removeHeight("#listaDinamica" + listaId);
                $scope.misIdeas[pos].splice(index, 1);
            };

            $scope.addPerson = function (elem, index) {
                addHeight(elem);
                $scope.answers[index].push("");
                console.log($scope.answers[index]);
            };

            $scope.deletePerson = function (elem, index, innerIndex) {
                removeHeight(elem);
                $scope.answers[index].splice(innerIndex, 1);
                console.log($scope.answers[index]);
            };

            $scope.addFuturo = function (pos) {
                var listaId = pos + 1;
                addHeight("#listaDinamica" + listaId);
                $scope.miFuturo[pos].push("");
            };

            $scope.deleteFuturo = function (index, pos) {
                var listaId = pos + 1;
                removeHeight("#listaDinamica" + listaId);
                $scope.miFuturo[pos].splice(index, 1);
            };

            $scope.hideWarning = function () {
                $scope.showWarning = false;
            };

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
            };

            $scope.cancel = function () {
                if ($scope.childActivity) {
                    //localStorage.removeItem("otherAnswQuiz/" + $scope.childActivity.coursemoduleid);
                } else {
                    //localStorage.removeItem("otherAnswQuiz/" + $scope.parentActivity.coursemoduleid);
                }

                $scope.numOfMultichoiceQuestions = 0;
                $scope.numOfOthers = 0;

                console.log(destinationPath);
                $location.path(destinationPath);
            };


        }
    ])
    .
    controller('OpeningStageController', function ($scope, $modalInstance) {

        $scope.cancel = function () {
            $scope.$emit('ShowPreloader');
            $modalInstance.dismiss('cancel');
        };

    })
    .controller('videoCollapsiblePanelController', function ($scope) {
        $scope.isCollapsed = false;
    });

