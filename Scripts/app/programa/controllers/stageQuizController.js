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

            $rootScope.pageName = "Estación: Conócete";
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $scope.$emit('HidePreloader'); //hide preloader
            $scope.currentPage = 1;
            $scope.setReadOnly = true;
            $scope.showWarning = false;
            $scope.coursemoduleid = 0;
            //$scope.userprofile = null;
            //$scope.activity = null;
            $scope.like_status = 0;


            $scope.finishActivity = function () {
                //Activity completed
                $scope.activity.status = 1;

                //Call stars - progress
                //Update Activity Stars - Progres Service

                //Llamar notificaciones

                //Update Activity userAnswers Service

                //Update Activity Log Service

                //Update Activity finished Service
                //moodleFactory.Services.PutEndActivity($scope.coursemoduleid, $scope.userprofile.id, $scope.fuenteDeEnergia, $scope.currentUser.token, successfullCallBack, errorCallback);
                //moodleFactory.Services.PutAsyncQuizActivity($scope.userprofile.id, $scope.coursemoduleid,$scope.AnswersResult, successfullCallBack, errorCallback);

                $scope.AnswersResult.userid = $scope.userprofile.id;
                $scope.AnswersResult.activityidnumber = $scope.activity.coursemoduleid;
                $scope.AnswersResult.like_status = $scope.like_status;
                
                //$scope.AnswersResult.answers = $scope.Suena_answers

                _endActivityQuiz({
                    "activity": $scope.activity,
                    "answersResult": $scope.AnswersResult,
                    "userId": $scope.userprofile.id
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

            $scope.dreamsLists = {"answers": [[], [], []]};


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
                $location.path('/ZonaDeVuelo/Dashboard');
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
                                        $scope.showWarning = true;
                                    }
                                }
                                else {
                                    $scope.showWarning = true;
                                }
                            }
                            else {
                                $scope.showWarning = true;
                            }
                        }
                        else {
                            $scope.showWarning = true;
                        }
                    }
                    else {
                        $scope.showWarning = true;
                    }
                }
                else {
                    $scope.showWarning = true;
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
                                    if (questionOption.answer.trim() == userAnswer) {
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

            $scope.AnswersResult = {
                "userid": 0,//$scope.userprofile.id,
                "answers": [null, [0, 0, 0, 0], '', null, []]
                , "activityidnumber": 0//$scope.activity.coursemoduleid
                , "like_status": 0
            };

            $scope.misCualidadesAnswers = [null, null, null];

            function errorCallback(data) {
                // var algo = data;
            }

            function getDataAsync() {

                //test
                
                //activity_identifier - activityname
                //1001 - Exploracion Inicial
                //1007 - Sueña
                //1006 - Mis cualidades
                var testActivity_identifier = 1001 //3004 - ???? /// Get activity_identifier from queryString
                
                //fin test     
                
                var activity_identifier = $location.path().split("/")[3] == "zv_exploracionInicial" ? testActivity_identifier : $location.path().split("/")[3];

                var activities = getActivityByActivity_identifier(activity_identifier);

                if (activities != null) {
                    $scope.coursemoduleid = activities.coursemoduleid;

                    $scope.userprofile = JSON.parse(localStorage.getItem("profile"));
                    $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                    $scope.activitieCache = JSON.parse(localStorage.getItem("activitiesCache/111"));

                    var activityFinished = false;

                    if (activities.status == 0) {
                        if ($scope.activitieCache != null) {
                            activityFinished = true;
                        }
                    }
                    else {
                        activityFinished = true;
                    }

                    $scope.setReadOnly = activityFinished;

                    if (activityFinished) {

                        moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, successfullCallBack, errorCallback);

                        //test

                        // var activity = { "id": 44, "name": "Exploracion Inicial", "description": null, "activityType": "Quiz", "status": null, "stars": null, "dateIssued": null, "score": 8, "quizType": null, "grade": 10, "questions": [{ "id": 19, "question": "1. \u00bfAlguna vez has tenido un sue\u00f1o que no has sabido c\u00f3mo alcanzar?", "questionType": "multichoice", "answers": [{ "id": 60, "answer": "Si", "fraction": "1.0000000" }, { "id": 61, "answer": "No", "fraction": "1.0000000" }], "userAnswer": "No" }, { "id": 20, "question": "2. \u00bfQu\u00e9 de lo siguiente has intentado hacer para lograrlo? Puedes elegir m\u00e1s de una.", "questionType": "multichoice", "answers": [{ "id": 62, "answer": "Pedir ayuda a alguien", "fraction": "1.0000000" }, { "id": 63, "answer": "Investigar sobre el tema", "fraction": "0.0000000" }, { "id": 64, "answer": "Nada, porque me parece imposible", "fraction": "0.0000000" }, { "id": 65, "answer": "Trazar un plan de lo que necesito", "fraction": "0.0000000" }], "userAnswer": "Pedir ayuda a alguien; Investigar sobre el tema" }, { "id": 23, "question": "3. \u00bfQu\u00e9 persona exitosa que conoces te inspira?", "questionType": "shortanswer", "answers": [{ "id": 72, "answer": "*", "fraction": "1.0000000" }], "userAnswer": "Bill Gates" }, { "id": 24, "question": "4. \u00bfSabes cu\u00e1les son tus habilidades?", "questionType": "multichoice", "answers": [{ "id": 73, "answer": "Si", "fraction": "1.0000000" }, { "id": 74, "answer": "No", "fraction": "1.0000000" }, { "id": 75, "answer": "Mas o menos", "fraction": "1.0000000" }], "userAnswer": "Mas o menos" }, { "id": 25, "question": "5. Menciona tus principales habilidades", "questionType": "multichoice", "answers": [{ "id": 76, "answer": "Empat\u00eda", "fraction": "1.0000000" }, { "id": 77, "answer": "Creatividad", "fraction": "0.0000000" }, { "id": 78, "answer": "Liderazgo", "fraction": "0.0000000" }, { "id": 79, "answer": "Comunicaci\u00f3n", "fraction": "0.0000000" }, { "id": 80, "answer": "Negociaci\u00f3n", "fraction": "0.0000000" }, { "id": 81, "answer": "Trabajo en equipo", "fraction": "0.0000000" }, { "id": 82, "answer": "Innovaci\u00f3n", "fraction": "0.0000000" }, { "id": 83, "answer": "Iniciativa", "fraction": "0.0000000" }, { "id": 84, "answer": "Toma de decisiones", "fraction": "0.0000000" }, { "id": 85, "answer": "Planeaci\u00f3n", "fraction": "0.0000000" }, { "id": 86, "answer": "Organizaci\u00f3n", "fraction": "0.0000000" }], "userAnswer": "Organizaci\u00f3n; Toma de decisiones; Trabajo en equipo" }] };
                    
                        // if (activity != null) {
                        //     for (var index = 0; index < activity.questions.length; index++) {
                        //         var question = activity.questions[index];
                        //         updateSelectedAnsers(index, question)
                        //     }
                        // }
                        // else {
                        //     $scope.showWarning = true;
                        //     $scope.warningMessage = "El quiz no se puede acceder en este momento";
                        // }
                    
                        //fin test                 
                    }
                    else {
                        $scope.activity = activities;
                    }
                }
            }

            //             function successfullCallBack(activity) {
            //                 if (activity != null) {
            //                     $scope.activity = activity;
            //                     for (var index = 0; index < activity.questions.length; index++) {
            //                         var question = activity.questions[index];
            // 
            //                         updateSelectedAnsers(index, question)
            //                     }
            //                 }
            //             }
            
            function successfullCallBack(activity) {
                if (activity != null) {
                    $scope.activity = activity;
                    for (var index = 0; index < activity.questions.length; index++) {
                        var question = activity.questions[index];
                        updateSelectedAnswers(index, question)
                    }
                }
                else {
                    $scope.showWarning = true;
                    $scope.warningMessage = "El quiz no se puede acceder en este momento";
                }
            }

            $scope.openModal = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'OpeningStageModal.html',
                    controller: 'OpeningStageController',
                    size: size,
                    windowClass: 'user-help-modal'
                });
                console.log("modal open");
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
             }

            $scope.validateMisCualidadesAnsweredQuestions = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                if (misCualidadesAnswers[0] != null) {
                    if (misCualidadesAnswers[1] != null) {
                        if (misCualidadesAnswers[2] != null) {
                            $scope.navigateToPage(2);  
                        }
                        else {
                            $scope.showWarning = true;
                        }
                    }
                    else {
                        $scope.showWarning = true;
                    }
                }
                else {
                    $scope.showWarning = true;
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

