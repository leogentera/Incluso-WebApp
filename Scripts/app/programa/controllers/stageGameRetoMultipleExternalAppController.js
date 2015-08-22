// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
angular
    .module('incluso.stage.gameretomultipleexternalappcontroller', [])
    .controller('stageGameRetoMultipleExternalAppController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {

            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader
            $scope.user = moodleFactory.Services.GetCacheJson("profile");
            $scope.activities = moodleFactory.Services.GetCacheJson("activities");
            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            $scope.tmpRetoMultiples = localStorage.getItem("tmpRetoMultiple");

            function requestCallback() {

                  var response = [{
                     "userid": $scope.user.id,
                     "actividad": "Reto múltiple",
                     "sub_actividad":  "Musical",
                     "duracion": "5",    
                     "fecha_inicio": "2015-07-15 14:23:12",   
                     "fecha_fin":  "2015-07-15  14:28:12",
                     "nivel_de_reto": "1",     
                     "estado": "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4",
                     "respuestas": [
                        {
                           "Pregunta": "¿Nivel inteligencia?",
                           "respuesta": "Medio"
                        },
                        {
                           "Pregunta": "¿Me fue fácil completar el reto?",
                           "respuesta": "Si"
                        },
                        {
                           "Pregunta": "¿Sé tocar algún instrumento?",
                           "respuesta": "Si"
                        },
                        {
                           "Pregunta": "¿Te gustó la actividad?",
                           "respuesta": "Si"
                        }

                     ]

                  },
                  {
                     "userid": $scope.user.id,
                     "actividad": "Reto múltiple",
                     "sub_actividad":  "Naturista",
                     "duracion": "5",    
                     "fecha_inicio": "2015-07-15 14:23:12",   
                     "fecha_fin":  "2015-07-15  14:28:12",
                     "nivel_de_reto": "1",     
                     "estado": "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4",
                     "respuestas": [
                        {
                           "Pregunta": "¿Nivel inteligencia?",
                           "respuesta": "Medio"
                        },
                        {
                           "Pregunta": "¿Me fue fácil completar el reto?",
                           "respuesta": "Si"
                        },
                        {
                           "Pregunta": "¿Sé tocar algún instrumento?",
                           "respuesta": "Si"
                        },
                        {
                           "Pregunta": "¿Te gustó la actividad?",
                           "respuesta": "Si"
                        }

                     ]

                  }
                  ];

                //answer questions and send to the server (or keep until devide is online)
                for(i = 0; i < response.length; i++) {
                    var activity = _.find($scope.retoMultipleActivities, function(a){ return a.name == "Juego " + response[i].sub_actividad; });
                    for(j = 0; j < response[i].respuestas.length; j++) {
                        var question = _.find(activity.questions, function(q) {return q.question == response[i].respuestas[j].Pregunta})
                        if (question) {
                            question.userAnswer = response[i].respuestas[j].respuesta;
                        }
                    }
                }
                //save response
                 localStorage.setItem("retoMultipleActivities", JSON.stringify($scope.retoMultipleActivities));
            }


            $scope.saveAndQuit = function () {
                requestCallback();
                $location.path('/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados');
            }

            $scope.saveAndContinue = function () {
                requestCallback();
                $location.path('/ProgramaDashboard');
            }

            $scope.back = function () {

                $location.path('/ProgramaDashboard');
            }

        }]);