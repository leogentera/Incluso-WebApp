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

            //debugger;            

            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false; 

            //$scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader
            
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
                }

                if (!activity) {
                    $location.path('/');
                    return "";
                }                

                return activity;
            }         
            
            $scope.firstTime = 0;

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
            
            $scope.openModal = function (size) {
                setTimeout(function(){ 
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'tutorialModal.html',
                        controller: 'tutorialController',
                        size: size,
                        windowClass: 'user-help-modal'
                    });
                    console.log("modal open");
                }, 1000);
            };
            
            $scope.openModal();

        }])
        .controller('tutorialController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });