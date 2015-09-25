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

            $scope.scrollToTop();

            _setLocalStorageItem("tuEligesActivities", null);

            $scope.user = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.tuEligesActivities = moodleFactory.Services.GetCacheJson("tuEligesActivities");
            $scope.stars = 0;
            $scope.enabled = true;
            $scope.isInstalled = false;
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 

            if ($routeParams.moodleid) {

                try {
                  cordova.exec(function(data) { $scope.isInstalled = data.isInstalled }, function() {} , "CallToAndroid", " isInstalled", []);
                }
                catch (e) {
                    $scope.isInstalled = true;
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
                                moodleFactory.Services.GetAsyncActivity(tuEligesActivity.activities[i].coursemoduleid, function(data){
                                    $scope.tuEligesActivities = data;
                                    assignCourseModuleId(true, data);
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
            		"userid": $scope.user.id,
                    "alias": $scope.user.username,
                    "actividad": $scope.tuEligesActivities.name,
            		"pathImagenes":"",
                    "estrellas":$scope.stars,
                    "introduccion":$scope.tuEligesActivities.description,
                    //TODO: Find a way to un-hardcode this.
                    "instrucciones":"Toma este reto y pon a prueba tu toma de decisiones. ¡Sólo tú decides el rumbo de tu vida!",
            		"preguntas": [],
                    "retro_aprobado":(_.max($scope.tuEligesActivities.quiz_feedback, function(a){ return a.mingrade; })).feedbacktext,
                    "retro_regular":(_.find($scope.tuEligesActivities.quiz_feedback, function(a){ return a.maxgrade == 5; })).feedbacktext,
                    "retro_reprobado":(_.min($scope.tuEligesActivities.quiz_feedback, function(a){ return a.mingrade; })).feedbacktext
            	}
            	for (var i = 0; i < $scope.tuEligesActivities.questions.length; i++) {
            		var currentQuestion = $scope.tuEligesActivities.questions[i];
            		var question = {
            			"orden": i + 1,
            			"preguntaId": currentQuestion.id,
            			"pregunta": currentQuestion.question,
            			"imagen":"imagen"+currentQuestion.id+".jpg",
                        "respuestas": [],
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
                        if (currentAnswer.fraction == 0) {
                            question.retro_resp_incorrecta = currentAnswer.feedback;
                        }else{
                            question.retro_resp_correcta = currentAnswer.feedback;
                        }
	            		question.respuestas.push(answer);
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
                        { "userid":$scope.user.id,"actividad":"Tu Eliges","duracion":"5","fecha_inicio":"2015-07-15 14:23:12","fecha_fin":"2015-07-15  14:28:12","actividad_completa":"Si","calificacion":"Reprobado","gusta_actividad":"Si","respuestas":[{"preguntaId":105,"respuestaId":469},{"preguntaId":104,"respuestaId":466},{"preguntaId":106,"respuestaId":473},{"preguntaId":107,"respuestaId":476},{"preguntaId":108,"respuestaId":479},{"preguntaId":109,"respuestaId":481},{"preguntaId":110,"respuestaId":484},{"preguntaId":111,"respuestaId":487}] }
                    );
                } 
            }

            function successGame(data){
            	//asign answers to the questions
            	var logEntry = {
            		"userid":$scope.user.id,
            		"answers": [],
            		"coursemoduleid": $scope.tuEligesActivities.coursemoduleid,
            		"like_status": (data.gusta_actividad == "Si" ? 1 : 0 ),
            		"startingTime": data.fecha_inicio,
            		"endingTime": data.fecha_fin
            	};
            	for (var i = 0; i < data.respuestas.length; i++) {
            		_.each($scope.tuEligesActivities.questions, function(q){
            			if (q.id == data.respuestas[i].preguntaId) {
            				q.userAnswer = data.respuestas[i].respuestaId;
            				//finds index of answer to insert it into array of logentry
            				var answerIndex = q.answers.getIndexBy("id", data.respuestas[i].respuestaId);
            				logEntry.answers.push(answerIndex);
            			}
            		});
            	}
                var quiz_finished = (data.actividad_completa == "Si" ? true : false);

            	var questionsAnswered = _.countBy($scope.tuEligesActivities.questions, function(q) {
            		return (q.userAnswer && q.userAnswer != '' ? 'completed' : 'incompleted');
                });

            	$scope.IsComplete = $scope.tuEligesActivities && 
                                    questionsAnswered.completed && 
                                    questionsAnswered.completed >= $scope.tuEligesActivities.questions.length &&
                                    questionsAnswered.completed > 0 &&
                                    quiz_finished ;

                //save response
                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
                var subactivitiesCompleted = [];
                var activitiesCompleted = 0;

                subactivitiesCompleted.push(parentActivity.activities[0].coursemoduleid);

                //It only ends activity once but saves all later attempts
                if (parentActivity.status == 0) {
                    for (var i = 0; i < parentActivity.activities.length; i++) {
                        if(parentActivity.activities[i].status == 1 && i != 0){
                            activitiesCompleted++;
                        }
                    }
                    //Checks if siblings activities are finished and ends parent activity
                    if ($scope.IsComplete && activitiesCompleted == parentActivity.activities.length - 1) {
                        parentActivity.status = 1;
                        _endActivity(parentActivity, function(){ });
                        $scope.activities = updateActivityManager($scope.activities, parentActivity.coursemoduleid);
                        debugger;
                        updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted);
                    }
                }
                if (parentActivity.activities) {
                    for (var i = 0; i < subactivitiesCompleted.length; i++) {
                        $scope.activities = updateActivityManager($scope.activities, subactivitiesCompleted[i]);
                    }
                    userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted);
                    _setLocalStorageJsonItem("usercourse", userCourseUpdated);
                    _setLocalStorageJsonItem("activityManagers", $scope.activities);
                    $scope.saveQuiz($scope.tuEligesActivities, logEntry, userCourseUpdated);
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
                    if ($scope.IsComplete) {
                        $location.path('/ZonaDeNavegacion/TuEliges/ResultadosTuEliges');
                    }else{
                        $location.path('/ZonaDeNavegacion/Dashboard/2/3')
                    };
                });
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
        }]);