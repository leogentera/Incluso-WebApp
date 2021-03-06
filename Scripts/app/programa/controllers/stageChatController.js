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
            var _loadedResources = false;
            var _pageLoaded = true;
            _timeout = $timeout;
            $scope.$emit('ShowPreloader');
            $scope.validateConnection(initController, offlineCallback);
            
            function offlineCallback() {
                $timeout(function() { $location.path("/Offline"); }, 1000);
            }
            
            function initController() {
                
                getContentResources($routeParams.moodleid);
                $rootScope.showFooter = false;
                $rootScope.showFooterRocks = false;
                $rootScope.showStage1Footer = false;
                $rootScope.showStage2Footer = false;
                $rootScope.showStage3Footer = false;            
                var userCourse = JSON.parse(localStorage.getItem("usercourse"));
                $scope.model = userCourse;
                $scope.like_status = 1;
                $rootScope.showFooterRocks = false;
                var userId = localStorage.getItem('userId');
                var finishCabinaSoporte = localStorage.getItem("finishCabinaSoporte/" + userId);
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
                
                $scope.activityPoints = treeActivity.points;
    
                $scope.goChat = function () {
                    $location.path('/Chat');
                };
                if(finishCabinaSoporte && treeActivity.status != 1){
                   $scope.currentPage = 2;
                   $scope.$emit('HidePreloader');            
                }                            
    
                if(treeActivity.status == 1){   
                    $location.path('/Chat'); 
                }            
                
    
                $scope.finishActivity = function () {
                    
                    $scope.validateConnection(function() {
                    
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
                        treeActivity.last_status_update =  moment(Date.now()).unix();
                        localStorage.removeItem("finishCabinaSoporte/" + currentUser.id);
                        
                        for(var i =0; i< $scope.model.stages.length; i++){
                            var stage = $scope.model.stages[i];
                            for(var j=0;j < stage.challenges.length; j++){
                                var challenge = stage.challenges[j];
                                for(var k=0; k < challenge.activities.length;k++){
                                    var activity = challenge.activities[k];
                                    if (activity.coursemoduleid == treeActivity.coursemoduleid){
                                        activity = treeActivity;
                                    }
                                }
                            }
                        }
                                                                    
                        moodleFactory.Services.PutEndActivity(treeActivity.coursemoduleid, data, treeActivity, currentUser.token, function () {
                            _setLocalStorageJsonItem('usercourse', $scope.model);
                            var profile = JSON.parse(localStorage.getItem("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));
                            var model = {
                                userId: currentUser.userId,
                                stars: $scope.activityPoints,
                                instance: treeActivity.coursemoduleid,
                                instanceType: 0,
                                date: getdate()
                            };
                                   
                            updateLocalStorageStars(model);
                            profile.stars = parseInt(profile.stars) + treeActivity.points;
                            moodleFactory.Services.PutStars(model, profile, currentUser.token, successfullCallBack, errorCallback, true);
                        }, function(){
                            $scope.$emit('HidePreloader'); //hide preloader  
                        });
                        }
                    
                    }, offlineCallback);
                    
                };
                
                
                function updateLocalStorageStars(data) {
                        console.log("updatelocalStorageStars");
                        console.log(data);
                        var userStars = JSON.parse(localStorage.getItem("userStars"));
                                          
                        var localStorageStarsData = {
                            dateissued: moment(Date.now()).unix(),
                            instance: data.instance,
                            instance_type: data.instanceType,
                            message: "",
                            is_extra: false,
                            points: data.stars,
                            userid: parseInt(data.userId)
                        };

                        userStars.push(localStorageStarsData);

                        localStorage.setItem("userStars", JSON.stringify(userStars));
                }
                    
                function successfullCallBack(){
                    //trigger activity type 2 is sent when the activity ends.
                    var triggerActivity = 2;   
    
                    //create notification                    
                    _activityNotification(treeActivity.coursemoduleid, triggerActivity);
                    //complete stage                
    
                    _updateBadgeStatus(treeActivity.coursemoduleid);
                    
                    _updateRewardStatus();
                    // update activity status dictionary used for blocking activity links
                    updateActivityStatusDictionary(treeActivity.activity_identifier);
    
                    $scope.$emit('HidePreloader'); //hide preloader  
                    var userCurrentStage = localStorage.getItem("currentStage");
                    
                    localStorage.removeItem("finishCabinaSoporte/" + userId);
                    localStorage.removeItem("startedActivityCabinaDeSoporte/" + userId);   
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
    
                function getContentResources(activityIdentifierId) {
                    drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                        _loadedResources = true;
                        $scope.setToolbar($location.$$path,data.node.tool_bar_title);
                        $scope.title = data.node.chat_title;
                        $scope.welcome = data.node.chat_welcome ;
                        $scope.description = data.node.chat_instructions ;
                        if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
    
                    }, function () { _loadedResources = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); } }, false);
    
                    var stageClosingContent = "";
                    if(activityIdentifierId > 999 && activityIdentifierId < 2000)
                        stageClosingContent = "ZonaDeVueloClosing";
                    else if(activityIdentifierId > 1999 && activityIdentifierId < 3000)
                        stageClosingContent = "ZonaDeNavegacionClosing";
                    else
                        stageClosingContent = "ZonaDeAterrizajeClosing";
    
                    drupalFactory.Services.GetContent(stageClosingContent, function (data, key) {
                        _loadedResources = true;
                        $scope.closingContent = data.node;
                    }, function () { _loadedResources = true; }, false);
                }
                
            }

        }]);