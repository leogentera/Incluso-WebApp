angular
    .module('incluso.stage.chatcontroller', [])
    .controller('stageChatController', [
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
            _timeout = $timeout;
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = false; 
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;            
            var userCourse = JSON.parse(localStorage.getItem("usercourse"));
            $scope.model = userCourse;
            $scope.like_status = 1;
            $rootScope.showFooterRocks = false;             
            var finishCabinaSoporte = localStorage.getItem('finishCabinaSoporte');
            $scope.idEtapa = 0;
            $scope.scrollToTop();            
            $scope.currentPage = 1;
            var index = 0;
            var parentIndex = 4;                           
            var coursemoduleid = parseInt($routeParams.moodleid);
            var currentChallenge = 0;
            var currentStage;
            switch(coursemoduleid){
                case 1002:
                    currentChallenge = 4;
                    currentStage = "ZonaDeVuelo";
                    break;
                case 2022:
                    currentChallenge = 5;
                    currentStage = "ZonaDeNavegacion";
                    break;
                case 3501:
                    currentChallenge = 5;
                    currentStage = "ZonaDeAterrizaje";
                    break;

            }
            var treeActivity = getActivityByActivity_identifier(coursemoduleid, userCourse);

            $scope.goChat = function () {
                $location.path('/Chat');
            };
            if(finishCabinaSoporte && treeActivity.status != 1){
               $scope.navigateToPage(2);
               $scope.$emit('HidePreloader');            
            }                            

            if(treeActivity.status == 1){   
                $location.path('/Chat'); 
            }            
            

            $scope.finishActivity = function () {
                $scope.$emit('ShowPreloader'); //show preloader
                if(!treeActivity.status){
                var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                var like_status = $scope.like_status;

                var data = {
                    userid: currentUser.userId,
                    like_status: like_status
                };

                // Update activity in usercourse
                treeActivity.status = 1;

                moodleFactory.Services.PutEndActivity(treeActivity.coursemoduleid, data, treeActivity, currentUser.token, function () {
                    _setLocalStorageJsonItem('usercourse', $scope.model);
                    var profile = JSON.parse(localStorage.getItem("profile/" + moodleFactory.Services.GetCacheObject("userId")));
                    var model = {
                        userId: currentUser.userId,
                        stars: $scope.activityPoints,
                        instance: treeActivity.coursemoduleid,
                        instanceType: 0,
                        date: new Date()
                    };

                    profile.stars = parseInt(profile.stars) + treeActivity.points;
                    moodleFactory.Services.PutStars(model, profile, currentUser.token, successfullCallBack, errorCallback);                    
                }, function(){
                    $scope.$emit('HidePreloader'); //hide preloader  
                });
                }
            };
                
            function successfullCallBack(){
                //trigger activity type 2 is sent when the activity ends.
                var triggerActivity = 2;   

                //create notification
                _createNotification(treeActivity.coursemoduleid, triggerActivity);
                //complete stage                
                _updateBadgeStatus(treeActivity.coursemoduleid);
                
                _updateRewardStatus();
                // update activity status dictionary used for blocking activity links
                updateActivityStatusDictionary(treeActivity.activity_identifier);
                
                localStorage.removeItem("finishCabinaSoporte");

                $scope.$emit('HidePreloader'); //hide preloader  
                var userCurrentStage = localStorage.getItem("currentStage");

                $location.path('/'+ currentStage +'/Dashboard/' + userCurrentStage + '/' + currentChallenge); 
                
            }

            function errorCallback(){
                $scope.$emit('HidePreloader'); //hide preloader  
            }    

            function getdate(){
              var currentdate = new Date(); 
              var datetime = currentdate.getFullYear() + ":"
                + addZeroBefore((currentdate.getMonth()+1))  + ":" 
                + addZeroBefore(currentdate.getDate()) + " "  
                + addZeroBefore(currentdate.getHours()) + ":"  
                + addZeroBefore(currentdate.getMinutes()) + ":" 
                + addZeroBefore(currentdate.getSeconds());
                return datetime;
            }

            function addZeroBefore(n) {
              return (n < 10 ? '0' : '') + n;
            }
        }]);