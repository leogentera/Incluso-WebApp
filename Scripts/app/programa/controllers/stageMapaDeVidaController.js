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
        '$filter',
        function ($scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal, $filter) {

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

            _setLocalStorageItem("mapaDeVidaActivities", null);

            $scope.user = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.mapaDeVidaActivities = moodleFactory.Services.GetCacheJson("mapaDeVidaActivities");
            $scope.mapaDeVidaAnswers = moodleFactory.Services.GetCacheJson("mapaDeVidaAnswers/" + $scope.user.id);
            $scope.stars = 0;
            $scope.isInstalled = false;
            $scope.pathImagenFicha = "";
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            var activitiesPosted = 0;
            var activitiesAtLeastOne = 0;

            for(var key in localStorage){  
                if(key.indexOf("mapaDeVidaAnswers") > -1 && key.indexOf($scope.user.id) < 0){
                    localStorage.removeItem(key);  
                }
            }

            if(!$routeParams.retry){
                try {       
                  cordova.exec(function(data) { $scope.isInstalled = data.isInstalled }, function() {} , "CallToAndroid", " isInstalled", []);      
                }       
                catch (e) {     
                    $scope.isInstalled = true;      
                }
            }else{
				try {
	            	document.addEventListener("deviceready",  function() {cordova.exec(successGame, failureGame, "CallToAndroid", "setProyectaTuVidaCallback", [])}, false);
	            }
	            catch (e) {
	                successGame(
	                    {"userid":"103","actividad":"Proyecta tu Vida","duración":"5","imagenFicha":"assets/images/results/FichaProyectaTuVida.png","pathImagenFicha":"","fecha_inicio":"2015-09-15 14:23:12","fecha_fin":"2015-09-15 14:28:12","actividad_completa":"Si","gusta_actividad":"Si","ficha_proyecto":[{"dimensionId":242,"respuestas":[{"preguntaId":147,"respuesta":"Dimension 1 1."},{"preguntaId":148,"respuesta":"Dimension 1 2."},{"preguntaId":149,"respuesta":["Dimension 1 3 1.","Dimension 1 3 2.","Dimension 1 3 3."]},{"preguntaId":150,"respuesta":"Dimension 1 4"},{"preguntaId":151,"respuesta":"Dimension 1 5."},{"preguntaId":152,"respuesta":"Dimension 1 6."}]},{"dimensionId":243,"respuestas":[{"preguntaId":154,"respuesta":"Dimension 2 1."},{"preguntaId":155,"respuesta":"Dimension 2 2."},{"preguntaId":156,"respuesta":["Dimension 2 3 1","Dimension 2 3 2","Dimension 2 3 3"]},{"preguntaId":157,"respuesta":"Dimension 2 4"},{"preguntaId":158,"respuesta":"Dimension 2 5."},{"preguntaId":159,"respuesta":"Dimension 2 6."}]},{"dimensionId":244,"respuestas":[{"preguntaId":160,"respuesta":"Dimension 3 1."},{"preguntaId":161,"respuesta":"Dimension 3 2."},{"preguntaId":162,"respuesta":["Dimension 3 3 1.","Dimension 3 3 2.","Dimension 3 3 3."]},{"preguntaId":163,"respuesta":"Dimension 3 4"},{"preguntaId":164,"respuesta":"Dimension 3 5."},{"preguntaId":165,"respuesta":"Dimension 3 6."}]},{"dimensionId":245,"respuestas":[{"preguntaId":166,"respuesta":"Dimension 4 1."},{"preguntaId":167,"respuesta":"Dimension 4 2."},{"preguntaId":168,"respuesta":["Dimension 4 3 1","Dimension 4 3 2","Dimension 4 3 3"]},{"preguntaId":169,"respuesta":"Dimension 4 4"},{"preguntaId":170,"respuesta":"Dimension 4 5."},{"preguntaId":171,"respuesta":"Dimension 4 6."}]},{"dimensionId":246,"respuestas":[{"preguntaId":172,"respuesta":"Dimension 5 1"},{"preguntaId":173,"respuesta":"Dimension 5 2"},{"preguntaId":174,"respuesta":["Dimension 5 3 1","Dimension 5 3 2","Dimension 5 3 3"]},{"preguntaId":175,"respuesta":"Dimension 5 4"},{"preguntaId":176,"respuesta":"Dimension 5 5"},{"preguntaId":177,"respuesta":"Dimension 5 6"}]}]}
	                );
	            }
            }

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
                            moodleFactory.Services.GetAsyncActivity(mapaDeVidaActivity.activities[i].coursemoduleid, currentUser.token, function(data){
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
                if (!$scope.mapaDeVidaAnswers || $scope.mapaDeVidaAnswers.length < $scope.mapaDeVidaActivities.length) {
                    $scope.mapaDeVidaAnswers = (!$scope.mapaDeVidaAnswers ? [] : $scope.mapaDeVidaAnswers );
                    getUserData($scope.mapaDeVidaActivities[$scope.mapaDeVidaActivities.length - 1]["coursemoduleid"]);
                }
                else{
                    $scope.$emit('HidePreloader');
                }
                _setLocalStorageJsonItem("mapaDeVidaActivities", $scope.mapaDeVidaActivities);
            }

            function getUserData(activityId) {
                moodleFactory.Services.GetAsyncActivity(activityId + "?userid=" + $scope.user.id, currentUser.token, function(data){
                    $scope.mapaDeVidaAnswers.push(data);
                    $scope.mapaDeVidaAnswers[$scope.mapaDeVidaAnswers.length-1]["coursemoduleid"] = activityId;
                    if ($scope.mapaDeVidaAnswers.length == $scope.mapaDeVidaActivities.length) {
                        _setLocalStorageJsonItem("mapaDeVidaAnswers/" + $scope.user.id, $scope.mapaDeVidaAnswers);
                        $scope.$emit('HidePreloader');
                    };
                });
            }

            function createRequest(){
                var request = {
                    "userid": $scope.user.id,
                    "alias": $scope.user.username,
                    "actividad": "Proyecta tu vida",
                    "estrellas": $scope.stars,
                    "pathImagenFicha": "",
                    "imagenFicha": "",
                    "ficha_proyecto": []
                }
                for (var i = 0; i < $scope.mapaDeVidaActivities.length; i++) {
                    var activity = $scope.mapaDeVidaActivities[i];
                    var proyecto = {
                        //replaces all the strings to nothing
                        "dimensionId": activity.coursemoduleid,
                        "respuestas": []
                    }
                    _.each(activity.questions, function (q, i) {
                        var respuesta = { "preguntaId": q.id, "respuesta": "" };
                        var activityAnswer = _.find($scope.mapaDeVidaAnswers, function(a){ return a.coursemoduleid == activity.coursemoduleid });
                        if (activityAnswer.questions) {
                            var questionAnswer = _.find(activityAnswer.questions, function (a) { return a.id == q.id });
                            if (questionAnswer) {
                                var userAnswer = questionAnswer.userAnswer;
                                respuesta.respuesta = ( userAnswer.indexOf(";") > -1 || i == 2 ? (userAnswer != "" ? userAnswer.split(";") : []) : userAnswer );
                            }
                        }
                        proyecto.respuestas.push(respuesta);
                    });
                    request.ficha_proyecto.push(proyecto);
                }
                request.ficha_proyecto = _.sortBy(request.ficha_proyecto,function(f){ return f.dimensionId; });
                return request;
            }

            $scope.downloadGame = function () {
                var r = createRequest();
                
                try {
                  cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [r]);
                }
                catch (e) {
                    successGame(
                        {"userid":"103","actividad":"Proyecta tu Vida","duración":"5","imagenFicha":"assets/images/results/FichaProyectaTuVida.png","pathImagenFicha":"","fecha_inicio":"2015-09-15 14:23:12","fecha_fin":"2015-09-15 14:28:12","actividad_completa":"Si","gusta_actividad":"Si","ficha_proyecto":[{"dimensionId":242,"respuestas":[{"preguntaId":1,"respuesta":"Dimension 1 1."},{"preguntaId":2,"respuesta":"Dimension 1 2."},{"preguntaId":3,"respuesta":["Dimension 1 3 1.","Dimension 1 3 2.","Dimension 1 3 3."]},{"preguntaId":4,"respuesta":"Dimension 1 4"},{"preguntaId":5,"respuesta":"Dimension 1 5."},{"preguntaId":6,"respuesta":"Dimension 1 6."}]},{"dimensionId":243,"respuestas":[{"preguntaId":1,"respuesta":"Dimension 2 1."},{"preguntaId":2,"respuesta":"Dimension 2 2."},{"preguntaId":3,"respuesta":["Dimension 2 3 1","Dimension 2 3 2","Dimension 2 3 3"]},{"preguntaId":4,"respuesta":"Dimension 2 4"},{"preguntaId":5,"respuesta":"Dimension 2 5."},{"preguntaId":6,"respuesta":"Dimension 2 6."}]},{"dimensionId":244,"respuestas":[{"preguntaId":1,"respuesta":"Dimension 3 1."},{"preguntaId":2,"respuesta":"Dimension 3 2."},{"preguntaId":3,"respuesta":["Dimension 3 3 1.","Dimension 3 3 2.","Dimension 3 3 3."]},{"preguntaId":4,"respuesta":"Dimension 3 4"},{"preguntaId":5,"respuesta":"Dimension 3 5."},{"preguntaId":6,"respuesta":"Dimension 3 6."}]},{"dimensionId":245,"respuestas":[{"preguntaId":1,"respuesta":"Dimension 4 1."},{"preguntaId":2,"respuesta":"Dimension 4 2."},{"preguntaId":3,"respuesta":["Dimension 4 3 1","Dimension 4 3 2","Dimension 4 3 3"]},{"preguntaId":4,"respuesta":"Dimension 4 4"},{"preguntaId":5,"respuesta":"Dimension 4 5."},{"preguntaId":6,"respuesta":"Dimension 4 6."}]},{"dimensionId":246,"respuestas":[{"preguntaId":1,"respuesta":"Dimension 5 1"},{"preguntaId":2,"respuesta":"Dimension 5 2"},{"preguntaId":3,"respuesta":["Dimension 5 3 1","Dimension 5 3 2","Dimension 5 3 3"]},{"preguntaId":4,"respuesta":"Dimension 5 4"},{"preguntaId":5,"respuesta":"Dimension 5 5"},{"preguntaId":6,"respuesta":"Dimension 5 6"}]}]}
                    );
               	}
            }

            function successGame(data){
                var quizzesRequests = [];
                $scope.pathImagenFicha = (!data.imagenFicha || data.imagenFicha == "" ? data.pathImagenFicha : data.imagenFicha );
                for (var i = 0; i < data.ficha_proyecto.length; i++) {
                    var logEntry = {
                        "userid":$scope.user.id,
                        "answers": [],
                        "coursemoduleid": "",
                        "like_status": "",
                        "startingTime": "",
                        "endingTime": "",
                        "quiz_answered": true,
                        "at_least_one": false
                    };
                    var dimension = data.ficha_proyecto[i];
                    if (dimension) {
                        for (var j = 0; j < dimension.respuestas.length; j++) {
                            var respuesta = dimension.respuestas[j];
                            var activity = _.find($scope.mapaDeVidaActivities, function(a){ return a.coursemoduleid == dimension.dimensionId; });
                            var activityCache = _.find($scope.mapaDeVidaAnswers, function(a){ return a.coursemoduleid == dimension.dimensionId; });
                            if (activity.questions) {
                            	var activityQuestion = activity.questions[respuesta.preguntaId - 1];
                            	if (activityQuestion) {
	                            	activityQuestion.userAnswer = getAnswer(respuesta.respuesta, true);
	                            	if (activityCache.questions && activityCache.questions.length == activity.questions.length) {
	                            		var questionCache = activityCache.questions[respuesta.preguntaId - 1];
	                            		questionCache.userAnswer = activityQuestion.userAnswer;
	                            	}else{
	                            		activityCache.questions = (activityCache.questions ? activityCache.questions : [] );
	                            		var question = {
	                            			"id": activityQuestion.id,
	                            			"question": activityQuestion.question,
	                            			"title": activityQuestion.title,
	                            			"userAnswer": activityQuestion.userAnswer
	                            		}
	                            		activityCache.questions.push(question);
	                            	}
                            	}
                            }
                            logEntry.answers.push([getAnswer(respuesta.respuesta, false)]);
                            logEntry.at_least_one = ( ( respuesta.respuesta != undefined && respuesta.respuesta != "" ) || logEntry.at_least_one );
                            logEntry.quiz_answered = ( respuesta.respuesta != undefined && respuesta.respuesta != "" && logEntry.quiz_answered );
                        };
                        logEntry.coursemoduleid = dimension.dimensionId;
                        logEntry.startingTime = data.fecha_inicio;
                        logEntry.endingTime = data.fecha_fin;
                        logEntry.like_status = (data.gusta_actividad == "Si" ? 1 : 0 );
                        quizzesRequests.push(logEntry);
                    }
                }
                _setLocalStorageJsonItem("mapaDeVidaAnswers/" + $scope.user.id, $scope.mapaDeVidaAnswers);
                var quizzesAnswered = _.countBy($scope.mapaDeVidaActivities, function(a){
                    if (a.questions) {
                        var questionsAnswers = _.countBy(a.questions, function(q){
                            return q.userAnswer && q.userAnswer != "" ? 'answered' : 'unanswered';
                        });
                        return questionsAnswers && questionsAnswers.answered == a.questions.length ? 'completed' : 'incompleted';
                    }
                });
                $scope.IsComplete = $scope.mapaDeVidaActivities && 
                                    quizzesAnswered.completed && 
                                    quizzesAnswered.completed >= $scope.mapaDeVidaActivities.length;
                
                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
                //had to concat unused activity cause if all quizzes were finished parentactivity wouldnt be marked as finished
                var subactivitiesCompleted = [];
                var activitiesCompleted = 0;
                var parent_finished = false;

                //counts how many quizzes were answered
                _.each(quizzesRequests, function(q){
                    if(q.quiz_answered){
                        subactivitiesCompleted.push(q.coursemoduleid);
                    }
                });
                if (parentActivity.status == 0 && $scope.IsComplete) {    
                    parentActivity.status = 1;
                    parent_finished = true;
                    _endActivity(parentActivity);
                    updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted);
                }

                if (parentActivity.activities) {
                    for (var i = 0; i < subactivitiesCompleted.length; i++) {
                        $scope.activities = updateActivityManager($scope.activities, subactivitiesCompleted[i], true);
                    };
                    userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted);
                    _setLocalStorageJsonItem("usercourse", userCourseUpdated);
                    _setLocalStorageJsonItem("activityManagers", $scope.activities);
                    $scope.$emit('ShowPreloader');
                    for (var i = 0; i < quizzesRequests.length; i++) {
                        if (quizzesRequests[i].at_least_one) {
                            activitiesAtLeastOne++;
                            var userActivity = _.find(parentActivity.activities, function(a){ return a.coursemoduleid == quizzesRequests[i].coursemoduleid });
                            $scope.saveQuiz(userActivity, quizzesRequests[i], userCourseUpdated, (parent_finished));
                        }
                    };
                }  
            }

            encodeImageUri = function (imageUri, callback) {
                var c = document.createElement('canvas');
                var ctx = c.getContext("2d");
                var img = new Image();
                img.onload = function () {
                    c.width = this.width;
                    c.height = this.height;
                    ctx.drawImage(img, 0, 0);

                    if (typeof callback === 'function') {
                        var dataURL = c.toDataURL("image/png");
                        callback(dataURL.slice(22, dataURL.length));
                    }

                };
                img.src = imageUri;
            };

            $scope.saveQuiz = function(activity, quiz, userCourseUpdated, parentStatus) {
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
                    if (activitiesPosted == activitiesAtLeastOne) {
                        if ($scope.pathImagenFicha != "" && parentStatus) {
                            //var pathimagen = "assets/avatar/" + avatarInfo[0].pathimagen + "?rnd=" + new Date().getTime();
                            moodleFactory.Services.GetAsyncForumDiscussions(85, currentUser.token, function(data, key) {
                                var currentDiscussionIds = [];
                                for(var d = 0; d < data.discussions.length; d++) {
                                    currentDiscussionIds.push(data.discussions[d].discussion);
                                }
                                localStorage.setItem("currentDiscussionIds", JSON.stringify(currentDiscussionIds));
                                
                                
                                var discussion = _.find(data.discussions, function(d){ return d.name.toLowerCase().indexOf("comparte") > -1 });
                                $scope.forumId = data.forumid;

                                encodeImageUri($scope.pathImagenFicha, function (b64) {
                                    var requestData = {
                                        "userid": $scope.user.id,
                                        "discussionid": discussion.discussion,
                                        "parentid": discussion.id,
                                        "message": "Mi mapa de vida",
                                        "createdtime": quiz.startingTime,
                                        "modifiedtime": quiz.endingTime,
                                        "posttype": 4,
                                        "filecontent": b64,
                                        "filename": 'mapa_de_vida_' + $scope.user.id + '.png',
                                        "picture_post_author": $scope.user.profileimageurlsmall
                                    };
                                    
                                    moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                                        function() {
                                            $scope.sharedAlbumMessage = null;
                                            $scope.isShareCollapsed = false;
                                            $scope.showSharedAlbum = true;
                                            $scope.$emit('HidePreloader');
                                            
                                            checkForumExtraPoints();
                                            $location.path('/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Comentarios/2026/' + discussion.discussion);
                                        },
                                        function(){
                                            $scope.sharedAlbumMessage = null;
                                            $scope.isShareCollapsed = false;
                                            $scope.showSharedAlbum = false;
                                            $scope.$emit('HidePreloader');
                                            $location.path('/ZonaDeNavegacion/Dashboard/2/4');
                                        }
                                    );
                                });
                            }, function(){}, true);
                        }else{
                            $location.path('/ZonaDeNavegacion/Dashboard/2/4');
                        }
                    }
                });
            }
            
            var checkForumExtraPoints = function() {
            
                var activityFromTree = getActivityByActivity_identifier(2026);
                
                /* check over extra points */
                var course = moodleFactory.Services.GetCacheJson("course");
                var forumData = moodleFactory.Services.GetCacheJson("postcounter/" + course.courseid);
                
                if (activityFromTree && activityFromTree.status == 1) {
                    /* sumar uno extra al total */
                    if (forumData.totalExtraPoints < 11) {
                         updateUserForumStars($routeParams.activityId, 50, function (){
                            successPutStarsCallback();
                        });
                    }
                }
            };

            var failureGame = function (data){
              $location.path('/ZonaDeNavegacion/Dashboard/2/4');
            }

            $scope.back = function () {
                $location.path('/ZonaDeNavegacion/Dashboard/2/4');
            }

            Array.prototype.getIndexBy = function (name, value) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][name] == value) {
                        return i;
                    }
                }
            }

            function getAnswer(answer, forLocalStorage){
                var answerConcat = "";
                if (typeof answer != 'string') {
                    _.each(answer, function(r){
                        answerConcat = answerConcat + (answerConcat != "" ? (forLocalStorage ? ";" : "\n" ) : "") + cleanText(r).trim();
                    });
                    return answerConcat;
                }
                return cleanText(answer);
            }

            function cleanText(userAnswer) {
                var result = userAnswer.replace("/\r/", "");
                result = userAnswer.replace("/<br>/", "");
                result = userAnswer.replace("/<p>/", "");
                result = userAnswer.replace("/</p>/", "");
                result = userAnswer.replace("/;/", "");
                result = userAnswer.replace("/\n/", "");
                return result;
            }
            
        }]);
