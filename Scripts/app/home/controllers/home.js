﻿angular
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

            $scope.navigateTo = function(url,sideToggle,activityId){
                if(false && activityId!= undefined && activityId > 0 && !$scope.canStartActivity(activityId)) {
                    return false;
                }
                $location.path(url);
                if(sideToggle == "sideToggle")
                    $rootScope.sidebar = !$rootScope.sidebar;
            };

            $scope.setToolbar = function(url,name){
                //Set toolbar color and text based on path
                //Default/global is orange
                $rootScope.showToolbar = true;
                $rootScope.navbarOrange = true;
                $rootScope.navbarBlue = false;
                $rootScope.navbarPink = false;
                $rootScope.navbarGreen = false;
                $rootScope.pageName=name;
                //Stage 1 is blue
                if(url.indexOf("/ZonaDeVuelo")=== 0) {
                    $rootScope.navbarOrange = false;
                    $rootScope.navbarBlue = true;
                    $rootScope.navbarPink = false;
                    $rootScope.navbarGreen = false;
                    $rootScope.pageName = "Zona de Vuelo";
                    //$("#menuton span").text('Zona de Vuelo');
                }//Stage 2 is green
                if(url.indexOf("/ZonaDeNavegacion")=== 0){
                    $rootScope.navbarOrange = false;
                    $rootScope.navbarBlue = false;
                    $rootScope.navbarPink = false;
                    $rootScope.navbarGreen = true;
                    $rootScope.pageName = "Zona de Navegación";
                }//Stage 3 is pink
                if(url.indexOf("/ZonaDeAterrizaje")=== 0){
                    $rootScope.navbarOrange = false;
                    $rootScope.navbarBlue = false;
                    $rootScope.navbarPink = true;
                    $rootScope.navbarGreen = false;
                    $rootScope.pageName = "Zona de Aterrizaje";
                }

            };

            $scope.toolbarOptionActive = function (path) {
                //console.log($location.path().substr(0, path.length + 1));
                if($location.path().substr(0, path.length) === path)
                    return "active disabled";
                else
                    return "";
            };
           
			$scope.playVideo = function(videoAddress, videoName){
                 playVideo(videoAddress, videoName);
            };
			
            $scope.scrollToTop = function(element){         
                $location.hash(element);
                $anchorScroll();      
            };
            
            //*******************************************************************
            /*
            $scope.challengeName = "MIS R";
            
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
              
              /*
              
              
              //*******************************************************************


            /* scroll to top function and listener */
            $scope.scrollTo = function(element) {
                $location.hash('top');
                $anchorScroll();                
            };
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


			$scope.showNotification = function(){
				
				if ($scope.pageName == 'Notificaciones') {
					return false;
				}else{
				var userNotifications = JSON.parse(localStorage.getItem('notifications'));
				//var countNotificationsUnread = _.where(userNotifications, {read: false}).length;
				var countNotificationsUnread = _.filter(userNotifications, function(notif){
                    return (notif.timemodified != null && notif.read != true);
                });				
				$rootScope.totalNotifications = countNotificationsUnread.length;
				return  countNotificationsUnread.length > 0;
				}
			}
			
			$scope.showChatNotification = function(){
				var readChatNotification = localStorage.getItem('chatRead');				
				if ($scope.pageName == 'Chat' || readChatNotification == "true" || readChatNotification == undefined) {
					return false;
				}else{
					var userChat = JSON.parse(localStorage.getItem('userChat'));
					if (userChat && userChat.length >= 1) {					
						var userId = localStorage.getItem('userId');
						
						var lastMessage = _.max(userChat,function(chat){
							return chat.messagedate;
						});
						
						if (lastMessage.messagesenderid != userId) {
							return true;
						}
					}else{
						return false;						
					}
				}
			};

            //Load activity status dictionary
            _activityStatus = {};
            var usercourse = moodleFactory.Services.GetCacheJson("usercourse");
            var stagesCount = usercourse.stages.length;
            var i, j,k;
            for (i = 0; i < stagesCount; i++) {
                var stage = usercourse.stages[i];
                var challengeCount = stage.challenges.length;
                for (j = 0; j <challengeCount ; j++) {
                    var challenge = stage.challenges[j];
                    var challengeActivitiesCount = challenge.activities.length;
                    for (k = 0; k < challengeActivitiesCount; k++) {
                        var activity = challenge.activities[k];
                        console.log(activity.coursemoduleid+" - "+activity.activity_identifier+" - "+activity.activityname);
                        _activityStatus[activity.coursemoduleid] = activity.status;
                    }

                }
            }

            //Helps defining if activity can be started
            $scope.canStartActivity = function(activityId){

                if(!_activityStatus[activityId]) {
                    var activityDependenciesRecord = _.filter(_activityDependencies, function (x) {
                        return x.id == activityId;
                    });
                    if (activityDependenciesRecord[0]) {
                        var activityDependencies = activityDependenciesRecord[0].dependsOn;
                        var dependenciesCount = activityDependencies.length;
                        for (var i = 0; i < dependenciesCount; i++) {
                            if (!_activityStatus[activityDependencies[i]]) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            };

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