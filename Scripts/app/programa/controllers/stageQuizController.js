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

            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;

            $scope.currentPage = 1;

            $scope.AnswersResult = {
                "userid": 125,
                "answers": [
                    {
                        //"0": null
                        "first": null
                    },
                    {
                        "second": [
                            '0', '0', '0', '0'
                            // { "_0": 0 },
                            // { "_1": 0 },
                            // { "_2": 0 },
                            // { "_3": 0 }
                        ]
                    },
                    {
                        "third": ''
                    }
                    ,
                    {
                        "fourth": null
                    },
                    {
                        "fifth": ['Habilidad por defecto']
                    }
                ]
            };

            $scope.addAbility = function () {
                $scope.AnswersResult.answers[4].fifth.push(new String());
            }
            $scope.deleteAbility = function (index) {
                $scope.AnswersResult.answers[4].fifth.splice(index, 1);
            }

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
            };
            // 
            //             $scope.activityCompleted = function () {
            //                 //update usercourse:
            //                 // Update 
            //                 $scope.navigateToPage(2);
            // 
            //             };
            // 
            $scope.cancel = function () {
                $location.path('/ProgramaDashboard');
            };
            // 
            //             $scope.navigateToStage = function () {
            //                 $scope.usercourse.stages[$scope.currentStageId].firstTime = 0;
            //                 localStorage.setItem("usercourse", JSON.stringify($scope.usercourse));
            //                 $location.path('/ProgramaDashboardEtapa/' + $scope.stage.id);
            //             };
            // 
            $scope.validateAnsweredQuestions = function () {

                var validationMenssage = "Asegurate de contestar todas las preguntas antes de guardar";

                var theAnswersResult = $scope.AnswersResult;

                if ($scope.AnswersResult.answers[0].first != null) {
                    if ($scope.AnswersResult.answers[1].second[0] == true ||
                        $scope.AnswersResult.answers[1].second[1] == true ||
                        $scope.AnswersResult.answers[1].second[2] == true ||
                        $scope.AnswersResult.answers[1].second[3] == true) {
                        if ($scope.AnswersResult.answers[2].third != null) {
                            if ($scope.AnswersResult.answers[3].fourth != null) {
                                if ($scope.AnswersResult.answers[4].fifth.length != 0) {
                                    $scope.navigateToPage(2);
                                }
                                else {
                                    alert(validationMenssage);
                                }
                            }
                            else {
                                alert(validationMenssage);
                            }
                        }
                        else {
                            alert(validationMenssage);
                        }
                    }
                    else {
                        alert(validationMenssage);
                    }
                }
                else {
                    alert(validationMenssage);
                }
            };
          
            //             
            // 
            //             //$scope.scrollToTop();
            //             //$scope.$emit('HidePreloader'); //hide preloader
            //             
            //             $scope.model = getDataAsync();
            // 
            //             $scope.activity = null;
            // 
            
            function activityModuleid() {

                var coursemoduleid = null;
                var activitiManger = JSON.parse(localStorage.getItem("activityManagers"));

                for (var index = 0; index < activitiManger.length; index++) {
                    var element = activitiManger[index];

                    if (element.activity_identifier == 3004) {
                        for (var index = 0; index < element.activities.length; index++) {
                            var activityChallenge = element.activities[index];
                            if (activityChallenge.activity_identifier == "1001") {
                                coursemoduleid = activityChallenge.coursemoduleid;
                                break;
                            }
                        }
                    }
                }
                return coursemoduleid;
            }

            function isActivityCompleted() {
                var isCompleted = 0;
                var exploracionFinalId = 37;

                var userCourse = JSON.parse(localStorage.getItem("usercourse"));

                for (var index = 0; index < userCourse.stages.length; index++) {
                    var stage = userCourse.stages[index];
                    if (stage.id == exploracionFinalId) {
                        isCompleted = stage.stageStatus;
                        break;
                    }
                }
                
                //Test purpose
                isCompleted = 0;

                return isCompleted;
            }

//             function getChallengeByActivity_identifier(activity_identifier) {
//                 var matchingChallenge = null;
//                 var breakAll = false;
//                 var userCourse = JSON.parse(localStorage.getItem("usercourse"));
//                 for (var index = 0; index < userCourse.stages.length; index++) {
//                     var stage = userCourse.stages[index];
//                     for (var index = 0; index < stage.challenges.length; index++) {
//                         var challenge = stage.challenges[index];
//                         if (challenge.activity_identifier == activity_identifier) {
//                             matchingChallenge = challenge;
//                             breakAll = true;
//                             break;
//                         }
//                     }
//                     if(breakAll)
//                      break;
//                 }
//                 return matchingChallenge;
//             }
// 
//             function getActivitiesByActivity_identifier(activity_identifier) {
//                 var activitiesFound = null;
//                 
//                 var challenge = getChallengeByActivity_identifier(activity_identifier);
//                 activitiesFound =challenge.activities;                
//               
//                 return activitiesFound ;
//             }

            function getDataAsync() {

                var challenge = getChallengeByActivity_identifier(3004);
                var activities = getActivitiesByActivity_identifier(3004);

                if (1 == 0) {
                    //var activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity" + 111));
                    //var activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity" + coursemoduleid));
                    
                    var activity = [{ "id": 44, "name": "Exploracion Inicial", "description": "", "activityType": "Quiz", "status": "0", "stars": -1, "dateIssued": null, "score": 8, "quizType": "", "questions": [{ "id": 19, "question": "<p>1. \u00bfAlguna vez has tenido un sue\u00f1o que no has sabido c\u00f3mo alcanzar?<br><\/p>", "questionType": "multichoice", "answers": [{ "id": 60, "answer": "<p>Si<\/p>", "fraction": "1.0000000" }, { "id": 61, "answer": "<p>No<\/p>", "fraction": "1.0000000" }], "userAnswer": "Si" }, { "id": 20, "question": "<p>2. \u00bfQu\u00e9 de lo siguiente has intentado hacer para lograrlo? Puedes elegir m\u00e1s de una.<br><\/p>", "questionType": "multichoice", "answers": [{ "id": 62, "answer": "<p>Pedir ayuda a alguien<\/p>", "fraction": "1.0000000" }, { "id": 63, "answer": "<p>Investigar sobre el tema<\/p>", "fraction": "0.0000000" }, { "id": 64, "answer": "<p>Nada, porque me parece imposible<\/p>", "fraction": "0.0000000" }, { "id": 65, "answer": "<p>Trazar un plan de lo que necesito<\/p>", "fraction": "0.0000000" }], "userAnswer": "Nada, porque me parece imposible; Pedir ayuda a alguien" }, { "id": 23, "question": "<p>3. \u00bfQu\u00e9 persona exitosa que conoces te inspira?<br><\/p>", "questionType": "shortanswer", "answers": [{ "id": 72, "answer": "*", "fraction": "1.0000000" }], "userAnswer": "Bill Gates" }, { "id": 24, "question": "<p>4. \u00bfSabes cu\u00e1les son tus habilidades?<br><\/p>", "questionType": "multichoice", "answers": [{ "id": 73, "answer": "<p>Si<\/p>", "fraction": "1.0000000" }, { "id": 74, "answer": "<p>No<\/p>", "fraction": "1.0000000" }, { "id": 75, "answer": "<p>Mas o menos<\/p>", "fraction": "1.0000000" }], "userAnswer": "Mas o menos" }, { "id": 25, "question": "<p>5. Menciona tus principales habilidades<br><\/p>", "questionType": "multichoice", "answers": [{ "id": 76, "answer": "<p>Empat\u00eda<br><\/p>", "fraction": "1.0000000" }, { "id": 77, "answer": "<p>Creatividad<br><\/p>", "fraction": "0.0000000" }, { "id": 78, "answer": "<p>Liderazgo<br><\/p>", "fraction": "0.0000000" }, { "id": 79, "answer": "<p>Comunicaci\u00f3n<br><\/p>", "fraction": "0.0000000" }, { "id": 80, "answer": "<p>Negociaci\u00f3n<br><\/p>", "fraction": "0.0000000" }, { "id": 81, "answer": "<p>Trabajo en equipo<br><\/p>", "fraction": "0.0000000" }, { "id": 82, "answer": "<p>Innovaci\u00f3n<br><\/p>", "fraction": "0.0000000" }, { "id": 83, "answer": "<p>Iniciativa<br><\/p>", "fraction": "0.0000000" }, { "id": 84, "answer": "<p>Toma de decisiones<br><\/p>", "fraction": "0.0000000" }, { "id": 85, "answer": "<p>Planeaci\u00f3n<br><\/p>", "fraction": "0.0000000" }, { "id": 86, "answer": "<p>Organizaci\u00f3n<br><\/p>", "fraction": "0.0000000" }], "userAnswer": "Organizaci\u00f3n\n; Liderazgo\n; Comunicaci\u00f3n\n" }], "sumgrades": 5, "grade": 10 }];

                    var pregunta = activity[0].questions;

                    for (var index = 0; index < activity[0].questions.length; index++) {
                        var question = activity[0].questions[index];
                        updateSelectedAnsers(index, question.userAnswer)
                    }
                }

                // if (!activity) {
                //     $location.path('/');
                //     return "";
                // }
                // else {
                //     return activity;
                // }
            }

            function updateSelectedAnsers(questionIndex, userAnswer) {
                switch (questionIndex) {
                    case 0:
                        $scope.AnswersResult.answers[0].first = 1;
                        break;
                    case 1:

                        break;
                    case 2:

                        break;
                    case 3:

                        break;
                    case 4:

                        break;
                    default:
                        break;
                }
            }

            $scope.activity = getDataAsync();         
            
      
            // 
            //             $scope.openModal = function (size) {
            // 
            //                 if ($scope.firstTime == 1) {
            //                     setTimeout(function () {
            // 
            //                         //         var modalInstance = $modal.open({
            //                         //             animation: $scope.animationsEnabled,
            //                         //             templateUrl: 'tutorialModal.html',
            //                         //             controller: 'tutorialController',
            //                         //             size: size,
            //                         //             windowClass: 'user-help-modal'
            //                         //         });
            //                         //         console.log("modal open");
            //                         //     }, 500);
            //                         // }
            // 
            //                         var modalInstance = $modal.open({
            //                             animation: $scope.animationsEnabled,
            //                             templateUrl: 'OpeningStageModal.html',
            //                             controller: 'OpeningStageController',
            //                             size: size,
            //                             windowClass: 'user-help-modal'
            //                         });
            //                         console.log("modal open");
            //                     }, 500);
            //                 }
            // 
            //             };
            // 
            //             $scope.openModal();

        }])
    .controller('OpeningStageController', function ($scope, $modalInstance) {
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

