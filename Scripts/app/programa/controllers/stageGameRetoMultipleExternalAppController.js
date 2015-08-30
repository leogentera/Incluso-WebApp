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

            _timeout = $timeout;
            _httpFactory = $http;
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = false; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader
            $scope.user = moodleFactory.Services.GetCacheJson("profile");
            $scope.activities = moodleFactory.Services.GetCacheJson("activities");
            $scope.profile = moodleFactory.Services.GetCacheJson("profile");
            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            $scope.tmpRetoMultipleRequest = localStorage.getItem("tmpRetoMultipleRequest");   //this is only for debug only

            function requestCallback() {

                  var response = [
                           {
                              "userid":153,
                              "actividad":"Reto múltiple",
                              "sub_actividad":"Musical",
                              "duracion":"5",
                              "fecha_inicio":"2015-07-15 14:23:12",
                              "fecha_fin":"2015-07-15  14:28:12",
                              "estado":"15500",
                              "respuestas":[
                                 {
                                    "Pregunta 1":"¿Nivel inteligencia?",
                                    "respuesta":"3"
                                 },
                                 {
                                    "Pregunta 2":"¿Me fue fácil completar el reto?",
                                    "respuesta":"9"
                                 },
                                 {
                                    "Pregunta 3":"¿Sé tocar algún instrumento?",
                                    "respuesta":"6"
                                 },
                                 {
                                    "Pregunta":"¿Te gustó la actividad?",
                                    "respuesta":"Si"
                                 }
                              ]
                           },
                           {
                              "userid":153,
                              "actividad":"Reto múltiple",
                              "sub_actividad":"Liguistica",
                              "duracion":"5",
                              "fecha_inicio":"2015-07-15 14:23:12",
                              "fecha_fin":"2015-07-15  14:28:12",
                              "estado":"15500",
                              "respuestas":[
                                 {
                                    "Pregunta 1":"¿Nivel inteligencia?",
                                    "respuesta":"3"
                                 },
                                 {
                                    "Pregunta 2":"¿Me fue fácil completar el reto?",
                                    "respuesta":"9"
                                 },
                                 {
                                    "Pregunta 3":"¿Sé tocar algún instrumento?",
                                    "respuesta":"6"
                                 },
                                 {
                                    "Pregunta":"¿Te gustó la actividad?",
                                    "respuesta":"Si"
                                 }
                              ]
                           },
                           {
                              "userid":153,
                              "actividad":"Reto múltiple",
                              "sub_actividad":"Corporal",
                              "duracion":"5",
                              "fecha_inicio":"2015-07-15 14:23:12",
                              "fecha_fin":"2015-07-15  14:28:12",
                              "estado":"15500",
                              "respuestas":[
                                 {
                                    "Pregunta 1":"¿Nivel inteligencia?",
                                    "respuesta":"1"
                                 },
                                 {
                                    "Pregunta 2":"¿Me fue fácil completar el reto?",
                                    "respuesta":"9"
                                 },
                                 {
                                    "Pregunta 3":"¿Sé tocar algún instrumento?",
                                    "respuesta":"6"
                                 },
                                 {
                                    "Pregunta":"¿Te gustó la actividad?",
                                    "respuesta":"Si"
                                 }
                              ]
                           },
                           {
                              "userid":153,
                              "actividad":"Reto múltiple",
                              "sub_actividad":"Espacial",
                              "duracion":"5",
                              "fecha_inicio":"2015-07-15 14:23:12",
                              "fecha_fin":"2015-07-15  14:28:12",
                              "estado":"15500",
                              "respuestas":[
                                 {
                                    "Pregunta 1":"¿Nivel inteligencia?",
                                    "respuesta":"1"
                                 },
                                 {
                                    "Pregunta 2":"¿Me fue fácil completar el reto?",
                                    "respuesta":"9"
                                 },
                                 {
                                    "Pregunta 3":"¿Sé tocar algún instrumento?",
                                    "respuesta":"6"
                                 },
                                 {
                                    "Pregunta":"¿Te gustó la actividad?",
                                    "respuesta":"Si"
                                 }
                              ]
                           },
                           {
                              "userid":153,
                              "actividad":"Reto múltiple",
                              "sub_actividad":"Matemático",
                              "duracion":"5",
                              "fecha_inicio":"2015-07-15 14:23:12",
                              "fecha_fin":"2015-07-15  14:28:12",
                              "estado":"15500",
                              "respuestas":[
                                 {
                                    "Pregunta 1":"¿Nivel inteligencia?",
                                    "respuesta":"1"
                                 },
                                 {
                                    "Pregunta 2":"¿Me fue fácil completar el reto?",
                                    "respuesta":"9"
                                 },
                                 {
                                    "Pregunta 3":"¿Sé tocar algún instrumento?",
                                    "respuesta":"6"
                                 },
                                 {
                                    "Pregunta":"¿Te gustó la actividad?",
                                    "respuesta":"Si"
                                 }
                              ]
                           },
                           {
                              "userid":153,
                              "actividad":"Reto múltiple",
                              "sub_actividad":"Intrapersonal",
                              "duracion":"5",
                              "fecha_inicio":"2015-07-15 14:23:12",
                              "fecha_fin":"2015-07-15  14:28:12",
                              "estado":"15500",
                              "respuestas":[
                                 {
                                    "Pregunta 1":"¿Nivel inteligencia?",
                                    "respuesta":"1"
                                 },
                                 {
                                    "Pregunta 2":"¿Me fue fácil completar el reto?",
                                    "respuesta":"9"
                                 },
                                 {
                                    "Pregunta 3":"¿Sé tocar algún instrumento?",
                                    "respuesta":"6"
                                 },
                                 {
                                    "Pregunta":"¿Te gustó la actividad?",
                                    "respuesta":"Si"
                                 }
                              ]
                           },
                           {
                              "userid":153,
                              "actividad":"Reto múltiple",
                              "sub_actividad":"Interpersonal",
                              "duracion":"5",
                              "fecha_inicio":"2015-07-15 14:23:12",
                              "fecha_fin":"2015-07-15  14:28:12",
                              "estado":"15500",
                              "respuestas":[
                                 {
                                    "Pregunta 1":"¿Nivel inteligencia?",
                                    "respuesta":"2"
                                 },
                                 {
                                    "Pregunta 2":"¿Me fue fácil completar el reto?",
                                    "respuesta":"9"
                                 },
                                 {
                                    "Pregunta 3":"¿Sé tocar algún instrumento?",
                                    "respuesta":"6"
                                 },
                                 {
                                    "Pregunta":"¿Te gustó la actividad?",
                                    "respuesta":"Si"
                                 }
                              ]
                           },
                           {
                              "userid":153,
                              "actividad":"Reto múltiple",
                              "sub_actividad":"Naturalista",
                              "duracion":"3 ",
                              "fecha_inicio":"2015-07-15  14:53:12",
                              "fecha_fin":"2015-07-15  14:56:12",
                              "respuestas":[
                                 {
                                    "Pregunta 1":"¿Nivel inteligencia?",
                                    "respuesta":"3"
                                 },
                                 {
                                    "Pregunta 2":"¿Me fue fácil completar el reto?",
                                    "respuesta":"9"
                                 },
                                 {
                                    "Pregunta 3":"¿Sé tocar algún instrumento?",
                                    "respuesta":"6"
                                 },
                                 {
                                    "Pregunta":"¿Te gustó la actividad?",
                                    "respuesta":"Si"
                                 }
                              ]
                           }
                        ];

                var shield = "";
                var quizesRequests = [];

                //answer questions and send to the server (or keep on device until it turns online)
                for(i = 0; i < response.length; i++) {
                    var activity = _.find($scope.retoMultipleActivities, function(a){ return a.name == response[i].sub_actividad; });
                    if (activity) {
                        var questionAnswers = _.countBy(activity.questions, function(q) {
                            return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                        });

                        if (response[i].respuestas) {

                            if (response[i].respuestas.length > 0 && response[i].respuestas[0].respuesta == "3") {
                              shield = response[i].sub_actividad;
                            }

                          var logEntry = {
                                  "userid":_getItem("userId"),
                                  "answers":[]
                                  };

                            for(j = 0; j < response[i].respuestas.length; j++) {

                                var answer = "0";
                                if (j==0) {
                                  activity.score = response[i].respuestas[0].respuesta;

                                  if (activity.score == "1") activity.calificacion = "Bajo";
                                  if (activity.score == "2") activity.calificacion = "Medio";
                                  if (activity.score == "3") activity.calificacion = "Alto";
                                }

                                //matched based on indexes request and response should match order
                                if (j > 0 && j <= activity.questions.length) {
                                    if (activity.questions[j - 1]) {
                                        activity.questions[j - 1]["userAnswer"] = response[i].respuestas[j].respuesta;
                                        answer = response[i].respuestas[j].respuesta;
                                    }
                                }

                                if (j > 0) {
                                  logEntry.answers.push(answer);
                                }
                            }

                          console.log("calificacion:" + activity.calificacion);
                          logEntry.answers.push(activity.calificacion);
                          quizesRequests.push(logEntry);

                        } else {

                          //no answers.  log entry
                          var logEntry = {
                                  "userid":_getItem("userId"),
                                  "answers":["0", "0", "Si", "Bajo"]  //3 questions and 4th is the control for grading
                                  };

                          quizesRequests.push(logEntry);

                        }
                    }
                }


                if (shield && $scope.profile) {

                  //update profile
                  $scope.profile["shield"] = shield;
                  localStorage.setItem("profile", JSON.stringify($scope.profile));
                }

                var completedActivities = _.countBy($scope.retoMultipleActivities, function(a) {
                    if (a.questions) {
                        var questionAnswers = _.countBy(a.questions, function(q) {
                            return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                        });
                        if (questionAnswers) {
                            console.log("answered:" + questionAnswers.answered);
                        }
                        return questionAnswers && questionAnswers.answered > 0? 'completed' : 'incompleted';

                    }
                });

                $scope.IsComplete = $scope.retoMultipleActivities && 
                                    completedActivities.completed && 
                                    $scope.retoMultipleActivities && 
                                    completedActivities.completed >= $scope.retoMultipleActivities.length;

                //save response
                for(i = 0; i < quizesRequests.length; i++){
                  console.log("saving quiz");
                  console.log(quizesRequests[i].answers);
                  //saveQuiz(activityId,  quizesRequests[i].answers);
                }
                 localStorage.setItem("retoMultipleActivities", JSON.stringify($scope.retoMultipleActivities));
            }


            $scope.saveAndContinue = function () {
                requestCallback();
                if ($scope.IsComplete) {
                    //$scope.saveUser();
                    $location.path('/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados');
                } else {
                    $location.path('/ZonaDeVuelo/Conocete/ProgramaDashboard');
                }
            }

            $scope.saveQuiz = function(activityId, quiz) {
              _putAsyncData
                moodleFactory.Services.PutAsyncQuiz(activityId, quiz,

                    function (data) {
                        console.log('Save profile successful...');
                    },
                    function (date) {
                        console.log('Save profile fail...');
                    });
            }

            $scope.saveUser = function () {

                moodleFactory.Services.PutAsyncProfile(_getItem("userId"), $scope.profile,

                    function (data) {
                        console.log('Save profile successful...');
                    },
                    function (date) {
                        console.log('Save profile fail...');
                    });
            };

            $scope.back = function () {

                $location.path('/ProgramaDashboard');
            }

        }]);