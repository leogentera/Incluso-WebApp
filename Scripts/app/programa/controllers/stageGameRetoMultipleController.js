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
         var _loadedResources = false;
         var _pageLoaded = true;

            _timeout = $timeout;
            _httpFactory = $http;

            drupalFactory.Services.GetContent("1039", function (data, key) {
               _loadedResources = true;
                $scope.contentResources = data.node;
                if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
            }, function () { _loadedResources = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); } }, false);

            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;

            $scope.scrollToTop();
            if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader')};
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            var activitiesPosted = 0;
            _setLocalStorageItem("retoMultipleActivities", null);
            $scope.user = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.profile = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            $scope.retosMultipleChallenge = _.find($scope.activities, function(a) { return a.activity_identifier == $routeParams.moodleid});
            if ($scope.retosMultipleChallenge) {
              $scope.stars = $scope.retosMultipleChallenge.points;
              _.each($scope.retosMultipleChallenge.activities, function(a){
                $scope.stars += a.points;
              });
            }

            $scope.isInstalled = false;

            if(!$routeParams.retry){
              for(var key in localStorage){  
                  if(key.indexOf("retoMultipleScores") > -1 && key.indexOf($scope.user.id) < 0){
                      localStorage.removeItem(key);  
                  }
              }
              try {
                cordova.exec(function(data) { $scope.isInstalled = data.isInstalled }, function() {} , "CallToAndroid", " isInstalled", []);
              }
              catch (e) {
                $scope.isInstalled = true;
              }
            }

            var loadData = function(hidePreloader){
              $scope.retoMultipleActivities = [];
              if ($scope.retosMultipleChallenge) {
                retoMultipleArray = $scope.retosMultipleChallenge.activities;
                for(i = 0; i < $scope.retosMultipleChallenge.activities.length; i++){
                  var activity = moodleFactory.Services.GetCacheJson("activity/" + $scope.retosMultipleChallenge.activities[i].coursemoduleid);
                  if (activity) {
                    $scope.retoMultipleActivities.push(activity);
                  } else {
                    moodleFactory.Services.GetAsyncActivity($scope.retosMultipleChallenge.activities[i].coursemoduleid, currentUser.token, function(data) {
                      $scope.retoMultipleActivities.push(data);
                      assignCourseModuleId(true, data);
                    });
                  }
                  if ($scope.retoMultipleActivities.length > 0) {
                    assignCourseModuleId(false, $scope.retosMultipleChallenge.activities[i]);
                  }
                }
              }
            }

            var assignCourseModuleId = function(asyncRequest, data){
              $scope.retoMultipleActivities[$scope.retoMultipleActivities.length - 1]["coursemoduleid"] = 
              ( asyncRequest ? _.find($scope.retosMultipleChallenge.activities, function(r){ return r.activityname == data.name }).coursemoduleid : data.coursemoduleid);
              if ($scope.retoMultipleActivities.length == $scope.retosMultipleChallenge.activities.length) {
                $scope.$emit('HidePreloader');
                $scope.retoMultipleActivities = _.sortBy($scope.retoMultipleActivities, function(r){ return r.coursemoduleid; });
                createRequest();
              }
            }

            var createRequest = function() {
                var request = {
                  "userId": "" + $scope.user.id,
                  "alias": $scope.user.username,
                  "actividad": "Reto múltiple",
                  "actividadTerminada":"",
                  "subactividades": []
                };
                var scoresActivity;
                _.each($scope.retoMultipleActivities, function(activity){
                  if (activity.name.toLowerCase().indexOf("puntaje") < 0 && activity.name.toLowerCase().indexOf("resultados") < 0) {
                    var subactivity = {
                        "estrellas": "300",
                        "subactividad": activity.name,
                        "puntajeFinal": "0"
                    };
                    request.subactividades.push(subactivity);
                  }
                  else  if (activity.name.toLowerCase().indexOf("resultados") >= 0){
                    scoresActivity = activity;
                  }
                });
                var activityAnswers = moodleFactory.Services.GetCacheJson("retoMultipleScores/" + $scope.user.id);
                if (activityAnswers) {
                  setUserAnswers(request, activityAnswers, scoresActivity);
                }else{
                  moodleFactory.Services.GetAsyncActivity(scoresActivity.coursemoduleid + "?userid=" + $scope.user.id, currentUser.token, function(data){
                    data["coursemoduleid"] = scoresActivity.coursemoduleid;
                    setUserAnswers(request, data, scoresActivity);
                  }); 
                }
            }

            var setUserAnswers = function(request, scores, scoresActivity){
              var equalsLength = (scores.questions != null && scores.questions.length == scoresActivity.questions.length);
              var isFinished = equalsLength;
              var scoreQuestions = (equalsLength ? scores.questions : scoresActivity.questions);
              scores.questions = (scores.questions ? scores.questions : scoresActivity.questions);
              _.each(request.subactividades, function(subactividad) {
                var currentQuestions = _.filter(scores.questions, function(q) { return q.title.toLowerCase().indexOf(subactividad.subactividad.toLowerCase()) >= 0 });
                _.each(currentQuestions, function(question) {
                  var answer = fillArray("-1", "-1", 9);
                  var isQuestion = question.title.toLowerCase().indexOf("personal") >= 0;
                  if (question.title.toLowerCase().indexOf("puntaje") >= 0) {
                    answer = (question.userAnswer == "" ? "0" : question.userAnswer);
                    subactividad["puntajeFinal"] = answer;
                  }else if(question.title.toLowerCase().indexOf("detalle") >= 0){
                    answer = (question.userAnswer == "" ? answer : question.userAnswer.split(";"));
                    if (!isQuestion) {   
                      subactividad["detallePuntaje"] = answer;
                    }
                  }
                  if (question.title.toLowerCase().indexOf("nivel") < 0) {
                    question.userAnswer = getAnswer(answer, true);
                    isFinished = isFinished && (typeof answer == 'object' ? !(_.countBy(answer, function(a){ return a==-1 ? 'unanswered':'answered' }).unanswered) : true);
                  }
                });
              });
              _setLocalStorageJsonItem("retoMultipleActivities", $scope.retoMultipleActivities);
              _setLocalStorageJsonItem("retoMultipleScores/" + $scope.user.id, scores);
              request.actividadTerminada = (isFinished ? "Si" : "No");
              $scope.$emit('HidePreloader');
              
              try {
                cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [request]);
              }
              catch (e) {
                successGame(
                  {"userid":"103","resultado":[{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Sé tocar algún instrumento?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","detallePuntaje":["10000","1800","-1","-1","-1","-1","-1","-1","-1"],"fechaFin":"","duración":"0","subactividad":"Musical","fechaInicio":""},{"preguntas":[{"respuesta":"5","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"8","pregunta":"¿Disfruté este reto?"},{"respuesta":"6","pregunta":"¿Me gusta enseñar lo que sé a otras personas?"},{"respuesta":"Si","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"1","puntajeInterno":"20000","fechaFin":"11\/23\/2015 12:40:34","duración":"8","subactividad":"Interpersonal","detallePreguntas":["3","2","1","1","2","3","3","3"],"fechaInicio":"11\/23\/2015 12:32:34"},{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Me gustaría tener mi propio jardín en el que pueda cultivar mis alimentos?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1","-1"],"fechaFin":"","duración":"0","subactividad":"Naturalista","fechaInicio":""},{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Me gusta evaluar las consecuencias antes de tomar una decisión?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","fechaFin":"","duración":"0","subactividad":"Intrapersonal","detallePreguntas":["0","0","0","0","0","0","0","0"],"fechaInicio":""},{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Me gusta ser la primera en bailar en las fiestas?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1","-1"],"fechaFin":"","duración":"0","subactividad":"Corporal","fechaInicio":""},{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Cuándo me dirijo a un lugar nuevo, me es fácil ubicarme?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1","-1"],"fechaFin":"","duración":"0","subactividad":"Espacial","fechaInicio":""},{"nivelInteligencia":"2","preguntas":[{"respuesta":"10","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"8","pregunta":"¿Disfruté este reto?"},{"respuesta":"10","pregunta":"¿Me gusta clasificar cosas por colores, tamaños y tener todo en orden?"},{"respuesta":"Si","pregunta":"¿Te gustó la actividad?"}],"puntajeInterno":"9633","subactividad":"Matemática","duración":"22","fechaFin":"11\/23\/2015 18:33:56","detallePuntaje":["5800","5500","1000","0","0","0","0","0","0"],"fechaInicio":"11\/23\/2015 12:32:34"},{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Me gustan los juegos de palabras y los crucigramas?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1","-1"],"fechaFin":"","duración":"0","subactividad":"Lingüística","fechaInicio":""}],"inteligenciaPredominante":[{"puntuación":"","inteligencia":""},{"puntuación":"","inteligencia":""},{"puntuación":"","inteligencia":""}],"userId":"196","escudo":"","actividad":"Reto múltiple"}
                  )
              }
            }

            $scope.downloadGame = function () {
              $scope.$emit('ShowPreloader');
              loadData();
            }
            
            var successGame = function (data){
                var shield = "";
                var quizzesRequests = [];
                var predominantes = [];

                if (data.escudo != "") {
                  shield = data.escudo;
                  shield = ( shield.toLowerCase().indexOf('matem') > -1 ? 'Matematica' : ( shield.toLowerCase().indexOf('ling') > -1 ? 'Linguistica' : shield ));
                }

                if (data.inteligenciaPredominante) {
                  for (var i = 0; i < data.inteligenciaPredominante.length; i++) {
                    if (data.inteligenciaPredominante[i]) {
                      var inteligencia = data.inteligenciaPredominante[i].inteligencia;
                      if (inteligencia != "") {
                        predominantes.push((inteligencia.toLowerCase().indexOf('matem') > -1 ? 'Matemática' : ( inteligencia.toLowerCase().indexOf('ling') > -1 ? 'Lingüística' : inteligencia )));
                      }
                    }
                  }
                }
                var scoreEntry = {
                  "userid": $scope.user.id,
                  "answers": [],
                  "coursemoduleid": "",
                  "like_status": 1,
                  "startingTime": getdatenow(),
                  "endingTime": getdatenow(),
                  "quiz_answered": false
                };
                if (data.resultado) {
                  var scoreQuiz = moodleFactory.Services.GetCacheJson("retoMultipleScores/" + $scope.user.id);
                  scoreQuiz = (!scoreQuiz || !scoreQuiz.questions ? _find($scope.retoMultipleActivities, function(a){ a.name.toLowerCase().indexOf("resultados") >= 0 }) : scoreQuiz );
                  _.each($scope.retoMultipleActivities, function(r){ 
                    var inteligencia = _.find(data.resultado,function(a){ return r.name.toLowerCase().indexOf(a.subactividad.toLowerCase()) > -1; });
                    if(inteligencia){
                      inteligencia.puntajeInterno = (inteligencia.puntajeInterno == "" ? "0" : inteligencia.puntajeInterno );
                      var isQuestion = (inteligencia.subactividad.toLowerCase().indexOf("personal") >= 0);
                      var isAnswered = _.countBy((isQuestion ? inteligencia.detallePreguntas : inteligencia.detallePuntaje ), function(p){ return p == (isQuestion ? 0 : -1 ) ? 'unanswered' : 'answered' });
                      var answer = (isQuestion ? fillArray(inteligencia.puntajeInterno, ( !isAnswered.unanswered ? "0" : "-1"), 9) : inteligencia.detallePuntaje);
                      scoreEntry.quiz_answered = scoreEntry.quiz_answered || isAnswered.answered > 0;
                      _.each(scoreQuiz.questions, function(question){
                        var questionTitle = question.title.toLowerCase();
                        if (questionTitle.indexOf(r.name.toLowerCase()) >= 0) {
                          question.userAnswer = (questionTitle.indexOf("puntaje") >= 0 ? 
                            inteligencia.puntajeInterno : ( questionTitle.indexOf("nivel") >= 0 ? inteligencia.nivelInteligencia : getAnswer(answer,true)));
                        }
                      });
                      scoreEntry.answers.push(inteligencia.puntajeInterno);
                      scoreEntry.answers.push(getAnswer(answer, false));
                      scoreEntry.answers.push(inteligencia.nivelInteligencia);
                    }else if (r.name.toLowerCase().indexOf("resultados") >= 0){
                      scoreEntry.coursemoduleid = r.coursemoduleid;
                    }
                  });
                  _setLocalStorageJsonItem("retoMultipleScores/" + $scope.user.id, scoreQuiz);
                  quizzesRequests.push(scoreEntry);
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
                      for (var j = 0; j < data.resultado[i].preguntas.length - 1; j++) {
                          activity.questions[j]["userAnswer"] = data.resultado[i].preguntas[j].respuesta;
                          logEntry.answers.push(data.resultado[i].preguntas[j].respuesta);
                          logEntry.quiz_answered = (data.resultado[i].preguntas[j].respuesta != "" && logEntry.quiz_answered);
                      }

                      logEntry.answers.push(data.resultado[i].nivelInteligencia);
                      var isAlto = _.find(predominantes, function(p) {
                          return p == data.resultado[i].subactividad
                      });
                      activity.score = (isAlto) ? 3 : 1;
                      activity.total_score = data.resultado[i].puntajeInterno;
                      logEntry.coursemoduleid = activity.coursemoduleid;
                      logEntry.like_status = (data.resultado[i].preguntas[3].respuesta == "No" ? 0 : 1);
                      logEntry.startingTime = data.resultado[i].fechaInicio;
                      logEntry.endingTime = data.resultado[i].fechaFin;
                      quizzesRequests.push(logEntry);
                    }
                  }
                }
                $scope.activitiesLength = 0;
                var completedActivities = _.countBy($scope.retoMultipleActivities, function(a) {
                    if (a.questions && a.name.toLowerCase().indexOf("puntaje") < 0 && a.name.toLowerCase().indexOf("resultados") < 0) {
                        var questionAnswers = _.countBy(a.questions, function(q) {
                            return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                        });
                        $scope.activitiesLength++;
                        return questionAnswers && questionAnswers.answered > 0 ? 'completed' : 'incompleted';
                    }
                });

                $scope.IsComplete = $scope.retoMultipleActivities && 
                                    completedActivities.completed && 
                                    $scope.retoMultipleActivities && 
                                    completedActivities.completed >= $scope.activitiesLength  &&
                                    completedActivities.completed > 1;

                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivityIdentifier = $routeParams.moodleid;
                var parentActivity = getActivityByActivity_identifier(parentActivityIdentifier, userCourseUpdated);
                var subactivitiesCompleted = [];
                _.each(quizzesRequests, function(q){
                  if(q.quiz_answered){
                    subactivitiesCompleted.push(q.coursemoduleid);
                  }
                });

                if (parentActivity.status == 0 && $scope.IsComplete) {
                  if (shield != "" && $scope.profile) {
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
                      }else if(a.score != -1){
                        $scope.profile["windowOfOpportunity"].push(a.name)
                      }
                    });

                    _setLocalStorageJsonItem("Perfil/" + $scope.user.id, $scope.profile);
                    _setLocalStorageJsonItem("CurrentUser", currentUser)

                    $scope.saveUser();
                  }
                  _endActivity(parentActivity, function(){});
                  parentActivity.status = 1;
                  if (parentActivity.activities) {
                    updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted);
                  }
                }
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
                  if ($routeParams.retry) {
                    moodleFactory.Services.ExecuteQueue();
                  }                  
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

            var fillArray = function(values, fill, length){
              var result = (typeof values == 'string' ? values.split(";") : values );
              for (var i = result.length; i < length; i++) {
                result.push(fill);
              }
              return result;
            }

            var getAnswer = function(answer, forLocalStorage){
                var answerConcat = "";
                if (typeof answer != 'string') {
                    _.each(answer, function(r){
                        answerConcat = answerConcat + (answerConcat != "" ? (forLocalStorage ? ";" : "\n" ) : "") + cleanText(r).trim();
                    });
                    return answerConcat;
                }
                return cleanText(answer);
            }

            var cleanText = function (userAnswer) {
                var result = userAnswer.replace("/\r/", "");
                result = userAnswer.replace("/<br>/", "");
                result = userAnswer.replace("/<p>/", "");
                result = userAnswer.replace("/</p>/", "");
                result = userAnswer.replace("/;/", "");
                result = userAnswer.replace("/\n/", "");
                return result;
            }

            function getdatenow() {
                var date = new Date(),
                    year = date.getFullYear(),
                    month = formatValue(date.getMonth() + 1),
                    day = formatValue(date.getDate()),
                    hour = formatValue(date.getHours()),
                    minute = formatValue(date.getMinutes()),
                    second = formatValue(date.getSeconds());

                function formatValue(value) {
                    return value >= 10 ? value : '0' + value;
                }

                return month + "/" + day + "/" + year + " " + hour + ":" + minute + ":" + second;
            }

            if($routeParams.retry){
              loadData();
              try {
                  document.addEventListener("deviceready",  function() { cordova.exec(successGame, failureGame, "CallToAndroid", "setRetoMultipleCallback", [])}, false);
                }
                catch (e) {
                  successGame(
                      {"userid":"103","resultado":[{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Sé tocar algún instrumento?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","detallePuntaje":["10000","1800","-1","-1","-1","-1","-1","-1","-1"],"fechaFin":"","duración":"0","subactividad":"Musical","fechaInicio":""},{"preguntas":[{"respuesta":"5","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"8","pregunta":"¿Disfruté este reto?"},{"respuesta":"6","pregunta":"¿Me gusta enseñar lo que sé a otras personas?"},{"respuesta":"Si","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"1","puntajeInterno":"20000","fechaFin":"11\/23\/2015 12:40:34","duración":"8","subactividad":"Interpersonal","detallePreguntas":["3","2","1","1","2","3","3","3"],"fechaInicio":"11\/23\/2015 12:32:34"},{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Me gustaría tener mi propio jardín en el que pueda cultivar mis alimentos?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1","-1"],"fechaFin":"","duración":"0","subactividad":"Naturalista","fechaInicio":""},{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Me gusta evaluar las consecuencias antes de tomar una decisión?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","fechaFin":"","duración":"0","subactividad":"Intrapersonal","detallePreguntas":["0","0","0","0","0","0","0","0"],"fechaInicio":""},{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Me gusta ser la primera en bailar en las fiestas?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1","-1"],"fechaFin":"","duración":"0","subactividad":"Corporal","fechaInicio":""},{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Cuándo me dirijo a un lugar nuevo, me es fácil ubicarme?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1","-1"],"fechaFin":"","duración":"0","subactividad":"Espacial","fechaInicio":""},{"nivelInteligencia":"2","preguntas":[{"respuesta":"10","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"8","pregunta":"¿Disfruté este reto?"},{"respuesta":"10","pregunta":"¿Me gusta clasificar cosas por colores, tamaños y tener todo en orden?"},{"respuesta":"Si","pregunta":"¿Te gustó la actividad?"}],"puntajeInterno":"9633","subactividad":"Matemática","duración":"22","fechaFin":"11\/23\/2015 18:33:56","detallePuntaje":["5800","5500","1000","0","0","0","0","0","0"],"fechaInicio":"11\/23\/2015 12:32:34"},{"preguntas":[{"respuesta":"","pregunta":"¿Me fue fácil completar el reto?"},{"respuesta":"","pregunta":"¿Disfruté este reto?"},{"respuesta":"","pregunta":"¿Me gustan los juegos de palabras y los crucigramas?"},{"respuesta":"","pregunta":"¿Te gustó la actividad?"}],"nivelInteligencia":"","puntajeInterno":"0","detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1","-1"],"fechaFin":"","duración":"0","subactividad":"Lingüística","fechaInicio":""}],"inteligenciaPredominante":[{"puntuación":"","inteligencia":""},{"puntuación":"","inteligencia":""},{"puntuación":"","inteligencia":""}],"userId":"196","escudo":"","actividad":"Reto múltiple"}
                  );
               }
            }

        }]);
