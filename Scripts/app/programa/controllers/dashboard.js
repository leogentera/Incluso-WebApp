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

            console.log('loading usercourse');
            $scope.usercourse = JSON.parse(moodleFactory.Services.GetCacheObject("usercourse"));
            console.log('loading course');
            $scope.course = JSON.parse(moodleFactory.Services.GetCacheObject("course"));
            console.log('loading currentStage');
            $scope.currentStage = JSON.parse(moodleFactory.Services.GetCacheObject("currentStage"));
            console.log('loading stage');

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

            $scope.logout = function(){
                logout($http, $scope, $location);
            };

            $scope.navigateToStage = function(){
                localStorage.setItem("firstTimeStage",0);
                $scope.openModal();
                $location.path('/ProgramaDashboardEtapa/' + $scope.stage.id);
            };
            
             $scope.playWelcome = function(){                 
                 var videoAddress = "assets/media";
                 var videoName = "480x270.mp4";
                cordova.exec(Success, Failure, "CallToAndroid", "PlayLocalVideo", [videoAddress,videoName]);
            };
            
            function Success() {
                
            }
            
            function Failure() {
                
            }
            

            //$scope.navigateTo = function(url){
              //  $location.path(url);
            //};

            function getDataAsync() {
                moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), getDataAsyncCallback, errorCallback);
            }

            function getDataAsyncCallback(){
                $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));

                moodleFactory.Services.GetAsyncCourse($scope.usercourse.courseId, function(){
                    $scope.course = JSON.parse(localStorage.getItem("course"));
                    $scope.currentStage = getCurrentStage();                
                    localStorage.setItem("currentStage", $scope.currentStage);
                    $scope.$emit('HidePreloader'); //hide preloader
                    $scope.$emit('scrollTop'); //- scroll
                }, errorCallback);
            }

            function errorCallback(data){
                console.log(data);
                $scope.$emit('HidePreloader'); //hide preloader
                $scope.$emit('scrollTop'); //- scroll
            }
                                                        
            function getCurrentStage(){
                var currentStage = 1;
                
                for(var i = 0; i < $scope.usercourse.stages.length; i++){
                    var uc = $scope.usercourse.stages[i];
                    
                    localStorage.setItem("stage", JSON.stringify(uc));
                    $scope.stage = uc;
                    var firstTimeStage = localStorage.getItem("firstTimeStage");
                    if (firstTimeStage == 0) {
                        $scope.stage.firstTime = 0;
                    }
                    
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
            
            
            function getUserNotificationsCallback(data){                
                var notifications = JSON.parse(localStorage.getItem("notifications"));                

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
