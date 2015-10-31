angular
    .module('incluso.stage.multiplicatudineroController', [])
    .controller('stageMultiplicaTuDineroController', [
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

            drupalFactory.Services.GetContent("3303", function (data, key) {
                $scope.contentResources = data.node;
            }, function () {}, false);

            drupalFactory.Services.GetContent("3303results", function (data, key) {
                $scope.contentResourcesResult = data.node;
            }, function () {}, false);

            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false; 

            $scope.scrollToTop();

            _setLocalStorageItem("multiplicaTuDineroActivities", null);

            $scope.user = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.multiplicaTuDineroActivity = moodleFactory.Services.GetCacheJson("multiplicaTuDineroActivities");
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            $scope.stars = 0;
            $scope.isInstalled = false;

            if (!$routeParams.retry) {
                try {
                  cordova.exec(function(data) { $scope.isInstalled = data.isInstalled }, function() {} , "CallToAndroid", " isInstalled", []);
                }
                catch (e) {
                    $scope.isInstalled = true;
                }
            }else{
                try {
                    document.addEventListener("deviceready",  function() { cordova.exec(successGame, failureGame, "CallToAndroid", "setMultiplicaTuDineroCallback", [])}, false);
                }
                catch (e) {
                    successGame(
                        {"userid":2,"pathImagenes":"","actividad":"Multiplica tu dinero","duracion":"5","fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","actividad_completa":"Si","calificacion":"Reprobado","gusta_actividad":"Si","respuestas":[{"preguntaId":127,"respuestaId":529},{"preguntaId":129,"respuestaId":534},{"preguntaId":130,"respuestaId":536},{"preguntaId":133,"respuestaId":545},{"preguntaId":137,"respuestaId":557},{"preguntaId":139,"respuestaId":563},{"preguntaId":140,"respuestaId":567},{"preguntaId":142,"respuestaId":573}]}
                    );
                }
            }
            if ($routeParams.moodleid) {
                if (!$scope.multiplicaTuDineroActivity) {
                    $scope.multiplicaTuDineroActivity = {};
                    var multiplicaTuDinero = _.find($scope.activities, function(a){ return a.activity_identifier == $routeParams.moodleid});
                    if (multiplicaTuDinero) {
                        $scope.stars += multiplicaTuDinero.points;
                        for (var i = 0; i < multiplicaTuDinero.activities.length; i++) {
                            $scope.stars += multiplicaTuDinero.activities[i].points;
                            var activity = moodleFactory.Services.GetCacheJson("activity/" + multiplicaTuDinero.activities[i].coursemoduleid);
                            if (activity) {
                                $scope.multiplicaTuDineroActivity = activity;
                                assignCourseModuleId(false, multiplicaTuDinero.activities[i]);
                            }else{
                                moodleFactory.Services.GetAsyncActivity(multiplicaTuDinero.activities[i].coursemoduleid, currentUser.token, function(data){
                                    $scope.multiplicaTuDineroActivity = data;
                                    assignCourseModuleId(true, data);
                                })
                            }
                        };
                    }
                }
            }else{
                $scope.$emit('HidePreloader');
            }

            function assignCourseModuleId(asyncRequest, data){
                $scope.multiplicaTuDineroActivity["coursemoduleid"] = 
                    ( asyncRequest ? _.find(multiplicaTuDinero.activities, function(r){ return r.activityname == data.name }).coursemoduleid : data.coursemoduleid);
                $scope.$emit('HidePreloader');
                _setLocalStorageJsonItem("multiplicaTuDineroActivities", $scope.multiplicaTuDineroActivity);
            }

            function createRequest(){
                var request = {
                    "userid": $scope.user.id,
                    "alias": $scope.user.username,
                    "actividad": "Multiplica tu dinero",
                    "estrellas": "" + $scope.stars,
                    "pathImagenes":"",
                    "preguntas": [],
                    "introducción": $scope.multiplicaTuDineroActivity.description,
                    "retro_aprobado":(_.max($scope.multiplicaTuDineroActivity.quiz_feedback, function(a){ return a.mingrade; })).feedbacktext,
                    "retro_regular":(_.find($scope.multiplicaTuDineroActivity.quiz_feedback, function(a){ return a.maxgrade == 5; })).feedbacktext,
                    "retro_reprobado":(_.min($scope.multiplicaTuDineroActivity.quiz_feedback, function(a){ return a.mingrade; })).feedbacktext
                }
                for (var i = 0; i < $scope.multiplicaTuDineroActivity.questions.length; i++) {
                    var currentQuestion = $scope.multiplicaTuDineroActivity.questions[i];
                    var question = {
                        "orden": i + 1,
                        "preguntaId": currentQuestion.id,
                        "pregunta": currentQuestion.question,
                        "imagen": currentQuestion.tag + ".jpg",
                        "respuestas":[],
                        "retro_resp_correcta":"",
                        "retro_resp_incorrecta":""
                    }
                    for(var j = 0; j < currentQuestion.answers.length; j++){
                        var currentAnswer = currentQuestion.answers[j];
                        var answer = {
                            "respuestaId": currentAnswer.id,
                            "respuesta": currentAnswer.answer,
                            "tipo": (currentAnswer.fraction == 0 ? "incorrecta" : "correcta")
                        }
                        question.respuestas.push(answer);
                        if (currentAnswer.fraction == 0) {
                            question.retro_resp_incorrecta = currentAnswer.feedback;
                        }else{
                            question.retro_resp_correcta = currentAnswer.feedback;
                        }
                    }
                    request.preguntas.push(question);
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
                        /*Completo*/ //{"userid":2,"pathImagenes":"","actividad":"Multiplica tu dinero","duracion":"5","fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","actividad_completa":"Si", "calificacion":"Reprobado","gusta_actividad":"Si","respuestas":[{"preguntaId":127,"respuesta":529},{"preguntaId":128,"respuesta":532},{"preguntaId":129,"respuesta":534},{"preguntaId":130,"respuesta":536},{"preguntaId":131,"respuesta":540},{"preguntaId":132,"respuesta":543},{"preguntaId":133,"respuesta":545},{"preguntaId":134,"respuesta":550},{"preguntaId":135,"respuesta":552},{"preguntaId":136,"respuesta":555},{"preguntaId":137,"respuesta":557},{"preguntaId":138,"respuesta":560},{"preguntaId":139,"respuesta":563},{"preguntaId":140,"respuesta":567},{"preguntaId":141,"respuesta":570},{"preguntaId":142,"respuesta":573},{"preguntaId":143,"respuesta":576},{"preguntaId":144,"respuesta":579},{"preguntaId":145,"respuesta":581},{"preguntaId":146,"respuesta":584}]}
                        /*8 respuestas*/ {"userid":2,"pathImagenes":"","actividad":"Multiplica tu dinero","duracion":"5","fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","actividad_completa":"Si","calificacion":"Reprobado","gusta_actividad":"Si","respuestas":[{"preguntaId":127,"respuestaId":529},{"preguntaId":129,"respuestaId":534},{"preguntaId":130,"respuestaId":536},{"preguntaId":133,"respuestaId":545},{"preguntaId":137,"respuestaId":557},{"preguntaId":139,"respuestaId":563},{"preguntaId":140,"respuestaId":567},{"preguntaId":142,"respuestaId":573}]}
                    );
                }
            }

            function successGame(data){
                //asign answers to the questions
                var logEntry = {
                    "userid": $scope.user.id,
                    "answers": [],
                    "coursemoduleid": $scope.multiplicaTuDineroActivity.coursemoduleid,
                    "like_status": (data.gusta_actividad == "Si" ? 1 : 0 ),
                    "startingTime": data.fecha_inicio,
                    "endingTime": data.fecha_fin
                };
                var quiz_finished = (data.actividad_completa == "Si" ? true : false);
                for(var i = 0; i < $scope.multiplicaTuDineroActivity.questions.length; i++){
                    var activity = $scope.multiplicaTuDineroActivity.questions[i];
                    _.each(data.respuestas, function(a){
                        if (a.preguntaId == activity.id) {
                            activity.userAnswer = a.respuestaId;
                            var answerIndex = activity.answers.getIndexBy("id", a.respuestaId);
                            logEntry.answers.push(answerIndex);
                        }
                    });
                    if (!activity.userAnswer || activity.userAnswer == "") {
                        logEntry.answers.push(null);
                    }
                }
                var questionsAnswered = _.countBy($scope.multiplicaTuDineroActivity.questions, function(q) {
                    return (q.userAnswer && q.userAnswer != '' ? 'completed' : 'incompleted');
                });

                $scope.IsComplete = $scope.multiplicaTuDineroActivity && 
                                    questionsAnswered.completed == data.respuestas.length; //&&
                                    //questionsAnswered.completed && 
                                    //questionsAnswered.completed >= $scope.multiplicaTuDineroActivity.questions.length &&
                                    //questionsAnswered.completed > 0 &&
                                    //quiz_finished;

                //save response
                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
                var subactivitiesCompleted = [];
                var activitiesCompleted = 0;
                if (parentActivity.status == 0) {
                    for (var i = 0; i < parentActivity.activities.length; i++) {
                        if(parentActivity.activities[i].status == 1 && i != 0){
                            activitiesCompleted++;
                        }
                    }
                    if ((activitiesCompleted == parentActivity.activities.length - 1) && $scope.IsComplete) {
                        parentActivity.status = 1;
                        _endActivity(parentActivity, function(){ });
                        $scope.activities = updateActivityManager($scope.activities, parentActivity.coursemoduleid);
                    }
                }
                if (parentActivity.activities) {
                    //TODO: change for all activities in case there are other siblings completed
                    subactivitiesCompleted.push(parentActivity.activities[0].coursemoduleid);
                    updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted);
                    for (var i = 0; i < subactivitiesCompleted.length; i++) {
                        $scope.activities = updateActivityManager($scope.activities, subactivitiesCompleted[i]);
                    };
                    userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted);
                    _setLocalStorageJsonItem("usercourse", userCourseUpdated);
                    _setLocalStorageJsonItem("activityManagers", $scope.activities);
                    $scope.saveQuiz($scope.multiplicaTuDineroActivity, logEntry, userCourseUpdated);
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
                $scope.$emit('ShowPreloader');          
                _endActivity(activityModel, function(){
                    $scope.$emit('HidePreloader');
                    $location.path('/ZonaDeAterrizaje/EducacionFinanciera/ResultadosMultiplicaTuDinero');
                });
            }

            var failureGame = function (data){
              $location.path('/ZonaDeAterrizaje/Dashboard/3/2');
            }

            $scope.back = function () {
                $location.path('/ZonaDeAterrizaje/Dashboard/3/2');
            }

            Array.prototype.getIndexBy = function (name, value) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][name] == value) {
                        return i;
                    }
                }
            }

        }]);