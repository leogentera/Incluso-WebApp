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

            $scope.like_status = 1;

            $scope.AnswersResult = { //For storing responses in "Exploración Inicial"
                "userid": 0,
                "answers": [null, [0, 0, 0, 0, 0], '', null, []],
                "activityidnumber": 0,                         //$scope.activity.coursemoduleid
                "like_status": 0
            };

            $scope.misCualidadesAnswers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            $scope.misGustosAnswers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""]];
            $scope.misSuenosAnswers = [[], [], [], []];

            $scope.exploracionFinal = ["", "", "", "", ""];

            $scope.show1 = function() {
              console.log($scope.AnswersResult.answers[0]);
            };

            $scope.addCaptureField = function() {
                //addHeight("#owl-carousel");
                console.log($scope.misCualidadesAnswers[0][11]);
                console.log($scope.misCualidadesAnswers[0][12]);
                console.log($scope.misCualidadesAnswers[1][11]);
                console.log($scope.misCualidadesAnswers[1][12]);
                console.log($scope.misCualidadesAnswers[2][11]);
                console.log($scope.misCualidadesAnswers[2][12]);
            };


            $scope.finishActivity = function () {
                //Activity completed

                $scope.activity.status = 1;
                
                //Update Activity Log Service
                updateUserStars($scope.activity_identifier);

                $scope.AnswersResult.userid = $scope.userprofile.id;
                $scope.AnswersResult.activityidnumber = $scope.activity.coursemoduleid;
                $scope.AnswersResult.like_status = $scope.like_status;
                $scope.AnswersResult.updatetype = 1;
                $scope.showWarning = false;

                var updatedActivityOnUsercourse = updateActivityStatus($scope.activity_identifier);
                console.log($scope.activityname);
                switch ($scope.activityname) {
                    case "Mis cualidades":
                        $scope.AnswersResult.answers = $scope.misCualidadesAnswers;
                        break;
                    case "Mis gustos":
                        $scope.AnswersResult.answers = $scope.misGustosAnswers;
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

                console.log($scope.AnswersResult.answers);

                //Update local storage and activities status array
                localStorage.setItem("usercourse", JSON.stringify(updatedActivityOnUsercourse));
                _activityStatus[$scope.activity.coursemoduleid] = 1;

                //Update quiz on server
                var activityModel = {
                    "usercourse": updatedActivityOnUsercourse,
                    "coursemoduleid": $scope.activity.coursemoduleid,
                    "answersResult": $scope.AnswersResult,
                    "userId": $scope.userprofile.id,
                    "startingTime": $scope.startingTime,
                    "endingTime": new Date(),
                    "token": $scope.currentUser.token,
                    "activityType": "Quiz"
                };

                console.log("activityModel = " + JSON.stringify(activityModel));

                _endActivity(activityModel);

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

            $scope.addSueno1 = function () {alert("sueño 1");
                addHeight("#listaDinamica1");
                $scope.misSuenosAnswers[0].push("");
            };

            $scope.addSueno2 = function () {
                addHeight("#listaDinamica2");
                $scope.misSuenosAnswers[1].push("");
            };

            $scope.addSueno3 = function () {
                addHeight("#listaDinamica3");
                $scope.misSuenosAnswers[2].push("");
            };

            $scope.deleteSueno1 = function (index) {
                removeHeight("#listaDinamica1");
                $scope.misSuenosAnswers[0].splice(index, 1);
            };

            $scope.deleteSueno2 = function (index) {
                removeHeight("#listaDinamica2");
                $scope.misSuenosAnswers[1].splice(index, 1);
            };

            $scope.deleteSueno3 = function (index) {
                removeHeight("#listaDinamica3");
                $scope.misSuenosAnswers[2].splice(index, 1);
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
                        if ($scope.AnswersResult.answers[2] != null && $scope.AnswersResult.answers[2] != "") {
                            //Solving for the '\n' character
                            $scope.AnswersResult.answers[2] = $scope.AnswersResult.answers[2].replace(/\r?\n|\r/g, " ").trim();
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
            };

            function updateSelectedAnswers(questionIndex, question) {//For "Exploración Inicial" only
                console.log("Question = " + JSON.stringify(question));
                switch (questionIndex) {
                    case 0:
                        if (question.userAnswer != "No") {console.log("question.userAnswer = " + question.userAnswer);
                            $scope.AnswersResult.answers[0] = 0;
                        }
                        else if (question.userAnswer == "No") {console.log("question.userAnswer = " + question.userAnswer);
                            $scope.AnswersResult.answers[0] = 1;
                        }
                        break;

                    case 1:
                        //console.log("Question.userAnswer: " + JSON.stringify(question.userAnswer));

                        //                         var userAnswersList = question.userAnswer.split(";");
                        // 
                        //                         userAnswersList.forEach(function (answer) {
                        //                             var cleanAnswer = cleanText(answer).trim();
                        // 
                        //                             if (cleanAnswer == "Pedir ayuda a alguien") {
                        //                                 $scope.AnswersResult.answers[1][0] = true;
                        //                             }
                        // 
                        //                             if (cleanAnswer == "Investigar sobre el tema") {
                        //                                 $scope.AnswersResult.answers[1][1] = true;
                        //                             }
                        // 
                        //                             if (cleanAnswer == "Nada, porque parece imposible") {
                        //                                 $scope.AnswersResult.answers[1][2] = true;
                        //                             }
                        // 
                        //                             if (cleanAnswer == "Trazar un plan de lo que necesito hacer") {
                        //                                 $scope.AnswersResult.answers[1][3] = true;
                        //                             }
                        //                         });

                       

                        if (question.userAnswer.length > 0) {
                            var userAnswers = question.userAnswer.split(";");
                            for (var indexUserAnswers = 0; indexUserAnswers < userAnswers.length; indexUserAnswers++) {
                                var userAnswer = cleanText(userAnswers[indexUserAnswers]).trim();
                                for (var index = 0; index < question.answers.length; index++) {
                                    var questionOption = cleanText(question.answers[index].answer).trim();
                                    if (questionOption == userAnswer) {
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
                        /*
                        if (question.userAnswer.length > 0) {
                            for (var index = 0; index < question.answers.length; index++) {
                                var questionOption = question.answers[index];
                                if (questionOption.answer == question.userAnswer) {
                                    $scope.AnswersResult.answers[3] = index;
                                    break;
                                }
                            }
                        }
                        */
                        //console.log("Question.userAnswer: " + JSON.stringify(question.userAnswer));
                        //var userAnswer = cleanText(question.userAnswer);                        
                        var userAnswer = question.userAnswer.replace("\n", "");

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
                            var userAnswers = cleanText(question.userAnswer);
                            var userAnswerArray = userAnswers.split(";");
                            for (var i = 0; i < userAnswerArray.length; i++) {
                                $scope.AnswersResult.answers[4].push(userAnswerArray[i]);
                                /*
                                var userAnswer = userAnswers[i].trim();
                                for (var index = 0; index < question.answers.length; index++) {
                                    var questionOption = question.answers[index];
                                    if (questionOption.answer.trim() == userAnswer) {
                                        $scope.AnswersResult.answers[4].push(userAnswer);
                                    }
                                }
                                */
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
                    console.log(JSON.stringify(question));
                    var userAnswers = cleanText(question.userAnswer);
                    console.log("userAnswers: " + userAnswers);
                    var userAnswersList = userAnswers.split(";");

                    //userAnswersList = ["Cantar", "Hacer manualidades"]
                    for (var answerOptionsIndex = 0; answerOptionsIndex < question.answers.length; answerOptionsIndex++) {
                        var answerOption = question.answers[answerOptionsIndex]; //JS array of literal objects

                        for (var userAnswersListIndex = 0; userAnswersListIndex < userAnswersList.length; userAnswersListIndex++) {
                            var userAnswer = cleanText(userAnswersList[userAnswersListIndex]).trim();
                            if (answerOption.answer == userAnswer) {
                                $scope.misCualidadesAnswers[currentQuestionIndex][answerOptionsIndex] = true;
                            }
                        }
                    }

                    console.log("$scope.misCualidadesAnswers: " + $scope.misCualidadesAnswers[currentQuestionIndex]);
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
                                $scope.misGustosAnswers[currentQuestionIndex][answerOptionsIndex] = true;
                            }
                        }
                    }
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
                    addHeightConsulta("#listaDinamica", qty);
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

            // function cleanText(userAnswer) {   //NOTE: replace() is a chainable method.
            //     var result = userAnswer.replace(/\r?\n|\r/g, "")
            //     .replace(/<br>/g, "")
            //     .replace(/<p>/g, "")
            //     .replace(/<\/p>/g, "");
            //     return result;
            // }
            
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

                $scope.startingTime = new Date();

                $scope.activity_identifier = $location.path().split("/")[$location.path().split("/").length - 1];
                var activity = getActivityByActivity_identifier($scope.activity_identifier);
                console.log("The activity ID is: \n" + $scope.activity_identifier);
                console.log("The activity data is: \n" + JSON.stringify(activity));
                console.log("The activity status is: " + activity.status);

                if (activity != null) {

                    if ($scope.activity_identifier == 1009) {
                        $scope.AnswersResult.answers = [0, 0, 0, 0, 0];
                    }
                    $scope.coursemoduleid = activity.coursemoduleid;    //console.log("coursemoduleid: " + activity.coursemoduleid);
                    $scope.activityPoints = activity.points;            //console.log("points: " + activity.points);
                    $scope.activityname = activity.activityname;        //console.log("activityname: " + activity.activityname);

                    $scope.userprofile = JSON.parse(localStorage.getItem("profile"));
                    $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                    //$scope.activitieCache = JSON.parse(localStorage.getItem("activitiesCache/" + $scope.coursemoduleid));

                    var activityFinished = false;
                    console.log("userprofile: " + $scope.userprofile.id);
                    if (activity.status != 0) {
                        activityFinished = true;
                        $scope.setReadOnly = true;
                        moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, successfullCallBack, errorCallback, true);
                    }
                    //console.log("setReadOnly: " + $scope.setReadOnly);
                    $scope.activity = activity;
                    $scope.activityFinished = activityFinished;
                    //console.log("activityFinished: " + $scope.activityFinished);
                }
            }


            function successfullCallBack(activityAnswers) {
                if (activityAnswers != null) {                    
                    // $scope.activity = activityAnswers;                    
                    for (var index = 0; index < activityAnswers.questions.length; index++) {

                        var question = activityAnswers.questions[index];

                        switch ($scope.activityname) {
                            case "Exploración inicial":
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
                                updateExploracionFinalSelectedAnswersFinal(index, question);
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

            }


            $scope.openModal = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'openingStageModal.html',
                    controller: 'OpeningStageController',
                    size: size,
                    windowClass: 'user-help-modal'
                });
            };

            $scope.openModal();
            
            function addHeightConsulta(lista, elementQty) {
                $scope.finalHeight = angular.element(lista).height() + (250 * (elementQty));
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            function addHeight(lista) {
                $scope.finalHeight = angular.element(lista).height() + 177;
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            function removeHeight(lista) {
                $scope.finalHeight = angular.element(lista).height() - 172;
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            //$scope.openModal();
            getDataAsync();

            $scope.validateMisSuenosAnsweredQuestions = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";

                //var questionIsValid = false;
                var validAnswers = 0;

                for (var a = 0; a < $scope.misSuenosAnswers.length; a++) {
                    var cont = $scope.misSuenosAnswers[a].length;

                    if (cont > 0) {//Question with dreams

                        //Check if dreams are not empty strings or spaces
                        var countNotEmptyAnswers = 0;
                        for (var b = 0; b < cont; b++) {
                            var text = $scope.misSuenosAnswers[a][b];
                            console.log(text);

                            //Correction for the '\n' reserved character
                            text = text.replace(/\r?\n|\r/g, " ").trim();
                            $scope.misSuenosAnswers[a][b] = text;
                            console.log(text);

                            if (text !== '') {
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
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                } else {
                    showWarningAndGoToTop();
                }
            };


            function showWarningAndGoToTop() {
                $scope.showWarning = true;
                $scope.$emit('scrollTop');
            }


            $scope.answerIndex = 1;
            //$scope.answerIndex1 = 1;

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
                    moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, partialSuccessfullCallBack, partialErrorCallback, true);

                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                }
            };

            function partialSuccessfullCallBack(partialActivityAnswers) {
                if (partialActivityAnswers != null) {

                    $scope.exploracionFinalresult =
                    [
                        { "badAnswer": false, "trueOptionWrong": false, "falseOptionWrong": false },
                        { "badAnswer": false, "trueOptionWrong": false, "falseOptionWrong": false },
                        { "badAnswer": false, "trueOptionWrong": false, "falseOptionWrong": false },
                        { "badAnswer": false, "firstOptionWrong": false, "secondOptionWrong": false, "thirdOptionWrong": false },
                        { "badAnswer": false, "firstOptionWrong": false, "secondOptionWrong": false, "thirdOptionWrong": false }
                    ];
                    var _mathFloor = 0;
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
                                    else { }
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
                                //                                 else {
                                //                                     $scope.exploracionFinalresult[index].badAnswer = true;
                                // 
                                //                                     if (answerIndex == 0) {
                                //                                         $scope.exploracionFinalresult[index].firstOptionWrong = true;
                                //                                         break;
                                //                                     }
                                //                                     else if (answerIndex == 1) {
                                //                                         $scope.exploracionFinalresult[index].secondOptionWrong = true;
                                //                                         break;
                                //                                     }
                                //                                     else {
                                //                                         $scope.exploracionFinalresult[index].thirdOptionWrong = true;
                                //                                     }
                                //                                 }
                            }
                        }
                    }
                }
                else {
                    $scope.showWarning = true;
                    $scope.warningMessage = "Las respuestas del quiz no se pueden mostrar en este momento";
                }
            }


            function partialErrorCallback(partialActivityAnswers) {
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

