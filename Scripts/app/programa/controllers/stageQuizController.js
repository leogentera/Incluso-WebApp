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
            //             function getDataAsync() {    
            //                  
            //                 //var m = JSON.parse(moodleFactory.Services.GetCacheObject("activity" + 111));
            // 
            //                 var activity = {
            //                     "id": 12,
            //                     "name": "Quiz",
            //                     "description": "Lorem ipsum",
            //                     "activityType": "Quiz",
            //                     "stars": 200,
            //                     "score": 100,
            //                     "quizType": "Survey",
            //                     "sumgrade": 3,
            //                     "questions": [
            //                         {
            //                             "id": 2,
            //                             "question": "¿Esta es la pregunta 1?",
            //                             "questionType": "Multichoice",
            //                             "answers": [
            //                                 {
            //                                     "id": 3,
            //                                     "fraction": 1,
            //                                     "description": "Answer A"
            //                                 },
            //                                 {
            //                                     "id": 4,
            //                                     "fraction": 0.4,
            //                                     "description": "Answer B"
            //                                 },
            //                                 {
            //                                     "id": 5,
            //                                     "fraction": 0.2,
            //                                     "description": "AnswerC"
            //                                 }
            //                             ],
            //                             "userAnswer": 3
            //                         },
            //                         {
            //                             "id": 3,
            //                             "question": "¿Esta es la pregunta 2",
            //                             "questionType": "True/False",
            //                             "answers": [
            //                                 {
            //                                     "id": 6,
            //                                     "fraction": 1,
            //                                     "description": "True"
            //                                 },
            //                                 {
            //                                     "id": 7,
            //                                     "fraction": 0,
            //                                     "description": "False"
            //                                 }
            //                             ],
            //                             "userAnswer": false
            //                         }
            //                     ]
            //                 };
            // 
            //                 if (!activity) {
            //                     $location.path('/');
            //                     return "";
            //                 }
            // 
            //                 return activity;
            //             }
            // 
      
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

