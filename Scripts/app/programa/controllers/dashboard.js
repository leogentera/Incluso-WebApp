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
            $scope.Math = window.Math;
            $scope.$emit('ShowPreloader'); //show preloader

            console.log('loading user'); 
            $scope.user = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));

            if (!$scope.user.shield) {
                $scope.user.shield = "blocked";
            }
            if (!$scope.user) {
                $location.path('/');
                return "";
            }

            $rootScope.pageName = "Mision incluso"
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = true; 

            try {
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
                if ($scope.usercourse.firsttime == 1) {
                    $scope.openModal();
                    $scope.stage.firstTime = 0;
                    $scope.usercourse.firsttime = 0;

                    var dataModel = {
                        firstTime: 0,
                        courseId: $scope.usercourse.courseid
                    };

                    moodleFactory.Services.PutAsyncFirstTimeInfo(_getItem("userId"), dataModel);
                }   

                $location.path('/ProgramaDashboardEtapa/' + $scope.stage.section);
            };

            $scope.playVideo = function(videoAddress, videoName){
                playVideo(videoAddress, videoName);
            };

            function getDataAsync() {
                moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), getDataAsyncCallback, errorCallback);
            }

            function getDataAsyncCallback(){
                $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));

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
                moodleFactory.Services.GetUserChat($scope.user.id,getUserChatCallback, errorCallback);                
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

            /* open terms and conditions modal */
            $scope.openModal = function (size) {
                setTimeout(function(){
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'tutorialModal.html',
                        controller: 'tutorialController',
                        size: size,
                        windowClass: 'user-help-modal'
                    });
                    console.log("modal open");
                }, 1000);
            };
        }])
        .controller('tutorialController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        })        
        .controller('videoCollapsiblePanelController', function ($scope) {
          $scope.isCollapsed = false;
        });
