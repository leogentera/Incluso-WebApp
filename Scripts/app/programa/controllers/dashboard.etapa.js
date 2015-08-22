angular
    .module('incluso.programa.dashboard.etapa', [])
    .controller('programaEtapaController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
		'$timeout',
		'$rootScope',
		'$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            /* $routeParams.stageId */
            _httpFactory = $http;

            $scope.Math = window.Math;
            $rootScope.pageName = "Estación: Conócete";
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

            function getDataAsync() {
                $scope.model = getModel();
            }

            function getModel(){
                var currentStage = getCurrentStage();
                var currentUserStage = getCurrentUserStage();

                console.log("# of challengues:" + currentUserStage.challenges.length);

                return {
                    Name: currentStage.Name,
                    Description: currentUserStage.name,
                    StageProgress: currentUserStage.stageProgress,
                    Challenges: currentUserStage.challenges
                };
            }

            $(".navbar").addClass("etapa-uno");
            getDataAsync();

            function getChallenges(stage, currentUserStage){

                var challenges = new Array();
                if(currentUserStage.activities){
                    for(ua = 0; ua < currentUserStage.activities.length; ua++){

                        var challenge = currentUserStage.activities[ua];

                        for(ci = 0; ci < stage.challenges.length; ci++){

                            var challengeInformation = stage.challenges[ci];

                            if(challenge.activityId === challengeInformation.id){

                                challenges.push({
                                    Id: challenge.id,
                                    Name: challengeInformation.name,
                                    Description: challengeInformation.description,
                                    Passed: status === 1,
                                    Image: challengeInformation.image
                                });

                                break;
                            }
                        }
                    }
                }

                return challenges;
            }

            function getCurrentStage(){

                var stage = {};

                var course = JSON.parse(localStorage.getItem("course"));

                for(var i = 0; i < course.stages.length; i++){
                    if(course.stages[i].id == $routeParams.stageId){
                        stage = course.stages[i];
                        break;
                    }
                }

                return stage;
            }

            function getCurrentUserStage(){

                var stage = {};

                var usercourse = JSON.parse(localStorage.getItem("usercourse"));

                for(var i = 0; i < usercourse.stages.length; i++){
                    if(usercourse.stages[i].id == $routeParams.stageId){
                        stage = usercourse.stages[i];
                        break;
                    }
                }

                return stage;
            }
            
            $scope.playVideo = function(videoAddress, videoName){                 
                 //var videoAddress = "assets/media";
                 //var videoName = "TutorialTest2.mp4";
                playVideo(videoAddress, videoName);
            };

            $scope.openClosingStageModal = function (size) {
                console.log("opening");
                //setTimeout(function(){ 
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'ClosingStage.html',
                        controller: 'closingStageController',
                        size: size,
                        windowClass: 'closing-stage-modal user-help-modal'
                    });
                    console.log("modal open closing");
                //}, 1000);
            };

        }])
        .controller('closingStageController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });
