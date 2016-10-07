angular
    .module('incluso.stage.tueligesController', [])
    .controller('stageTuEligesController', [
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
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false; 

            $scope.scrollToTop();

            _setLocalStorageItem("tuEligesActivities", null);

            $scope.user = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.tuEligesActivities = moodleFactory.Services.GetCacheJson("tuEligesActivities");
            $scope.stars = 0;
            $scope.enabled = true;
            $scope.isInstalled = false;
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 

            if ($routeParams.moodleid) {

                if(!$routeParams.retry){
                    try {
                      cordova.exec(function(data) { $scope.isInstalled = data.isInstalled }, function() {} , "CallToAndroid", " isInstalled", []);
                    }
                    catch (e) {
                        $scope.isInstalled = true;
                    }
                }

                if (!$scope.tuEligesActivities) {
                    $scope.tuEligesActivities = {};
                    var tuEligesActivity = _.find($scope.activities, function(a) { return a.activity_identifier == $routeParams.moodleid });
                    if (tuEligesActivity) {
                        $scope.stars += tuEligesActivity.points;
                        for (var i = 0; i < tuEligesActivity.activities.length; i++) {
                            $scope.stars += tuEligesActivity.activities[i].points;
                            var activity = moodleFactory.Services.GetCacheJson("activity/" + tuEligesActivity.activities[i].coursemoduleid);
                            if (activity) {
                                $scope.tuEligesActivities = activity;
                                assignCourseModuleId(false, tuEligesActivity.activities[i]);
                            }else{
                                moodleFactory.Services.GetAsyncActivity(tuEligesActivity.activities[i].coursemoduleid, currentUser.token, function(data){
                                    $scope.tuEligesActivities = data;
                                    assignCourseModuleId(true, data);
                                }, function(obj) {
                                    $scope.$emit('HidePreloader');
                                });
                            }
                        };
                    }
                }
            }else{
                $scope.$emit('HidePreloader');
            } 

            function assignCourseModuleId(asyncRequest, data){
                $scope.tuEligesActivities["coursemoduleid"] = 
              	    ( asyncRequest ? _.find(tuEligesActivity.activities, function(r){ return r.activityname == data.name }).coursemoduleid : data.coursemoduleid);
                _setLocalStorageJsonItem("tuEligesActivities", $scope.tuEligesActivities);
                $scope.$emit('HidePreloader');
            }

            function createRequest () {
            	var request = {
            		"userId": "" + $scope.user.id,
                    "alias": $scope.user.username,
                    "actividad": $scope.tuEligesActivities.name,
            		"pathImagenes": "",
                    "estrellas": "" + $scope.stars,
                    "introducción": $scope.tuEligesActivities.description,
                    "instrucciones":"Toma este reto y pon a prueba tu toma de decisiones. ¡Sólo tú decides el rumbo de tu vida!",
            		"preguntas": [],
                    "retroAprobado":(_.max($scope.tuEligesActivities.quiz_feedback, function(a){ return a.mingrade; })).feedbacktext,
                    "retroRegular":(_.find($scope.tuEligesActivities.quiz_feedback, function(a){ return a.maxgrade == 5; })).feedbacktext,
                    "retroReprobado":(_.min($scope.tuEligesActivities.quiz_feedback, function(a){ return a.mingrade; })).feedbacktext
            	}
                $scope.questionMap = [];
            	for (var i = 0; i < $scope.tuEligesActivities.questions.length; i++) {
            		var currentQuestion = $scope.tuEligesActivities.questions[i];
                    var questionMap = { "questionId": "" + currentQuestion.id, "orderId": "" + (i + 1), "answers": [] };
            		var question = {
            			"orden": "" + (i + 1),
            			"preguntaId": "" + (i + 1),
            			"pregunta": currentQuestion.question,
            			"imagen":"imagen"+currentQuestion.id+".jpg",
                        "respuestas": [],
                        "retroRespCorrecta":"",
                        "retroRespIncorrecta":""
            		};
            		for(var j = 0; j < currentQuestion.answers.length; j++){
            			var currentAnswer = currentQuestion.answers[j];
	            		var answer = {
	            			"respuestaId": "" + (i * 3 + (j + 1)),
	            			"respuesta": currentAnswer.answer,
                            "tipo": (currentAnswer.fraction == 0 ? "incorrecta" : "correcta")
	            		};
                        questionMap.answers.push({"answerId": "" + currentAnswer.id, "orderId": "" + (i * 3 + (j + 1))});
                        if (currentAnswer.fraction == 0) {
                            question.retroRespIncorrecta = currentAnswer.feedback;
                        }else{
                            question.retroRespCorrecta = currentAnswer.feedback;
                        }
	            		question.respuestas.push(answer);
            		}
            		request.preguntas.push(question);
                    $scope.questionMap.push(questionMap);
            	}
                _setLocalStorageJsonItem("tuEligesQuestionMap", $scope.questionMap);
            	return request;
            }

            $scope.downloadGame = function () {
                var r = createRequest();
                
                try {
                  cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [r]);
                }
                catch (e) {
                    successGame(
                        {"respuestas":[{"preguntaId":"1", "respuestaId":"2"}, {"preguntaId":"2", "respuestaId":"5"},{"preguntaId":"3", "respuestaId":"7"},{"preguntaId":"4", "respuestaId":"11"},{"preguntaId":"5", "respuestaId":"14"},{"preguntaId":"6", "respuestaId":"17"},{"preguntaId":"7", "respuestaId":"20"},{"preguntaId":"8", "respuestaId":"23"}],"userId":"645","actividad":"Tú Eliges", "duracion":"0", "fechaInicio":"2015-11-30 11:45:13","fechaFin":"2015-11-30 11:45:55","actividadCompleta":"Si", "calificación":"Aprobado", "gustaActividad":"Si"}
                    );
                } 
            }

            function successGame(data){
                $scope.questionMap = ($scope.questionMap ? $scope.questionMap : moodleFactory.Services.GetCacheJson("tuEligesQuestionMap"));
            	var logEntry = {
            		"userid":$scope.user.id,
            		"answers": [],
            		"coursemoduleid": $scope.tuEligesActivities.coursemoduleid,
            		"like_status": (data.gustaActividad == "Si" ? 1 : 0 ),
            		"startingTime": data.fechaInicio,
            		"endingTime": data.fechaFin
            	};
            	for (var i = 0; i < data.respuestas.length; i++) {
                    var questionMap = _.find($scope.questionMap, function(q){ return q.orderId == data.respuestas[i].preguntaId });
            		_.each($scope.tuEligesActivities.questions, function(q){
            			if (q.id == questionMap.questionId) {
                            var answerMap = _.find(questionMap.answers, function(a){ return a.orderId == data.respuestas[i].respuestaId});
            				q.userAnswer = data.respuestas[i].respuestaId;
            				var answerIndex = q.answers.getIndexBy("id", answerMap.answerId);
            				logEntry.answers.push(answerIndex);
            			}
            		});
            	}

                var quiz_finished = (data.actividadCompleta == "Si" ? true : false);

            	var questionsAnswered = _.countBy($scope.tuEligesActivities.questions, function(q) {
            		return (q.userAnswer && q.userAnswer != '' ? 'completed' : 'incompleted');
                });

            	$scope.IsComplete = $scope.tuEligesActivities && 
                                    questionsAnswered.completed && 
                                    questionsAnswered.completed >= $scope.tuEligesActivities.questions.length &&
                                    questionsAnswered.completed > 0 &&
                                    quiz_finished;

                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
                var subactivitiesCompleted = [];
                var activitiesCompleted = 0;

                subactivitiesCompleted.push(parentActivity.activities[0].coursemoduleid);

                if (parentActivity.status == 0) {
                    for (var i = 0; i < parentActivity.activities.length; i++) {
                        if(parentActivity.activities[i].status == 1 && i != 0){
                            activitiesCompleted++;
                        }
                    }
                    
                     var setAsCompleted= false; //Indicates if the activity should be completed or not
                     
                    if ($scope.IsComplete && activitiesCompleted == parentActivity.activities.length - 1) {
                        if (data["calificación"] && (data["calificación"] == "Aprobado" || data["calificación"] == "Regular" )) {
                           parentActivity.status = 1;
                           setAsCompleted=true;
                        }
                        else{
                            setAsCompleted=false;
                            parentActivity.status = 0; 
                        }
                        parentActivity.setAsCompleted=setAsCompleted;
                        
                        var userid = localStorage.getItem("userId");
                        var user = JSON.parse(localStorage.getItem("Perfil/" + userid));
                        //update assertiveness on users profile
                        if(data["calificación"] && (data["calificación"] == "Aprobado" || data["calificación"] == "Regular" ) &&
                           (user.assertiveness == "-1" || !user.assertiveness)){
                          user.assertiveness = 1;
                        }else if (data["calificación"] && data["calificación"] == "Reprobado" &&
                                  (user.assertiveness == "-1" || !user.assertiveness)) {
                          user.assertiveness = 0;
                        }
                        moodleFactory.Services.PutAsyncProfile(userid, user,function (data) {},function (obj) {
                            $scope.$emit('HidePreloader');
                        }, false, true);
                        _endActivity(parentActivity, function(){}, function(){
                            $scope.$emit('HidePreloader');
                        }, true);

                        $scope.activities = updateActivityManager($scope.activities, parentActivity.coursemoduleid);
                        //We are going to assing stars once they pass
                        if (setAsCompleted) {
                                updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted, false, function(obj){
                                    $scope.$emit('HidePreloader');
                                }, true);
                        }
                    }
                }
                if (data["calificación"] && data["calificación"] == "Reprobado") {
                    $timeout(function(){
                        $scope.isReprobado = true;
                        _loadedResources = false;
                        _pageLoaded = true;
                        drupalFactory.Services.GetContent("TuEligesRobot", function (data, key) {
                            _loadedResources = true;
                            if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
                            var modalInstance = $modal.open({
                                templateUrl: 'TuEligesModal.html',
                                controller: 'stageTuEligesModalController',
                                resolve: {
                                    content: function () {
                                        return data.node;
                                    }
                                },
                                windowClass: 'closing-stage-modal user-help-modal'
                            });
                        }, function () { _loadedResources = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); } }, false);
                    }, 1000);
                }
                if (parentActivity.activities) {
                    
                    if (setAsCompleted) {
                      for (var i = 0; i < subactivitiesCompleted.length; i++) {
                            $scope.activities = updateActivityManager($scope.activities, subactivitiesCompleted[i]);
                        }
                        userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted); 
                    }
                    _setLocalStorageJsonItem("usercourse", userCourseUpdated);
                    _setLocalStorageJsonItem("activityManagers", $scope.activities);
                    $scope.tuEligesActivities.setAsCompleted=setAsCompleted;
                    $scope.saveQuiz($scope.tuEligesActivities, logEntry, userCourseUpdated);
                }
            }


            $scope.saveQuiz = function(activity, quiz, userCourseUpdated) {
                var results = {
                    "userid": currentUser.userId,
                    "answers": quiz.answers,
                    "like_status": quiz.like_status,
                    "activityidnumber": activity.coursemoduleid,
                    "dateStart": quiz.startingTime,
                    "dateEnd": quiz.endingTime,
                    "setAsCompleted":activity.setAsCompleted
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
                    if ($routeParams.retry) {
                        _forceUpdateConnectionStatus(function() {
                            if (_isDeviceOnline) {
                                moodleFactory.Services.ExecuteQueue();
                            }
                        }, function() {} );
                    }
                    $timeout(function(){
                        $scope.$emit('HidePreloader');
                        var url = "";
                        if ($scope.IsComplete) {
                            url = ($scope.isReprobado ? '/ZonaDeNavegacion/TuEliges/TuEliges/2012' : '/ZonaDeNavegacion/TuEliges/ResultadosTuEliges');
                        }else{
                            url = '/ZonaDeNavegacion/Dashboard/2/3';
                        };
                        $scope.$apply(function() {
                            $location.path(url);
                        });
                    },1000);
                }, function(obj) {//Error handler
                    $scope.$emit('HidePreloader');
                }, true);
            }
                
            var failureGame = function (data){
              $location.path('/ZonaDeNavegacion/Dashboard/2/3');
            }

            $scope.back = function () {
                $location.path('/ZonaDeNavegacion/Dashboard/2/3');
            }

            Array.prototype.getIndexBy = function (name, value) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][name] == value) {
                        return i;
                    }
                }
            }
            

            if($routeParams.retry){
                _loadedDrupalResources = true;
                try {
                    document.addEventListener("deviceready",  function() { cordova.exec(successGame, failureGame, "CallToAndroid", "setTuEligesCallback", [])}, false);
                }
                catch (e) {
                    successGame(
                        {"respuestas":[{"preguntaId":"1", "respuestaId":"2"}, {"preguntaId":"2", "respuestaId":"5"},{"preguntaId":"3", "respuestaId":"7"},{"preguntaId":"4", "respuestaId":"11"},{"preguntaId":"5", "respuestaId":"14"},{"preguntaId":"6", "respuestaId":"17"},{"preguntaId":"7", "respuestaId":"20"},{"preguntaId":"8", "respuestaId":"23"}],"userId":"645","actividad":"Tú Eliges", "duracion":"0", "fechaInicio":"2015-11-30 11:45:13","fechaFin":"2015-11-30 11:45:55","actividadCompleta":"Si", "calificación":"Regular", "gustaActividad":"Si"}
                    );
                }
            }
            
            function getContentResources() {

                drupalFactory.Services.GetContent("tuEliges", function (data, key) {
                    $scope.contentResources = data.node;
                }, function () {
                }, false);

            }
            
            getContentResources();
        }])
        .controller('stageTuEligesModalController', ['$scope', '$modalInstance', 'content', function ($scope, $modalInstance, content) {
            $scope.message = content.mensaje;
            $scope.title = content.titulo;
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }])