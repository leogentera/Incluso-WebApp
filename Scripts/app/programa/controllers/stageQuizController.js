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
            _timeout = $timeout;
            $scope.setToolbar($location.$$path, "");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $scope.$emit('HidePreloader'); //hide preloader
            $scope.currentPage = 1;
            $scope.setReadOnly = false;
            $scope.showWarning = false;
            $scope.coursemoduleid = 0;
            //$scope.userprofile = null;

            $scope.like_status = 1;

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
                console.log("theUserCouerseUpdated: " + JSON.stringify(updatedActivityOnUsercourse));

                switch ($scope.activityname) {
                    case "Mis cualidades":
                        $scope.AnswersResult.answers = $scope.misCualidadesAnswers;
                        break;
                    case "Mis gustos":
                        $scope.AnswersResult.answers = $scope.misGustosAnswers;
                        break;
                    case "Sueña":
                        $scope.AnswersResult.answers = $scope.dreamsLists.answers;
                        console.log("Answers " + $scope.dreamsLists.answers);
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
                    "endingTime": new Date(),
                    "token" : $scope.currentUser.token
                });

                var currentStage = localStorage.getItem("currentStage");

                $location.path('/ZonaDeVuelo/Dashboard/' + currentStage);
            };

            $scope.addAbility = function () {
                addHeight("#listaDinamica");
                $scope.AnswersResult.answers[4].push(new String());
            };

            $scope.deleteAbility = function (index) {
                removeHeight("#listaDinamica");
                $scope.AnswersResult.answers[4].splice(index, 1);
            };

            $scope.dreamsLists = {"answers": [[], [], []]};

            $scope.addSueno1 = function () {
                addHeight("#listaDinamica1");
                $scope.dreamsLists.answers[0].push("");
            };

            $scope.addSueno2 = function () {
                addHeight("#listaDinamica2");
                $scope.dreamsLists.answers[1].push("");
            };

            $scope.addSueno3 = function () {
                addHeight("#listaDinamica3");
                $scope.dreamsLists.answers[2].push("");
            };

            $scope.deleteSueno1 = function (index) {
                removeHeight("#listaDinamica1");
                $scope.dreamsLists.answers[0].splice(index, 1);
            };

            $scope.deleteSueno2 = function (index) {
                removeHeight("#listaDinamica2");
                $scope.dreamsLists.answers[1].splice(index, 1);
            };

            $scope.deleteSueno3 = function (index) {
                removeHeight("#listaDinamica3");
                $scope.dreamsLists.answers[2].splice(index, 1);
            };

            $scope.hideWarning = function () {
                $scope.showWarning = false;
            };

            $scope.hideWarning2 = function () {
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

            $scope.validateAnsweredQuestionsFinal = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                if ($scope.AnswersResult.answers[0] != null) {
                    if ($scope.AnswersResult.answers[1] != null) {
                        if ($scope.AnswersResult.answers[2] != null) {
                            if ($scope.AnswersResult.answers[3] != null) {
                                if ($scope.AnswersResult.answers[4] != null) {
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

            function updateSelectedAnswers(questionIndex, question) {
                debugger;
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

            function updateSelectedAnswersFinal(questionIndex, question) {  
            
                switch (questionIndex) {
                    case 0:
                        if (question.userAnswer == "True") {
                            $scope.AnswersResult.answers[0] = 2;
                        }
                        else if (question.userAnswer == "False") {
                            $scope.AnswersResult.answers[0] = 1;
                        }
                        break;
                    case 1:
                        if (question.userAnswer == "True") {
                            $scope.AnswersResult.answers[1] = 2;
                        }
                        else if (question.userAnswer == "False") {
                            $scope.AnswersResult.answers[1] = 1;
                        }
                        break;
                    case 2:
                        if (question.userAnswer == "True") {
                            $scope.AnswersResult.answers[2] = 1;
                        }
                        else if (question.userAnswer == "False") {
                            $scope.AnswersResult.answers[2] = 0;
                        }
                        break;
                    case 3:
                        if (question.userAnswer == "Es tu ejemplo a seguir y debes ser igual a él\n") {
                            $scope.AnswersResult.answers[3] = 0;
                        }
                        else if (question.userAnswer == "Puedes aprender de su experiencia para alcanzar tus sueños\n") {
                            $scope.AnswersResult.answers[3] = 1;
                        }
                        else if (question.userAnswer == "Puede enseñarte cómo ganar dinero más fácil\n") {
                            $scope.AnswersResult.answers[3] = 2;
                        }
                        break;  
                    case 4:
                        if (question.userAnswer == "Porque aprovechas mejor tus talentos y difrutas lo que haces\n") {
                            $scope.AnswersResult.answers[4] = 0;
                        }
                        else if (question.userAnswer == "Porque puedes ser más famoso y exitoso\n") {
                            $scope.AnswersResult.answers[4] = 1;
                        }
                        else if (question.userAnswer == "Porque debes hacer lo que quieras sin importar nada ni nadie\n") {
                            $scope.AnswersResult.answers[4] = 2;
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


            function updateMisGustosSelectedAnswers(currentQuestionIndex, question) {
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

            function updateMisSueñosSelectedAnswers(index, question) {

                console.log("Inside updateMisSueños(): " + JSON.stringify(question));

                var userAnswers = cleanText(question.userAnswer);
                var userAnswersList = userAnswers.split(" ");
                console.log("userAnswersList" + userAnswersList);

                var largo = userAnswersList.length;
                var i;

                for (i = 0; i < largo; i++) {
                    $scope.dreamsLists.answers[index].push(userAnswersList[i]);
                }

                console.log($scope.dreamsLists.answers[index]);
            }

            function cleanText(userAnswer) {   //NOTE: replace() is a chainable method.
                var result = userAnswer.replace(/\r?\n|\r/g, "")
                .replace(/<br>/g, "")
                .replace(/<p>/g, "")
                .replace(/<\/p>/g, "");
                return result;
            }

            $scope.misCualidadesAnswers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            $scope.misGustosAnswers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            $scope.misSuenosAnswers = [[], [], [], []];


            function errorCallback(data) {
                console.log("You entered the errorCallback");
                // var algo = data;
            }

            function getDataAsync() {

                $scope.startingTime = new Date();

                $scope.activity_identifier = $location.path().split("/")[$location.path().split("/").length - 1];

                var activity = getActivityByActivity_identifier($scope.activity_identifier);
                console.log("activity: " + JSON.stringify(activity));

                if (activity != null) {
                    if($scope.activity_identifier == 1009){
                        $scope.AnswersResult.answers = [0,0,0,0,0];
                    }
                    $scope.coursemoduleid = activity.coursemoduleid;
                    $scope.activityPoints = activity.points;
                    $scope.activityname = activity.activityname;
                    console.log("Actividad: " + $scope.activityname);                    

                    $scope.userprofile = JSON.parse(localStorage.getItem("profile"));
                    $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                    //$scope.activitieCache = JSON.parse(localStorage.getItem("activitiesCache/" + $scope.coursemoduleid));

                    var activityFinished = false;

                    if (activity.status != 0) {
                        console.log("Actividad YA finalizada");
                        activityFinished = true;
                        $scope.setReadOnly = true;
                        moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, successfullCallBack, errorCallback);
                    }

                    $scope.activity = activity;
                }
            }


            function successfullCallBack(activityAnswers) {
                console.log("You entered successfullCallBack");
                
                if (activityAnswers != null) {
                    console.log("activityAnswers :" + JSON.stringify(activityAnswers));
                    // $scope.activity = activityAnswers;
                    console.log("number Of Questions :" + activityAnswers.questions.length);
                    debugger;
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
                                updateMisSueñosSelectedAnswers(index, question);
                                break;
                            case "Exploración final":
                                updateSelectedAnswersFinal(index, question);
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


            function errorCallback() {
                console.log("Unsuccessful callback");
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

            function addHeight(lista) {
                $scope.finalHeight = angular.element(lista).height() + 177;
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            function removeHeight(lista) {
                $scope.finalHeight = angular.element(lista).height() - 172;
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            $scope.openModal();
            getDataAsync();

            $scope.validateMisSuenosAnsweredQuestions = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";

                //var questionIsValid = false;
                var validAnswers = 0;

                for (var a = 0; a < $scope.dreamsLists.answers.length; a++) {
                    var cont = $scope.dreamsLists.answers[a].length;

                    if (cont > 0) {//Question with dreams

                        //Check if dreams are not empty strings or spaces
                        var countNotEmptyAnswers = 0;
                        for (var b = 0; b < cont; b++) {
                            var text = $scope.dreamsLists.answers[a][b];

                            if (text.trim() !== '') {
                                countNotEmptyAnswers++;
                            }
                        }

                        if (countNotEmptyAnswers > 0) {
                            //questionIsValid = true;
                            validAnswers++;
                        }

                    }
                }

                if (validAnswers == 3) {
                    console.log("Validado");
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                } else {
                    console.log("NO Validado");
                    showWarningAndGoToTop();
                }
            };


            function showWarningAndGoToTop() {
                $scope.showWarning = true;
                $scope.$emit('scrollTop');
            }


            $scope.answerIndex = 1;
            $scope.answerIndex1 = 1;

            $scope.addToAnswerIndex = function (delta) {
                $scope.answerIndex += delta;

                if ($scope.answerIndex > 3) {
                    $scope.answerIndex = 1;
                }

                if ($scope.answerIndex < 1) {
                    $scope.answerIndex = 3;
                }
            };


            $scope.addToAnswerIndex1 = function (delta) {
                $scope.answerIndex1 += delta;

                if ($scope.answerIndex1 > 5) {
                    $scope.answerIndex1 = 1;
                }

                if ($scope.answerIndex1 < 1) {
                    $scope.answerIndex1 = 5;
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

