// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
angular
    .module('incluso.stage.gameretomultiplecontroller', [])
    .controller('stageGameRetoMultipleController', [
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
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

            $scope.user = moodleFactory.Services.GetCacheJson("profile");
            $scope.activities = moodleFactory.Services.GetCacheJson("activities");
            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            
            if ( $scope.activities == null) {
            $scope.activities = [  
                           {  
                              "coursemoduleid":68,
                              "activitytype":"assign",
                              "name":"Chat",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":81,
                              "activitytype":"assign",
                              "name":"Canvas",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":87,
                              "activitytype":"assign",
                              "name":"Chat",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":90,
                              "activitytype":"assign",
                              "name":"Canvas",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":95,
                              "activitytype":"assign",
                              "name":"Chat",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":76,
                              "activitytype":"resource",
                              "name":"Archivo ejemplo",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":88,
                              "activitytype":"resource",
                              "name":"Archivo ejemplo",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":92,
                              "activitytype":"resource",
                              "name":"Archivo ejemplo",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":52,
                              "activitytype":"quiz",
                              "name":"Exploraci\u00f3n Inicial",
                              "intro":"\u003Cp\u003E\u003Cbr\u003ETest\u003C\/p\u003E"
                           },
                           {  
                              "coursemoduleid":57,
                              "activitytype":"quiz",
                              "name":"Juego Naturista",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":58,
                              "activitytype":"quiz",
                              "name":"Juego Liguistica",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":59,
                              "activitytype":"quiz",
                              "name":"Juego Corporal",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":60,
                              "activitytype":"quiz",
                              "name":"Juego Espacial",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":61,
                              "activitytype":"quiz",
                              "name":"Juego Musical",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":62,
                              "activitytype":"quiz",
                              "name":"Juego Matem\u00e1tico",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":70,
                              "activitytype":"quiz",
                              "name":"Mis gustos",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":71,
                              "activitytype":"quiz",
                              "name":"Mis cualidades",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":72,
                              "activitytype":"quiz",
                              "name":"Sue\u00f1a",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":75,
                              "activitytype":"quiz",
                              "name":"Exploraci\u00f3n inicial",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":77,
                              "activitytype":"quiz",
                              "name":"Creencias limitantes",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":78,
                              "activitytype":"quiz",
                              "name":"Creencias impulsoras",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":82,
                              "activitytype":"quiz",
                              "name":"Mi vida en 1 a\u00f1o",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":83,
                              "activitytype":"quiz",
                              "name":"Mi vida en 3 a\u00f1os",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":84,
                              "activitytype":"quiz",
                              "name":"Mi vida en 5 a\u00f1os",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":86,
                              "activitytype":"quiz",
                              "name":"Exploraci\u00f3n final",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":89,
                              "activitytype":"quiz",
                              "name":"Exploraci\u00f3n Inicial",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":96,
                              "activitytype":"quiz",
                              "name":"Exploraci\u00f3n final",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":100,
                              "activitytype":"quiz",
                              "name":"Exploraci\u00f3n final",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":105,
                              "activitytype":"quiz",
                              "name":"Juego Intrapersonal",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":106,
                              "activitytype":"quiz",
                              "name":"Juego Interpersonal",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":111,
                              "activitytype":"quiz",
                              "name":"Exploracion Inicial",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":63,
                              "activitytype":"forum",
                              "name":"Zona de contacto",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":64,
                              "activitytype":"forum",
                              "name":"Punto de encuentro",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":73,
                              "activitytype":"forum",
                              "name":"Punto de encuentro",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":79,
                              "activitytype":"forum",
                              "name":"Punto de contacto",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":85,
                              "activitytype":"forum",
                              "name":"Foro",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":91,
                              "activitytype":"forum",
                              "name":"Foro",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":93,
                              "activitytype":"forum",
                              "name":"Foro",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":108,
                              "activitytype":"forum",
                              "name":"News forum",
                              "intro":"General news and announcements"
                           },
                           {  
                              "coursemoduleid":74,
                              "activitytype":"page",
                              "name":"Contenido ejemplo",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":80,
                              "activitytype":"page",
                              "name":"Contenido ejemplo",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":102,
                              "activitytype":"page",
                              "name":"Contenido",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":94,
                              "activitytype":"url",
                              "name":"Enlace ejemplo",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":101,
                              "activitytype":"url",
                              "name":"Liga",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":109,
                              "activitytype":"url",
                              "name":"Recuerda cu\u00e1les eran tus juguetes favoritos y descubre m\u00e1s sobre tus inteligencias",
                              "intro":"\u003Cbr\u003E"
                           },
                           {  
                              "coursemoduleid":110,
                              "activitytype":"url",
                              "name":"Mira  hasta donde eres capaz de llegar \u00a1Los l\u00edmites los pones t\u00fa!",
                              "intro":"video"
                           }
                        ];
                     localStorage.setItem("activities", JSON.stringify($scope.activities));
            }

            if ($scope.retoMultipleActivities == null) {
                     $scope.retoMultipleActivities = [
                                 {  
                                    "id":21,
                                    "name":"Juego Naturista",
                                    "description":null,
                                    "activityType":"quiz",
                                    "status":"-1",
                                    "stars":300,
                                    "dateIssued":null,
                                    "score":-1,
                                    "quizType":"survey",
                                    "grade":null,
                                    "questions":[  
                                       {  
                                          "id":22,
                                          "question":"\u003Cp\u003E\u00bfNivel naturista?\u003Cbr\u003E\u003C\/p\u003E",
                                          "questiontype":"multichoice",
                                          "answers":[  
                                             {  
                                                "id":69,
                                                "answer":"\u003Cp\u003EAlto\u003C\/p\u003E",
                                                "fraction":"1.0000000"
                                             },
                                             {  
                                                "id":70,
                                                "answer":"\u003Cp\u003EMedio\u003C\/p\u003E",
                                                "fraction":"0.0000000"
                                             },
                                             {  
                                                "id":71,
                                                "answer":"\u003Cp\u003EBajo\u003C\/p\u003E",
                                                "fraction":"0.0000000"
                                             }
                                          ],
                                          "userAnswer":""
                                       }
                                    ]
                                 },
                                 {  
                                    "id":21,
                                    "name":"Juego Musical",
                                    "description":null,
                                    "activityType":"quiz",
                                    "status":"-1",
                                    "stars":300,
                                    "dateIssued":null,
                                    "score":-1,
                                    "quizType":"survey",
                                    "grade":null,
                                    "questions":[  
                                       {  
                                          "id":22,
                                          "question":"\u003Cp\u003E\u00bfNivel musical?\u003Cbr\u003E\u003C\/p\u003E",
                                          "questiontype":"multichoice",
                                          "answers":[  
                                             {  
                                                "id":69,
                                                "answer":"\u003Cp\u003EAlto\u003C\/p\u003E",
                                                "fraction":"1.0000000"
                                             },
                                             {  
                                                "id":70,
                                                "answer":"\u003Cp\u003EMedio\u003C\/p\u003E",
                                                "fraction":"0.0000000"
                                             },
                                             {  
                                                "id":71,
                                                "answer":"\u003Cp\u003EBajo\u003C\/p\u003E",
                                                "fraction":"0.0000000"
                                             }
                                          ],
                                          "userAnswer":""
                                       }
                                    ]
                                 }
                     ];
                     localStorage.setItem("retoMultipleActivities", JSON.stringify($scope.retoMultipleActivities));
            }

            function calculateStars() {
               var stars = 0;
               _.each($scope.retoMultipleActivities, function(activity) { stars = stars + activity.stars; });
               return stars;
            }

            $scope.stars = calculateStars();

            function createRequest() {


                var request = {
                            "userid  ": $scope.user.id,
                            "alias": $scope.user.username,
                            "actividad": "Reto múltiple",
                            "estado": "",
                            "sub_actividades": []
                        };

                for(i = 0; i < $scope.retoMultipleActivities.length; i++) {
                    var subactivity = {
                                        "estrellas": $scope.retoMultipleActivities[i].stars,
                                        "sub_actividad": $scope.retoMultipleActivities[i].name,
                                        "preguntas": []
                                    };


                    for(j = 0; j < $scope.retoMultipleActivities[i].questions.length; j++) {
                        var pregunta ={
                                   "pregunta":$scope.retoMultipleActivities[i].questions[j].question,
                                   "catalogorespuestas":[]
                                };

                        for(k = 0; k < $scope.retoMultipleActivities[i].questions[j].answers.length; k++ )
                        {
                            var respuesta = {
                                         "respuestaid": $scope.retoMultipleActivities[i].questions[j].answers[k].id,
                                         "respuesta":  $scope.retoMultipleActivities[i].questions[j].answers[k].answer
                                      };

                            pregunta.catalogorespuestas.push(respuesta);

                        }

                        subactivity.preguntas.push(pregunta);
                    }

                    request.sub_actividades.push(subactivity);
                }
                return request;

            }

            $scope.downloadGame = function () {
                var r = createRequest();
                localStorage.setItem("tmpRetoMultiple", JSON.stringify(r));
                $location.path('/ZonaDeVuelo/Conocete/RetoMultipleExternalApp');
            }

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

        }]);