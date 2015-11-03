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
            
            var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
            var token = currentUser.token;
            var userId = moodleFactory.Services.GetCacheObject("userId");
            $scope.userId = userId;
            
            var profile = JSON.parse(localStorage.getItem("profile/" + $scope.userId));
            
            if (profile && profile.stars) {
                $scope.profileStars = profile.stars;
            }else{
                $scope.profileStars = 0;
            }
                        
            drupalFactory.Services.GetContent("MyStars", function (data, key) {
                $scope.contentResources = data.node;
                                
                var starsByActivity = moodleFactory.Services.GetAsyncStars(userId, token, function(dataStars){
                    if (dataStars.length > 0) {
                        addStarsByActivity(dataStars);
                    }                
                }, function(){
                    $scope.activitiesCompleted = [];
                    }, true);
                
            }, function () {}, true);
                                                                                                                                                   
            function addStarsByActivity(data){
                
                var starsByActivity = [];
                var points=0;
                for(var i=0; i< data.length; i++){
                    if (data[i].points != 0) {
                        var courseModuleId = data[i].instance;
                        var userCourse = JSON.parse(localStorage.getItem("usercourse"));
                        var stages = userCourse.stages;
                        for(var j=0; j < stages.length; j++){
                            var challenges = stages[j].challenges;
                            for(var k = 0; k < challenges.length ; k++){
                                var challengeName = challenges[k].activityname;
                                var activities = challenges[k].activities;
                                for(var l=0; l < activities.length; l++){
                                    var activity = activities[l];
                                    if (activity.coursemoduleid == courseModuleId){
                                        activity.sectionname = challengeName;
                                        starsByActivity.push(activity);
                                        points = points + activity.points;
                                    }
                                    else{
                                        if (activity.activities) {
                                            for(var m=0; m< activity.activities.length; m++){
                                                var subactivity = activity.activities[m];
                                                if (subactivity.coursemoduleid == courseModuleId){
                                                    subactivity.sectionname = challengeName;
                                                    subactivity.activityname = activity.activityname;
                                                    starsByActivity.push(subactivity)
                                                    points = points + subactivity.points;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                var groups = _.groupBy(starsByActivity, function(activity){
                        return activity.activityname + '#' + activity.sectionname;
                    });
                
                var groupedByActivity = _.map(groups,function(group){
                       var pointsSum = 0;
                       var lastDate = new Date('1999/01/01');
                       for(var i=0; i< group.length; i++){
                            pointsSum = pointsSum + group[i].points;
                            var activityDate = new Date(group[i].last_status_update * 1000);
                            if (lastDate < activityDate){
                                lastDate = group[i].last_status_update;
                            }
                       }
                       return {
                            activityname: group[0].activityname,
                            sectionname: group[0].sectionname,
                            points: pointsSum,
                            last_status_update: lastDate
                       }
                    });
                
                $scope.activitiesCompleted = _.sortBy(groupedByActivity, function(act){
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