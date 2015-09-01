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
            var retoMultipleActivitiesParent = localStorage.getItem("retoMultipleActivitiesParent");
            $scope.retoMultipleActivities = $scope.retoMultipleActivities.slice(0,8);
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            var startingTime = new Date();

            function requestCallback() {
                  var response = {
                    "userid": 196,
                    "actividad": "Reto múltiple",
                    "escudo": "", //escudo seleccionado
                    "inteligencia_predominante": [ //puede ser una máximo 3, determinado por el juego
                      {"inteligencia": "Musical", "puntuacion" : "15000"},
                      {"inteligencia": "Matemático", "puntuacion" : "2000"},
                      {"inteligencia": "Corporal", "puntuacion" : "43200"}
                    ] ,
                    "resultado": [
                       {
                          "subactividad":"Musical",
                          "duración": 5,
                          "fecha_inicio": "2015-07-15 14:23:12",
                          "fecha_fin": "2015-07-15  14:28:12",
                          "puntaje_interno": "15500",
                          "nivel_inteligencia": "1", //1: Bajo, 2: Medio, 3:Alto
                          "preguntas":[
                             {"pregunta" : "¿Me fue fácil completar el reto?" , "respuesta" : "4"}, //Escala del 1 al 10
                             {"pregunta" : "¿Disfruté este reto?", "respuesta" : "1"}, // Escala del 1 al 10
                             {"pregunta" : "¿Sé tocar algún instrumento?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Te gustó la actividad?", "respuesta" : "Si"} //Si / No
                          ]
                       },
                       {
                          "subactividad":"Interpersonal",
                          "duración": 5,
                          "fecha_inicio": "2015-07-15 14:23:12",
                          "fecha_fin": "2015-07-15  14:28:12",
                          "puntaje_interno": "15500",
                          "nivel_inteligencia": "1", //1: Bajo, 2: Medio, 3:Alto
                          "preguntas":[
                             {"pregunta" : "¿Me fue fácil completar el reto?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Disfruté este reto?", "respuesta" : "1"}, // Escala del 1 al 10
                             {"pregunta" : "¿Me gusta enseñar lo que sé a otras personas? " , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Te gustó la actividad?", "respuesta" : "Si"} //Si / No
                          ]
                       },
                       {
                          "subactividad":"Naturalista",
                          "duración": 5,
                          "fecha_inicio": "2015-07-15 14:23:12",
                          "fecha_fin": "2015-07-15  14:28:12",
                          "puntaje_interno": "15500",
                          "nivel_inteligencia": "1", //1: Bajo, 2: Medio, 3:Alto
                          "preguntas":[
                             {"pregunta" : "¿Me fue fácil completar el reto?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Disfruté este reto?", "respuesta" : "1"}, // Escala del 1 al 10
                             {"pregunta" : "¿Me gustaría tener mi propio jardín en el que pueda cultivar mis alimentos?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Te gustó la actividad?", "respuesta" : "Si"} //Si / No
                          ]
                       },
                       {
                          "subactividad":"Intrapersonal",
                          "duración": 5,
                          "fecha_inicio": "2015-07-15 14:23:12",
                          "fecha_fin": "2015-07-15  14:28:12",
                          "puntaje_interno": "15500",
                          "nivel_inteligencia": "2", //1: Bajo, 2: Medio, 3:Alto
                          "preguntas":[
                             {"pregunta" : "¿Me fue fácil completar el reto?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Disfruté este reto?", "respuesta" : "1"}, // Escala del 1 al 10
                             {"pregunta" : "¿Me gusta evaluar las consecuencias antes de tomar una decisión?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Te gustó la actividad?", "respuesta" : "Si"} //Si / No
                          ]
                       },
                       {
                          "subactividad": "Corporal",
                          "duración": 5,
                          "fecha_inicio": "2015-07-15 14:23:12",
                          "fecha_fin": "2015-07-15  14:28:12",
                          "puntaje_interno": "15500",
                          "nivel_inteligencia": "3", //1: Bajo, 2: Medio, 3:Alto
                          "preguntas":[
                             {"pregunta" : "¿Me fue fácil completar el reto?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Disfruté este reto?", "respuesta" : "1"}, // Escala del 1 al 10
                             {"pregunta" : "¿Me gusta ser la primera en bailar en las fiestas?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Te gustó la actividad?", "respuesta" : "Si"} //Si / No
                          ]
                       },
                       {
                          "subactividad":"Espacial",
                          "duración": 5,
                          "fecha_inicio": "2015-07-15 14:23:12",
                          "fecha_fin": "2015-07-15  14:28:12",
                          "puntaje_interno": "15500",
                          "nivel_inteligencia": "3", //1: Bajo, 2: Medio, 3:Alto
                          "preguntas":[
                             {"pregunta" : "¿Me fue fácil completar el reto?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Disfruté este reto?", "respuesta" : "1"}, // Escala del 1 al 10
                             {"pregunta" : "¿Cuándo me dirijo a un lugar nuevo, me es fácil ubicarme?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Te gustó la actividad?", "respuesta" : "Si"} //Si / No
                          ]
                       },
                       {
                          "subactividad":"Matemático",
                          "duración": 5,
                          "fecha_inicio": "2015-07-15 14:23:12",
                          "fecha_fin": "2015-07-15  14:28:12",
                          "puntaje_interno": "15500",
                          "nivel_inteligencia": "3", //1: Bajo, 2: Medio, 3:Alto
                          "preguntas":[
                             {"pregunta" : "¿Me fue fácil completar el reto?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Disfruté este reto?", "respuesta" : "1"}, // Escala del 1 al 10
                             {"pregunta" : " ¿Me gusta clasificar cosas por colores, tamaños y tener todo en orden?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Te gustó la actividad?", "respuesta" : "Si"} //Si / No
                          ]
                       },               
                       {
                          "subactividad":"Liguistica",
                          "duración": 5,
                          "fecha_inicio": "2015-07-15 14:23:12",
                          "fecha_fin": "2015-07-15  14:28:12",
                          "puntaje_interno": "15500",
                          "nivel_inteligencia": "1", //1: Bajo, 2: Medio, 3:Alto
                          "preguntas":[
                             {"pregunta" : "¿Me fue fácil completar el reto?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Disfruté este reto?", "respuesta" : "1"}, // Escala del 1 al 10
                             {"pregunta" : "¿Me gustan los juegos de palabras y los crucigramas?" , "respuesta" : "9"}, //Escala del 1 al 10
                             {"pregunta" : "¿Te gustó la actividad?", "respuesta" : "Si"} //Si / No
                          ]
                       }    
                    ]  
                  }

                var shield = "";
                var quizzesRequests = [];

                //Shield of highest score
                if (response.inteligencia_predominante) {
                  shield = _.max(response.inteligencia_predominante, function(m){ 
                    return  m.puntuacion;
                  }).inteligencia;
                }

                //Assign results to answers.
                for (var i = 0; i < response.resultado.length; i++) {
                  var logEntry = {
                    "userid": $scope.user.id,
                    "answers": [],
                    "coursemoduleid": ""
                  };
                  var activity = _.find($scope.retoMultipleActivities, function(a){ return a.name == response.resultado[i].subactividad; });
                  if (activity) {
                    activity.score = response.resultado[i].nivel_inteligencia;
                    var questionAnswers = _.countBy(activity.questions, function(q){
                      return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                    });
                    for(var j = 0; j < response.resultado[i].preguntas.length - 1; j++){
                      if (activity.questions[j]) {
                          activity.questions[j]["userAnswer"] = response.resultado[i].preguntas[j].respuesta;
                          logEntry.answers.push(response.resultado[i].preguntas[j].respuesta);
                      }
                    }
                  logEntry.coursemoduleid = activity.coursemoduleid;
                  logEntry.answers.push(activity.score);
                  quizzesRequests.push(logEntry);
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

                var parentActivityIdentifier = localStorage.getItem("retoMultipleActivitiesParent");
                var parentActivity = getActivityByActivity_identifier(parentActivityIdentifier);
                parentActivity.status = 1;
                _endActivity(parentActivity);

                //localStorage.setItem("usercourse", JSON.stringify(usercourse));
                localStorage.setItem("retoMultipleActivities", JSON.stringify($scope.retoMultipleActivities));
                
                if (parentActivity.activities) {
                  //Updates all the subactivities' status
                  var userCourseUpdated = updateAllActivityStatuses(parentActivity);
                  //Posts the stars of activity and subactivities
                  updateAllSubactivityStars(parentActivity);
                }

                for(i = 0; i < quizzesRequests.length; i++){
                  console.log("saving quiz");
                  var userActivity = _.find(parentActivity.activities, function(a){ return a.coursemoduleid == quizzesRequests[i].coursemoduleid });
                  $scope.saveQuiz(userActivity, quizzesRequests[i], userCourseUpdated)
                }
            }

            $scope.saveAndContinue = function () {
                requestCallback();
                if ($scope.IsComplete) {
                    //$scope.saveUser();
                    $location.path('/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados');
                } else {
                    $location.path('/ZonaDeVuelo/Dashboard/1');
                }
            }

            $scope.saveQuiz = function(activity, quiz, userCourseUpdated) {
              //Update quiz on server
              var results = {
                "userid": currentUser.userId,
                "activityidnumber": activity.coursemoduleid,
                "like_status": "1",
                "updatetype": "1",
                "answers": quiz.answers
              };
              var activityModel = {
                  "usercourse": userCourseUpdated,
                  "coursemoduleid": activity.coursemoduleid,
                  "answersResult": results,
                  "userId": currentUser.userId,
                  "startingTime": startingTime,
                  "endingTime": new Date(),
                  "token": currentUser.token,
                  "activityType": "Quiz"
              };             
              _endActivity(activityModel);
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