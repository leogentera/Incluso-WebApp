angular
    .module('incluso.stage.dashboardcontroller', [])
    .controller('stageDashboardController', [
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
            $scope.scrollToTop();

            $scope.activitiesCompletedInCurrentStage = [];
            $scope.isCollapsed = false;
            $scope.idEtapa = $routeParams['stageId'] - 1; //We are in stage stageId, taken from URL
            $scope.thisStage = $scope.model.stages[$scope.idEtapa];
            $scope.nombreEtapaActual = $scope.thisStage.sectionname;
            localStorage.setItem("userCurrentStage", $routeParams['stageId']);
                                
            //Opens stage welcome message if first time visit
            $scope.openModal_StageFirstTime = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'OpeningStageModal.html',
                    controller: 'OpeningStageController',
                    size: size,
                    windowClass: 'user-help-modal'
                });

            };
            
            
            $scope.openModal_CloseChallenge = function (size) {                
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'ClosingChallengeModal.html',
                    controller: 'closingStageController',
                    size: size,
                    windowClass: 'closing-stage-modal user-help-modal'                    
                });
            }
            

            //Updated stage first time flag in scope, local storage and server
            $scope.updateStageFirstTime = function(){
                //Update model
                $scope.thisStage.firsttime = 0;
                $scope.model.stages[$scope.idEtapa].firsttime = 0;
                //Update local storage
                var userCourse = moodleFactory.Services.GetCacheJson("usercourse");
                if(userCourse!={}) {
                    userCourse.stages[$scope.idEtapa].firsttime = 0;
                    localStorage.setItem("usercourse",JSON.stringify(userCourse));
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
                    if(activity.activities) {
                        var subActivitiesCount = activity.activities.length;
                        for (k = 0; k < subActivitiesCount; k++) {
                            var subActivity = activity.activities[k];
                            stageProgressBuffer += subActivity.status;
                            stageTotalActivities++;
                        }
                    }
                }
            }
            
            $scope.stageProgress = Math.ceil((stageProgressBuffer  / stageTotalActivities)*100);            
            var challengeCompleted = _isChallengeCompleted();
            
            if(challengeCompleted){
              localStorage.setItem("challengeMessageId",challengeCompleted);
              $scope.openModal_CloseChallenge();
            }else{
              localStorage.setItem("challengeMessageId",0);
            }            
            //localStorage.setItem("challengeMessageId",113);
            //$scope.openModal_CloseChallenge();
            
            //Load challenges images
            $scope.retosIconos = {
                "Exploración inicial": "assets/images/challenges/stage-1/img-evaluacion inicial.svg",
                "Cuarto de recursos": "assets/images/challenges/stage-1/img-cuarto-recursos.svg",
                "Conócete": "assets/images/challenges/stage-1/img-conocete.svg",
                "Mis sueños": "assets/images/challenges/stage-1/img-mis-suenos.svg",
                "Cabina de soporte": "assets/images/challenges/stage-1/img-cabina-soporte.svg",
                "Exploración final": "assets/images/challenges/stage-1/img-evaluacion final.svg"
            };

            $scope.$emit('HidePreloader'); //hide preloader            

            $scope.playVideo = function (videoAddress, videoName) {
                playVideo(videoAddress, videoName);
            };



            $scope.startActivity = function (activity, index, parentIndex) {
                if(!$scope.canStartActivity(activity.coursemoduleid)) return false;
                var url = _.filter(_activityRoutes, function(x) { return x.id == activity.coursemoduleid })[0].url;

                if (url) {
                    $location.path(url);
                } else {
                    var startedActivityCabinaDeSoporte = $scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index].started && !$scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index].status;

                    // Start activity of 'cabina de soporte'                    
                    if (!startedActivityCabinaDeSoporte) {
                        var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                        var data = {
                            userid: currentUser.userId,
                            datestarted: getdate(),
                            moduleid: activity.coursemoduleid,
                            updatetype: 0
                        };
                                                
                        moodleFactory.Services.PutStartActivity(data, activity, currentUser.token, function (size) {
                            $scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index].started = 1;
                            $scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index].datestarted = data.datestarted;
                            localStorage.setItem('usercourse', JSON.stringify($scope.model));
                            localStorage.setItem('startedActivityCabinaDeSoporte', JSON.stringify({$stage: $scope.idEtapa, $index: index, $parentIndex: parentIndex, $data: data}));

                            //trigger activity type 1 is sent when the activity starts.
                            var triggerActivity = 1;
                            _createNotification(activity.coursemoduleid, triggerActivity);

                            var modalInstance = $modal.open({
                                animation: $scope.animationsEnabled,
                                templateUrl: 'CabinaSoporteMsj.html',
                                controller: function ($scope, $modalInstance) {
                                    $scope.cancel = function () {
                                        $modalInstance.dismiss('cancel');
                                    };
                                },
                                size: size,
                                windowClass: 'user-help-modal'
                            });
                            console.log("modal open");
                        },function(){
                            console.log('Error callback');    
                        });
                    }
                }
            };

            $scope.getCurrentStatusOfActivity = function (coursemoduleid) {
                var activity = _getActivityByCourseModuleId(coursemoduleid);
                return activity.status;
            };
            
        }]).controller('closingStageController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
                        
            var challengeMessageId = JSON.parse(localStorage.getItem("challengeMessageId"));
            
            $scope.robotMessages = [{
                        title : "CUARTO DE RECURSOS",
                        message : "¡Has recuperado con éxito una de las piezas para reparar la nave! Ahora sabes que los sueños son el motor que te impulsa a avanzar y llegar cada vez más lejos.",
                        read : "false",
                        challengeId: 113},
                    {
                        title : "CONÓCETE",
                        message : "¡Has recuperado con éxito una de las piezas para reparar la nave! Haz de tus habilidades una fortaleza y pónlas en acción cada día.",
                        read : "false",
                        challengeId: 114},
                    {
                        title : "MIS SUEÑOS",
                        message : "¡Has recuperado con éxito una de las piezas para reparar la nave! Lograste descubrir cuáles son tus más grandes sueños, ahora sabes hacia dónde te diriges.",
                        read : "false",
                        challengeId: 115},
                    {
                        title : "CABINA DE SOPORTE",
                        message : "¡Has recuperado con éxito una de las piezas para reparar la nave!  Lograste unir los puntos clave para definir un sueño: pasión, habilidades y talentos. ¡sólo falta ponerlos en acción para lograr lo que te propongas!",
                        read : "false",
                        challengeId: 116}];
             
             $scope.actualMessage = _.findWhere($scope.robotMessages,{read: "false", challengeId: challengeMessageId});             
             
    });
