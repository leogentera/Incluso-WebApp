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
            $rootScope.pageName = "Estación: Conócete";
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader
            
            //
            /*
            var stage = JSON.parse(localStorage.getItem('stage'));
            var userCourse = JSON.parse(localStorage.getItem('usercourse'));
            
            var id = stage.id;
            
            var etapa1 = userCourse.stages[0];
            */
            //var challenges = etapa1.
            $scope.isCollapsed = false;
            
            $scope.challengeName = "MIS RETOS";
            
            $scope.goToUrl = function(url) {
                $location.path(url);
                
            }
            
            //El key "status" de los elementos del array "etapas" del objeto "logroEducativo" indica si la etapa ya se completó (1) o no se ha completado (9)
            $scope.logroEducativo = {
                "userId" : 53,
                
                "etapas" : [{"idEtapa" : 0, "name" : "Zona de Vuelo", "status" : 0}, 
                            {"idEtapa" : 1, "name" : "Zona de Navegación", "status" : 0}, 
                            {"idEtapa" : 2, "name" : "Zona de Aterrizaje", "status" : 0}  ],                           
                
                
                "retosPorEtapa" :  [    { "idEtapa" : 1, "retos" : [    {"idReto": 1, "name" : "Exploración inicial", "icon" : "assets/images/img-rotator-01-lg.png", "actividades" : [ {"id" : 1, "name" : "Exploracion inicial", "link": "/ZonaDeVuelo/ExploracionInicial/zv_exploracionInicial", "status" : 1} ] },
                                                                        {"idReto": 2, "name" : "Cuarto de recursos", "icon" : "assets/images/img-rotator-01-lg.png", "actividades" : [ {"id" : 1, "name" : "Fuente de energía", "link" : "/ZonaDeVuelo/CuartoDeRecursos/FuenteDeEnergia/zv_cuartoderecursos_fuentedeenergia",  "status" : 1} ] },
                                                                        {"idReto": 3, "name" : "Conócete", "icon" : "assets/images/img-rotator-01-lg.png", "actividades" : [ {"id" : 1, "name" : "Fuente de energía", "link":"/ZonaDeVuelo/Conocete/FuenteDeEnergia/zv_conocete_fuentedeenergia", "status" : 0},  {"id" : 2, "name" : "Reto múltiple", "link":"/ZonaDeVuelo/Conocete/RetoMultiple/zv_conocete_retomultiple",  "status" : 0},  {"id" : 3, "name" : "Punto de encuentro", "link":"/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/zv_puntodeencuentro", "status" : 0},  {"id" : 4, "name" : "Zona de contacto", "link":"/ZonaDeVuelo/Conocete/ZonaDeContacto','Zona de contacto", "status" : 0} ]},
                                                                        {"idReto": 4, "name" : "Mis sueños", "icon" : "assets/images/img-rotator-01-lg.png",  "actividades" : [ {"id" : 1, "name" : "Fuente de energía", "link":"/ZonaDeVuelo/MisSuenos/FuenteDeEnergia/zv_missuenos_fuentedeenergia", "status" : 0},  {"id" : 2, "name" : "Mis gustos", "link":"/ZonaDeVuelo/MisSuenos/MisGustos/zv_missuenos_misgustos", "status" : 0},  {"id" : 3, "name" : "Mis cualidades", "link":"/ZonaDeVuelo/MisSuenos/MisCualidades/zv_missuenos_miscualidades", "status" : 0},  {"id" : 4, "name" : "Sueña", "link": "/ZonaDeVuelo/MisSuenos/Suena/zv_missuenos_suena", "status" : 0},  {"id" : 5, "name" : "Punto de encuentro", "link":"/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/zv_missuenos_puntosdeencuentro", "status" : 0} ] },
                                                                        {"idReto": 5, "name" : "Cabina de soporte", "icon" : "assets/images/img-rotator-01-lg.png", "actividades" : [ {"id" : 1, "name" : "Chat", "link":"/ZonaDeVuelo/CabinaDeSoporte/zv_cabinadesoporte_chat", "status" : 0} ]},
                                                                        {"idReto": 6, "name" : "Exploración final", "icon" : "assets/images/img-rotator-01-lg.png", "actividades" : [ {"id" : 1, "name" : "Exploracion final", "link":"/ZonaDeVuelo/ExploracionFinal/zv_exploracionfinal", "status" : 0} ]  }
                                                                    ]},
                                                                    
                                        { "idEtapa" : 2, "retos" : [    {"idReto": 7, "name" : "Reto 1", "icon" : "assets/images/img-rotator-01-lg.png", "actividades" : [ {"id" : 1, "name" : "Actividad X", "status" : 0} ] },
                                                                        {"idReto": 8, "name" : "Reto 2", "icon" : "assets/images/img-rotator-01-lg.png", "actividades" : [ {"id" : 1, "name" : "Actividad X", "status" : 0} ]},                                                                    
                                                                    ]},
                                                                    
                                        { "idEtapa" : 3, "retos" : [    {"idReto": 9, "name" : "Reto 1", "icon" : "assets/images/img-rotator-01-lg.png", "actividades" : [ {"id" : 1, "name" : "Actividad X", "status" : 0} ] },
                                                                        {"idReto": 10, "name" : "Reto 1", "icon" : "assets/images/img-rotator-01-lg.png", "actividades" : [ {"id" : 1, "name" : "Actividad X", "status" : 0} ] },                                                                    
                                                                    ]}
                                    ]
            };
            
            /*                           
                                "actividades" : [{"name" : "Exploracion inicial", "status" : 0}]}, 
                            {"name" : "Cuarto de recursos", "icon" : "assets/images/img-rotator-01-lg.png", 
                               "actividades" : [{"name" : "Fuente de energia", "status" : 1}]}, 
                            {"name" : "Conócete",  "icon" : "assets/images/img-rotator-01-lg.png",
                                "actividades" : [{"name" : "Fuente de energia", "status" : 1}, {"name" : "Reto múltiple", "status" : 1}, {"name" : "Punto de encuentro", "status" : 1}, {"name" : "Zona de contacto", "status" : 1}  ]}, 
                            {"name" : "Mis sueños", "icon" : "assets/images/img-rotator-01-lg.png",
                                "actividades" : [{"name" : "Fuente de energia", "status" : 1}, {"name" : "Mis gustos", "status" : 1}, {"name" : "Mis cualidades", "status" : 1}, {"name" : "Sueña", "status" : 1}, {"name" : "Punto de encuentro", "status" : 1} ]},
                            {"name" : "Cabina de soporte", "icon" : "assets/images/img-rotator-01-lg.png", 
                               "actividades" : [{"name" : "Chat", "status" : 1}]}, 
                            {"name" : "Exploración final", "icon" : "assets/images/img-rotator-01-lg.png", 
                                "actividades" : [{"name" : "Exploracion final", "status" : 1}]}, 
                          ]                            
                },
                */
                
              var avanceGlobal = 0;  //Avance global del usuario, considerando todas las Actividdes de todos los Retos de todas las Etapas
              var avanceEtapa = [0, 0, 0]; //Avance del usuario, considerando todas las Actividades de todos los Retos, por cada Etapa
              
              var totalDeEtapas = $scope.logroEducativo.etapas.length; //Número total de Etapas
              var totalDeRetos = 0;   //Número total de Retos, considetando todos los Retos de todas las Etapas
              var totalDeActividades = 0; //Número total de Actividdes, considerando todos los Retos de todas las Etapas
              
              //Obtención del total de Retos sobre todas la Etapas (1, 2 y 3)
              for (var i = 0; i < totalDeEtapas; i++) {
                totalDeRetos += $scope.logroEducativo.retosPorEtapa[i].retos.length;           
              }
              
              // Conteo del total de Actividades sobre todas las Etapas
              for (var i = 0; i < totalDeEtapas; i++) {
                  
                  var retos = $scope.logroEducativo.retosPorEtapa[i].retos.length;
                  
                  for (var j = 0; j < retos; j++) {
                        totalDeActividades += $scope.logroEducativo.retosPorEtapa[i].retos[j].actividades.length;               
                }                      
              }
              
              $scope.idEtapa = 0;      //Se identifica la etapa actual como la Etapa 1
              $scope.nombreEtapaActual = $scope.logroEducativo.etapas[$scope.idEtapa].name;   //Se obtiene el nombre de la etapa actual a partir del objeto $scope.logroEducativo
              
              //Cálculo del avance global del usuario sobre todas las Actividades de todas las Etapas (1, 2, 3)
              for (var i = 0; i < totalDeEtapas; i++) {
                  
                  var retosEnEtapa = $scope.logroEducativo.retosPorEtapa[i].retos.length;
                  
                  for (var j = 0; j < retosEnEtapa; j++) {
                        var actividadesEnReto = $scope.logroEducativo.retosPorEtapa[i].retos[j].actividades.length;     
                        
                    for (var k = 0; k < actividadesEnReto; k++) {
                        avanceGlobal += $scope.logroEducativo.retosPorEtapa[i].retos[j].actividades[k].status;               
                    }            
                 }                      
              }
              
              //Cálculo del avance global del usuario en la Etapa actual              
              var avanceEnEtapaActual = 0;
              var totalActividadesEnEtapaActual = 0;
              
              var retosEnEtapaActual = $scope.logroEducativo.retosPorEtapa[$scope.idEtapa].retos.length;
              
              for (var j = 0; j < retosEnEtapaActual; j++) {
                var numActividadesParcial = $scope.logroEducativo.retosPorEtapa[$scope.idEtapa].retos[j].actividades.length;     
                        
                for (var k = 0; k < numActividadesParcial; k++) {
                    avanceEnEtapaActual += $scope.logroEducativo.retosPorEtapa[$scope.idEtapa].retos[j].actividades[k].status;  
                    totalActividadesEnEtapaActual++;             
                }            
              }       
           
            
            //$scope.avanceGlobal = Math.ceil(avanceGlobal*100/totalDeActividades);
            $scope.avanceEnEtapaActual = Math.ceil(avanceEnEtapaActual*100/totalActividadesEnEtapaActual);            
          
            
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
