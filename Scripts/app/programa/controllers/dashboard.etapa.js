

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
            
            //$rootScope.pageName = "Estación: Conócete";
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


            var challengesPaths = {
                "Exploración Inicial" : "/ZonaDeVuelo/ExploracionInicial/zv_exploracionInicial",
                "Cuarto de recursos" : "/ZonaDeVuelo/CuartoDeRecursos/FuenteDeEnergia/zv_cuartoderecursos_fuentedeenergia",
                "Conócete" : "",
                "Mis sueños" : "",
                "Cabina de soporte" : "",
                "Exploración final" : ""
            };
            
            $scope.goToUrl = function(url) {
                $location.path(challengesPaths[url]);
            };

            $scope.model = JSON.parse(localStorage.getItem("usercourse"));

            var totalDeEtapas = $scope.model.stages.length; //Número total de Etapas

            var totalDeRetos = 0;   //Número total de Retos, considetando todos los Retos de todas las Etapas
            var totalDeActividades = 0; //Número total de Actividdes, considerando todos los Retos de todas las Etapas

            //Obtención del total de Retos sobre todas la Etapas (1, 2 y 3)
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


            //Cálculo del avance del usuario en la Etapa actual
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
