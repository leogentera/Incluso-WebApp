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
            $scope.user = moodleFactory.Services.GetCacheJson("profile");
            $scope.activities = moodleFactory.Services.GetCacheJson("activities");
            $scope.profile = moodleFactory.Services.GetCacheJson("profile");
            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            $scope.tmpRetoMultipleRequest = localStorage.getItem("tmpRetoMultipleRequest");   //this is only for debug only
            var retoMultipleActivitiesParent = localStorage.getItem("retoMultipleActivitiesParent");
            //$scope.retoMultipleActivities = $scope.retoMultipleActivities.slice(0,8);
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            var startingTime = new Date();


            function requestCallback() {
                //var response = {"userid":103,"actividad":"Reto múltiple","escudo":"","inteligencia_predominante":[{"inteligencia":"","puntuacion":""},{"inteligencia":"","puntuacion":""},{"inteligencia":"","puntuacion":""}],"resultado":[{"subactividad":"Musical","duración":0,"fecha_inicio":"","fecha_fin":"","puntaje_interno":"","nivel_de_reto":"","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":""},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":""},{"pregunta":"¿Disfruté este reto?","respuesta":""},{"pregunta":"¿Se tocar algún instrumento?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Interpersonal","duración":0,"fecha_inicio":"","fecha_fin":"","puntaje_interno":"","nivel_de_reto":"","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":""},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":""},{"pregunta":"¿Disfruté este reto?","respuesta":""},{"pregunta":"¿Me gusta enseñar lo que sé a otras personas?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"0"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"4"},{"pregunta":"¿Disfruté este reto?","respuesta":"1"},{"pregunta":"¿Me gustraia tener mi propio jardín en el que pueda cultivar mis alimentos?","respuesta":"10"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}],"fecha_inicio":"09/02/2015 17:46:44","fecha_fin":"09/02/2015 17:50:57","duración":"3","puntaje_interno":"9977","subactividad":"Naturalista","nivel_de_reto":"1"},{"subactividad":"Intrapersonal","duración":0,"fecha_inicio":"","fecha_fin":"","puntaje_interno":"","nivel_de_reto":"","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":""},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":""},{"pregunta":"¿Disfruté este reto?","respuesta":""},{"pregunta":"¿Me gusta evaluar las consecuencias antes de tomar una decision?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Corporal","duración":0,"fecha_inicio":"","fecha_fin":"","puntaje_interno":"","nivel_de_reto":"","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":""},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":""},{"pregunta":"¿Disfruté este reto?","respuesta":""},{"pregunta":"¿Me gusta ser la primera en bailar en las fiestas?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Espacial","duración":0,"fecha_inicio":"","fecha_fin":"","puntaje_interno":"","nivel_de_reto":"","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":""},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":""},{"pregunta":"¿Disfruté este reto?","respuesta":""},{"pregunta":"¿Cuándo me dirijo a un lugar nuevo, me es fácil ubicarme?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Matemática","duración":0,"fecha_inicio":"","fecha_fin":"","puntaje_interno":"","nivel_de_reto":"","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":""},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":""},{"pregunta":"¿Disfruté este reto?","respuesta":""},{"pregunta":"¿Me gusta clasificar cosas por colores, tamaños y tener todo en orden?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Lingüística","duración":0,"fecha_inicio":"","fecha_fin":"","puntaje_interno":"","nivel_de_reto":"","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":""},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":""},{"pregunta":"¿Disfruté este reto?","respuesta":""},{"pregunta":"¿Me gustan los juegos de palabras y los crucigramas?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]}]};
                var response = {"userid":103,"actividad":"Reto múltiple","escudo":"Musical","inteligencia_predominante":[{"inteligencia":"Musical","puntuacion":"13243"},{"inteligencia":"Naturalista","puntuacion":"15500"},{"inteligencia":"Corporal","puntuacion":"15500"}],"resultado":[{"subactividad":"Musical","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"13243","nivel_de_reto":"3","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"3"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Se tocar algún instrumento?","respuesta":"6"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Interpersonal","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"15500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"3"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gusta enseñar lo que sé a otras personas?","respuesta":"8"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Naturalista","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"15500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gustraia tener mi propio jardín en el que pueda cultivar mis alimentos?","respuesta":"5"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Intrapersonal","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"15500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gusta evaluar las consecuencias antes de tomar una decision?","respuesta":"4"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Corporal","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"15500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gusta ser la primera en bailar en las fiestas?","respuesta":"8"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Espacial","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"15500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Cuándo me dirijo a un lugar nuevo, me es fácil ubicarme?","respuesta":"6"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Matemática","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"15500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gusta clasificar cosas por colores, tamaños y tener todo en orden?","respuesta":"2"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Lingüística","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"15500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gustan los juegos de palabras y los crucigramas?","respuesta":"10"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]}]}

                var shield = "";
                var quizzesRequests = [];

                //Shield of highest score
                if (response.inteligencia_predominante) {
                  shield = _.max(response.inteligencia_predominante, function(m){ 
                    return  m.puntuacion;
                  }).inteligencia;
                }

                //Assign results to answers.
                debugger;
                for (var i = 0; i < response.resultado.length; i++) {
                  var logEntry = {
                    "userid": $scope.user.id,
                    "answers": [],
                    "coursemoduleid": "",
                    "like_status": "",
                    "startingTime":"",
                    "endingTime": "",
                    "quiz_answered": true
                  };
                  var activity = _.find($scope.retoMultipleActivities, function(a){ return a.name == response.resultado[i].subactividad; });
                  if (activity) {
                    var questionAnswers = _.countBy(activity.questions, function(q){
                      return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                    });
                    for(var j = 0; j < response.resultado[i].preguntas.length - 1; j++){
                      if (activity.questions[j] && response.resultado[i].preguntas[j].respuesta != "") {
                          activity.questions[j]["userAnswer"] = response.resultado[i].preguntas[j].respuesta;
                          logEntry.answers.push((j < response.resultado[i].preguntas.length - 2 ? response.resultado[i].preguntas[j+1].respuesta : response.resultado[i].preguntas[0].respuesta ));
                      }
                      logEntry.quiz_answered = ( response.resultado[i].preguntas[j].respuesta != "" && logEntry.quiz_answered);
                    }
                  logEntry.coursemoduleid = activity.coursemoduleid;
                  logEntry.like_status = (response.resultado[i].preguntas[4].respuesta == "No" ? 0 : 1 );
                  logEntry.startingTime = response.resultado[i].fecha_inicio;
                  logEntry.endingTime = response.resultado[i].fecha_fin;
                  quizzesRequests.push(logEntry);
                }
              }

                if (shield != "" && $scope.profile) {

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
                        return questionAnswers && questionAnswers.answered > 0 ? 'completed' : 'incompleted';

                    }
                });


                $scope.IsComplete = $scope.retoMultipleActivities && 
                                    completedActivities.completed && 
                                    $scope.retoMultipleActivities && 
                                    completedActivities.completed >= $scope.retoMultipleActivities.length &&
                                    completedActivities.completed > 1;

                //save response
                var parentActivityIdentifier = localStorage.getItem("retoMultipleActivitiesParent");
                var parentActivity = getActivityByActivity_identifier(parentActivityIdentifier);
                var subactivitiesCompleted = [];
                if (parentActivity.status == 0) {
                  if ($scope.IsComplete) {
                    //Updates the status of the parent activity and finishes it
                    //parentActivity.status = 1;
                    _endActivity(parentActivity);
                    
                    //localStorage.setItem("usercourse", JSON.stringify(usercourse));
                    localStorage.setItem("retoMultipleActivities", JSON.stringify($scope.retoMultipleActivities));
                  }
                  if (parentActivity.activities) {
                    //Searches for the quizzes completed
                    _.each(quizzesRequests, function(q){
                      if(q.quiz_answered){
                        subactivitiesCompleted.push(q.coursemoduleid);
                      }
                    });
                    //Posts the stars of the finished subactivities and if they're all finished, posts the stars of the parent
                    updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted);
                    //Updates the statuses of the subactivities completed
                    var userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted);
                  }
                  for(i = 0; i < quizzesRequests.length; i++){
                    if (quizzesRequests[i].quiz_answered) {
                      var userActivity = _.find(parentActivity.activities, function(a){ return a.coursemoduleid == quizzesRequests[i].coursemoduleid });
                      $scope.saveQuiz(userActivity, quizzesRequests[i], userCourseUpdated);
                      subactivitiesCompleted.push(quizzesRequests[i].coursemoduleid);
                    }
                  }
                }

            }

            $scope.saveAndContinue = function () {
                requestCallback();
                if ($scope.IsComplete) {
                    $scope.saveUser();
                    //Only shows the results if all of the quizzes are answered
                    $location.path('/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados');  
                } else {
                    $location.path('/ZonaDeVuelo/Dashboard/1');
                }
            }

            $scope.saveQuiz = function(activity, quiz, userCourseUpdated) {
              //Update quiz on server
              var results = {
                "userid": currentUser.userId,
                "answers": quiz.answers,
                "like_status": quiz.like_status,
                "activityidnumber": activity.coursemoduleid,
                "dateStart": quiz.startingTime,
                "dateEnd": quiz.endingTime
              };
              var activityModel = {
                "usercourse": userCourseUpdated,
                "coursemoduleid": activity.coursemoduleid,
                "answersResult": results,
                "userId": quiz.userid,
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