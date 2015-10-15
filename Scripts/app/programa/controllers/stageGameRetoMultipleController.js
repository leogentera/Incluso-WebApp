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

            _timeout = $timeout;
            _httpFactory = $http;

            $scope.$emit('ShowPreloader');
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;

            $scope.scrollToTop();

            _setLocalStorageItem("retoMultipleActivities", null);

            $scope.user = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.profile = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            var stars = 0;
            var activitiesPosted = 0;

            if (!$scope.retoMultipleActivities) {
               $scope.retoMultipleActivities = [];
               var retosMultipleChallenge = _.find($scope.activities, function(a) { return a.activity_identifier == $routeParams.moodleid});
               if (retosMultipleChallenge) {
                  stars = retosMultipleChallenge.points;
                  retoMultipleArray = retosMultipleChallenge.activities;
                  for(i = 0; i < retosMultipleChallenge.activities.length; i++)
                  {
                    stars = stars + retosMultipleChallenge.activities[i].points;
                    var activity = moodleFactory.Services.GetCacheJson("activity/" + retosMultipleChallenge.activities[i].coursemoduleid);
                    if (activity) {
                        $scope.retoMultipleActivities.push(activity);
                    } else {
                        moodleFactory.Services.GetAsyncActivity(retosMultipleChallenge.activities[i].coursemoduleid, function(data) {
                          $scope.retoMultipleActivities.push(data);
                          assignCourseModuleId(true, data);
                        });
                    }
                    if ($scope.retoMultipleActivities.length > 0) {
                      assignCourseModuleId(false, retosMultipleChallenge.activities[i]);
                    }
                  }
                  _setLocalStorageJsonItem("retoMultipleActivities", $scope.retoMultipleActivities);
//                  _setLocalStorageItem("retoMultipleActivitiesParent", $routeParams.moodleid);
               }
            }

            $scope.stars = stars;
            $scope.isInstalled = false;

            if(!$routeParams.retry){
              try {
                cordova.exec(function(data) { $scope.isInstalled = data.isInstalled }, function() {} , "CallToAndroid", " isInstalled", []);
              }
              catch (e) {
                  $scope.isInstalled = true;
              }
            }


            function assignCourseModuleId(asyncRequest, data){
              $scope.retoMultipleActivities[$scope.retoMultipleActivities.length - 1]["coursemoduleid"] = 
              ( asyncRequest ? _.find(retosMultipleChallenge.activities, function(r){ return r.activityname == data.name }).coursemoduleid : data.coursemoduleid);
              $scope.$emit('HidePreloader');
            }

            function createRequest() {


                var request = {
                            "userid  ": "" + $scope.user.id,
                            "alias": $scope.user.username,
                            "actividad": "Reto múltiple",
                            "sub_actividades": []
                        };

                for(i = 0; i < $scope.retoMultipleActivities.length; i++) {
                    var subactivity = {
                        "estrellas": "300",
                        "sub_actividad": $scope.retoMultipleActivities[i].name
                    };

                    request.sub_actividades.push(subactivity);
                }
                return request;

            }

            $scope.downloadGame = function () {
                var r = createRequest();

                try {
                  cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [r]);
                }
                catch (e) {
                  successGame(
                    {"userid":$scope.user.id,"actividad":"Reto múltiple","escudo":"Corporal","inteligencia_predominante":[{"inteligencia":"Musical","puntuacion":"13243"},{"inteligencia":"Naturalista","puntuacion":"12500"},{"inteligencia":"Corporal","puntuacion":"11500"}],"resultado":[{"subactividad":"Musical","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"13243","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"9"},{"pregunta":"¿Disfruté este reto?","respuesta":"1"},{"pregunta":"¿Me gusta enseñar lo que sé a otras personas?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Interpersonal","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"11500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gusta enseñar lo que sé a otras personas?","respuesta":"8"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Naturalista","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"12500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gustaría tener mi propio jardín en el que pueda cultivar mis alimentos?","respuesta":"5"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Intrapersonal","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"10500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gusta evaluar las consecuencias antes de tomar una decisión?","respuesta":"4"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Corporal","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"11500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gusta ser la primera en bailar en las fiestas?","respuesta":"8"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Espacial","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"9500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Cuándo me dirijo a un lugar nuevo, me es fácil ubicarme?","respuesta":"6"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Matemática","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"85000","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gusta clasificar cosas por colores, tamaños y tener todo en orden?","respuesta":"2"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Lingüística","duración":5,"fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","puntaje_interno":"5500","nivel_de_reto":"1","preguntas":[{"pregunta":"¿Nivel inteligencia?","respuesta":"2"},{"pregunta":"¿Me fue fácil completar el reto?","respuesta":"7"},{"pregunta":"¿Disfruté este reto?","respuesta":"9"},{"pregunta":"¿Me gustan los juegos de palabras y los crucigramas?","respuesta":"10"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]}]}
                  )
                }

            }
            
            var successGame = function (data){
                var shield = "";
                var quizzesRequests = [];
                var predominantes = [];

                if (data.escudo) {
                  shield = data.escudo;
                  shield = ( shield.toLowerCase().indexOf('matem') > -1 ? 'Matematica' : ( shield.toLowerCase().indexOf('ling') > -1 ? 'Linguistica' : shield ));
                }

                if (data.inteligencia_predominante) {
                  for (var i = 0; i < data.inteligencia_predominante.length; i++) {
                    if (data.inteligencia_predominante[i]) {
                      var inteligencia = data.inteligencia_predominante[i].inteligencia;
                      predominantes.push((inteligencia.toLowerCase().indexOf('matem') > -1 ? 'Matemática' : ( inteligencia.toLowerCase().indexOf('ling') > -1 ? 'Lingüística' : inteligencia )));
                    }
                  }
                }
                //Assign results to answers.
                for (var i = 0; i < data.resultado.length; i++) {
                  var logEntry = {
                    "userid": $scope.user.id,
                    "answers": [],
                    "coursemoduleid": "",
                    "like_status": "",
                    "startingTime":"",
                    "endingTime": "",
                    "quiz_answered": true
                  };
                  var activity = _.find($scope.retoMultipleActivities, function(a){ return a.name == data.resultado[i].subactividad; });
                  if (activity) {
                    var questionAnswers = _.countBy(activity.questions, function(q){
                      return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                    });
                    for(var j = 0; j < data.resultado[i].preguntas.length - 1; j++){
                      if (activity.questions[j] && data.resultado[i].preguntas[j].respuesta != "") {
                          activity.questions[j]["userAnswer"] = data.resultado[i].preguntas[j].respuesta;
                          logEntry.answers.push((j < data.resultado[i].preguntas.length - 2 ? data.resultado[i].preguntas[j+1].respuesta : data.resultado[i].preguntas[0].respuesta ));
                      }
                    }
                    var isAlto = _.find(predominantes, function(p) { return p == data.resultado[i].subactividad});
                    activity.score = (isAlto) ? 3 : 1;
                    activity.total_score = data.resultado[i].puntaje_interno;
                    logEntry.quiz_answered = ( data.resultado[i].preguntas[j].respuesta != "" && logEntry.quiz_answered);
                    logEntry.coursemoduleid = activity.coursemoduleid;
                    logEntry.like_status = (data.resultado[i].preguntas[4].respuesta == "No" ? 0 : 1 );
                    logEntry.startingTime = data.resultado[i].fecha_inicio;
                    logEntry.endingTime = data.resultado[i].fecha_fin;
                    quizzesRequests.push(logEntry);
                  }
                }

                var completedActivities = _.countBy($scope.retoMultipleActivities, function(a) {
                    if (a.questions) {
                        var questionAnswers = _.countBy(a.questions, function(q) {
                            return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                        });
                        return questionAnswers && questionAnswers.answered > 0 ? 'completed' : 'incompleted';

                    }
                });


                $scope.IsComplete = $scope.retoMultipleActivities && 
                                    completedActivities.completed && 
                                    $scope.retoMultipleActivities && 
                                    completedActivities.completed >= $scope.retoMultipleActivities.length &&
                                    completedActivities.completed > 1;

                //save response
                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivityIdentifier = $routeParams.moodleid;
                var parentActivity = getActivityByActivity_identifier(parentActivityIdentifier, userCourseUpdated);
                var subactivitiesCompleted = [];
                //Searches for the quizzes completed
                _.each(quizzesRequests, function(q){
                  if(q.quiz_answered){
                    subactivitiesCompleted.push(q.coursemoduleid);
                  }
                });
                //Shield and stars are only assigned if parent activity has neved been completed and all quizzes were answered
                if (parentActivity.status == 0 && $scope.IsComplete) {
                  if (shield != "" && $scope.profile) {
                    //update profile
                    $scope.profile["shield"] = shield;
                    currentUser.shield = shield;
                    var careers = {
                      "Linguistica":["Escritor","Locutor de radio o TV","Periodista","Abogado","Editor de textos","Traductor","Dramaturgo","Bibliotecario","Orador"],
                      "Matematica":["Tecnólogo","Contador","Matemático","Científico","Economista","Ingeniero","Informático","Auditor","Físico"], 
                      "Espacial":["Ingeniero","Topógrafo","Arquitecto","Dibujante","Pintor","Fotógrafo","Diseñador","Marino","Escultor"], 
                      "Musical":["DJ","Fabricante de instrumentos","Afinador de pianos","Compositor","Ingeniero de sonidos","Corista","Cantante","Profesor de música","Productor musical"],
                      "Corporal": ["Actor","Profesor de Educación Física","Coreógrafo","Cirujano","Mecánico","Deportista","Bailarín"], 
                      "Interpersonal":["Sociólogo","Psicólogo social","Vendedor","Publicista","Político","Sacerdote","Educador","Trabajador social","Enfermera"], 
                      "Intrapersonal":["Consejero","Psicólogo clínico","Terapeuta","Filósofo","Teólogo","Maestro de yoga","Coach"], 
                      "Naturalista":["Biólogo","Nutriólogo","Agrónomo","Vererinario","Meteorólogo","Ecologista","Geólogo","Antropóloogo","Chef","Biotecnólogo"]
                    };
                    $scope.profile["recomendedBachelorDegrees"] = careers[shield];
                    $scope.profile["strengths"] = [];
                    $scope.profile["windowOfOpportunity"] = [];
                    _.each($scope.retoMultipleActivities, function(a){
                      if (a.score == 3) {
                        $scope.profile["strengths"].push(a.name);
                      }else{
                        $scope.profile["windowOfOpportunity"].push(a.name)
                      }
                    });

                    _setLocalStorageJsonItem("profile/" + $scope.user.id, $scope.profile);
                    _setLocalStorageJsonItem("CurrentUser", currentUser)

                    $scope.saveUser();
                  }

                  _endActivity(parentActivity, function(){});
                  parentActivity.status = 1;

                  if (parentActivity.activities) {
                    //Posts the stars of the finished subactivities and if they're all finished, posts the stars of the parent
                    updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted);
                  }
                }

                //Updates the statuses of the subactivities completed - Status should always be updated because ending an activity updates the status anyway.
                userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted);
                userCourseUpdated.isMultipleChallengeActivityFinished = $scope.IsComplete;
                
                $scope.$emit('ShowPreloader');
                for(i = 0; i < quizzesRequests.length; i++){
                  if (quizzesRequests[i].quiz_answered) {
                    var userActivity = _.find(parentActivity.activities, function(a){ return a.coursemoduleid == quizzesRequests[i].coursemoduleid });
                    $scope.saveQuiz(userActivity, quizzesRequests[i], userCourseUpdated, subactivitiesCompleted);
                  }
                }
                _setLocalStorageJsonItem("retoMultipleActivities", $scope.retoMultipleActivities);
                _setLocalStorageJsonItem("usercourse", userCourseUpdated);
            }


            $scope.saveQuiz = function(activity, quiz, userCourseUpdated, activitiesFinished) {
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
              _endActivity(activityModel, function(){
                activitiesPosted++;
                if (activitiesPosted == activitiesFinished.length) {
                  $scope.$emit('HidePreloader');
                  if ($scope.IsComplete) {
                    $location.path('/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados');  
                  }else{
                      $location.path('/ZonaDeVuelo/Dashboard/1/2');
                  }
                }
              });
            }

            $scope.saveUser = function () {
                moodleFactory.Services.PutAsyncProfile($scope.user.id, $scope.profile);
            };
                
            var failureGame = function (data){
              $location.path('/ZonaDeVuelo/Dashboard/1/2');
            }

            $scope.back = function () {
                $location.path('/ZonaDeVuelo/Dashboard/1/2');
            }

        }]);