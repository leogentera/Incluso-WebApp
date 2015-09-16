// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
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
            $scope.profile = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.tuEligesActivities = moodleFactory.Services.GetCacheJson("tuEligesActivities");
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 

            var stars = 0;
            if (!$scope.tuEligesActivities) {
            	$scope.tuEligesActivities = {};
            	var tuEligesActivity = _.find($scope.activities, function(a) { return a.activity_identifier == $routeParams.moodleid });
            	if (tuEligesActivity) {
            		stars += tuEligesActivity.points;
            		for (var i = 0; i < tuEligesActivity.activities.length; i++) {
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

           /* if (!$scope.tuEligesActivities) {
            	$scope.tuEligesActivities = {};
            	var tuEligesChallenge = _.find($scope.activities, function(a) { return a.activity_identifier == $routeParams.moodleid });
            	if (tuEligesChallenge.activities) {
            		var tuEligesActivity = _.find(tuEligesChallenge.activities, function(c) { return c.activity_identifier == "2012" });
            		if (tuEligesActivity) {
            			stars += tuEligesActivity.points;
            			//var tuEligesChildActivity = tuEligesActivity.activities[0];
            			for (var i = 0; i < tuEligesActivity.activities.length; i++) {
            				var activity = moodleFactory.Services.GetCacheJson("activity/" + tuEligesActivity.activities[i].coursemoduleid);
            				stars += tuEligesActivity.activities[i].points;
            				if (activity) {
            					$scope.tuEligesActivities = activity;
                      			assignCourseModuleId(false, tuEligesActivity.activities[i]);
            				}else{
            					moodleFactory.Services.GetAsyncActivity(tuEligesActivity.activities[i].coursemoduleid, function(data){
            						$scope.tuEligesActivities = data;
            						assignCourseModuleId(true, data);
            					});
            				}
            			}
            		}
            	}
            }  */

            function assignCourseModuleId(asyncRequest, data){
              $scope.tuEligesActivities["coursemoduleid"] = 
              	( asyncRequest ? _.find(tuEligesChallenge.activities, function(r){ return r.activityname == data.name }).coursemoduleid : data.coursemoduleid);
              $scope.$emit('HidePreloader');
              _setLocalStorageJsonItem("tuEligesActivities", $scope.tuEligesActivities);
            }

            function createRequest () {
            	var request = {
            		"userid": $scope.user.id,
            		"alias": $scope.user.username,
            		"pathimagenes":"",
            		"preguntas": [],
            		"catalogorespuestas": []
            	}
            	for (var i = 0; i < $scope.tuEligesActivities.questions.length; i++) {
            		var currentQuestion = $scope.tuEligesActivities.questions[i];
            		var question = {
            			"orden": i + 1,
            			"preguntaid": currentQuestion.id,
            			"pregunta": currentQuestion.question,
            			"imagen":"",
            			"tiporespuesta": "Retroalimentacion",
            			"caso": "Caso " + ( i + 1)
            		}
            		for(var j = 0; j < currentQuestion.answers.length; j++){
            			var currentAnswer = currentQuestion.answers[j];
	            		var answer = {
	            			"respuestaid": currentAnswer.id,
	            			"respuesta": currentAnswer.answer,
	            			"Retro": "Óptimo", //TODO: check why the server is not returning retro from moodle
	            		}
	            		request.catalogorespuestas.push(answer);
            		}
            		request.preguntas.push(question);
            	}
            	return request;
            }

            $scope.startGame = function () {
                var r = createRequest();

                /*try {
                  cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [r]);
                }
                catch (e) {*/
                  successGame(
                  	{ "userid":$scope.user.id,"pathImagenes":"","actividad":"Tu Eliges","respuestas":[{"preguntaid":105,"respuesta":"Elegir una de las profesiones que dicen son las mejor pagadas"},{"preguntaid":104,"respuesta":"Ir al concierto, es tu banda favorita y es el concierto de despedida"},{"preguntaid":106,"respuesta":"Antes de aceptar, revisas quién es y si no tienes ni idea lo rechazas"},{"preguntaid":107,"respuesta":"Hacerlo porque no pasa nada, él lo hace todo el tiempo"},{"preguntaid":108,"respuesta":"Investigar cuál tiene más materias relacionadas con la carrera que te gustaría elegir más adelante"},{"preguntaid":109,"respuesta":"Organizar entrenamientos extra para quien quiera estar mejor preparado"},{"preguntaid":110,"respuesta":"Ir sin avisar, prefieres pedir perdón que pedir permiso"},{"preguntaid":111,"respuesta": "Hacer como que no viste nada"}] }
                  );
                //}
            }

            function successGame(data){
            	//asign answers to the questions
            	var logEntry = {
            		"userid":$scope.user.id,
            		"answers": [],
            		"coursemoduleid": $scope.tuEligesActivities.coursemoduleid,
            		"like_status": 1,
            		"startingTime": new Date(),
            		"endingTime": new Date(),
            		"quiz_answered": true
            	};
            	for (var i = 0; i < data.respuestas.length; i++) {
            		_.each($scope.tuEligesActivities.questions, function(q){
            			if (q.id == data.respuestas[i].preguntaid) {
            				q.userAnswer = data.respuestas[i].respuesta;
            				//finds index of answer to insert it into array of logentry
            				var answerIndex = q.answers.getIndexBy("answer", data.respuestas[i].respuesta);
            				logEntry.answers.push(answerIndex);
            			}
            		});

            	}
            	var questionsAnswered = _.countBy($scope.tuEligesActivities.questions, function(q) {
            		return (q.userAnswer && q.userAnswer != '' ? 'completed' : 'incompleted');
                });

            	$scope.IsComplete = $scope.tuEligesActivities && 
                                    questionsAnswered.completed && 
                                    questionsAnswered.completed >= $scope.tuEligesActivities.questions.length &&
                                    questionsAnswered.completed > 0;

                //save response
                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
                var subactivitiesCompleted = [];
                var activitiesCompleted = 0;
                if (parentActivity.status == 0) {
                	parentActivity.status = 1;
                	for (var i = 0; i < parentActivity.activities.length; i++) {
            			if(parentActivity.activities[i].status == 1 || i != 0){
            				subactivitiesCompleted++;
            			}
            		}
                	if ($scope.IsComplete && activitiesCompleted == parentActivity.activities.length - 1) {
                		_endActivity(parentActivity, function(){ });
                	}
                }
                if (parentActivity.activities) {
                	//TODO: change for all activities in case there are other siblings completed
                	subactivitiesCompleted.push(parentActivity.activities[0].coursemoduleid);
                	updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted);
                	userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted);
            		_setLocalStorageJsonItem("usercourse", userCourseUpdated);
            		$scope.saveQuiz($scope.tuEligesActivities, logEntry, userCourseUpdated);
                }
                /*var grandparentActivityIdentifier = $routeParams.moodleid;
                var grandparentActivity = getActivityByActivity_identifier(grandparentActivityIdentifier, userCourseUpdated);
        		var parentActivity = getActivityByActivity_identifier("2012", userCourseUpdated);
                var activitiesCompleted = 0;
                var subactivitiesCompleted = [];
                if (grandparentActivity.status == 0) {                    
					grandparentActivity.status = 1;
                	//checks if siblings of parent activity are completed so grandparent activity could be finished
                	for (var i = 0; i < grandparentActivity.activities.length; i++) {
                		if (grandparentActivity.activities[i].activity_identifier != "2012" && grandparentActivity.activities[i].status == 1){
                			activitiesCompleted++;
                		}
                	}
	                if ($scope.IsComplete && activitiesCompleted == grandparentActivity.activities.length - 1) {
                    	_endActivity(grandparentActivity, function() {});
					}
                }*/
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
              _endActivity(activityModel, function(){});
            }

            $scope.saveUser = function () {
                moodleFactory.Services.PutAsyncProfile(_getItem("userId"), $scope.profile,
                function (data) {
//                    console.log('Save profile successful...');
                },
                function (date) {
//                    console.log('Save profile fail...');
                });
            };
                
            var failureGame = function (data){
              $location.path('/ZonaDeVuelo/Dashboard/1/2');
            }

            $scope.back = function () {
                $location.path('/ZonaDeVuelo/Dashboard/1/2');
            }

            Array.prototype.getIndexBy = function (name, value) {
			    for (var i = 0; i < this.length; i++) {
			        if (this[i][name] == value) {
			            return i;
			        }
			    }
			}

            $scope.startGame();

        }]);