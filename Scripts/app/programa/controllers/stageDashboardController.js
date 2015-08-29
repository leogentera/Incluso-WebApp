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
            _httpFactory = $http;
            $scope.Math = window.Math;
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.model = JSON.parse(localStorage.getItem("usercourse"));

            $scope.setToolbar($location.$$path,"");
            
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

            $scope.openModal = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'OpeningStageModal.html',
                    controller: 'OpeningStageController',
                    size: size,
                    windowClass: 'user-help-modal'
                });

            };

            $scope.openModal();

            var closingStageModal = localStorage.getItem('closeStageModal');
            if (closingStageModal == 'true') {
                openStageModal();
                localStorage.setItem('closeStageModal', 'false');
            }

            $scope.activitiesCompletedInCurrentStage = [];
            $scope.isCollapsed = false;
            $scope.stages = _staticStages;
            $scope.idEtapa = $routeParams['stageId'] - 1; //We are in stage stageId, taken from URL
            $scope.nombreEtapaActual = $scope.model.stages[$scope.idEtapa].sectionname;
            localStorage.setItem("userCurrentStage", $routeParams['stageId']);

            var totalDeEtapas = $scope.model.stages.length; //Total amount of stages
            var totalDeRetos = 0; //Total number of challenges, along all possible stages
            var totalDeActividades = 0; //Total number of activities, along all challenges in all stages
            var i, j, k; //Getting total number of challenges along all stages (1, 2 y 3)

            for (i = 0; i < totalDeEtapas; i++) {
                totalDeRetos += $scope.model.stages[i].challenges.length;
            }

            // Count of whole activities along all Stages
            for (i = 0; i < totalDeEtapas; i++) {
                var numOfChallenges = $scope.model.stages[i].challenges.length;

                for (j = 0; j < numOfChallenges; j++) {
                    totalDeActividades += $scope.model.stages[i].challenges[j].activities.length;
                }
            }

            var avanceEnEtapaActual = 0;
            var totalActividadesEnEtapaActual = 0; //Attainment of user in the current Stage            
            var retosEnEtapaActual = $scope.model.stages[$scope.idEtapa].challenges.length;

            for (j = 0; j < retosEnEtapaActual; j++) {
                var numActividadesParcial = $scope.model.stages[$scope.idEtapa].challenges[j].activities.length;

                for (k = 0; k < numActividadesParcial; k++) {
                    avanceEnEtapaActual += $scope.model.stages[$scope.idEtapa].challenges[j].activities[k].status;
                    totalActividadesEnEtapaActual++;
                }
            }

            $scope.avanceEnEtapaActual = Math.ceil(avanceEnEtapaActual * 100 / totalActividadesEnEtapaActual);
            $scope.retosIconos = {
                "Exploración Inicial": "assets/images/challenges/stage-1/img-evaluacion inicial.svg",
                "Cuarto de recursos": "assets/images/challenges/stage-1/img-cuarto-recursos.svg",
                "Conócete": "assets/images/challenges/stage-1/img-conocete.svg",
                "Mis sueños": "assets/images/challenges/stage-1/img-mis-suenos.svg",
                "Cabina de soporte": "assets/images/challenges/stage-1/img-cabina-soporte.svg",
                "Exploración final": "assets/images/challenges/stage-1/img-evaluacion final.svg"
            };

            $scope.playVideo = function (videoAddress, videoName) {
                playVideo(videoAddress, videoName);
            };

            $scope.startActivity = function (activity, index, parentIndex) {
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
                        
                        //trigger activity type 1 is sent when the activity starts.
                        var triggerActivity = 1;
                        _createNotification(activity.coursemoduleid, triggerActivity);
                        
                        moodleFactory.Services.PutStartActivity(data, activity, currentUser.token, function (size) {
                            $scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index].started = 1;
                            $scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index].datestarted = data.datestarted;
                            localStorage.setItem('usercourse', JSON.stringify($scope.model));
                            localStorage.setItem('startedActivityCabinaDeSoporte', JSON.stringify({$stage: $scope.idEtapa, $index: index, $parentIndex: parentIndex, $data: data}));

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

            $scope.getCurrentStatusOfActivity = function (index, parentIndex) {
                return $scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index].status;
            };

            function openStageModal() {
                setTimeout(function(){ 
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'ClosingStage.html',
                    controller: 'closingStageController',
                    size: size,
                    windowClass: 'closing-stage-modal user-help-modal'
                });
                }, 1000);
            }
        }])
    .controller('closingStageController', function ($scope, $modalInstance) {
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
