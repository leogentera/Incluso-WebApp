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
            // $scope.stage = JSON.parse(moodleFactory.Services.GetCacheObject("stage"));
            $scope.stage = JSON.parse(localStorage.getItem("stage"));
            $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
            $scope.currentStageId = getCurrentStageId();
            $scope.firstTime = $scope.usercourse.stages[$scope.currentStageId].firstTime;

            $scope.firstQuestionAnswer = null;
            $scope.secondQuestionAnswer = {
                "options": [
                    {
                        "option": false
                    },
                    {
                        "option": false
                    },
                    {
                        "option": false
                    },
                    {
                        "option": false
                    },
                    {
                        "valuesOption5": []
                    }
                ]
            };
            $scope.thirdQuestionAnswer = null;
            $scope.fourthQuestionAnswer = null;
            $scope.fifthQuestionAnswer = [];

            $scope.AnswersResult = {
                "userid": 125,
                "answers": [
                    {
                        "0": 1
                    },
                    {
                        "1": [
                            { "0": 0 },
                            { "0": 0 },
                            { "0": 0 },
                            { "0": 0 }
                        ]
                    }
                ]
            };

            function getCurrentStageId() {
                var currentStageId = null;

                if ($scope.usercourse != null) {
                    for (var index = 0; index < $scope.usercourse.stages.length; ++index) {
                        if ($scope.usercourse.stages[index].id == $scope.stage.id) {
                            currentStageId = index;
                            break;
                        }
                    }
                }
                return currentStageId;
            };

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
            };

            $scope.activityCompleted = function () {
                //update usercourse:
                // Update 
                $scope.navigateToPage(2);

            };

            $scope.navigateToStage = function () {
                $scope.usercourse.stages[$scope.currentStageId].firstTime = 0;
                localStorage.setItem("usercourse", JSON.stringify($scope.usercourse));
                $location.path('/ProgramaDashboardEtapa/' + $scope.stage.id);
            };

            $scope.validateAnsweredQuestions = function () {
                var validationMenssage = "Asegurate de contestar todas las preguntas antes de guardar";                
                
                //Validate first quiestion
                if ($scope.firstQuestionAnswer != null) {
                    //Validate second question
                    if (secondQuestionHasSelectedAnyOption()) {
                        //Validate third question                        
                        if ($scope.thirdQuestionAnswer != null) {
                            //Validate fourth question
                            if ($scope.fourthQuestionAnswer != null) {
                                $scope.activityCompleted();
                                
                                //Validate fifth question
                                // if ($scope.fifthQuestionAnswer.length > 0) {
                                //     $scope.navigateToPage(2);
                                // }
                                // else {
                                //     alert(validationMenssage);
                                // }
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

            function secondQuestionHasSelectedAnyOption() {
                var hasSelectedAnyOption = false;

                for (var index = 0; index < $scope.secondQuestionAnswer.options.length; index++) {
                    var element = $scope.secondQuestionAnswer.options[index];
                    if (element.option && (index < $scope.secondQuestionAnswer.options.length - 1)) {
                        hasSelectedAnyOption = true;
                        break;
                    }
                    else {
                        if (element.length > 0) {
                            hasSelectedAnyOption = true;
                            break;
                        }
                    }
                }
                return hasSelectedAnyOption;
            }

            
            
            

            //$scope.scrollToTop();
            //$scope.$emit('HidePreloader'); //hide preloader
            
            $scope.model = getDataAsync();

            $scope.activity = null;

            function getDataAsync() {    
                 
                //var m = JSON.parse(moodleFactory.Services.GetCacheObject("activity" + 111));

                var activity = {
                    "id": 12,
                    "name": "Quiz",
                    "description": "Lorem ipsum",
                    "activityType": "Quiz",
                    "stars": 200,
                    "score": 100,
                    "quizType": "Survey",
                    "sumgrade": 3,
                    "questions": [
                        {
                            "id": 2,
                            "question": "¿Esta es la pregunta 1?",
                            "questionType": "Multichoice",
                            "answers": [
                                {
                                    "id": 3,
                                    "fraction": 1,
                                    "description": "Answer A"
                                },
                                {
                                    "id": 4,
                                    "fraction": 0.4,
                                    "description": "Answer B"
                                },
                                {
                                    "id": 5,
                                    "fraction": 0.2,
                                    "description": "AnswerC"
                                }
                            ],
                            "userAnswer": 3
                        },
                        {
                            "id": 3,
                            "question": "¿Esta es la pregunta 2",
                            "questionType": "True/False",
                            "answers": [
                                {
                                    "id": 6,
                                    "fraction": 1,
                                    "description": "True"
                                },
                                {
                                    "id": 7,
                                    "fraction": 0,
                                    "description": "False"
                                }
                            ],
                            "userAnswer": false
                        }
                    ]
                };

                if (!activity) {
                    $location.path('/');
                    return "";
                }

                return activity;
            }

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

            $scope.openModal = function (size) {

                if ($scope.firstTime == 1) {
                    setTimeout(function () {
                        var modalInstance = $modal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'tutorialModal.html',
                            controller: 'tutorialController',
                            size: size,
                            windowClass: 'user-help-modal'
                        });
                        console.log("modal open");
                    }, 500);
                }
            };

            $scope.openModal();

        }])
    .controller('tutorialController', function ($scope, $modalInstance) {
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });