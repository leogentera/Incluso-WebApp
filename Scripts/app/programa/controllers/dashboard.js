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

            console.log('loading user'); 
            $scope.user = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));//load profile from local storage

            if (!$scope.user) {
                $location.path('/');
                return "";
            }

            $scope.setToolbar($location.$$path,"Incluso"); //set global toolbar properties
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
            getUserNotifications();
            getUserChat();

            $scope.logout = function(){
                logout($http, $scope, $location);
            };

            $scope.navigateToStage = function(){
                if ($scope.usercourse.firsttime) {
                    $scope.openModal();
                    //Update firsttime value
                    $scope.updateProgramFirstTime();
                }
                //redirect user to stage 1 dashboard after closing modal
                $location.path('/ZonaDeVuelo/Dashboard/' + $scope.stage.section);
            };

            //Updates firsttime flag for program in model, localstorage and server
            $scope.updateProgramFirstTime = function() {
                //Update model
                $scope.usercourse.firsttime = 0;
                //Update local storage
                var userCourse = moodleFactory.Services.GetCacheJson("usercourse");
                if(userCourse!={}) {
                    userCourse.firsttime = 0;
                    localStorage.setItem("usercourse",JSON.stringify(userCourse));
                }
                //Update back-end
                var dataModel = {
                    firstTime: $scope.usercourse.firsttime,
                    courseId: $scope.usercourse.courseid
                };

                moodleFactory.Services.PutAsyncFirstTimeInfo(_getItem("userId"), dataModel,function(){},function(){});
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
                //Load Course from server
                moodleFactory.Services.GetAsyncCourse($scope.usercourse.courseid, function(){
                    $scope.course = JSON.parse(localStorage.getItem("course"));
                    $scope.currentStage = getCurrentStage();                
                    localStorage.setItem("currentStage", $scope.currentStage);

                    moodleFactory.Services.GetAsyncLeaderboard($scope.usercourse.courseid, function(){
                        $scope.course.leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
                        $scope.$emit('HidePreloader'); //hide preloader
                        $scope.$emit('scrollTop'); //- scroll
                    }, errorCallback);

                }, errorCallback);
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
                    localStorage.setItem("stage", JSON.stringify(uc));
                    $scope.stage = uc;
                    
                    if(uc.stageStatus === 0){
                        break;
                    }

                    currentStage++;
                }

                return currentStage;
            }

            function getUserNotifications(){
                moodleFactory.Services.GetUserNotification($scope.user.id, getUserNotificationsCallback, errorCallback);
            }

            function getUserNotificationsCallback(){
                var notifications = JSON.parse(localStorage.getItem("notifications"));
            }            

            function getUserChat() {                
                moodleFactory.Services.GetUserChat($scope.user.id,getUserChatCallback, errorCallback, true);                
            }
            
            function getUserChatCallback() {
                var chat = JSON.parse(localStorage.getItem('userChat'));
                var userId = localStorage.getItem("userId");
                
                var chatAmount = _.countBy(chat,function(messages){
                        return messages.senderid != userId;
                    });
                                                
                if (chatAmount.true != localStorage.getItem('chatAmountRead')) {
                    localStorage.setItem('chatRead',"false");
                }

                localStorage.setItem('chatAmountRead',chatAmount.true);
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
            };
        }])
        .controller('videoCollapsiblePanelController', function ($scope) {
          $scope.isCollapsed = false;
        });
