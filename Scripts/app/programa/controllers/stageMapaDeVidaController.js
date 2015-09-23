angular
    .module('incluso.stage.mapadevidaController', [])
    .controller('stageMapaDeVidaController', [
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        function ($scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {

            _timeout = $timeout;
            _httpFactory = $http;

            $scope.$emit('ShowPreloader');
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();

            _setLocalStorageItem("mapaDeVidaActivities", null);

            $scope.user = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.mapaDeVidaActivities = moodleFactory.Services.GetCacheJson("mapaDeVidaActivities");
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 

            $scope.stars = 0;

            if (!$scope.mapaDeVidaActivities) {
                $scope.mapaDeVidaActivities = [];
                var mapaDeVidaActivity = _.find($scope.activities, function(a){ return a.activity_identifier == $routeParams.moodleid});
                if (mapaDeVidaActivity) {
                    $scope.stars += mapaDeVidaActivity.points;
                    for (var i = 0; i < mapaDeVidaActivity.activities.length; i++) {
                        $scope.stars += mapaDeVidaActivity.activities[i].points;
                        var activity = moodleFactory.Services.GetCacheJson("activity/" + mapaDeVidaActivity.activities[i].coursemoduleid);
                        if (activity) {
                            $scope.mapaDeVidaActivities.push(activity);
                            assignCourseModuleId(false, mapaDeVidaActivity.activities[i]);
                        }else{
                            moodleFactory.Services.GetAsyncActivity(mapaDeVidaActivity.activities[i].coursemoduleid, function(data){
                                $scope.mapaDeVidaActivities.push(data);
                                assignCourseModuleId(true, data);
                            })
                        }
                    };
                }
            }

            function assignCourseModuleId(asyncRequest, data){
                $scope.mapaDeVidaActivities[$scope.mapaDeVidaActivities.length - 1]["coursemoduleid"] = 
                    ( asyncRequest ? _.find(mapaDeVidaActivity.activities, function(r){ return r.activityname == data.name }).coursemoduleid : data.coursemoduleid);
                $scope.$emit('HidePreloader');
                _setLocalStorageJsonItem("mapaDeVidaActivities", $scope.mapaDeVidaActivities);
            }

            function createRequest(){
                var request = {
                    "userid": $scope.user.id,
                    "alias": $scope.user.username,
                    "actividad": "Proyecta tu vida",
                    "estrellas": $scope.stars,
                    "dimensiones": [],
                    "preguntas": []
                } 
                //set dimensiones
                for (var i = 0; i < $scope.mapaDeVidaActivities.length; i++) {
                    var activity = $scope.mapaDeVidaActivities[i];
                    if(activity.name.toLowerCase() != "mapa de vida"){
                        var dimension = { "dimensionId": activity.coursemoduleid, "dimension": activity.name };
                        request.dimensiones.push(dimension);
                        //set questions just once
                        if (i == 1) {
                            for (var j = 0; j < activity.questions.length; j++) {
                                var currentQuestion = activity.questions[j];
                                var question = {
                                    "preguntaId": (j + 1),
                                    "titulo": currentQuestion.title,
                                    "pregunta": currentQuestion.question,
                                    "orden": (j + 1),
                                    "tipoRespuesta": "Abierta"
                                }
                                request.preguntas.push(question);
                            }
                        }
                    }
                };
                return request;
            }

            $scope.downloadGame = function () {
                var r = createRequest();

                try {
                  cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [r]);
                }
                catch (e) {
                    successGame(
                        /*Incompleto*/ //{"userid":"293","actividad":"Proyecta tu vida","duración":"5","fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","actividad_completa":"No","gusta_actividad":"Si","ficha_proyecto":[{"dimensionId":242,"respuestas":[{"preguntaId":1,"respuesta":"Lorem ipsum dolor"},{"preguntaId":2,"respuesta":"Lorem ipsum"},{"preguntaId":3,"respuesta":"Lorem ipsum"},{"preguntaId":4,"respuesta":"Lorem ipsum"},{"preguntaId":5,"respuesta":"Lorem ipsum"},{"preguntaId":6,"respuesta":"Lorem ipsum"}]},{"dimensionId":244,"respuestas":[{"preguntaId":1,"respuesta":"Lorem ipsum"},{"preguntaId":2,"respuesta":"Lorem ipsum"},{"preguntaId":3,"respuesta":"Lorem ipsum"},{"preguntaId":4,"respuesta":"Lorem ipsum"},{"preguntaId":5,"respuesta":"Lorem ipsum"},{"preguntaId":6,"respuesta":"Lorem ipsum"}]}]}
                        /*Completo v.2*/ {"userid":"103","actividad":"Tú eliges","duración":"5","fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15 14:28:12","actividad_completa":"Si","gusta_actividad":"Si","ficha_proyecto":[{"dimensionId":242,"respuestas":[{"preguntaId":1,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dignissim ipsum."},{"preguntaId":2,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dignissim."},{"preguntaId":3,"respuesta":["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla."]},{"preguntaId":4,"respuesta":["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla.","Lorem ipsum dolor sit amet, consectetur adipiscing elit.."]},{"preguntaId":5,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla."},{"preguntaId":6,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit."}]},{"dimensionId":243,"respuestas":[{"preguntaId":1,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing."},{"preguntaId":2,"respuesta":"Lorem ipsum dolor sit amet, consectetur."},{"preguntaId":3,"respuesta":["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla."]},{"preguntaId":4,"respuesta":["Lorem ipsum dolor sit amet, consectetur adipiscing elit","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla.","Lorem ipsum dolor sit amet, consectetur adipiscing elit.."]},{"preguntaId":5,"respuesta":"Lorem ipsum dolor."},{"preguntaId":6,"respuesta":"Lorem ipsum."}]},{"dimensionId":244,"respuestas":[{"preguntaId":1,"respuesta":"Lorem."},{"preguntaId":2,"respuesta":"Lorem ipsum."},{"preguntaId":3,"respuesta":["Lorem, consectetur adipiscing elit. Nulla sit amet.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla."]},{"preguntaId":4,"respuesta":["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla.","Lorem ipsum dolor sit amet, consectetur adipiscing elit.."]},{"preguntaId":5,"respuesta":"Lorem ipsum dolor sit amet."},{"preguntaId":6,"respuesta":"Lorem ipsum dolor sit amet, consectetur."}]},{"dimensionId":245,"respuestas":[{"preguntaId":1,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing."},{"preguntaId":2,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit."},{"preguntaId":3,"respuesta":["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla."]},{"preguntaId":4,"respuesta":["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla.","Lorem ipsum dolor sit amet, consectetur adipiscing elit.."]},{"preguntaId":5,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet."},{"preguntaId":6,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dignissim."}]},{"dimensionId":246,"respuestas":[{"preguntaId":1,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dignissim ipsum."},{"preguntaId":2,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dignissim."},{"preguntaId":3,"respuesta":["Lorem ipsum dolor s iadipiscing elit. Nulla sit amet.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla."]},{"preguntaId":4,"respuesta":["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit.","Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla.","Lorem ipsum dolor sit amet, consectetur adipiscing elit.."]},{"preguntaId":5,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla."},{"preguntaId":6,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit."}]}]}
                        ///*Completo*/{"userid":"103","actividad":"Tú eliges","duración":"5","fecha_inicio":"2015:07:15 14:23:12","fecha_fin":"2015:07:15 14:28:12","actividad_completa":"Si","gusta_actividad":"Si","ficha_proyecto":[{"dimensionId":242,"respuestas":[{"preguntaId":1,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dignissim ipsum."},{"preguntaId":2,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dignissim."},{"preguntaId":3,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet."},{"preguntaId":4,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit."},{"preguntaId":5,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla."},{"preguntaId":6,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit."}]},{"dimensionId":243,"respuestas":[{"preguntaId":1,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing."},{"preguntaId":2,"respuesta":"Lorem ipsum dolor sit amet, consectetur."},{"preguntaId":3,"respuesta":"Lorem ipsum dolor sit amet."},{"preguntaId":4,"respuesta":"Lorem ipsum dolor sit."},{"preguntaId":5,"respuesta":"Lorem ipsum dolor."},{"preguntaId":6,"respuesta":"Lorem ipsum."}]},{"dimensionId":244,"respuestas":[{"preguntaId":1,"respuesta":"Lorem."},{"preguntaId":2,"respuesta":"Lorem ipsum."},{"preguntaId":3,"respuesta":"Lorem ipsum dolor."},{"preguntaId":4,"respuesta":"Lorem ipsum dolor sit."},{"preguntaId":5,"respuesta":"Lorem ipsum dolor sit amet."},{"preguntaId":6,"respuesta":"Lorem ipsum dolor sit amet, consectetur."}]},{"dimensionId":245,"respuestas":[{"preguntaId":1,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing."},{"preguntaId":2,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit."},{"preguntaId":3,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla."},{"preguntaId":4,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit."},{"preguntaId":5,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet."},{"preguntaId":6,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dignissim."}]},{"dimensionId":246,"respuestas":[{"preguntaId":1,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dignissim ipsum."},{"preguntaId":2,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet dignissim."},{"preguntaId":3,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet."},{"preguntaId":4,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit."},{"preguntaId":5,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla."},{"preguntaId":6,"respuesta":"Lorem ipsum dolor sit amet, consectetur adipiscing elit."}]}]}
                    );
                }
            }

            function successGame(data){
                //asign answers to the questions
                var quizzesRequests = [];
                var quiz_finished = false;
                for (var i = 0; i < data.ficha_proyecto.length; i++) {
                    var logEntry = {
                        "userid":$scope.user.id,
                        "answers": [],
                        "coursemoduleid": "",
                        "like_status": "",
                        "startingTime": "",
                        "endingTime": "",
                        "quiz_answered": true
                    };
                    var dimension = data.ficha_proyecto[i];
                    if (dimension) {
                        for (var j = 0; j < dimension.respuestas.length; j++) {
                            var answerConcat = "";
                            var respuesta = data.ficha_proyecto[i].respuestas[j];
                            _.each($scope.mapaDeVidaActivities, function(a){
                                if (dimension.dimensionId == a.coursemoduleid) {
                                    if(typeof respuesta.respuesta != 'string'){
                                        _.each(respuesta.respuesta, function(r){
                                            answerConcat = answerConcat +""+ cleanText(r).trim() + "\n";
                                        });
                                        return a.questions[(respuesta.preguntaId - 1)].userAnswer = answerConcat;
                                    }
                                    return a.questions[(respuesta.preguntaId - 1)].userAnswer = cleanText(respuesta.respuesta);
                                };
                            });
                            logEntry.quiz_answered = (respuesta.respuesta && respuesta.respuesta != "" && logEntry.quiz_answered);
                            logEntry.answers.push([answerConcat != "" ? answerConcat : respuesta.respuesta]);
                        };
                        logEntry.coursemoduleid = dimension.dimensionId;
                        logEntry.startingTime = data.fecha_inicio;
                        logEntry.endingTime = data.fecha_fin;
                        logEntry.like_status = (data.gusta_actividad == "Si" ? 1 : 0 );
                        quiz_finished = (data.actividad_completa == "Si" ? true : false);
                        quizzesRequests.push(logEntry);
                    }
                }

                var quizzesAnswered = _.countBy($scope.mapaDeVidaActivities, function(a){
                    if (a.questions) {
                        var questionsAnswers = _.countBy(a.questions, function(q){
                            return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                        });
                        return questionsAnswers && questionsAnswers.answered == a.questions.length ? 'completed' : 'incompleted';
                    }
                });

                $scope.IsComplete = $scope.mapaDeVidaActivities && 
                                    quizzesAnswered.completed && 
                                    $scope.mapaDeVidaActivities && 
                                    quizzesAnswered.completed >= $scope.mapaDeVidaActivities.length - 1 &&
                                    quiz_finished;
                
                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
                //had to concat unused activity cause if all quizzes were finished parentactivity wouldnt be marked as finished
                var subactivitiesCompleted = [166];
                var activitiesCompleted = 0;
                if (parentActivity.status == 0) {
                    //counts how many quizzes were answered
                    _.each(quizzesRequests, function(q){
                        if(q.quiz_answered){
                            subactivitiesCompleted.push(q.coursemoduleid);
                        }
                    });
                    
                    if ($scope.IsComplete) {
                        parentActivity.status = 1;
                        _endActivity(parentActivity);
                    }
                    if (parentActivity.activities) {
                        updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted);
                        for (var i = 0; i < subactivitiesCompleted.length; i++) {
                            $scope.activities = updateActivityManager($scope.activities, subactivitiesCompleted[i], true);
                        };
                        userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted);
                        _setLocalStorageJsonItem("usercourse", userCourseUpdated);
                        _setLocalStorageJsonItem("activityManagers", $scope.activities);
                        for (var i = 0; i < quizzesRequests.length; i++) {
                            var userActivity = _.find(parentActivity.activities, function(a){ return a.coursemoduleid == quizzesRequests[i].coursemoduleid });
                            if (userActivity.status == 0) {
                                $scope.saveQuiz(userActivity, quizzesRequests[i], userCourseUpdated);
                            }
                        };
                    }
                }
                
                $location.path('/ZonaDeAterrizaje/Dashboard/3/0');
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

            var failureGame = function (data){
              $location.path('/ZonaDeAterrizaje/Dashboard/3/0');
            }

            $scope.back = function () {
                $location.path('/ZonaDeAterrizaje/Dashboard/3/0');
            }

            Array.prototype.getIndexBy = function (name, value) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][name] == value) {
                        return i;
                    }
                }
            }

            function cleanText(userAnswer) {
                var result = userAnswer.replace("/\r/", "");
                result = userAnswer.replace("/<br>/", "");
                result = userAnswer.replace("/<p>/", "");
                result = userAnswer.replace("/</p>/", "");
                result = userAnswer.replace("/\n/", "");
                return result;
            }
        }]);