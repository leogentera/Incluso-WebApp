//Controller for Suena.html
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

            _httpFactory = $http;
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $scope.$emit('HidePreloader'); //hide preloader
            $scope.currentPage = 1;
            $scope.setReadOnly = false;
            $scope.showWarning = false;
            $scope.coursemoduleid = 0;
            //$scope.userprofile = null;
            
            $scope.like_status = 0;

            $scope.AnswersResult = {
                "userid": 0,//$scope.userprofile.id,
                "answers": [null, [0, 0, 0, 0], '', null, []],
                "activityidnumber": 0,                         //$scope.activity.coursemoduleid
                "like_status": 0
            };


            $scope.finishActivity = function () {
                //Activity completed
                
                $scope.activity.status = 1;

                //Llamar notificaciones
                //Update Activity Log Service
                
                updateUserStars($scope.activity_identifier);

                $scope.AnswersResult.userid = $scope.userprofile.id;
                $scope.AnswersResult.activityidnumber = $scope.activity.coursemoduleid;
                $scope.AnswersResult.like_status = $scope.like_status;
                $scope.showWarning = false;

                var updatedActivityOnUsercourse = updateActivityStatus($scope.activity_identifier);

                switch ($scope.activityname) {
                    case "Mis cualidades":
                        $scope.AnswersResult.answers = $scope.misCualidadesAnswers;console.log($scope.misCualidadesAnswers);
                        break;
                    case "Mis gustos":
                        $scope.AnswersResult.answers = $scope.misGustosAnswers;
                        break;
                    case "Sueña":
                        $scope.AnswersResult.answers = $scope.dreamsLists.answers;console.log("Answers " + $scope.dreamsLists.answers);
                        break;
                    default:
                        break;
                }

                _endActivityQuiz({
                    "usercourse": updatedActivityOnUsercourse,
                    "coursemoduleid": $scope.activity.coursemoduleid,
                    "answersResult": $scope.AnswersResult,
                    "userId": $scope.userprofile.id,
                    "startingTime": $scope.startingTime,
                    "endingTime": new Date()
                });

                $location.path('/ZonaDeVuelo/Dashboard');
            };

            $scope.addAbility = function () {
                addHeight();
                $scope.AnswersResult.answers[4].push(new String());
            };

            $scope.deleteAbility = function (index) {
                removeHeight();
                $scope.AnswersResult.answers[4].splice(index, 1);
            };

            $scope.dreamsLists = { "answers": [[], [], []] };

            $scope.addSueno1 = function () {
                addHeight();
                $scope.dreamsLists.answers[0].push("");
            };

            $scope.addSueno2 = function () {
                addHeight();
                $scope.dreamsLists.answers[1].push("");
            };

            $scope.addSueno3 = function () {
                addHeight();
                $scope.dreamsLists.answers[2].push("");
            };

            $scope.deleteSueno1 = function (index) {
                removeHeight();
                $scope.dreamsLists.answers[0].splice(index, 1);
            };

            $scope.deleteSueno2 = function (index) {
                removeHeight();
                $scope.dreamsLists.answers[1].splice(index, 1);
            };

            $scope.deleteSueno3 = function (index) {
                removeHeight();
                $scope.dreamsLists.answers[2].splice(index, 1);
            };

            $scope.hideWarning = function () {
                $scope.showWarning = false;
            };

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
            };

            $scope.cancel = function () {
                var userCurrentStage = localStorage.getItem("userCurrentStage");
                $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage);
            };

            $scope.validateAnsweredQuestions = function () {

                //var validationMenssage = "Asegurate de contestar todas las preguntas antes de guardar";
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";

                if ($scope.AnswersResult.answers[0] != null) {
                    if ($scope.AnswersResult.answers[1][0] == true ||
                        $scope.AnswersResult.answers[1][1] == true ||
                        $scope.AnswersResult.answers[1][2] == true ||
                        $scope.AnswersResult.answers[1][3] == true) {
                        if ($scope.AnswersResult.answers[2] != null) {
                            if ($scope.AnswersResult.answers[3] != null) {
                                if ($scope.AnswersResult.answers[4].length != 0) {
                                    var lastQuestionValidation = true;
                                    for (var a = 0; a < $scope.AnswersResult.answers[4].length; a++) {
                                        var text = $scope.AnswersResult.answers[4][a];
                                        if (text.trim() == '') {
                                            lastQuestionValidation = false;
                                            break;
                                        }
                                    }

                                    if (lastQuestionValidation) {
                                        $scope.showWarning = false;
                                        $scope.navigateToPage(2);
                                    }
                                    else {
                                        showWarningAndGoToTop();
                                    }
                                }
                                else {
                                    showWarningAndGoToTop();
                                }
                            }
                            else {
                                showWarningAndGoToTop();
                            }
                        }
                        else {
                            showWarningAndGoToTop();
                        }
                    }
                    else {
                        showWarningAndGoToTop();
                    }
                }
                else {
                    showWarningAndGoToTop();
                }
            };


            function updateSelectedAnswers(questionIndex, question) {
                switch (questionIndex) {
                    case 0:
                        if (question.userAnswer == "Si") {
                            $scope.AnswersResult.answers[0] = 1;
                        }
                        else if (question.userAnswer == "No") {
                            $scope.AnswersResult.answers[0] = 0;
                        }
                        break;
                    case 1:
                        if (question.userAnswer.length > 0) {
                            var userAnswers = question.userAnswer.split(";");
                            for (var indexUserAnswers = 0; indexUserAnswers < userAnswers.length; indexUserAnswers++) {
                                var userAnswer = userAnswers[indexUserAnswers].trim();
                                for (var index = 0; index < question.answers.length; index++) {
                                    var questionOption = question.answers[index];
                                    if (questionOption.answer.trim() == userAnswers) {
                                        $scope.AnswersResult.answers[1][index] = true;
                                    }
                                }
                            }
                        }
                        break;
                    case 2:
                        $scope.AnswersResult.answers[2] = question.userAnswer.trim();
                        break;
                    case 3:
                        if (question.userAnswer.length > 0) {
                            for (var index = 0; index < question.answers.length; index++) {
                                var questionOption = question.answers[index];
                                if (questionOption.answer == question.userAnswer) {
                                    $scope.AnswersResult.answers[3] = index;
                                    break;
                                }
                            }
                        }
                        break;
                    case 4:
                        if (question.userAnswer != null) {
                            var userAnswers = question.userAnswer.split(";");
                            for (var indexUserAnswers = 0; indexUserAnswers < userAnswers.length; indexUserAnswers++) {
                                var userAnswer = userAnswers[indexUserAnswers].trim();
                                for (var index = 0; index < question.answers.length; index++) {
                                    var questionOption = question.answers[index];
                                    if (questionOption.answer.trim() == userAnswer) {
                                        $scope.AnswersResult.answers[4].push(userAnswer);
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
            }


            function updateMisCualidadesSelectedAnswers(currentQuestionIndex, question) {
                if (question.userAnswer != null) {
                    var userAnswers = cleanText(question.userAnswer);
                    var userAnswersList = userAnswers.split(";");
                    for (var answerOptionsIndex = 0; answerOptionsIndex < question.answers.length; answerOptionsIndex++) {
                        var answerOption = question.answers[answerOptionsIndex];
                        for (var userAnswersListIndex = 0; userAnswersListIndex < userAnswersList.length; userAnswersListIndex++) {
                            var userAnswer = cleanText(userAnswersList[userAnswersListIndex]);
                            if (answerOption.answer == userAnswer) {
                                $scope.misCualidadesAnswers[currentQuestionIndex][answerOptionsIndex] = true;
                            }
                        }
                    }
                }
            }


            function updateMisGustosSelectedAnswers(currentQuestionIndex,question) {                
                if (question.userAnswer != null) {
                    var userAnswers = cleanText(question.userAnswer);
                    var userAnswersList = userAnswers.split(";");
                    for (var answerOptionsIndex = 0; answerOptionsIndex < question.answers.length; answerOptionsIndex++) {
                        var answerOption = question.answers[answerOptionsIndex];
                        for (var userAnswersListIndex = 0; userAnswersListIndex < userAnswersList.length; userAnswersListIndex++) {
                            var userAnswer = cleanText(userAnswersList[userAnswersListIndex]);
                            if (answerOption.answer == userAnswer) {
                                $scope.misGustosAnswers[currentQuestionIndex][answerOptionsIndex] = true;
                            }
                        }
                    }
                }
            }

            function updateMisSueñosSelectedAnswers(question) {

                if (question.userAnswer != null) {console.log("update mis sueños: " + question.userAnswer);
                    var userAnswers = question.userAnswer.split(";");
                    for (var indexUserAnswers = 0; indexUserAnswers < userAnswers.length; indexUserAnswers++) {
                        var userAnswer = userAnswers[indexUserAnswers].trim();
                        for (var index = 0; index < question.answers.length; index++) {
                            var questionOption = question.answers[index];
                            if (questionOption.answer.trim() == userAnswer) {
                                dreamsLists.answers.push(userAnswer);
                            }
                        }
                    }
                }

            }

            function cleanText(userAnswer) {
                var result = userAnswer.replace("\n", "");
                result = userAnswer.replace("<br>", "");
                result = userAnswer.replace("<p>", "");
                result = userAnswer.replace("</p>", "");
                return result;
            }


            $scope.misCualidadesAnswers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            $scope.misGustosAnswers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            //$scope.misGustosAnswers =


            function errorCallback(data) {
                // var algo = data;
            }

            function getDataAsync() {
                                
                $scope.startingTime = new Date();

                $scope.activity_identifier = $location.path().split("/")[$location.path().split("/").length - 1];

                var activity = getActivityByActivity_identifier($scope.activity_identifier);
                console.log("activity from getDataAsync() " + JSON.stringify(activity));

                if (activity != null) {
                    $scope.coursemoduleid = activity.coursemoduleid;
                    $scope.activityPoints = activity.points;
                    $scope.activityname = activity.activityname;console.log("Actividad: " + $scope.activityname);

                    $scope.userprofile = JSON.parse(localStorage.getItem("profile"));
                    $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                    //$scope.activitieCache = JSON.parse(localStorage.getItem("activitiesCache/" + $scope.coursemoduleid));

                    var activityFinished = false;

                    if (activity.status != 0) {console.log("Actividad YA finalizada");
                        activityFinished = true;
                    }

                    $scope.setReadOnly = activityFinished;

                    if (activityFinished) {
                        moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, successfullCallBack, errorCallback);
                    }

                    $scope.activity = activity;console.log("activity object: " + JSON.stringify($scope.activity));
                }
            }


            function successfullCallBack(activityAnswers) {

                if (activityAnswers != null) {
                    // $scope.activity = activityAnswers;
                    for (var index = 0; index < activityAnswers.questions.length; index++) {

                        var question = activityAnswers.questions[index];

                        switch ($scope.activityname) {
                            case "Exploracion Inicial":
                                updateSelectedAnswers(index, question);
                                break;
                            case "Mis cualidades":
                                updateMisCualidadesSelectedAnswers(index, question);
                                break;
                            case "Mis gustos":
                                updateMisGustosSelectedAnswers(index, question);
                                break;
                            case "Sueña":
                                updateMisSueñosSelectedAnswers(question);
                                break;
                            default:
                                break;
                        }

                    }
                }
                else {
                    $scope.showWarning = true;
                    $scope.warningMessage = "Las respuestas del quiz no se pueden mostrar en este momento";
                }
            }


            function errorCallback() {console.log("Unsuccessful callback");
            }


            $scope.openModal = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'OpeningStageModal.html',
                    controller: 'OpeningStageController',
                    size: size,
                    windowClass: 'user-help-modal'
                });
            };

            function addHeight() {
                $scope.finalHeight = angular.element("#listaDinamica").height() + 125;
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            function removeHeight() {
                $scope.finalHeight = angular.element("#listaDinamica").height() - 135;
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            $scope.openModal();
            getDataAsync();

            $scope.validateMisSuenosAnsweredQuestions = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                if ($scope.dreamsLists.answers.length != 0) {

                    var lastQuestionValidation = true;

                    for (var a = 0; a < $scope.dreamsLists.answers.length; a++) {
                        var cont = $scope.dreamsLists.answers[a].length;

                        if (cont == 0) {//Question withoud dreams
                            lastQuestionValidation = false;
                            break;

                        } else {

                            for (var b = 0; b < cont; b++) {
                                var text = $scope.dreamsLists.answers[a][b];

                                if (text.trim() == '') {
                                    lastQuestionValidation = false;
                                    break;
                                }
                            }
                        }

                        if (!lastQuestionValidation) {
                            break;
                        }

                    }

                    if (lastQuestionValidation) {
                        $scope.showWarning = false;
                        $scope.navigateToPage(2);
                    } else {
                        showWarningAndGoToTop();
                    }

                } else {
                    showWarningAndGoToTop();
                }

            };

            function showWarningAndGoToTop() {
                $scope.showWarning = true;
                $scope.$emit('scrollTop');
            }

            $scope.answerIndex = 1;

            $scope.addToAnswerIndex = function(delta) {
                $scope.answerIndex += delta;

                if ($scope.answerIndex >3) {
                    $scope.answerIndex = 1;
                }

                if ($scope.answerIndex < 1) {
                    $scope.answerIndex = 3;
                }
            };


            $scope.validateMisCualidadesAnsweredQuestions = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                if ($scope.misCualidadesAnswers.length != 0) {
                    var validatedAnswers = 0;
                    for (var a = 0; a < $scope.misCualidadesAnswers.length; a++) {
                        var cont = $scope.misCualidadesAnswers[a].length;

                        for (var b = 0; b < cont; b++) {
                            var checked = $scope.misCualidadesAnswers[a][b];
                            if (checked) {
                                validatedAnswers++;
                                break;
                            }
                        }
                    }

                    if ($scope.misCualidadesAnswers.length == validatedAnswers) {
                        $scope.showWarning = false;
                        $scope.navigateToPage(2);
                    } else {
                        showWarningAndGoToTop();
                    }
                } else {
                    showWarningAndGoToTop();
                }
            };

            $scope.validateMisGustosAnsweredQuestions = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                if ($scope.misGustosAnswers.length != 0) {
                    var validatedAnswers = 0;
                    for (var a = 0; a < $scope.misGustosAnswers.length; a++) {
                        var cont = $scope.misGustosAnswers[a].length;

                        for (var b = 0; b < cont; b++) {
                            var checked = $scope.misGustosAnswers[a][b];
                            if (checked) {
                                validatedAnswers++;
                                break;
                            }
                        }
                    }

                    if ($scope.misGustosAnswers.length == validatedAnswers) {
                        $scope.showWarning = false;
                        $scope.navigateToPage(2);
                    } else {
                        showWarningAndGoToTop();
                    }

                } else {
                    showWarningAndGoToTop();
                }
            }

        }])
    .controller('OpeningStageController', function ($scope, $modalInstance) {
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .controller('videoCollapsiblePanelController', function ($scope) {
        $scope.isCollapsed = false;
    });

