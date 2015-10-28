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
            
            $scope.activitiesCompleted = "";
            var starsByActivityQuantityInitial = 3;
            $scope.starsByActivityQuantity = starsByActivityQuantityInitial;
            
            var rewardsQuantityInitial = 3;
            $scope.rewardsQuantity = rewardsQuantityInitial;
            
            var userId = moodleFactory.Services.GetCacheObject("userId");
            $scope.userId = userId;
            
             var profile = JSON.parse(localStorage.getItem("profile/" + $scope.userId));
                    
            if (profile && profile.stars) {
                $scope.profileStars = profile.stars;
            }else{
                $scope.profileStars = 0;
            }              
                                       
            var starsByActivity = moodleFactory.Services.GetAsyncStars(userId, function(data){
                    if (data.length > 0) {
                        addStarsByActivity(data);
                    }                
                }, function(){
                    $scope.activitiesCompleted = [];
                    }, true);
            
            function addStarsByActivity(data){
                
                var starsByActivity = [];                
                for(var i=0; i < data.length; i++){
                    console.log(data[i]);
                    if (data[i].points != 0) {
                        var courseModuleId = data[i].instance;                        
                        var activityManagers = JSON.parse(localStorage.getItem("activityManagers"));                       
                        for(j = 0; j < activityManagers.length; j++){                        
                            for(k=0; k < activityManagers[j].activities.length; k++){
                                if (activityManagers[j].activities[k].coursemoduleid == courseModuleId) {                                    
                                    starsByActivity.push(activityManagers[j].activities[k]);
                                }
                            }                            
                        }
                    }       
                }
                                
                $scope.activitiesCompleted = _.sortBy(starsByActivity, function(act){
                    return act.last_status_update;
                });
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
            
             $scope.showRewardDetail = function (rewardId) {                
                $scope.navigateTo('/RewardDetail/' + rewardId, 'null');
            }
                                
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false; 
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
            
            $scope.$emit('HidePreloader'); //hide preloader
}]);