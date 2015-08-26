

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
            _httpFactory = $http;
            $scope.Math = window.Math;
            $scope.$emit('ShowPreloader'); //show preloader
            
            //$rootScope.pageName = "EstaciÃ³n: ConÃ³cete";
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

//
            //_createNotification();

        
            $scope.activitiesCompletedInCurrentStage = [];

            $scope.isCollapsed = false;

            $scope.theActivities = [    [{"name" : "Exploracion Inicial", "status" : 1, "link" : "/ZonaDeVuelo/ExploracionInicial/zv_exploracionInicial"}],
                                        [{"name" : "Fuente de energía", "status" : 1, "link" : "/ZonaDeVuelo/CuartoDeRecursos/FuenteDeEnergia/zv_cuartoderecursos_fuentedeenergia"}],
                                        [{"name" : "Fuente de energía", "status" : 0, "link" : "/ZonaDeVuelo/Conocete/FuenteDeEnergia/zv_conocete_fuentedeenergia"}, {"name" : "Reto múltiple", "status" : 0, "link" : "/ZonaDeVuelo/Conocete/RetoMultiple/zv_conocete_retomultiple"}, {"name" : "Punto de encuentro", "status" : 0, "link" : "/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/64"}, {"name" : "Zona de contacto", "status" : 0, "link" : "/ZonaDeVuelo/Conocete/ZonaDeContacto"}],
                                        [{"name" : "Fuente de energía", "status" : 0, "link" : "/ZonaDeVuelo/MisSuenos/FuenteDeEnergia/zv_missuenos_fuentedeenergia"}, {"name" : "Mis cualidades", "status" : 0, "link":"/ZonaDeVuelo/MisSuenos/MisCualidades/zv_missuenos_miscualidades"}, {"name" : "Mis gustos", "status" : 0, "link":"/ZonaDeVuelo/MisSuenos/MisGustos/zv_missuenos_misgustos"}, {"name" : "Sueña", "status" : 0, "link":"/ZonaDeVuelo/MisSuenos/Suena/zv_missuenos_suena"}, {"name" : "Punto de encuentro", "status" : 0, "link":"/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/zv_missuenos_puntosdeencuentro"}],
                                        [{"name" : "Cabina de soporte", "status" : 0, "link":"/ZonaDeVuelo/CabinaDeSoporte/zv_cabinadesoporte_chat"}],
                                        [{"name" : "Exploración final", "status" : 0, "link":"/ZonaDeVuelo/ExploracionFinal/zv_exploracionfinal"}]  ];


            
            $scope.goToUrl = function(url) {
                $location.path(url);
            };

            $scope.model = JSON.parse(localStorage.getItem("usercourse"));

            var totalDeEtapas = $scope.model.stages.length; //NÃºmero total de Etapas

            var totalDeRetos = 0;   //NÃºmero total de Retos, considetando todos los Retos de todas las Etapas
            var totalDeActividades = 0; //NÃºmero total de Actividdes, considerando todos los Retos de todas las Etapas

            //ObtenciÃ³n del total de Retos sobre todas la Etapas (1, 2 y 3)
            for (var i = 0; i < totalDeEtapas; i++) {
                totalDeRetos += $scope.model.stages[i].challenges.length;
            }



            // Conteo del total de Actividades sobre todas las Etapas
            for (var i = 0; i < totalDeEtapas; i++) {

                var numOfChallenges = $scope.model.stages[i].challenges.length;

                for (var j = 0; j < numOfChallenges; j++) {
                    totalDeActividades += $scope.model.stages[i].challenges[j].activities.length;
                }
            }

            $scope.idEtapa = 0;      //Se identifica la etapa actual como la Etapa 1
            $scope.nombreEtapaActual = $scope.model.stages[$scope.idEtapa].sectionname;

            var avanceEnEtapaActual = 0;

            //CÃ¡lculo del avance del usuario en la Etapa actual
            var totalActividadesEnEtapaActual = 0;

            var retosEnEtapaActual = $scope.model.stages[$scope.idEtapa].challenges.length;

            for (var j = 0; j < retosEnEtapaActual; j++) {
                var numActividadesParcial = $scope.model.stages[$scope.idEtapa].challenges[j].activities.length;

                for (var k = 0; k < numActividadesParcial; k++) {
                    avanceEnEtapaActual += $scope.model.stages[$scope.idEtapa].challenges[j].activities[k].status;
                    //alert("status " + $scope.model.stages[$scope.idEtapa].challenges[j].activities[k].status);
                    totalActividadesEnEtapaActual++;
                }
            }

            $scope.avanceEnEtapaActual = Math.ceil(avanceEnEtapaActual*100/totalActividadesEnEtapaActual);


            $scope.retosIconos = {
                "Exploración Inicial" : "assets/images/challenges/stage-1/img-evaluacion inicial.svg",
                "Cuarto de recursos" : "assets/images/challenges/stage-1/img-cuarto-recursos.svg",
                "Conócete" : "assets/images/challenges/stage-1/img-conocete.svg",
                "Mis sueños" : "assets/images/challenges/stage-1/img-mis-suenos.svg",
                "Cabina de soporte" : "assets/images/challenges/stage-1/img-cabina-soporte.svg",
                "Exploración final" : "assets/images/challenges/stage-1/img-evaluacion final.svg"
            };




            
            $scope.playVideo = function(videoAddress, videoName){
                 playVideo(videoAddress, videoName);
            };

            $scope.openClosingStageModal = function (size) {
                console.log("opening");
                //setTimeout(function(){ 
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'ClosingStage.html',
                        controller: 'closingStageController',
                        size: size,
                        windowClass: 'closing-stage-modal user-help-modal'
                    });
                    console.log("modal open closing");
                //}, 1000);
            };

        }])
        .controller('closingStageController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });
