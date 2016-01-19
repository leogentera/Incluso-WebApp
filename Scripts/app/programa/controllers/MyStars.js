var myStarsModule = angular.module('incluso.program.myStars', []);

myStarsModule.controller('MyStarsController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            var _loadedResources = false;
            var _pageLoaded = false;
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
            
            var profile = JSON.parse(localStorage.getItem("Perfil/" + $scope.userId));
            
            if (profile && profile.stars) {
                $scope.profileStars = profile.stars;
            }else{
                $scope.profileStars = 0;
            }
                        
            drupalFactory.Services.GetContent("MyStars", function (data, key) {
                _loadedResources = true;
                $scope.contentResources = data.node;
                                
                var starsFromLocalStorage = JSON.parse(localStorage.getItem("userStars"));

                if(starsFromLocalStorage)
                {
                    addStarsByActivity(starsFromLocalStorage);                
                }
                else
                {
                    moodleFactory.Services.GetAsyncStars(userId, token, function(dataStars){
                        if (dataStars.length > 0) {
                            addStarsByActivity(dataStars);
                        }
                    }, function(){$scope.activitiesCompleted = [];}, true);
                }
                
                if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
                
            }, function () {
                
                _loadedResources = true;
                if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
                }, false);
                                                                                                                                                   
            function addStarsByActivity(data){
                
                var starsByActivity = [];
                var points=0;
                for(var i=0; i< data.length; i++){
                    if (data[i].points != 0) {
                        var courseModuleId = data[i].instance;
                        var extra = data[i].is_extra;
                        var userCourse = JSON.parse(localStorage.getItem("usercourse"));
                        
                        if (userCourse && userCourse.activities) {
                            for(var p = 0; p < userCourse.activities.length; p++){
                                var profileActivity = userCourse.activities[p];
                                if (profileActivity.coursemoduleid == courseModuleId && profileActivity.status == 1) {
                                    profileActivity.sectionname = "Perfil " ;
                                    console.log(profileActivity);
                                    starsByActivity.push(profileActivity);
                                }                                
                            }
                        }
                        
                        var stages = userCourse.stages;                                            
                        for(var j=0; j < stages.length; j++){
                            var challenges = stages[j].challenges;
                            var stageName = stages[j].sectionname;
                            for(var k = 0; k < challenges.length ; k++){
                                var challengeName = challenges[k].activityname;
                                var activities = challenges[k].activities;
                                for(var l=0; l < activities.length; l++){
                                    var activity = activities[l];
                                    if (activity.coursemoduleid == courseModuleId){
                                        if (extra) {                                              
                                            activity.activityname = "Puntos extra " + activity.activityname;
                                            activity.points = data[i].points;
                                        }
                                        activity.sectionname = stageName + " - " + challengeName;
                                        starsByActivity.push(activity);
                                        points = points + activity.points;
                                    }
                                    else{
                                        if (activity.activities) {
                                            var extraCounter = 0;
                                            for(var m=0; m < activity.activities.length; m++){
                                                var subactivity = activity.activities[m];
                                                var extraPointsName = activity.activityname;
                                                                                             
                                                //var extraPointsName = extra ? "Puntos extra " + activity.activityname + idSubactivity : activity.activityname ;
                                                if (subactivity.coursemoduleid == courseModuleId){
                                                    if(extra){                                                        
                                                        extraPointsName = "Puntos extra " + activity.activityname;
                                                    }
                                                    
                                                    subactivity.sectionname = stageName + " - " + challengeName;
                                                    subactivity.activityname = extraPointsName;
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
                        if (!activity.activityname.indexOf("Puntos extra") > -1  ) {
                            return activity.activityname + '#' + activity.sectionname;
                        }
                    });
                
                var groupedByActivity = _.map(groups,function(group){                    
                       var pointsSum = 0;                    
                       var lastDate = new Date('1999/01/01');
                       var unixLastDate = moment(lastDate).unix();
                       for(var i=0; i< group.length; i++){
                            pointsSum = pointsSum + group[i].points;
                            var activityDate = Number(group[i].last_status_update);
                            if (unixLastDate < activityDate){
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
            
            _pageLoaded = true;
            if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader')};

}]);

myStarsModule.filter('Capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});
