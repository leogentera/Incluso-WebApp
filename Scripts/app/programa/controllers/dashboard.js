angular
    .module('incluso.programa.dashboard', [])
    .controller('programaDashboardController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {

            _httpFactory = $http;
            _timeout = $timeout;
            $scope.Math = window.Math;
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.stageProgress=0;

            $scope.user = moodleFactory.Services.GetCacheJson("CurrentUser");//load current user from local storage
            $scope.user.profileimageurl = $scope.user.profileimageurl + "?rnd=" + new Date().getTime();

            $scope.profile = moodleFactory.Services.GetCacheJson("profile"); //profile is not used in this page, it is only used for stars. 
            if ($scope.profile && $scope.profile.stars) {
                //the first time the user logs in to the application, the stars come from CurrentUser (authentication service)
                //the entire application updates profile.stars.  The cached version of stars should be read from profile (if it exists)
                $scope.user.stars = $scope.profile.stars;
                $scope.profile = null;   //profile is not used in this page, it is only used for stars
            }

            console.log("Scope user = " + JSON.stringify($scope.user));

            if (!_getItem("userId")) {
                $location.path('/');
                return "";
            }

            $scope.setToolbar($location.$$path,"Misión Incluso"); //set global toolbar properties
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = true; 

            try {
                //Get stage from local storage
                if(moodleFactory.Services.GetCacheObject("stage")){
                    $scope.stage = JSON.parse(moodleFactory.Services.GetCacheObject("stage"));
                }else{                
                    $scope.stage = {};
                }
            }
            catch (e) {
                console.log(e);
                $scope.$emit('HidePreloader'); //hide preloader
                $scope.$emit('scrollTop'); //- scroll
            }

            $(".navbar").removeClass("etapa-uno");
            getDataAsync();

            $scope.logout = function(){
                logout($http, $scope, $location);
            };                    
          


            $scope.navigateToStage = function(){
                //Check if first time with course
                if ($scope.usercourse.firsttime) { // 1 (true) : it is first time; 0 : it is not firsttime
                    $scope.openModal();
                    //Update firsttime value
                    $scope.updateProgramFirstTime();
                }
                //redirect user to stage 1 dashboard after closing modal
                $location.path('/ZonaDeVuelo/Dashboard/' + $scope.stage.section + '/0');
            };

            //Updates firsttime flag for program in model, localstorage and server
            $scope.updateProgramFirstTime = function() {
                //Update model
                $scope.usercourse.firsttime = 0;
                //Update local storage
                var userCourse = moodleFactory.Services.GetCacheJson("usercourse");
                if(userCourse!={}) {
                    userCourse.firsttime = 0;
                    _setLocalStorageJsonItem("usercourse",userCourse);
                }
                //Update back-end
                var dataModel = {
                    firstTime: $scope.usercourse.firsttime,
                    courseId: $scope.usercourse.courseid
                };

                moodleFactory.Services.PutAsyncFirstTimeInfo(_getItem("userId"), dataModel, function(){}, function(){});
            };

            $scope.playVideo = function(videoAddress, videoName){
                playVideo(videoAddress, videoName);
            };

            //Loads UserCourse data from server
            function getDataAsync() {
                moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), getDataAsyncCallback, errorCallback);
            }

            //Callback function for UserCourse call
            function getDataAsyncCallback(){
                //Load UserCourse structure into model
                $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));

                $scope.$emit('HidePreloader'); //hide preloader

                getUserNotifications(function() { getUserChat(); });

                //Load Course from server
                moodleFactory.Services.GetAsyncCourse($scope.usercourse.courseid, function(){
                    $scope.course = JSON.parse(localStorage.getItem("course"));
                    $scope.currentStage = getCurrentStage();                
                    _setLocalStorageItem("currentStage", $scope.currentStage);

                    moodleFactory.Services.GetAsyncLeaderboard($scope.usercourse.courseid, function(){
                        $scope.course.leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
                        $scope.$emit('HidePreloader'); //hide preloader
                        $scope.$emit('scrollTop'); //- scroll
                        moodleFactory.Services.GetAsyncProfile(_getItem("userId"), function() {}, function() {});
                    }, errorCallback);

                }, errorCallback);
                
                calculateTotalProgress();
            }
            
            function calculateTotalProgress(){
                var currentStage = 0;                
                if (currentStage != null) {
                    var usercourses = $scope.usercourse;
                    
                    var stageProgressBuffer = 0;
                    var stageTotalActivities = 0; //Attainment of user in the current Stage
                    var stageChallengesCount = usercourses.stages[currentStage].challenges.length;
        
                    var i, j,k;
                    for (i = 0; i < stageChallengesCount; i++) {
                        var challenge = usercourses.stages[currentStage].challenges[i];
                        var challengeActivitiesCount = challenge.activities.length;
                        for (j = 0; j < challengeActivitiesCount; j++) {
                            var activity = challenge.activities[j];
                            stageProgressBuffer += activity.status;
                            stageTotalActivities++;
                            /*if(activity.activities) {
                                var subActivitiesCount = activity.activities.length;
                                for (k = 0; k < subActivitiesCount; k++) {
                                    var subActivity = activity.activities[k];
                                    stageProgressBuffer += subActivity.status;
                                    stageTotalActivities++;
                                }
                            }*/
                        }
                    }
                    
                    $scope.stageProgress = Math.ceil((stageProgressBuffer  / stageTotalActivities)*100);
                }
                else {                                        
                }
            }

            function errorCallback(data){
                console.log(data);
                $scope.$emit('HidePreloader'); //hide preloader
                $scope.$emit('scrollTop'); //- scroll
            }
                                                        
            function getCurrentStage(){
                var currentStage = 1;
                
                for(var i = 0; i < $scope.usercourse.stages.length; i++) {
                    var uc = $scope.usercourse.stages[i];
                    _setLocalStorageJsonItem("stage", uc);
                    $scope.stage = uc;
                    
                    if(uc.stageStatus === 0){
                        break;
                    }

                    currentStage++;
                }

                return currentStage;
            }

            function getUserNotifications(callback){
                moodleFactory.Services.GetUserNotification(_getItem("userId"), callback, errorCallback);
            }

            function getUserChat(callback) {                
                moodleFactory.Services.GetUserChat(_getItem("userId"),function() {
                    if (callback) callback();
                    var chat = JSON.parse(localStorage.getItem('userChat'));
                    var userId = localStorage.getItem("userId");
                    
                    var chatAmount = _.countBy(chat,function(messages){
                            return messages.senderid != userId;
                        });
                                                    
                    if (chatAmount.true != localStorage.getItem('chatAmountRead')) {
                        _setLocalStorageItem('chatRead',"false");
                    }

                    _setLocalStorageItem('chatAmountRead',chatAmount.true);
                }, errorCallback, false);                
            }
            

            //Open Welcome Message modal
            $scope.openModal = function (size) {
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'programWelcome.html',
                        controller: function ($scope, $modalInstance) {
                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            };
                        },
                        size: size,
                        windowClass: 'user-help-modal dashboard-programa'
                    });
            }

            //$scope.openModal();   //To open the modal no matter the value of 'firsttime'
        }])
        .controller('videoCollapsiblePanelController', function ($scope) {
          $scope.isCollapsed = false;
        });
