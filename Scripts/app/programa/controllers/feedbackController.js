angular
    .module('incluso.programa.feedbackcontroller', [])   
    .controller('programafeedbackcontroller', [
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
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.currentPage = 1;
            $scope.location = "";
            $scope.messageProfile = "";
            var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
            $scope.user = currentUser.alias;
            $scope.profile = JSON.parse(localStorage.getItem("Perfil/" + currentUser.userId));
            $scope.activity = getActivityByActivity_identifier($routeParams.activityId);
            $scope.like_status = 1;
            $scope.closingContentname = "RetroalimentacionClosing";
            $scope.startingTime = moment().format('YYYY:MM:DD HH:mm:ss');
            var misGustosActivityId = 70;
            var retoMultipleActivityId = 139;
            var tuEligesActivityIdentifier = 2012;
            var multiplicaTuDineroActivityIdentifier = 3302;
            
            switch ($routeParams.activityId) {
                case "1002":
                    $scope.location = '/ZonaDeVuelo/Dashboard/1/5';
                    $rootScope.showStage1Footer = true;
                    break;
                case "2022":
                    $scope.location = 'ZonaDeNavegacion/Dashboard/2/7';
                    $rootScope.showStage2Footer = true;
                    break;
                case "3501":
                    $scope.location = "ZonaDeAterrizaje/Dashboard/3/6";
                    $rootScope.showStage3Footer = true; 
                    break;
            }
            
            var profileCatalogs = JSON.parse(localStorage.getItem("profileCatalogs"));
            var perfilIncluso = profileCatalogs.messages || [];
            
                        
            function getProfile() {
                var profileId = 0;
                var currentStage = localStorage.getItem("currentStage");
                
                var assertiveness = "-1";//Default null value
                var financialAbility = "-1";//Default null value
                
                var tuEligesActivity = getActivityByActivity_identifier(tuEligesActivityIdentifier);
                var multiplicaTuDineroActivity = getActivityByActivity_identifier(multiplicaTuDineroActivityIdentifier);
                
                if (tuEligesActivity && tuEligesActivity.status != 0) {
                    assertiveness = $scope.profile.assertiveness == true ? "1" : "0";
                }
                if (multiplicaTuDineroActivity && multiplicaTuDineroActivity.status != 0) {
                    financialAbility = $scope.profile.financialAbility == true ? "1" : "0";
                }
                
                if (!$scope.profile.inclusoprofile) {
                    var profilePoints = JSON.parse(localStorage.getItem("profilePoints"));
                    
                    profileId = getMaxProfile(profilePoints);
                    
                    $scope.profile.inclusoprofile =  _.findWhere(profileCatalogs.profiles, { id: profileId}).profilename;
                    
                    moodleFactory.Services.PutAsyncProfile(currentUser.id, $scope.profile, function (data) {},function (data) {});

                }else{
                    profileId = _.findWhere(profileCatalogs.profiles, { profilename: $scope.profile.inclusoprofile}).id;
                }
                                
                var possibleMessages = _.where(perfilIncluso, {profileid: profileId, assertive : assertiveness, financialability: financialAbility });
                var randomNum = _.random(0, possibleMessages.length - 1);
                $scope.messageProfile = possibleMessages[randomNum];

                if ($scope.messageProfile.description.indexOf("@nombre") > -1){
                    var name = $scope.profile.firstname;
                    $scope.messageProfile.description = $scope.messageProfile.description.replace("@nombre", name);
                }
                
                if ($scope.messageProfile.description.indexOf("@inteligencia-escudo") > -1){
                    var shield = $scope.profile.shield;
                    $scope.messageProfile.description =  $scope.messageProfile.description.replace("@inteligencia-escudo", shield);
                }

            }
            
            function getMaxProfile(profilePoints) {
                // Gets the score by profile
                var profiles = copyProfile(profileCatalogs.profiles);
                for(var i = 0 ; i < profilePoints.length; i++){
                    var currentProfileActivity = profilePoints[i];
                    for(var j = 0; j < profiles.length; j++) {
                        profiles[j].score = profiles[j].score != undefined ? profiles[j].score : 0;
                        if (profiles[j].id == currentProfileActivity.profileid) {
                            profiles[j].score += currentProfileActivity.score;
                        }
                    };
                };
                
                //gets the profile with highest score
                var maxProfile = _.max(profiles, function(profile){ return profile.score; });
                
                //evaluates if another profile has the maximum score also
                var tiedProfiles = _.filter(profiles, function(item){ return item.score == maxProfile.score; });


                if (tiedProfiles.length >= 4) { 
                    //If there are more than 4 profiles in draw sets Generic profile to it
                    return _.where(profiles, { profilename : "Generico"}).id;
                }else if (tiedProfiles.length > 1) {

                    //Gets an array of the score obtained in the activity Mis Gustos
                    var misGustosActivities = _.filter(profilePoints,function(item){
                        for(var i = 0; i < tiedProfiles.length; i++){
                            var profileTied = tiedProfiles[i];
                            if (profileTied.id == item.profileid) {
                                return item.moduleid == misGustosActivityId;
                            }
                        };
                    });

                    //Fills profiles with the score obtained in misGustosActivities
                    var misGustosProfiles = copyProfile( profileCatalogs.profiles);
                    for(var i=0; i < misGustosActivities.length; i++){
                        var misGustosActivity = misGustosActivities[i];                        
                        for(var j=0; j < misGustosProfiles.length; j++){
                            misGustosProfiles[j].score = misGustosProfiles[j].score != undefined ? misGustosProfiles[j].score : 0;
                            if(misGustosActivities[i].profileid == misGustosProfiles[j].id){
                                misGustosProfiles[j].score += misGustosActivities[i].score;
                            }  
                        };
                    };
                    
                    //Gets the profile with the highest score from misGustosProfiles
                    var maxMisGustos = _.max(misGustosProfiles,function(item){ return item.score; });
                    //Evaluates if there are more than one profile with the same highest score of maxMisGustos
                    var tiedMisGustos = _.filter(misGustosProfiles, function(item){ return item.score == maxMisGustos.score; }); 
                
                    //If there is a tie in Mis Gustos Profiles goes to reto Multiple Activities
                    if (tiedMisGustos.length > 1) {
                        var retoMultipleActivities = _.filter(profilePoints, function(item){
                            for(var i = 0; i < misGustosActivities.length; i++){
                                var misGustosActivity = misGustosActivities[i];
                                if (misGustosActivity.profileid == item.profileid) { return item.moduleid == retoMultipleActivityId; }
                            };
                        });
                        
                        //Fill profiles with the score obtained in retoMultipleActivities
                        var retoMultipleProfiles = profileCatalogs.profiles;
                        for(var i= 0; i < retoMultipleProfiles.length; i++){
                            retoMultipleProfiles[i].score = retoMultipleProfiles[i].score || 0;
                            for(j=0;j < retoMultipleActivities.length;j++){
                                if(retoMultipleActivities[j].profileid == retoMultipleProfiles[i].id){
                                    retoMultipleProfiles[i].score += retoMultipleActivities[j].score; }    
                            };
                        };
                        //Gets the profile with the highest score from retoMultipleProfiles
                        var maxRetoMultiple = _.max(retoMultipleProfiles,function(item){ return  item.score; });
                        //Evaluates if there are more than one profile with the same score of maxRetoMultiple
                        var tiedRetoMultiple = _.filter(retoMultipleProfiles,function(item){ return item.score == maxRetoMultiple.score});
                        //If there is a tie in retoMultiple then gets a returns a random profile from tiedRetoMultiple
                        if (tiedRetoMultiple.length > 1) {
                            var randomIndex = _.random(0, tiedRetoMultiple.length - 1);
                            return tiedRetoMultiple[randomIndex].id;
                        }else{
                            return maxRetoMultiple.id;
                        }
                    }else{
                        return maxMisGustos.id;
                    }
                }else{
                    return maxProfile.id;
                }
            }
            
            //Returns a copy by Val of the Profile object
            function copyProfile(profile) {
                var arrayOfProfiles = [];
                for(var i = 0; i < profile.length; i++){
                    var profileCopied =  $.extend(true, {}, profile[i]);
                    arrayOfProfiles.push(profileCopied);
                }
                return arrayOfProfiles;
            }
            
            
            function initialLoading() {
                // $scope.showRobot();
                $scope.$emit('HidePreloader');
                getContentAsync()
                getProfile();
            };
            
            
            function getContentAsync() {
                
                drupalFactory.Services.GetContent($scope.closingContentname, function (data, key) {
                        _loadedResources = true;
                        $scope.closingContent = data.node;
                    },
                        function () {
                        },
                            false);
            };
            
            
            $scope.continueActivity = function(){
                if ($scope.activity.status == 1) {
                    $location.path($scope.location);
                }else{
                    $scope.currentPage = 2;//Redirect to finish activity page;
                }
                
            }
            
            $scope.finishActivity = function(){
                
                var endTime = moment().format('YYYY:MM:DD HH:mm:ss');
                
                var activityModel = {
                    like_status : $scope.like_status ,
                    dateStart : $scope.startingTime,
                    dateEnd : endTime,
                    coursemoduleid : $scope.activity.coursemoduleid
                };
                
                _endActivity(activityModel,function(data){
                    var updatedActivityOnUserCourse = updateActivityStatus($scope.activity.activity_identifier);
                    //Update local storage and activities status array
                    _setLocalStorageJsonItem("usercourse", updatedActivityOnUserCourse);
                });
                $location.path($scope.location);
            };
            
        initialLoading();
        
        }
    ]);