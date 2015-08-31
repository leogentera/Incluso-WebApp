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
                          "nivel_inteligencia ": "1", //1: Bajo, 2: Medio, 3:Alto
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
                          "nivel_inteligencia ": "2", //1: Bajo, 2: Medio, 3:Alto
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
                          "nivel_inteligencia": "2", //1: Bajo, 2: Medio, 3:Alto
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
                          "nivel_inteligencia": "3", //1: Bajo, 2: Medio, 3:Alto
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
                    "activityid": ""
                  };
                  var activity = _.find($scope.retoMultipleActivities, function(a){ return a.name == response.resultado[i].subactividad; });
                  if (activity) {
                    var questionAnswers = _.countBy(activity.questions, function(q){
                      return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                    });
                    for(var j = 0; j < response.resultado[i].preguntas.length; j++){
                      if (activity.questions[j]) {
                          activity.questions[j]["userAnswer"] = response.resultado[i].preguntas[j].respuesta;
                          logEntry.answers.push(response.resultado[i].preguntas[j].respuesta);
                      }
                    }
                  logEntry.activityid = activity.id;
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
                for(i = 0; i < logEntry.answers.length; i++){
                  console.log("saving quiz");
                  console.log(logEntry[i]);
                  //$scope.retoMultipleActivities[i].status = 1;
                  $scope.saveQuiz($scope.retoMultipleActivities[i], quizesRequests[i].answers)
                }
                 localStorage.setItem("retoMultipleActivities", JSON.stringify($scope.retoMultipleActivities));
            }

            var updateActivitiesStatus = function(){
             /* var starsAchieved = 0;
              var currentActivity = _getActivityByCourseModuleId(retoMultipleActivitiesParent);
              if (currentActivity.status == 0) {
                currentActivity.status = 1;
                starsAchieved += parseInt(currentActivity.points);
                _endActivity(currentActivity);
                for (var i = 0; i < $scope.retoMultipleActivities.length; i++) {
                  //currentActivity.activities[i].status = 1;
                  //$scope.retoMultipleActivities[i].status = 1;
                  //_endActivity(currentActivity.activities[i]);
                  starsAchieved += parseInt(currentActivity.activities[i].points);
                }
                if (starsAchieved > 0) {
                  $scope.user.stars = (isNaN(starsAchieved) ? 0 : starsAchieved) + parseInt($scope.user.stars); 
                  var data = {
                    userId: $scope.user.id,
                    stars: starsAchieved,
                    instance: retoMultipleActivitiesParent,
                    instanceType: 0,
                    date: getDate()
                  };
                  moodleFactory.Services.PutStars(data, $scope.user, currentUser.token, successfulCallback, errorCallback);
                }

              }*/
            }

            $scope.saveAndContinue = function () {
                requestCallback();
                if ($scope.IsComplete) {
                    //$scope.saveUser();
                    updateActivitiesStatus();
                    $location.path('/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados');
                } else {
                    $location.path('/ZonaDeVuelo/Dashboard/1');
                }
            }

            $scope.saveQuiz = function(activity, quiz) {
              //answer results = activitynumber answers like_status update_type user_id

              var results = {
                activityidnumber: activity.id,
                answers: quiz,
                like_status: 1,
                updatetype: 1,
                userid: $scope.user.id
              }
              moodleFactory.Services.PutEndActivityQuizes(activity.id, results, activity, currentUser.token, function(data){console.log('success')}, function(data){console.log('error')});
              /*
              var activityModel = {
                    "usercourse": updatedActivityOnUsercourse,
                    "coursemoduleid": $scope.activity.coursemoduleid,
                    "answersResult": $scope.AnswersResult,
                    "userId": $scope.userprofile.id,
                    "startingTime": $scope.startingTime,
                    "endingTime": new Date(),
                    "token" : $scope.currentUser.token
              };
              moodleFactory.Services.PutEndActivityQuizes(activityModel.coursemoduleid, activityModel.answersResult, activityModel.usercourse,activityModel.token,_endActivitySuccessCallback,errorCallback);

              _putAsyncData
              _endActivityQuiz({
                  "usercourse": activity,
                  "coursemoduleid": activity.id,
                  "answersResult": quiz,
                  "userId": $scope.user.id,
                  "startingTime": startingTime,
                  "endingTime": new Date()
              });
                moodleFactory.Services.PutAsyncQuiz(activityId, quiz,

                    function (data) {
                        console.log('Save profile successful...');
                    },
                    function (date) {
                        console.log('Save profile fail...');
                    });*/
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