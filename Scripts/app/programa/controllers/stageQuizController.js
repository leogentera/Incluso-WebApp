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
            $scope.scrollToTop();
            $scope.currentPage = 1;
            $scope.setReadOnly = false;
            $scope.showWarning = false;
            $scope.coursemoduleid = 0;
            $scope.like_status = 1;

            //Models for Quizzes - Stage #1
            $scope.AnswersResult = { //For storing responses in "Exploración Inicial"
                "userid": 0,
                "answers": [null, [0, 0, 0, 0, 0], [], null, []],
                "activityidnumber": 0,
                "like_status": 0
            };

            /*        //For storing responses in "Exploración Inicial"
             $scope.AnswersResult = {
             "answers": [null, [false, false, false, false, false, ''], [], null, []]
             };
             */
            $scope.exploracionInicialOtroAnswer = [{
                "questionid": 47,
                "answers": ['']
            }];

            $scope.misCualidadesAnswers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            $scope.misCualidadesOtroAnswers = [{
                "questionid": 16,
                "answers": ['']
            }, {
                "questionid": 17,
                "answers": ['']
            }, {
                "questionid": 18,
                "answers": ['']
            }];
            $scope.misGustosAnswers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            $scope.misGustosOtroAnswers = [{
                "questionid": 43,
                "answers": ['']
            }, {
                "questionid": 44,
                "answers": ['']
            }, {
                "questionid": 45,
                "answers": ['']
            }];

            $scope.misSuenosAnswers = [[], [], []];
            $scope.exploracionFinal = ['', '', '', '', ''];

            //Models for Quizzes - Stage #2
            $scope.exploracionInicialStage2 = [null, null, null, [0, 0, 0, 0, 0]];
            $scope.exploracionInicialStage2OtroAnswer = [
                {
                    "questionid": 97,
                    "answers": ['']
                }
            ];

            $scope.misIdeas = [[], []];
            $scope.miFuturo = [[], [], []];
            $scope.exploracionFinalStage2 = [null, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
            $scope.exploracionFinalStage2OtroAnswers = [
                {
                    "questionid": 16,
                    "answers": ['']
                },
                {
                    "questionid": 17,
                    "answers": ['']
                },
                {
                    "questionid": 18,
                    "answers": ['']
                }
            ];

            //Models for Quizzes - Stage #3
            $scope.exploracionInicialStage3 = [null, [0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0]];
            $scope.exploracionInicialStage3OtroAnswers = [
                {
                    "questionid": 16,
                    "answers": ['']
                },
                {
                    "questionid": 17,
                    "answers": ['']
                },
                {
                    "questionid": 18,
                    "answers": ['']
                }
            ];
            $scope.exploracionFinalStage3 = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0, 0], null, [0, 0, 0, 0]];

            $scope.addCaptureField = function (value) {
                if (value) {
                    addHeightForOther();
                } else {
                    reduceHeightForOther();
                }
            };

            $scope.isDisabled = false;

            $scope.finishActivity = function () {
                //Activity completed

                $scope.activity.status = 1;
                $scope.isDisabled = true;

                //Update Activity Log Service                
                if ($scope.activity_status == 0) {
                    $scope.activity_status = 1;
                    updateUserStars($scope.activity_identifier);
                }

                $scope.AnswersResult.userid = $scope.userprofile.id;
                $scope.AnswersResult.activityidnumber = $scope.activity.coursemoduleid;
                $scope.AnswersResult.like_status = $scope.like_status;
                $scope.AnswersResult.updatetype = 1;
                $scope.showWarning = false;

                var updatedActivityOnUsercourse = updateActivityStatus($scope.activity_identifier);

                switch ($scope.activityname) {
                    case "Exploración inicial":
                        $scope.OtroAnswer = $scope.exploracionInicialOtroAnswer;
                        break;
                    case "Mis cualidades":
                        $scope.AnswersResult.answers = $scope.misCualidadesAnswers;
                        $scope.OtroAnswer = $scope.misCualidadesOtroAnswers;
                        break;
                    case "Mis gustos":
                        $scope.AnswersResult.answers = $scope.misGustosAnswers;
                        $scope.OtroAnswer = $scope.misGustosOtroAnswers;
                        break;
                    case "Sueña":
                        $scope.AnswersResult.answers = $scope.misSuenosAnswers;
                        break;
                    case "Exploración final":
                        $scope.AnswersResult.answers = $scope.exploracionFinal;
                        break;
                    default:
                        break;
                }


                switch ($scope.activity_identifier) {
                    case "2001":
                        $scope.OtroAnswer = $scope.exploracionInicialStage2OtroAnswer;
                        break;
                    case "2002":
                        $scope.AnswersResult.answers = $scope.misIdeas;
                        break;
                    case "2003":
                        $scope.AnswersResult.answers = $scope.miFuturo;
                        break;
                    case "2004":
                        $scope.AnswersResult.answers = $scope.exploracionFinalStage2;
                        $scope.OtroAnswer = $scope.exploracionFinalStage2OtroAnswers;
                        break;

                    default:
                        break;
                }

                //Update local storage and activities status array
                _setLocalStorageJsonItem("usercourse", updatedActivityOnUsercourse);
                _activityStatus[$scope.activity.coursemoduleid] = 1;

                //Update quiz on server
                var activityModel = {
                    "usercourse": updatedActivityOnUsercourse,
                    "coursemoduleid": $scope.activity.coursemoduleid,
                    "answersResult": $scope.AnswersResult,
                    "userId": $scope.userprofile.id,
                    "startingTime": $scope.startingTime,
                    "endingTime": $scope.startingTime = moment().format('YYYY-MM-DD HH:mm:ss'),
                    "token": $scope.currentUser.token,
                    //"others":[{"questionid":54, "answers":["respuesta otro"]}],
                    "others": $scope.OtroAnswer,
                    "activityType": "Quiz"
                };

                activityModel.answersResult.dateStart = activityModel.startingTime;
                activityModel.answersResult.dateEnd = activityModel.endingTime;

                switch ($scope.activityname) {
                    case "Exploración inicial":
                        activityModel.answersResult.others = activityModel.others;
                        break;
                    case "Mis cualidades":
                        activityModel.answersResult.others = activityModel.others;
                        break;
                    case "Mis gustos":
                        activityModel.answersResult.others = activityModel.others;
                        break;
                }

                switch ($scope.activity_identifier) {
                    case "2001":
                        activityModel.answersResult.others = activityModel.others;
                        break;
                    case "2004":
                        activityModel.answersResult.others = activityModel.others;
                        break;
                    default:
                        break;
                }

                _endActivity(activityModel, null, $scope.currentChallenge);
                _setLocalStorageJsonItem("activityAnswers/" + $scope.activity.coursemoduleid, $scope.AnswersResult.answers);
                _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.activity.coursemoduleid, $scope.OtroAnswer);
            };


            $scope.addAbility = function () {
                addHeight("#listaDinamica");
                $scope.AnswersResult.answers[4].push('');
            };

            $scope.deleteAbility = function (index) {
                removeHeight("#listaDinamica");
                $scope.AnswersResult.answers[4].splice(index, 1);
            };

            $scope.addSueno = function (pos) {
                var listaId = pos + 1;
                addHeight("#listaDinamica" + listaId);
                $scope.misSuenosAnswers[pos].push("");
            };

            /*
             $scope.addSueno2 = function () {
             addHeight("#listaDinamica2");
             $scope.misSuenosAnswers[1].push("");
             };

             $scope.addSueno3 = function () {
             addHeight("#listaDinamica3");
             $scope.misSuenosAnswers[2].push("");
             };
             */

            $scope.deleteSueno = function (index, pos) {
                var listaId = pos + 1;
                removeHeight("#listaDinamica" + listaId);
                $scope.misSuenosAnswers[pos].splice(index, 1);
            };

            /*
             $scope.deleteSueno2 = function (index) {
             removeHeight("#listaDinamica2");
             $scope.misSuenosAnswers[1].splice(index, 1);
             };

             $scope.deleteSueno3 = function (index) {
             removeHeight("#listaDinamica3");
             $scope.misSuenosAnswers[2].splice(index, 1);
             };
             */

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

            $scope.addPerson = function () {
                addHeight("#listaDinamica4");
                $scope.AnswersResult.answers[2].push("");
            };

            $scope.deletePerson = function (index) {
                removeHeight("#listaDinamica4");
                $scope.AnswersResult.answers[2].splice(index, 1);
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
                var userCurrentStage = localStorage.getItem("userCurrentStage");
                $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/' + $scope.currentChallenge);
            };


            $scope.cancel2 = function () {//Temporary functionality to return to dashboard Stage 2
                var userCurrentStage = localStorage.getItem("userCurrentStage");
                $location.path('/ZonaDeNavegacion/Dashboard/2/1');
            };


            $scope.cancel3 = function () {//Temporary functionality to return to dashboard Stage 3
                var userCurrentStage = localStorage.getItem("userCurrentStage");
                $location.path('/ZonaDeAterrizaje/Dashboard/3/1');
            };

            $scope.validateAnsweredQuestions = function () {

                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";

                if ($scope.AnswersResult.answers[0] != null) {
                    if (($scope.AnswersResult.answers[1][0] == true ||
                        $scope.AnswersResult.answers[1][1] == true ||
                        $scope.AnswersResult.answers[1][2] == true ||
                        $scope.AnswersResult.answers[1][3] == true) ||
                        ($scope.AnswersResult.answers[1][4] == true && $scope.exploracionInicialOtroAnswer[0].answers[0] != '')) {
                        if ($scope.AnswersResult.answers.length[2] != 0) {
                            //Solving for the '\n' character
                            for (var a = 0; a < $scope.AnswersResult.answers[2].length; a++) {
                                var questionIsValid = true;
                                var text = $scope.AnswersResult.answers[2][a].replace(/\r?\n|\r/g, " ").trim();
                                $scope.AnswersResult.answers[2][a] = text;
                                if (text == '') {
                                    questionIsValid = false;
                                    break;
                                }
                            }
                            if (questionIsValid) {

                                if ($scope.AnswersResult.answers[3] != null) {
                                    if ($scope.AnswersResult.answers[4].length != 0) {
                                        var lastQuestionValidation = true;
                                        for (var a = 0; a < $scope.AnswersResult.answers[4].length; a++) {
                                            //Solving for the '\n' character
                                            var text = $scope.AnswersResult.answers[4][a].replace(/\r?\n|\r/g, " ").trim();
                                            $scope.AnswersResult.answers[4][a] = text;

                                            if (text == '') {
                                                lastQuestionValidation = false;
                                                break;
                                            }
                                        }

                                        if (lastQuestionValidation) {
                                            $scope.showWarning = false;
                                            $scope.navigateToPage(2);
                                            $scope.scrollToTop();
                                        } else {
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
                } else {
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
                                    $scope.scrollToTop();
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

            function updateSelectedAnswers(questionIndex, question) {//For "Exploración Inicial" only                
                var userAnswers = '';
                switch (questionIndex) {
                    case 0:
                        if (question.userAnswer == "Si") {

                            $scope.AnswersResult.answers[0] = "0";
                        }
                        else if (question.userAnswer == "No") {
                            $scope.AnswersResult.answers[0] = "1";
                        }
                        break;

                    case 1:
                        if (question.userAnswer.length > 0) {
                            userAnswers = question.userAnswer.split(";");
                            for (var indexUserAnswers = 0; indexUserAnswers < userAnswers.length; indexUserAnswers++) {
                                var userAnswer = cleanText(userAnswers[indexUserAnswers]).trim();
                                for (var index = 0; index < question.answers.length; index++) {
                                    var questionOption = cleanText(question.answers[index].answer).trim();
                                    console.log(questionOption + " == " + userAnswer);
                                    if (questionOption == userAnswer) {
                                        $scope.AnswersResult.answers[1][index] = 1;
                                        if (userAnswer == "Otro") {

                                            $scope.exploracionInicialOtroAnswer[0].answers[0] = question.other;
                                            $scope.OtroAnswer = $scope.exploracionInicialOtroAnswer;
                                            _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.activity.coursemoduleid, $scope.OtroAnswer);

                                        }
                                    }
                                }
                            }
                        }

                        break;
                    case 2:

                        if (question.userAnswer != null) {
                            userAnswers = question.userAnswer.split('\n');

                            for (var index = 0; index < userAnswers.length; index++) {
                                var myAnswer = userAnswers[index];
                                $scope.AnswersResult.answers[2].push(myAnswer);
                            }
                        }
                        //$scope.AnswersResult.answers[2] = question.userAnswer.trim();
                        break;
                    case 3:

                        userAnswer = question.userAnswer.replace("\n", "");

                        if (userAnswer == "Si") {
                            $scope.AnswersResult.answers[3] = 0;
                        }

                        if (userAnswer == "No") {
                            $scope.AnswersResult.answers[3] = 1;
                        }

                        if (userAnswer == "Mas o menos") {
                            $scope.AnswersResult.answers[3] = 2;
                        }

                        break;

                    case 4:

                        if (question.userAnswer != null) {
                            userAnswers = question.userAnswer.split(';');
                            for (var index = 0; index < userAnswers.length; index++) {
                                var myAnswer = userAnswers[index];
                                $scope.AnswersResult.answers[4].push(myAnswer);
                            }
                        }
                        /*
                         if (question.userAnswer != null) {
                         var userAnswers = cleanText(question.userAnswer);
                         var userAnswerArray = userAnswers.split(";");
                         for (var i = 0; i < userAnswerArray.length; i++) {
                         $scope.AnswersResult.answers[4].push(userAnswerArray[i]);
                         }
                         }
                         */

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

                    //userAnswersList = ["Cantar", "Hacer manualidades"]
                    for (var answerOptionsIndex = 0; answerOptionsIndex < question.answers.length; answerOptionsIndex++) {
                        var answerOption = question.answers[answerOptionsIndex]; //JS array of literal objects

                        for (var userAnswersListIndex = 0; userAnswersListIndex < userAnswersList.length; userAnswersListIndex++) {
                            var userAnswer = cleanText(userAnswersList[userAnswersListIndex]).trim();
                            if (answerOption.answer == userAnswer) {
                                $scope.misCualidadesAnswers[currentQuestionIndex][answerOptionsIndex] = 1;
                                if (userAnswer == "Otro") {
                                    $scope.misCualidadesOtroAnswers[currentQuestionIndex].answers[0] = question.other;
                                }
                            }
                        }
                    }
                    $scope.OtroAnswer = $scope.misCualidadesOtroAnswers;
                    _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.activity.coursemoduleid, $scope.OtroAnswer);
                }
            }


            function updateMisGustosSelectedAnswers(currentQuestionIndex, question) {
                if (question.userAnswer != null) {
                    var userAnswers = cleanText(question.userAnswer);
                    var userAnswersList = userAnswers.split(";");
                    for (var answerOptionsIndex = 0; answerOptionsIndex < question.answers.length; answerOptionsIndex++) {
                        var answerOption = question.answers[answerOptionsIndex];
                        for (var userAnswersListIndex = 0; userAnswersListIndex < userAnswersList.length; userAnswersListIndex++) {
                            var userAnswer = cleanText(userAnswersList[userAnswersListIndex]).trim();
                            if (answerOption.answer.trim() == userAnswer) {
                                $scope.misGustosAnswers[currentQuestionIndex][answerOptionsIndex] = 1;
                                if (userAnswer == "Otro") {
                                    $scope.misGustosOtroAnswers[currentQuestionIndex].answers[0] = question.other;
                                }
                            }
                        }
                    }
                    $scope.OtroAnswer = $scope.misGustosOtroAnswers;
                    _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.activity.coursemoduleid, $scope.OtroAnswer);
                }
            }

            function updateMisSueñosSelectedAnswers(index, question) {
                var userAnswersList = question.userAnswer.split(";");
                userAnswersList.forEach(function (answer) {
                    //var cleanAnswer = cleanText2(answer);
                    $scope.misSuenosAnswers[index].push(answer);
                });

                if (index == 0) {
                    var qty = userAnswersList.length;
                    addHeightConsulta("#listaDinamica1", qty);
                }
            }

            function updateExploracionFinalSelectedAnswersFinal(index, question) {
                var userAnswer = cleanText(question.userAnswer).trim();

                for (var answerIndex = 0; answerIndex < question.answers.length; answerIndex++) {
                    var answerOption = question.answers[answerIndex];
                    var cleanAnswer = cleanText(answerOption.answer).trim();
                    if (cleanAnswer == userAnswer) {

                        if (index == 0 || index == 1 || index == 2) {
                            answerIndex = answerIndex == 0 ? 1 : 0;
                            $scope.exploracionFinal[index] = answerIndex;
                            break;
                        }
                        if (index == 3 || index == 4) {
                            $scope.exploracionFinal[index] = answerIndex;
                            break;
                        }
                    }
                }
            }

            function updateExploracionInicialStage2Answers(index, question) {

                var userAnswers = '';
                switch (questionIndex) {
                    case 0:
                        if (question.userAnswer == "Si") {

                            $scope.exploracionInicialStage2[0] = "0";
                        }
                        else if (question.userAnswer == "No") {
                            $scope.exploracionInicialStage2[0] = "1";
                        }
                        break;

                    case 1:
                        if (question.userAnswer == "Si") {

                            $scope.exploracionInicialStage2[1] = "0";
                        }
                        else if (question.userAnswer == "No") {
                            $scope.exploracionInicialStage2[1] = "1";
                        }
                        break;

                    case 2:

                        if (question.userAnswer == "Si") {

                            $scope.exploracionInicialStage2[2] = "0";
                        }
                        else if (question.userAnswer == "No") {
                            $scope.exploracionInicialStage2[2] = "1";
                        }
                        break;

                    case 3:

                        if (question.userAnswer.length > 0) {
                            userAnswers = question.userAnswer.split(";");
                            for (var indexUserAnswers = 0; indexUserAnswers < userAnswers.length; indexUserAnswers++) {
                                var userAnswer = cleanText(userAnswers[indexUserAnswers]).trim();
                                for (var index = 0; index < question.answers.length; index++) {
                                    var questionOption = cleanText(question.answers[index].answer).trim();
                                    console.log(questionOption + " == " + userAnswer);
                                    if (questionOption == userAnswer) {
                                        $scope.AnswersResult.answers[1][index] = 1;
                                        if (userAnswer == "Otro") {
                                            $scope.exploracionInicialStage2OtroAnswer[0].answers[0] = question.other;
                                            $scope.OtroAnswer = $scope.exploracionInicialStage2OtroAnswer;
                                            _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.activity.coursemoduleid, $scope.OtroAnswer);
                                        }
                                    }
                                }
                            }
                        }

                    default:
                        break;
                }
            }

            function updateTusIdeasStage2Answers(index, question) {

                var userAnswersList = question.userAnswer.split(";");
                userAnswersList.forEach(function (answer) {
                    $scope.misIdeas[index].push(answer);
                });

                if (index == 0) {
                    var qty = userAnswersList.length;
                    addHeightConsulta("#listaDinamica1", qty);
                }
            }

            function updateTuFuturoStage2Answers(index, question) {

                var userAnswersList = question.userAnswer.split(";");
                userAnswersList.forEach(function (answer) {
                    $scope.miFuturo[index].push(answer);
                });

                if (index == 0) {
                    var qty = userAnswersList.length;
                    addHeightConsulta("#listaDinamica1", qty);
                }

            }

            function updateExploracionFinalStage2Answers(index, question) {

            }


            function cleanText(userAnswer) {

                var result = userAnswer.replace("\r", "");
                result = userAnswer.replace("<br>", "");
                result = userAnswer.replace("<p>", "");
                result = userAnswer.replace("</p>", "");
                result = userAnswer.replace("\n", "");
                result = userAnswer.replace("\r", "");

                return result;
            }


            function getDataAsync() {
                $scope.startingTime = moment().format('YYYY:MM:DD HH:mm:ss');

                $scope.activity_identifier = $location.path().split("/")[$location.path().split("/").length - 1];

                switch ($scope.activity_identifier) {

                    case "1001":
                        $scope.currentChallenge = 0; //Exploración Inicial
                        break;
                    case "1005":
                        $scope.currentChallenge = 3;  //Mis Cualidades
                        break;
                    case "1006":
                        $scope.currentChallenge = 3;  //Mis Gustos
                        break;
                    case "1007":
                        $scope.currentChallenge = 3; //Sueña
                        break;
                    case "1009":
                        $scope.currentChallenge = 5; //Exploración Final
                        break;
                    case "2001":
                        $scope.currentChallenge = 0; //Exploración Inicial Etapa 2
                        break;
                    default:
                        $scope.currentChallenge = 0; //Default
                        break;
                }

                var activity = getActivityByActivity_identifier($scope.activity_identifier);

                if (activity != null) {

                    if ($scope.activity_identifier == '1009') {
                        $scope.AnswersResult.answers = [0, 0, 0, 0, 0];
                    }

                    $scope.coursemoduleid = activity.coursemoduleid;
                    $scope.activityPoints = activity.points;
                    console.log("points: " + activity.points);
                    $scope.activityname = activity.activityname;

                    $scope.userprofile = JSON.parse(localStorage.getItem("profile/" + moodleFactory.Services.GetCacheObject("userId")));
                    $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

                    var activityFinished = false;

                    $scope.activity_status = activity.status;

                    if (activity.status != 0) {
                        activityFinished = true;
                        if ($scope.activity_identifier == '1009' || $scope.activity_identifier == '1001' || $scope.activity_identifier == '2001' || $scope.activity_identifier == '2004') {
                            $scope.setReadOnly = true;
                        }

                        var localAnswers = JSON.parse(_getItem("activityAnswers/" + activity.coursemoduleid));
                        var localOtrosAnswers = JSON.parse(_getItem("activityOtrosAnswers/" + activity.coursemoduleid));
                        if (localAnswers == null) {
                            moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, successfullCallBack, errorCallback, true);
                        }
                        else {
                            switch ($scope.activity_identifier) {
                                case "1001":
                                    $scope.AnswersResult.answers = localAnswers; //Exploración Inicial
                                    $scope.exploracionInicialOtroAnswer = localOtrosAnswers;
                                    break;
                                case "1005":
                                    $scope.misCualidadesAnswers = localAnswers;  //Mis Cualidades
                                    $scope.misCualidadesOtroAnswers = localOtrosAnswers;
                                    break;
                                case "1006":
                                    $scope.misGustosAnswers = localAnswers;  //Mis Gustos
                                    $scope.misGustosOtroAnswers = localOtrosAnswers;
                                    break;
                                case "1007":
                                    $scope.misSuenosAnswers = localAnswers; //Sueña
                                    break;
                                case "1009":
                                    $scope.exploracionFinal = localAnswers; //Exploración Final
                                    break;
                                default:
                                    $scope.currentChallenge = 0; //Default
                                    break;
                            }

                        }
                    } else {

                    }

                    $scope.activity = activity;
                    $scope.activityFinished = activityFinished;
                }
                else {
                    console.log("Activity is NOT defined");
                }
                $scope.$emit('HidePreloader');
            }

            //This callback is invoked for finished activities only
            function successfullCallBack(activityAnswers) {

                $scope.$emit('HidePreloader');
                if (activityAnswers != null) {
                    // $scope.activity = activityAnswers;
                    for (var index = 0; index < activityAnswers.questions.length; index++) {

                        var question = activityAnswers.questions[index];

                        switch ($scope.activityname) {
                            case "Exploración inicial":
                                updateSelectedAnswers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + $scope.activity.coursemoduleid, $scope.AnswersResult.answers);
                                break;
                            case "Mis cualidades":
                                updateMisCualidadesSelectedAnswers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + $scope.activity.coursemoduleid, $scope.misCualidadesAnswers);
                                break;
                            case "Mis gustos":
                                updateMisGustosSelectedAnswers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + $scope.activity.coursemoduleid, $scope.misGustosAnswers);
                                break;
                            case "Sueña":
                                updateMisSueñosSelectedAnswers(index, question);
                                break;
                            case "Exploración final":
                                updateExploracionFinalSelectedAnswersFinal(index, question);
                                break;
                            default:
                                break;
                        }

                        switch ($scope.activity_identifier) {
                            case "2001":
                                updateExploracionInicialStage2Answers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + $scope.activity.coursemoduleid, $scope.exploracionInicialStage2);
                                break;
                            case "2002":
                                updateTusIdeasStage2Answers(index, question);
                                break;
                            case "2003":
                                updateTuFuturoStage2Answers(index, question);
                                break;
                            case "2004":
                                updateExploracionFinalStage2Answers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + $scope.activity.coursemoduleid, $scope.exploracionFinalStage2);
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
                console.log("error Callback");
                $scope.$emit('HidePreloader');
            }


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
                        }, 1000)
                        //$scope.$emit('HidePreloader');
                    });
            };

            $scope.openModal();

            function addHeightConsulta(lista, elementQty) {
                $scope.finalHeight = angular.element(lista).height() + (250 * (elementQty));
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            function addHeight(lista) {
                var listaHeight = angular.element(lista).height();
                angular.element("div.owl-wrapper-outer").css('height', listaHeight + 177);
            }

            function addHeightForOther() {
                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                angular.element("div.owl-wrapper-outer").css('height', containerHeight + 100);
            }

            function reduceHeightForOther() {
                $scope.finalHeight = angular.element('.owl-wrapper-outer').height() - 100;
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }


            function removeHeight(lista) {
                var listaHeight = angular.element(lista).height();
                angular.element("div.owl-wrapper-outer").css('height', listaHeight - 127);
            }

            //$scope.openModal();
            getDataAsync();

            $scope.validateMisSuenosAnsweredQuestions = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";

                var validAnswers = 0;

                for (var a = 0; a < $scope.misSuenosAnswers.length; a++) {
                    var cont = $scope.misSuenosAnswers[a].length;

                    if (cont > 0) {//Question with dreams

                        //Check if dreams are not empty strings or spaces
                        var countNotEmptyAnswers = 0;
                        for (var b = 0; b < cont; b++) {

                            //Correction for the '\n' reserved character
                            $scope.misSuenosAnswers[a][b] = $scope.misSuenosAnswers[a][b].replace(/\r?\n|\r/g, " ").trim();

                            if ($scope.misSuenosAnswers[a][b] !== '') {
                                countNotEmptyAnswers++;
                            }
                        }

                        if (countNotEmptyAnswers > 0) {
                            validAnswers++;
                        }
                    }
                }

                if (validAnswers == 3) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    showWarningAndGoToTop();
                }
            };


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


            $scope.validateMisCualidadesAnsweredQuestions = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";


                var validatedAnswers = [0, 0, 0];
                var validateOther = [0, 0, 0];

                for (var a = 0; a < $scope.misCualidadesAnswers.length; a++) {
                    var cont = $scope.misCualidadesAnswers[a].length;  //It should be equal to 13

                    for (var b = 0; b < cont; b++) { //Only the first 12 checkboxes
                        var checked = $scope.misCualidadesAnswers[a][b];
                        if (checked) {  //An option was checked by the user
                            validatedAnswers[a]++;
                        } else {
                            $scope.misCualidadesAnswers[a][b] = 0;
                        }
                    }

                    //...and lastly, for the input value...
                    if ($scope.misCualidadesAnswers[a][11] == true) {
                        //Get rid from carriage return                        

                        if ($scope.misCualidadesOtroAnswers[a].answers[0] != '') {
                            $scope.misCualidadesOtroAnswers[a].answers[0] = $scope.misCualidadesOtroAnswers[a].answers[0].replace(/\r?\n|\r/g, " ").trim();
                            validateOther[a] = 1;
                        } else {
                            validateOther[a] = -1;
                        }
                    }

                }

                //console.log(validatedAnswers);
                //console.log(validateOther);

                if (validatedAnswers[0] > 0 &&
                    validatedAnswers[1] > 0 &&
                    validatedAnswers[2] > 0 &&
                    validateOther[0] != -1 &&
                    validateOther[1] != -1 &&
                    validateOther[2] != -1) {
                    $scope.OtroAnswer = $scope.misCualidadesOtroAnswers;
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    showWarningAndGoToTop();
                }


                /*
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
                 console.log("Answers ARE Valid");
                 $scope.showWarning = false;
                 $scope.navigateToPage(2);
                 } else {
                 showWarningAndGoToTop();
                 }
                 } else {
                 showWarningAndGoToTop();
                 }
                 */
            };

            $scope.validateMisGustosAnsweredQuestions = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";

                var validatedAnswers = [0, 0, 0];
                var validateOther = [0, 0, 0];

                for (var a = 0; a < $scope.misGustosAnswers.length; a++) {
                    var cont = $scope.misGustosAnswers[a].length;  //It should be equal to 12

                    for (var b = 0; b < cont; b++) { //Only the first 11 checkboxes
                        var checked = $scope.misGustosAnswers[a][b];
                        if (checked) {  //An option was checked by the user
                            validatedAnswers[a]++;
                        } else {
                            $scope.misGustosAnswers[a][b] = 0;
                        }
                    }

                    //...and lastly, for the input value...
                    if ($scope.misGustosAnswers[a][10] == true) {
                        //Get rid from carriage return

                        if ($scope.misGustosOtroAnswers[a].answers[0] != '') {
                            $scope.misGustosOtroAnswers[a].answers[0] = $scope.misGustosOtroAnswers[a].answers[0].replace(/\r?\n|\r/g, " ").trim();
                            validateOther[a] = 1;
                        } else {
                            validateOther[a] = -1;
                        }
                    }

                }

                if (validatedAnswers[0] > 0 &&
                    validatedAnswers[1] > 0 &&
                    validatedAnswers[2] > 0 &&
                    validateOther[0] != -1 &&
                    validateOther[1] != -1 &&
                    validateOther[2] != -1) {
                    $scope.OtroAnswer = $scope.misGustosOtroAnswers;
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    showWarningAndGoToTop();
                }

                /*
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
                 */
            };

            $scope.validateExploracionFinalAnsweredQuestions = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";

                var validAnswers = true;

                for (var index = 0; index < $scope.exploracionFinal.length; index++) {
                    var element = $scope.exploracionFinal[index];
                    if (element == "") {
                        validAnswers = false;
                        showWarningAndGoToTop();
                        break;
                    }
                }

                if (validAnswers) {
                    //moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, partialSuccessfullCallBack, partialErrorCallback, true);
                    moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, -1, partialSuccessfullCallBack, partialErrorCallback, true);

                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                }
            };


            function partialSuccessfullCallBack(partialActivityAnswers) {
                if (partialActivityAnswers != null) {

                    $scope.exploracionFinalresult =
                        [
                            {"badAnswer": false, "trueOptionWrong": false, "falseOptionWrong": false},
                            {"badAnswer": false, "trueOptionWrong": false, "falseOptionWrong": false},
                            {"badAnswer": false, "trueOptionWrong": false, "falseOptionWrong": false},
                            {
                                "badAnswer": false,
                                "firstOptionWrong": false,
                                "secondOptionWrong": false,
                                "thirdOptionWrong": false
                            },
                            {
                                "badAnswer": false,
                                "firstOptionWrong": false,
                                "secondOptionWrong": false,
                                "thirdOptionWrong": false
                            }
                        ];
                    var _mathFloor = 0;
                    var goodAnswersQty = 0;
                    for (var index = 0; index < partialActivityAnswers.questions.length; index++) {
                        var question = partialActivityAnswers.questions[index];
                        for (var answerIndex = 0; answerIndex < question.answers.length; answerIndex++) {
                            var questionAnswer = question.answers[answerIndex];
                            if (index == 0 || index == 1 || index == 2) {
                                var questionAnswerAnswer = questionAnswer.answer.toLowerCase().trim() == "true" ? 1 : 0;
                                var selectedAnswer = Number($scope.exploracionFinal[index]);
                                if (questionAnswerAnswer == selectedAnswer) {
                                    _mathFloor = Math.floor(questionAnswer.fraction);
                                    if (_mathFloor != 1) {
                                        $scope.exploracionFinalresult[index].badAnswer = true;
                                        if (questionAnswerAnswer == 0) {
                                            $scope.exploracionFinalresult[index].falseOptionWrong = true;
                                        }
                                        else {
                                            $scope.exploracionFinalresult[index].trueOptionWrong = true;
                                        }
                                    }
                                    else {
                                    }
                                }
                            }
                            else if (index == 3 || index == 4) {
                                if (answerIndex == $scope.exploracionFinal[index]) {
                                    if (Math.floor(questionAnswer.fraction) == 1) {

                                    }
                                    else {
                                        $scope.exploracionFinalresult[index].badAnswer = true;
                                        if (answerIndex == 0) {
                                            $scope.exploracionFinalresult[index].firstOptionWrong = true;
                                        }
                                        else if (answerIndex == 1) {
                                            $scope.exploracionFinalresult[index].secondOptionWrong = true;
                                        }
                                        else {
                                            $scope.exploracionFinalresult[index].thirdOptionWrong = true;
                                        }
                                        break;
                                    }
                                }
                            }
                        }

                        if (!$scope.exploracionFinalresult[index].badAnswer) {
                            goodAnswersQty++;
                        }
                    }
                }
                else {
                    $scope.showWarning = true;
                    $scope.warningMessage = "Las respuestas del quiz no se pueden mostrar en este momento";
                }

                $scope.Score = goodAnswersQty * 100 / $scope.exploracionFinalresult.length;
            }

            //$scope.$emit('HidePreloader'); //hide preloader
            function partialErrorCallback(partialActivityAnswers) {

            }


            $scope.validateExploracionInicialStage2 = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";

                var quizIsValid = false;
                console.log($scope.exploracionInicialStage2 + " answer: " + $scope.exploracionInicialStage2OtroAnswer[0].answers[0]);

                //Validation: there must not be a 'null' value AND the multichoice must have some 'true' value
                if (($scope.exploracionInicialStage2.indexOf(null) == -1) && ($scope.exploracionInicialStage2[3].indexOf(true) > -1)) {

                    //Other is 'true' and has a non empty string in the input
                    var userInput = $scope.exploracionInicialStage2OtroAnswer[0].answers[0].replace(/\r?\n|\r/g, " ").trim();
                    if ($scope.exploracionInicialStage2[3][4] && userInput != '') {
                        quizIsValid = true;
                    }
                }

                if (quizIsValid) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();

                } else {
                    console.log("Wrong!");
                    showWarningAndGoToTop();
                }
            };


            $scope.validateTusIdeas = function () {

                var quizIsValid = true;
                var numQuestions = $scope.misIdeas.length;
                var i, b;

                //Remove repeated entries and blanks in each of the two questions
                for (i = 0; i < numQuestions; i++) {
                    $scope.misIdeas[i] = $scope.misIdeas[i].filter(function (item, pos) {
                        return item.trim().length > 0 && $scope.misIdeas[i].indexOf(item) == pos;
                    });
                }

                //Correction for the '\n' reserved character
                for (i = 0; i < numQuestions; i++) {
                    for (b = 0; b < $scope.misIdeas[i].length; b++) {
                        $scope.misIdeas[i][b] = $scope.misIdeas[i][b].replace(/\r?\n|\r/g, " ").trim();
                    }
                }

                //Check is some of the questions had no valid answer
                for (i = 0; i < numQuestions; i++) {
                    if ($scope.misIdeas[i].length == 0) {
                        quizIsValid = false;
                    }
                }

                if (quizIsValid) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    showWarningAndGoToTop();
                }
            };


            $scope.validateTuFuturo = function () {

                var quizIsValid = true;
                var numQuestions = $scope.miFuturo.length;
                var i, b;

                //Remove repeated entries and blanks in each of the two questions
                for (i = 0; i < numQuestions; i++) {
                    $scope.miFuturo[i] = $scope.miFuturo[i].filter(function (item, pos) {
                        return item.trim().length > 0 && $scope.miFuturo[i].indexOf(item) == pos;
                    });
                }

                //Correction for the '\n' reserved character
                for (i = 0; i < numQuestions; i++) {
                    for (b = 0; b < $scope.miFuturo[i].length; b++) {
                        $scope.miFuturo[i][b] = $scope.miFuturo[i][b].replace(/\r?\n|\r/g, " ").trim();
                    }
                }

                //Check is some of the questions had no valid answer
                for (i = 0; i < numQuestions; i++) {
                    if ($scope.miFuturo[i].length == 0) {
                        quizIsValid = false;
                    }
                }

                if (quizIsValid) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    showWarningAndGoToTop();
                }
            };


            $scope.validateExploracionFinalStage2 = function () {

                var cont = $scope.exploracionFinalStage2.length;
                var quizIsValid = true;

                //Check if first (yes/no) question was answered
                if ($scope.exploracionFinalStage2[0]) {

                    //Check if second (multiple choice) question was answered
                    if ($scope.exploracionFinalStage2[1].indexOf(true) > -1) {

                        //Check if third (multiple choice) question was answered
                        if ($scope.exploracionFinalStage2[2].indexOf(true) > -1) {

                            //Check if fourth (multiple choice) question was answered
                            if (!($scope.exploracionFinalStage2[3].indexOf(true) > -1)) {
                                quizIsValid = false;
                            }

                        } else {
                            quizIsValid = false;
                        }

                    } else {
                        quizIsValid = false;
                    }

                } else {
                    quizIsValid = false;
                }
                console.log(quizIsValid);

                if (quizIsValid) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    showWarningAndGoToTop();
                }

                /*

                 if (validAnswers) {
                 //moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, partialSuccessfullCallBack, partialErrorCallback, true);
                 moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, -1, partialSuccessfullCallBack, partialErrorCallback, true);

                 $scope.showWarning = false;
                 $scope.navigateToPage(2);
                 $scope.scrollToTop();
                 }

                 */

            };

            $scope.validateExploracionInicialStage3 = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";

                var cont = $scope.exploracionInicialStage3.length;  //It should be equal to 4: Four questions.
                var quizIsValid = true;
                var userInput;

                //Check if first (yes/no) question was answered
                if ($scope.exploracionInicialStage3[0]) {

                    //Check if answer in second question
                    if ($scope.exploracionInicialStage3[1].indexOf(true) > -1) {

                        //Check if Other was selected and it has a non null string
                        userInput = $scope.exploracionInicialStage3OtroAnswers[0].answers[0].replace(/\r?\n|\r/g, " ").trim();
                        if (($scope.exploracionInicialStage3[1][2] && userInput != '') || !$scope.exploracionInicialStage3[1][2]) {

                            //Check if answer in third question
                            if ($scope.exploracionInicialStage3[2].indexOf(true) > -1) {

                                //Check if Other was selected and it has a non null string
                                userInput = $scope.exploracionInicialStage3OtroAnswers[1].answers[0].replace(/\r?\n|\r/g, " ").trim();
                                if (($scope.exploracionInicialStage3[2][5] && userInput != '') || !$scope.exploracionInicialStage3[2][5]) {

                                    //Check if answer in fourth question
                                    if ($scope.exploracionInicialStage3[3].indexOf(true) > -1) {

                                        //Check if Other was selected and it has a non null string
                                        userInput = $scope.exploracionInicialStage3OtroAnswers[2].answers[0].replace(/\r?\n|\r/g, " ").trim();
                                        if (!(($scope.exploracionInicialStage3[3][3] && userInput != '') || !$scope.exploracionInicialStage3[3][3])) {
                                            quizIsValid = false;
                                        }
                                    } else {
                                        quizIsValid = false;
                                    }

                                } else {
                                    quizIsValid = false;
                                }

                            } else {
                                quizIsValid = false;
                            }

                        } else {
                            quizIsValid = false;
                        }

                    } else {
                        quizIsValid = false;
                    }
                } else {
                    quizIsValid = false;
                }

                console.log(quizIsValid);

                if (quizIsValid) {console.log("Good");
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {console.log("bad");
                    showWarningAndGoToTop();
                }
            };


        }
    ])
    .controller('OpeningStageController', function ($scope, $modalInstance) {

        $scope.cancel = function () {
            $scope.$emit('ShowPreloader');
            $modalInstance.dismiss('cancel');
        };

    })
    .controller('videoCollapsiblePanelController', function ($scope) {
        $scope.isCollapsed = false;
    });

