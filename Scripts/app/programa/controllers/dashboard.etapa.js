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
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http) {
            /* $routeParams.stageId */
            _httpFactory = $http;

            $scope.Math = window.Math;

            getDataAsync();

            function getDataAsync() {
                $scope.model = getModel();
            }

            function getModel(){
                var currentStage = getCurrentStage();
                var currentUserStage = getCurrentUserStage();
                var challenges = getChallenges(currentStage, currentUserStage);

                return {
                    Name: currentStage.Name,
                    Description: currentStage.Description,
                    StageProgress: currentUserStage.stageProgress,
                    Challenges: challenges
                };
            }

            function getChallenges(stage, currentUserStage){

                var challenges = new Array();

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
console.log(challenges);
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
                    if(usercourse.stages[i].stageId == $routeParams.stageId){
                        stage = usercourse.stages[i];
                        break;
                    }
                }

                return stage;
            }

        }]);
