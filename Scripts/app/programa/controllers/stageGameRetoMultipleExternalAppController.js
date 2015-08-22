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
                              "nivel_de_reto":"1",
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
                              "sub_actividad":"Musical",
                              "duracion":"3 ",
                              "fecha_inicio":"2015-07-15  14:43:12",
                              "fecha_fin":"2015-07-15  14:46:12",
                              "nivel_de_reto":"1"
                           },
                           {
                              "userid":153,
                              "actividad":"Reto múltiple",
                              "sub_actividad":"Naturalista",
                              "duracion":"3 ",
                              "fecha_inicio":"2015-07-15  14:53:12",
                              "fecha_fin":"2015-07-15  14:56:12",
                              "nivel_de_reto":"3",
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
                           }
                        ];

                //answer questions and send to the server (or keep on device until it turns online)
                for(i = 0; i < response.length; i++) {
                    var activity = _.find($scope.retoMultipleActivities, function(a){ return a.name == response[i].sub_actividad; });
                    if (activity) {
                        var questionAnswers = _.countBy(activity.questions, function(q) {
                            return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                        });

                        //only answer activities where no previously answers are found
                        if (questionAnswers && !questionAnswers.answered) {
                            if (response[i].respuestas) {
                                for(j = 0; j < response[i].respuestas.length; j++) {

                                    activity.score = response[i].nivel_de_reto;

                                    if (activity.score == 1) activity.calificacion = "Bajo";
                                    if (activity.score == 2) activity.calificacion = "Medio";
                                    if (activity.score == 3) activity.calificacion = "Alto";

                                    //matched based on indexes request and response should match order
                                    if (activity.questions.length > j) {
                                        if (activity.questions[j]) {
                                            activity.questions[j].userAnswer = response[i].respuestas[j].respuesta;
                                        }
                                    }
                                }
                            }
                        }
                    }
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
                 localStorage.setItem("retoMultipleActivities", JSON.stringify($scope.retoMultipleActivities));
            }


            $scope.saveAndContinue = function () {
                requestCallback();
                if ($scope.IsComplete) 
                    $location.path('/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados');
                else
                    $location.path('/ZonaDeVuelo/Conocete/ProgramaDashboard');
            }


            $scope.back = function () {

                $location.path('/ProgramaDashboard');
            }

        }]);