angular
    .module('incluso.program.myStars', [])
    .controller('MyStarsController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"Mis estrellas");
            
            var starsByActivityQuantityInitial = 3;
            $scope.starsByActivityQuantity = starsByActivityQuantityInitial;
            
            var rewardsQuantityInitial = 3;
            $scope.rewardsQuantity = rewardsQuantityInitial;
            
            var profile = JSON.parse(localStorage.getItem("profile/" + moodleFactory.Services.GetCacheObject("userId")));
            
            var userCourse = JSON.parse(localStorage.getItem("usercourse"));
            
            var activitiesCompleted = [];
            
            for(var i = 0; i < userCourse.stages.length; i++){
                var currentStage = userCourse.stages[i];
                for(var j=0; j < currentStage.challenges.length; j++){
                    var currentChallenge = currentStage.challenges[j];
                    for(var k= 0; k < currentChallenge.activities.length; k++){
                        if (currentChallenge.activities[k].status == 1) {
                            var activity = currentChallenge.activities[k];                            
                            activitiesCompleted.push(activity);
                        }                                            
                    }                   
                }
            }
            
            $scope.activitiesCompleted = activitiesCompleted;
                        
            if (profile) {
                $scope.profileStars = profile.stars;
            }else{
                $scope.profileStars = 0;
            }
            
            $scope.rewardsEarned = _.filter(profile.rewards, function(reward){
                    return reward.status == "won";
                } );
            
            $scope.qtyStarsByAcctivity = function(){                
                return this.$index < $scope.starsByActivityQuantity;                     
            }
                        
            $scope.showMore = function(){
                $scope.starsByActivityQuantity = ($scope.starsByActivityQuantity + starsByActivityQuantityInitial);                
            }                        
            
            $scope.showLoadMoreBar = function(){               
                return !($scope.starsByActivityQuantity >= $scope.activitiesCompleted.length);                
            }
            
            $scope.qtyRewards = function(){
                return this.$index < $scope.rewardsQuantity;
                
            }
            $scope.showMoreRewards = function(){
                $scope.rewardsQuantity = ($scope.rewardsQuantity + rewardsQuantityInitial);
            }
            
            $scope.showMoreBarRewards = function(){
                return !($scope.rewardsQuantity >= $scope.rewardsEarned.length);
                
            }
            
            
            
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
            $scope.$emit('HidePreloader'); //hide preloader
}]);