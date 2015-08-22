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
            $scope.retoMultipleActivities = null; //moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            
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
                              "name":"Naturista",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":58,
                              "activitytype":"quiz",
                              "name":"Liguistica",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":59,
                              "activitytype":"quiz",
                              "name":"Corporal",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":60,
                              "activitytype":"quiz",
                              "name":"Espacial",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":61,
                              "activitytype":"quiz",
                              "name":"Musical",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":62,
                              "activitytype":"quiz",
                              "name":"Matem\u00e1tico",
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
                              "name":"Intrapersonal",
                              "intro":""
                           },
                           {  
                              "coursemoduleid":106,
                              "activitytype":"quiz",
                              "name":"Interpersonal",
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
                                    "name":"Naturalista",
                                    "description":"\u003Cp\u003E\u003Ctable border=\u00220\u0022 cellpadding=\u00220\u0022 cellspacing=\u00220\u0022 width=\u0022302\u0022 style=\u0022border-collapse:\r\n collapse;width:227pt\u0022\u003E\r\n \u003Ccolgroup\u003E\u003Ccol width=\u0022302\u0022 style=\u0022;width:227pt\u0022\u003E\r\n \u003C\/colgroup\u003E\u003Ctbody\u003E\u003Ctr height=\u002280\u0022 style=\u0022height:60.0pt\u0022\u003E\r\n\r\n  \u003Ctd height=\u002280\u0022 class=\u0022xl64\u0022 width=\u0022302\u0022 style=\u0022height:60.0pt;width:227pt;\r\n  font-size:11.0pt;color:black;font-weight:400;text-decoration:none;text-underline-style:\r\n  none;text-line-through:none;font-family:Calibri;border:none\u0022\u003ESi prefieres\r\n  platicar con las plantas que con tu abuelita, las hormigas se vuelven tus\r\n  mascotas y entiendes m\u00e1s de biolog\u00eda que otra cosa.\u003Cbr\u003E\r\n    Naturalmente esta es tu inteligencia\u003C\/td\u003E\r\n\r\n \u003C\/tr\u003E\r\n\u003C\/tbody\u003E\u003C\/table\u003E\u003Cbr\u003E\u003C\/p\u003E",
                                    "activityType":"quiz",
                                    "status":"-1",
                                    "stars":-1,
                                    "dateIssued":null,
                                    "score":-1,
                                    "quizType":"survey",
                                    "grade":null,
                                    "questions":[
                                       {
                                          "id":32,
                                          "question":"\u003Cp\u003E\u00bfMe fue f\u00e1cil completar el reto?\u003C\/p\u003E",
                                          "questiontype":"multichoice",
                                          "answers":[
                                             {
                                                "id":99,
                                                "answer":"\u003Cp\u003ES\u00ed\u003C\/p\u003E",
                                                "fraction":"1.0000000"
                                             },
                                             {
                                                "id":100,
                                                "answer":"\u003Cp\u003ENo\u003C\/p\u003E",
                                                "fraction":"0.0000000"
                                             }
                                          ],
                                          "userAnswer":""
                                       },
                                       {
                                          "id":33,
                                          "question":"\u003Cp\u003E\u00bfDisfrut\u00e9 este reto?\u003C\/p\u003E",
                                          "questiontype":"multichoice",
                                          "answers":[
                                             {
                                                "id":101,
                                                "answer":"\u003Cp\u003ES\u00ed\u003C\/p\u003E",
                                                "fraction":"1.0000000"
                                             },
                                             {
                                                "id":102,
                                                "answer":"\u003Cp\u003ENo\u003C\/p\u003E",
                                                "fraction":"0.0000000"
                                             }
                                          ],
                                          "userAnswer":""
                                       },
                                       {
                                          "id":34,
                                          "question":"\u003Cp\u003E\u00bfMe gustar\u00eda tener mi propio jard\u00edn en el que pueda cultivar mis alimentos?\u003C\/p\u003E",
                                          "questiontype":"multichoice",
                                          "answers":[
                                             {
                                                "id":103,
                                                "answer":"\u003Cp\u003ES\u00ed\u003C\/p\u003E",
                                                "fraction":"1.0000000"
                                             },
                                             {
                                                "id":104,
                                                "answer":"\u003Cp\u003ENo\u003C\/p\u003E",
                                                "fraction":"0.0000000"
                                             }
                                          ],
                                          "userAnswer":""
                                       },
                                       {
                                          "id":42,
                                          "question":"\u003Cp\u003ENivel\u003C\/p\u003E",
                                          "questiontype":"multichoice",
                                          "answers":[
                                             {
                                                "id":119,
                                                "answer":"\u003Cp\u003EAlto\u003C\/p\u003E",
                                                "fraction":"1.0000000"
                                             },
                                             {
                                                "id":120,
                                                "answer":"\u003Cp\u003EMedio\u003C\/p\u003E",
                                                "fraction":"0.6000000"
                                             },
                                             {
                                                "id":121,
                                                "answer":"\u003Cp\u003EBajo\u003C\/p\u003E",
                                                "fraction":"0.2000000"
                                             }
                                          ],
                                          "userAnswer":""
                                       }
                                    ]
                                 },
                                 {
                                    "id":21,
                                    "name":"Musical",
                                    "description":"\u003Cp\u003E\u003Ctable border=\u00220\u0022 cellpadding=\u00220\u0022 cellspacing=\u00220\u0022 width=\u0022302\u0022 style=\u0022border-collapse:\r\n collapse;width:227pt\u0022\u003E\r\n \u003Ccolgroup\u003E\u003Ccol width=\u0022302\u0022 style=\u0022;width:227pt\u0022\u003E\r\n \u003C\/colgroup\u003E\u003Ctbody\u003E\u003Ctr height=\u002280\u0022 style=\u0022height:60.0pt\u0022\u003E\r\n\r\n  \u003Ctd height=\u002280\u0022 class=\u0022xl64\u0022 width=\u0022302\u0022 style=\u0022height:60.0pt;width:227pt;\r\n  font-size:11.0pt;color:black;font-weight:400;text-decoration:none;text-underline-style:\r\n  none;text-line-through:none;font-family:Calibri;border:none\u0022\u003ESi prefieres\r\n  platicar con las plantas que con tu abuelita, las hormigas se vuelven tus\r\n  mascotas y entiendes m\u00e1s de biolog\u00eda que otra cosa.\u003Cbr\u003E\r\n    Naturalmente esta es tu inteligencia\u003C\/td\u003E\r\n\r\n \u003C\/tr\u003E\r\n\u003C\/tbody\u003E\u003C\/table\u003E\u003Cbr\u003E\u003C\/p\u003E",
                                    "activityType":"quiz",
                                    "status":"-1",
                                    "stars":-1,
                                    "dateIssued":null,
                                    "score":-1,
                                    "quizType":"survey",
                                    "grade":null,
                                    "questions":[
                                       {
                                          "id":32,
                                          "question":"\u003Cp\u003E\u00bfMe fue f\u00e1cil completar el reto?\u003C\/p\u003E",
                                          "questiontype":"multichoice",
                                          "answers":[
                                             {
                                                "id":99,
                                                "answer":"\u003Cp\u003ES\u00ed\u003C\/p\u003E",
                                                "fraction":"1.0000000"
                                             },
                                             {
                                                "id":100,
                                                "answer":"\u003Cp\u003ENo\u003C\/p\u003E",
                                                "fraction":"0.0000000"
                                             }
                                          ],
                                          "userAnswer":""
                                       },
                                       {
                                          "id":33,
                                          "question":"\u003Cp\u003E\u00bfDisfrut\u00e9 este reto?\u003C\/p\u003E",
                                          "questiontype":"multichoice",
                                          "answers":[
                                             {
                                                "id":101,
                                                "answer":"\u003Cp\u003ES\u00ed\u003C\/p\u003E",
                                                "fraction":"1.0000000"
                                             },
                                             {
                                                "id":102,
                                                "answer":"\u003Cp\u003ENo\u003C\/p\u003E",
                                                "fraction":"0.0000000"
                                             }
                                          ],
                                          "userAnswer":""
                                       },
                                       {
                                          "id":34,
                                          "question":"\u003Cp\u003E\u00bfMe gustar\u00eda tener mi propio jard\u00edn en el que pueda cultivar mis alimentos?\u003C\/p\u003E",
                                          "questiontype":"multichoice",
                                          "answers":[
                                             {
                                                "id":103,
                                                "answer":"\u003Cp\u003ES\u00ed\u003C\/p\u003E",
                                                "fraction":"1.0000000"
                                             },
                                             {
                                                "id":104,
                                                "answer":"\u003Cp\u003ENo\u003C\/p\u003E",
                                                "fraction":"0.0000000"
                                             }
                                          ],
                                          "userAnswer":""
                                       },
                                       {
                                          "id":42,
                                          "question":"\u003Cp\u003ENivel\u003C\/p\u003E",
                                          "questiontype":"multichoice",
                                          "answers":[
                                             {
                                                "id":119,
                                                "answer":"\u003Cp\u003EAlto\u003C\/p\u003E",
                                                "fraction":"1.0000000"
                                             },
                                             {
                                                "id":120,
                                                "answer":"\u003Cp\u003EMedio\u003C\/p\u003E",
                                                "fraction":"0.6000000"
                                             },
                                             {
                                                "id":121,
                                                "answer":"\u003Cp\u003EBajo\u003C\/p\u003E",
                                                "fraction":"0.2000000"
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
                                        "sub_actividad": $scope.retoMultipleActivities[i].name
                                    };

                    request.sub_actividades.push(subactivity);
                }

                return request;

            }

            $scope.downloadGame = function () {
                var r = createRequest();
                localStorage.setItem("tmpRetoMultipleRequest", JSON.stringify(r));
                $location.path('/ZonaDeVuelo/Conocete/RetoMultipleExternalApp');
            }

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

        }]);