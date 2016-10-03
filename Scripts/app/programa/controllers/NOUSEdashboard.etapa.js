angular
    .module('incluso.programa.dashboard.etapa', [])
    .controller('programaEtapaController', [
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

            ///////harcoded/////
            _setLocalStorageItem("currentStage", "1");
            ////////////////////

            var currentStage = JSON.parse(localStorage.getItem("currentStage"));
            $scope.idEtapa = currentStage;      //We are in Stage 1
            $rootScope.pageName = $scope.nombreEtapaActual = $scope.model.stages[$scope.idEtapa].sectionname;
            $rootScope.navbarOrange = false;
            $rootScope.navbarBlue = false;
            $rootScope.navbarPink = false;
            $rootScope.navbarGreen = false;
            if ($scope.idEtapa == 0)               //Zona de vuelo
                $rootScope.navbarBlue = true;
            if ($scope.idEtapa == 1)               //Zona de navegacion
                $rootScope.navbarGreen = true;
            if ($scope.idEtapa == 2)               //Zona de aterrizaje
                $rootScope.navbarPink = true;


            //$rootScope.pageName = "EstaciÃ³n: ConÃ³cete";

            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
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
                _setLocalStorageItem('closeStageModal', 'false');
            }

            $scope.activitiesCompletedInCurrentStage = [];
            $scope.isCollapsed = false;

            $scope.theActivities = [    [{"name" : "Exploracion Inicial", "status" : 0, "link" : "/ZonaDeVuelo/ExploracionInicial/zv_exploracionInicial"}],
             [{"name" : "Fuente de energía", "status" : 0, "link" : "/ZonaDeVuelo/CuartoDeRecursos/FuenteDeEnergia/zv_cuartoderecursos_fuentedeenergia"}],
             [{"name" : "Fuente de energía", "status" : 0, "link" : "/ZonaDeVuelo/Conocete/FuenteDeEnergia/zv_conocete_fuentedeenergia"}, {"name" : "Reto múltiple", "status" : 0, "link" : "/ZonaDeVuelo/Conocete/RetoMultiple/zv_conocete_retomultiple"}, {"name" : "Punto de encuentro", "status" : 0, "link" : "/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/1010"}, {"name" : "Zona de contacto", "status" : 0, "link" : "/ZonaDeVuelo/Conocete/ZonaDeContacto"}],
             [{"name" : "Fuente de energía", "status" : 0, "link" : "/ZonaDeVuelo/MisSuenos/FuenteDeEnergia/zv_missuenos_fuentedeenergia"}, {"name" : "Mis cualidades", "status" : 0, "link":"/ZonaDeVuelo/MisSuenos/MisCualidades/zv_missuenos_miscualidades"}, {"name" : "Mis gustos", "status" : 0, "link":"/ZonaDeVuelo/MisSuenos/MisGustos/zv_missuenos_misgustos"}, {"name" : "Sueña", "status" : 0, "link":"/ZonaDeVuelo/MisSuenos/Suena/zv_missuenos_suena"}, {"name" : "Punto de encuentro", "status" : 0, "link":"/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/zv_missuenos_puntosdeencuentro"}],
             [{"name" : "Cabina de soporte", "status" : 0, "link":"/ZonaDeVuelo/CabinaDeSoporte/zv_cabinadesoporte_chat"}],
             [{"name" : "Exploración final", "status" : 0, "link":"/ZonaDeVuelo/ExploracionFinal/zv_exploracionfinal"}]  ];

            var activitiesURLs = [
                ["/ZonaDeVuelo/ExploracionInicial/zv_exploracionInicial"],
                ["/ZonaDeVuelo/CuartoDeRecursos/FuenteDeEnergia/zv_cuartoderecursos_fuentedeenergia"],
                ["/ZonaDeVuelo/Conocete/FuenteDeEnergia/zv_conocete_fuentedeenergia", "/ZonaDeVuelo/Conocete/RetoMultiple/zv_conocete_retomultiple", "/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/1010", "/ZonaDeVuelo/Conocete/ZonaDeContacto"],
                ["/ZonaDeVuelo/MisSuenos/FuenteDeEnergia/zv_missuenos_fuentedeenergia", "/ZonaDeVuelo/MisSuenos/MisGustos/zv_missuenos_misgustos", "/ZonaDeVuelo/MisSuenos/MisCualidades/zv_missuenos_miscualidades", "/ZonaDeVuelo/MisSuenos/Suena/zv_missuenos_suena", "/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/zv_missuenos_puntosdeencuentro"],
                ["url_cabinadesoporte"],
                ["/ZonaDeVuelo/ExploracionFinal/zv_exploracionfinal"]];

            $scope.goToUrl2 = function (url) {
             $location.path(url);
             };

            $scope.model = JSON.parse(localStorage.getItem("usercourse"));

            $scope.idEtapa = $routeParams['stageId'] - 1; //We are in stage stageId, taken from URL
            $scope.nombreEtapaActual = $scope.model.stages[$scope.idEtapa].sectionname;

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

                    if ($scope.model.stages[$scope.idEtapa].challenges[j].activities[k].status > 0) {
                        //alert($scope.model.stages[$scope.idEtapa].challenges[j].activities[k].activityname);
                    }
                }
            }

            $scope.avanceEnEtapaActual = Math.ceil(avanceEnEtapaActual * 100 / totalActividadesEnEtapaActual);
            $scope.retosIconos = {
                "Exploración Inicial": "assets/images/challenges/stage-1/img-evaluacion-inicial.svg",
                "Cuarto de recursos": "assets/images/challenges/stage-1/img-cuarto-recursos.svg",
                "Conócete": "assets/images/challenges/stage-1/img-conocete.svg",
                "Mis sueños": "assets/images/challenges/stage-1/img-mis-suenos.svg",
                "Cabina de soporte": "assets/images/challenges/stage-1/img-cabina-soporte.svg",
                "Exploración final": "assets/images/challenges/stage-1/img-evaluacion-final.svg"
            };

            $scope.playVideo = function (videoAddress, videoName) {
                playVideo(videoAddress, videoName);
            };

            $scope.startActivity = function (activity, challenge, index) {
                var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                var data = {
                    userid: currentUser.userId,
                    datestarted: getFormattedDate(),
                    moduleid: activity.coursemoduleid,
                    updatetype: 1
                };


                moodleFactory.Services.PutStartActivity(data, activity, currentUser.token, function (size) {
                    var url = activitiesURLs[challenge][index];

                    if (url != 'url_cabinadesoporte') {
                        $location.path(url);
                    } else {
                        var modalInstance = $modal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'CabinaSoporteMsj.html',
                            controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                                $scope.cancel = function () {
                                    $modalInstance.dismiss('cancel');
                                };
                            }],
                            size: size,
                            windowClass: 'user-help-modal'
                        });
                    }
                }, function (obj) {
                    $scope.$emit('HidePreloader');
                    if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                      $timeout(function () {
                        $location.path('/Offline'); //This behavior could change
                      }, 1);
                    } else {//Another kind of Error happened
                        console.log("Another kind of Error happened");
                      $timeout(function () {
                          $scope.$emit('HidePreloader');
                          $location.path('/connectionError');
                      }, 1);
                    }
                });

                function getFormattedDate() {
                    var date = new Date(),
                        year = date.getFullYear(),
                        month = formatValue(date.getMonth() + 1), // months are zero indexed
                        day = formatValue(date.getDate()),
                        hour = formatValue(date.getHours()),
                        minute = formatValue(date.getMinutes()),
                        second = formatValue(date.getSeconds());

                    function formatValue(value) {
                        return value >= 10 ? value : '0' + value;
                    }

                    return year + ":" + month + ":" + day + " " + hour + ":" + minute + ":" + second;
                }
            };

            function openStageModal() {
                //setTimeout(function(){ 
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'ClosingStage.html',
                    controller: 'closingStageController',
                    //size: size,
                    windowClass: 'closing-stage-modal user-help-modal'
                });
                //}, 1000);
            };
        }])
    .controller('closingStageController', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
