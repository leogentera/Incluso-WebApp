angular
    .module('incluso.home', [])
    .controller('homeCtrl', [
        '$rootScope',
        '$scope',
        '$location',
        '$anchorScroll',
        '$window',
        '$modal',
        function ($rootScope, $scope, $location, $anchorScroll, $window, $modal ) {
        	// http://stackoverflow.com/questions/15033195/showing-spinner-gif-during-http-request-in-angular
			// To handle page reloads

        	if ($location.$$path.split('/')[1]) {
        		$scope.loading = true;
        	} else {
        		$scope.loading = false;
        	}

            $scope.sideToggle = function(outside){ 
                if(!outside)
                    $rootScope.sidebar = !$rootScope.sidebar;
                else
                    $rootScope.sidebar = false;
                
            };

            $scope.navigateTo = function(url,name,sideToggle,navbarColor){
                $location.path(url);
                console.log(navbarColor);
                if(navbarColor == 'navbarorange'){
                    $rootScope.navbarOrange = true;
                    $rootScope.navbarBlue = false;
                }
                if(navbarColor == 'navbarblue'){
                    $rootScope.navbarOrange = false;
                    $rootScope.navbarBlue = true;
                }

                $("#menuton span").text(name);
                
                if(sideToggle == "sideToggle")
                    $rootScope.sidebar = !$rootScope.sidebar;
            };

            $scope.toolbarOptionActive = function (path) {
                //console.log($location.path().substr(0, path.length + 1));
                if($location.path().substr(0, path.length) === path)
                    return "active disabled";
                else
                    return "";
            }
           
			$scope.playVideo = function(videoAddress, videoName){
                 playVideo(videoAddress, videoName);
            };
			
            $scope.scrollToTop = function(element){         
                $location.hash(element);
                $anchorScroll();      
            }
            
            $scope.challengeName = "MIS RETOS";
            
            $scope.logroEducativo = {
                "userId" : 53,
                "etapas" : [{"etapa1" : {"name" : "Exploración inicial", "icon" : "assets/images/img-rotator-01-lg.png", "status" : 1}}, 
                            {"etapa2" : {"name" : "Exploración inicial", "icon" : "assets/images/img-rotator-01-lg.png", "status" : 1}}, 
                            {"etapa3" : {"name" : "Exploración inicial", "icon" : "assets/images/img-rotator-01-lg.png", "status" : 1}}
                           ],
                "etapasLogradas" : [1],  //Etapas completadas
                "retos" : [ {"name" : "Exploración inicial", "icon" : "assets/images/img-rotator-01-lg.png", 
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
                };
                
              var puntosObtenidos = 0;
              
              var numRetos = $scope.logroEducativo.retos.length;
              
              for (var i = 0; i < numRetos; i++) {
                  var numActividades = $scope.logroEducativo.retos[i].actividades.length;
                  
                  for (var j = 0; j < numActividades; j++) {
                      puntosObtenidos = puntosObtenidos + $scope.logroEducativo.retos[i].actividades[j].status;
                  }
                  
              }
              
              $scope.puntosObtenidos = puntosObtenidos*100/13;
              alert($scope.puntosObtenidos);


            /* scroll to top function and listener */
            $scope.scrollTo = function(element) {
                $location.hash('top');
                $anchorScroll();
                console.log("scrolled to top");
            } 
            $scope.$on('scrollTop', $scope.scrollTo);

            /* Preloader default callbacks and listeners */
            var _showPreloader = function() {
                $scope.loading = true;
                //$scope.modalTransitionIn = true;
            };
            var _hidePreloader = function() {
                $scope.loading = false;
                //$scope.modalTransitionIn = false;
            };
            $scope.$on('ShowPreloader', _showPreloader);
            $scope.$on('HidePreloader', _hidePreloader);


            //// new menu behavior ////
            $scope.leftVisible = false;
            $scope.rightVisible = false;

            $scope.close = function() {
                $scope.leftVisible = false;
                $scope.rightVisible = false;
            };

            $scope.showLeft = function(e) {
                $scope.leftVisible = true;
                e.stopPropagation();
            };

            $scope.showRight = function(e) {
                $scope.rightVisible = true;
                e.stopPropagation();
            }

            $rootScope.$on("documentClicked", _close);
            $rootScope.$on("escapePressed", _close);

            function _close() {
                $scope.$apply(function() {
                    $scope.close(); 
                });
            }

        }]);