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

            function getCurrentStageId() {
                var currentStageId = null;
                
                if ($scope.usercourse != null) {
                    for (var index = 0; index < $scope.usercourse.stages.length; ++index) {
                        if($scope.usercourse.stages[index].id == $scope.stage.id )
                        {
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

            $scope.navigateToStage = function () {
                $scope.usercourse.stages[$scope.currentStageId].firstTime = 0;                
                var borrame = JSON.parse(localStorage.getItem("usercourse"));    
                localStorage.setItem("usercourse",JSON.stringify($scope.usercourse));
                var borrame2 =  JSON.parse(localStorage.getItem("usercourse"));                    
                $location.path('/ProgramaDashboardEtapa/' + $scope.stage.id);
            };

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
                
               if($scope.firstTime == 1){
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