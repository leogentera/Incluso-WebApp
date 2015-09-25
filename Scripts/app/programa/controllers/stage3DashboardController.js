angular
    .module('incluso.stage.dashboardcontroller3', [])
    .controller('stage3DashboardController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            /* $routeParams.stageId */
            _timeout = $timeout;
            _httpFactory = $http;
            $scope.Math = window.Math;
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.model = JSON.parse(localStorage.getItem("usercourse"));
            $scope.setToolbar($location.$$path,"");

            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = true;
            $scope.scrollToTop();

            $scope.activitiesCompletedInCurrentStage = [];
            $scope.isCollapsed = false;
            $scope.idEtapa = $routeParams['stageId'] - 1; //We are in stage stageId, taken from URL
            $scope.idReto = $routeParams['challenge'];
            $scope.thisStage = $scope.model.stages[$scope.idEtapa];
            $scope.nombreEtapaActual = $scope.thisStage.sectionname;
            _setLocalStorageItem("userCurrentStage", $routeParams['stageId']);

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
                    touchDrag:false,
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
                    touchDrag:false,
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
                    $("span#index").text((item+1));
                }

                function callback2(event) {
                    item = this.currentItem;
                    owl.trigger("owl.goTo", item);
                    $("span#index").text((item+1));
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
                    templateUrl: 'ClosingStageThreeChallengeModal.html',
                    controller: 'closingStageThreeChallengeController',
                    size: size,
                    windowClass: 'closing-stage-modal user-help-modal'
                });
            };

            $scope.openModal_CloseStage = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'ClosingStageThreeModal.html',
                    controller: 'closingStageThreeController',
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

            if($scope.thisStage.firsttime){
                $scope.openModal_StageFirstTime();
                $scope.updateStageFirstTime();
            }


            //calculate user's stage progress
            var stageProgressBuffer = 0;
            var stageTotalActivities = 0; //Attainment of user in the current Stage
            var stageChallengesCount = $scope.thisStage.challenges.length;

            var i, j,k;
            for (i = 0; i < stageChallengesCount; i++) {
                var challenge = $scope.thisStage.challenges[i];
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

            var stageCompleted = _updateStageStatus();
            $scope.stageProgress = Math.ceil((stageProgressBuffer  / stageTotalActivities)*100);
            var challengeCompletedId = _isChallengeCompleted();
            _coachNotification();

            //Exclude challenges initial and final from showing modal robot
            var challengeExploracionInicial = 205;
            var challengeExploracionFinal = 218;
            if(challengeCompletedId && (challengeCompletedId != challengeExploracionInicial) && (challengeCompletedId != challengeExploracionFinal)){
                _setLocalStorageItem("challengeMessageId",challengeCompletedId);
                $scope.openModal_CloseChallenge();
            }else{
                _setLocalStorageItem("challengeMessageId",0);
            }



            //Try to close stage. If stage is closed exactly in this attempt, show closing message.
            if(_tryCloseStage($scope.idEtapa)){
                $scope.openModal_CloseStage();
            }

            // this is the propper way, but since owl isn't part of angular framework, it is rendered afterwards angular finishes
            $scope.$on('$viewContentLoaded', function() {
                //$scope.$emit('HidePreloader'); //hide preloader
            });
            // this is the dirty way to hide owl's carousel rendering process while user waits
            $timeout(function() {
                $scope.$emit('HidePreloader'); //hide preloader
            }, 2000);

            $scope.playVideo = function (videoAddress, videoName) {
                playVideo(videoAddress, videoName);
            };

            $scope.startActivity = function (activity, index, parentIndex) {
                //TODO: Remove false from condition, only there to jump freely into activities in DEV
                if(false && !$scope.canStartActivity(activity.activity_identifier)) return false;
                var url = _.filter(_activityRoutes, function(x) { return x.id == activity.activity_identifier })[0].url;

                if (url) {
                    $location.path(url);
                }
            };

            $scope.getCurrentStatusOfActivity = function (coursemoduleid) {
                var activity = _getActivityByCourseModuleId(coursemoduleid);
                return activity.status;
            };

        }]).controller('closingStageThreeChallengeController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
    
            var challengeMessageId = JSON.parse(localStorage.getItem("challengeMessageId"));
    
            $scope.robotMessages = [
                    {
                        title : "CUARTO DE RECURSOS",
                        message : "!Ahora tienes una pieza m\u00E1s del equipo de exploraci\u00F3n! Recuerda, un emprendedor ve oportunidades donde otros ven problemas.",                        
                        read : "false",
                        challengeId : 206},
                    {
                        title : "EDUCACI\u00D3N FINANCIERA",
                        message : "!Ahora tienes una pieza m\u00E1s del equipo de exploraci\u00F3n! Est\u00E1s listo para conseguir lo que te propongas, ahorrar puede ayudarte a reunir los recursos que necesitas para lograrlo.",
                        read : "false",
                        challengeId : 208},
                    {
                        title : "MAPA DEL EMPRENDEDOR",
                        message : "!Ahora tienes una pieza m\u00E1s del equipo de exploraci\u00F3n! Todos podemos ser emprendedores, s\u00F3lo hace falta creer en nuestras ideas y tomar las acciones necesarias para hacerlas realidad.",
                        read : "false",
                        challengeId : 90},
                    {
                        title : "CABINA DE SOPORTE",
                        message : "!Ahora tienes una pieza m\u00E1s del equipo de exploraci\u00F3n! El mapa de tu idea de negocio esta completo, ya tienes todas las piezas para volverlo realidad, ahora s\u00F3lo depende de ti.",
                        read : "false",
                        challengeId : 217
                    }];

        $scope.actualMessage = _.findWhere($scope.robotMessages,{read: "false", challengeId: challengeMessageId});

    }).controller('closingStageThreeController', function ($scope, $modalInstance,$location) {
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };



        $scope.navigateToDashboard = function () {
            $modalInstance.dismiss('cancel');
            $location.path('/ProgramaDashboard');
        };
        _setLocalStorageItem('robotEndStageThreeShown',true);
    });
