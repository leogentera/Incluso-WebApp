angular
    .module('incluso.stage.dashboardcontroller2', [])
    .controller('stage2DashboardController', [
       '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        '$filter',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $filter) {
            var _loadedResources = false;
            var _pageLoaded = false;
            /* $routeParams.stageId */
            _timeout = $timeout;
            _httpFactory = $http;
            $scope.Math = window.Math;
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.model = JSON.parse(localStorage.getItem("usercourse"));
            $scope.resetActivityBlockedStatus();//Copies last version of activity blocked status into model variable
            $scope.setToolbar($location.$$path,"");
            
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = true;
            $rootScope.showStage3Footer = false;
            //$rootScope.linksStage2Footer = true;
            $scope.scrollToTop();

            $scope.activitiesCompletedInCurrentStage = [];
            $scope.isCollapsed = false;
            $scope.idEtapa = $routeParams['stageId'] - 1; //We are in stage stageId, taken from URL
            $scope.idReto = $routeParams['challenge'];
            $scope.thisStage = $scope.model.stages[$scope.idEtapa];
            $scope.nombreEtapaActual = $scope.thisStage.sectionname;
            _setLocalStorageItem("userCurrentStage", $routeParams['stageId']);
            
            var activity_identifier = "2000";
            getContentResources(activity_identifier);

            setTimeout(function () {
                var hits = 1;

                //Carrusel de retos
                var owl2 = $("#owl-demo2");

                owl2.owlCarousel({
                    navigation: false,
                    pagination: false,
                    //paginationSpeed: 1000,
                    goToFirstSpeed: 2000,
                    singleItem: true,
                    autoHeight: true,
                    touchDrag:true,
                    mouseDrag:false,
                    transitionStyle:"fade",
                    afterMove: callback1
                });

                //Carrusel de Actividades
                var owl = $("#owl-demo");

                owl.owlCarousel({
                    navigation: false,
                    pagination: false,
                    //paginationSpeed: 1000,
                    goToFirstSpeed: 2000,
                    singleItem: true,
                    autoHeight: true,
                    touchDrag:true,
                    mouseDrag:false,
                    transitionStyle:"fade",
                    afterMove: callback2
                });

                this.currentItem = $scope.idReto;
                var currentItem;
                owl.trigger("owl.goTo", $scope.idReto);
                $("span#index").text(($scope.idReto+1));

                owl2.trigger("owl.goTo", $scope.idReto);
                $("span#index").text(($scope.idReto+1));

                function callback1(event) {
                    var item = this.currentItem;
                    currentItem = parseInt(this.owl.currentItem);
                    owl2.trigger("owl.goTo", item);
                    owl.trigger("owl.goTo", item);
                    $("span#index").text((item + 1));
                }
                function callback2(event) {
                    item = this.currentItem;
                    owl.trigger("owl.goTo", item);
                    owl2.trigger("owl.goTo", item);
                    $("span#index").text((item + 1));
                }

                $("#prev").click(function (ev) {
                    if(currentItem){
                        owl.trigger('owl.goTo', currentItem - 1);
                        owl2.trigger('owl.goTo', currentItem - 1);
                    }
                    else{
                        owl.trigger('owl.prev');
                        owl2.trigger('owl.prev');
                    }
                    ev.preventDefault();
                });
                $("#next").click(function (ev) {
                    if(currentItem){
                        owl.trigger('owl.goTo', currentItem + 1);
                        owl2.trigger('owl.goTo', currentItem + 1);
                    }
                    else{
                        owl.trigger('owl.next');
                        owl2.trigger('owl.next');
                    }
                    ev.preventDefault();
                });

            }, 1000);

            //Opens stage welcome message if first time visit
            $scope.openModal_StageFirstTime = function (size) {
                var modalInstance = $modal.open({
                    animation: false,//$scope.animationsEnabled,
                    templateUrl: 'OpeningStageModal.html',
                    controller: 'OpeningStageController',
                    size: size,
                    windowClass: 'user-help-modal dashboard-stage-intro'
                });
            };

            $scope.openModal_CloseChallenge = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'ClosingStageTwoChallengeModal.html',
                    controller: 'closingStageTwoChallengeController',
                    size: size,
                    windowClass: 'closing-stage-modal user-help-modal'                    
                });
            };

            $scope.openModal_CloseStage = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'ClosingStageTwoModal.html',
                    controller: 'closingStageTwoController',
                    size: size,
                    windowClass: 'closing-stage-modal user-help-modal'
                });
            };


            //Updated stage first time flag in scope, local storage and server
            $scope.updateStageFirstTime = function(){
                //Update model
                $scope.thisStage.firsttime = 0;
                $scope.model.stages[$scope.idEtapa].firsttime = 0;
                //Update local storage
                var userCourse = moodleFactory.Services.GetCacheJson("usercourse");
                if(userCourse!={}) {
                    userCourse.stages[$scope.idEtapa].firsttime = 0;
                    _setLocalStorageJsonItem("usercourse",userCourse);
                }
                //Update back-end
                var dataModel = {
                    stages: [
                        {
                            firstTime:0,
                            section:$scope.thisStage.section
                        }
                    ]
                };

                moodleFactory.Services.PutAsyncFirstTimeInfo(_getItem("userId"), dataModel,function(){},function(){});

            };

            
            function loadController(){
            //If first time in stage, show modal with welcome message
                if($scope.thisStage.firsttime){
                    $scope.openModal_StageFirstTime();
    
                    $scope.updateStageFirstTime();
                }
    
                var challengeCompletedId = _closeChallenge($scope.idEtapa);
    
                _coachNotification($scope.idEtapa);
    
                //Exclude initial and final challenges from showing modal robot
                var challengeExploracionInicial = 154;
                var challengeExploracionFinal = 168;
                if(challengeCompletedId && (challengeCompletedId != challengeExploracionInicial) && (challengeCompletedId != challengeExploracionFinal)){
                    showClosingChallengeRobot(challengeCompletedId);
                }else{
                    localStorage.removeItem("challengeMessage");
                }    
    
                //Try to close stage. If stage is closed exactly in this attempt, show closing message.
                if(_tryCloseStage($scope.idEtapa)){    
                    $scope.openModal_CloseStage();
                }
    
                //Update progress
                var userid = localStorage.getItem("userId");
                var user = JSON.parse(localStorage.getItem("profile/" + userid));
                $scope.model = JSON.parse(localStorage.getItem("usercourse"));
                var progress = moodleFactory.Services.RefreshProgress($scope.model, user);
                $scope.model = progress.course;           
                _setLocalStorageJsonItem("usercourse", $scope.model);
    
                $scope.stageProgress = $scope.model.stages[$scope.idEtapa].stageProgress;
                
                _progressNotification($scope.idEtapa, $scope.stageProgress);

            }
            // this is the propper way, but since owl isn't part of angular framework, it is rendered afterwards angular finishes
            $scope.$on('$viewContentLoaded', function() {
                //$scope.$emit('HidePreloader'); //hide preloader
            });
            // this is the dirty way to hide owl's carousel rendering process while user waits
            $timeout(function() {
                _pageLoaded = true;
                if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader')};
            }, 2000);

            $scope.playVideo = function (videoAddress, videoName) {
                playVideo(videoAddress, videoName);
            };

            $scope.startActivity = function (activity, index, parentIndex) {
                if(_activityBlocked[activity.activity_identifier].disabled) return false;
                var url = _.filter(_activityRoutes, function(x) { return x.id == activity.activity_identifier })[0].url;

                //Store an Index of the chosen menu item.
                _setLocalStorageJsonItem("owlQuizCurrentIndex", parentIndex);

                if (url) {
                    
                    if (_compareSyncDeviceVersions()) {
						var activityId = activity.activity_identifier;
                        var timeStamp = $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss');
                        logStartActivityAction(activityId, timeStamp);
                        $location.path(url);
					}else {
						$scope.openUpdateAppModal();
					}
                }
            };

            $scope.getCurrentStatusOfActivity = function (coursemoduleid) {
                var activity = _getActivityByCourseModuleId(coursemoduleid);
                return activity.status;
            };
            
            function getContentResources(activityIdentifierId) {
                drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                    _loadedResources = true;
                    $scope.contentResources = data.node;                    
                    loadController();
                    
                    if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
                    
                    }, function () { _loadedResources = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); } }, false);
            }
            
            
            function showClosingChallengeRobot(challengeCompletedId){
                                        
                console.log("show closing challengeRobot");
                $scope.robotMessages = [
                                {
                                    title: $scope.contentResources.robot_title_challenge_one,
                                    message: $scope.contentResources.robot_challenge_one,
                                    read: "false",
                                    challengeId: 155
                                },
                                {
                                    title: $scope.contentResources.robot_title_challenge_two,
                                    message: $scope.contentResources.robot_challenge_two,
                                    read: "false",
                                    challengeId: 157
                                },
                                {
                                    title: $scope.contentResources.robot_title_challenge_thre,
                                    message: $scope.contentResources.robot_challenge_three,
                                    read: "false",
                                    challengeId: 160
                                },
                                {
                                    title:  $scope.contentResources.robot_challenge_four,
                                    message: $scope.contentResources.robot_challenge_four,
                                    read: "false",
                                    challengeId: 81
                                },
                                {
                                    title:  $scope.contentResources.robot_challenge_five,
                                    message: $scope.contentResources.robot_challenge_five,
                                    read: "false",
                                    challengeId: 167
                                }];
            
                
                $scope.actualMessage = _.findWhere($scope.robotMessages, { read: "false", challengeId: challengeCompletedId });                
                if($scope.actualMessage){                
                    _setLocalStorageItem("challengeMessage", JSON.stringify($scope.actualMessage));
                    console.log($scope.actualMessage);
                    $scope.openModal_CloseChallenge();
                }
            }
                                                                                               
        }])
    .controller('closingStageTwoChallengeController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
                        
            var challengeMessage = JSON.parse(localStorage.getItem("challengeMessage"));
                              
            $scope.actualMessage = challengeMessage;
             
    })
    .controller('closingStageTwoController', function ($scope, $modalInstance,$location) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    
                    $scope.robotMessages = {
                        title: "Zona de Navegación",
                        message: "¡Muy bien! Has reunido los elementos necesarios para salir de la lluvia de asteroides. Recuerda, creer en ti y en todo lo que puede lograr, te llevará a avanzar en el camino que has elegido ¡Adelante!"
                    };
                    
                    $scope.navigateToDashboard = function () {                        
                        $modalInstance.dismiss('cancel');
                        $location.path('/ProgramaDashboard');
                    };
                    _setLocalStorageItem('robotEndStageTwoShown',true);
                });

