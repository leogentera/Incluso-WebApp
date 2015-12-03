angular
    .module('incluso.stage.mapadelemprendedorController', [])
    .controller('stageMapaDelEmprendedorController', [
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        function ($scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {
            var _loadedResources = false;
            var _pageLoaded = true;

            _timeout = $timeout;
            _httpFactory = $http;
            $scope.$emit('ShowPreloader');
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            
            drupalFactory.Services.GetContent("MapaDelEmprendedor", function (data, key) {
                _loadedResources = true;
                $scope.content = data.node;
                if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
                }, function () {
                    _loadedResources = true;
                    if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
            }, false);

            $scope.scrollToTop();

            _setLocalStorageItem("mapaDeEmprendedorActivities", null);

            $scope.user = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.mapaDeEmprendedorActivities = moodleFactory.Services.GetCacheJson("mapaDeEmprendedorActivities");
            $scope.mapaDeEmprendedorAnswers = moodleFactory.Services.GetCacheJson("mapaDeEmprendedorAnswers/" + $scope.user.id);
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            var activitiesPosted = 0;
            var subactivitiesCompleted = [];
            $scope.stars = 0;
            $scope.isInstalled = false;

            if(!$routeParams.retry) {
                //Removes answers of any other user previously logged in
                for(var key in localStorage){  
                    if(key.indexOf("mapaDeEmprendedorAnswers") > -1 && key.indexOf($scope.user.id) < 0){
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

            if (!$scope.mapaDeEmprendedorActivities) {
                $scope.mapaDeEmprendedorActivities = [];
                var mapaDeEmprendedorActivity = _.find($scope.activities, function(a){ return a.activity_identifier == $routeParams.moodleid});
                if (mapaDeEmprendedorActivity) {
                    $scope.stars += mapaDeEmprendedorActivity.points;
                    for (var i = 0; i < mapaDeEmprendedorActivity.activities.length; i++) {
                        $scope.stars += mapaDeEmprendedorActivity.activities[i].points;
                        var activity = moodleFactory.Services.GetCacheJson("activity/" + mapaDeEmprendedorActivity.activities[i].coursemoduleid);
                        if (activity) {
                            $scope.mapaDeEmprendedorActivities.push(activity);
                            assignCourseModuleId(false, mapaDeEmprendedorActivity.activities[i]);
                        }else{
                            moodleFactory.Services.GetAsyncActivity(mapaDeEmprendedorActivity.activities[i].coursemoduleid, currentUser.token, function(data){
                                $scope.mapaDeEmprendedorActivities.push(data);
                                assignCourseModuleId(true, data);
                            })
                        }
                    };
                }
            }

            function assignCourseModuleId(asyncRequest, data){
                $scope.mapaDeEmprendedorActivities[$scope.mapaDeEmprendedorActivities.length - 1]["coursemoduleid"] = 
                    ( asyncRequest ? _.find(mapaDeEmprendedorActivity.activities, function(r){ return r.activityname == data.name }).coursemoduleid : data.coursemoduleid);
                if (!$scope.mapaDeEmprendedorAnswers || $scope.mapaDeEmprendedorAnswers.length < $scope.mapaDeEmprendedorActivities.length) {
                    $scope.mapaDeEmprendedorAnswers = (!$scope.mapaDeEmprendedorAnswers ? [] : $scope.mapaDeEmprendedorAnswers );
                    getUserData($scope.mapaDeEmprendedorActivities[$scope.mapaDeEmprendedorActivities.length - 1]["coursemoduleid"]);
                }
                else{
                    $scope.$emit('HidePreloader');
                }
                _setLocalStorageJsonItem("mapaDeEmprendedorActivities", $scope.mapaDeEmprendedorActivities);

            }

            function getUserData(activityId) {
                moodleFactory.Services.GetAsyncActivity(activityId + "?userid=" + $scope.user.id, currentUser.token, function(data){
                    $scope.mapaDeEmprendedorAnswers.push(data);
                    $scope.mapaDeEmprendedorAnswers[$scope.mapaDeEmprendedorAnswers.length-1]["coursemoduleid"] = activityId;
                    if ($scope.mapaDeEmprendedorAnswers.length == $scope.mapaDeEmprendedorActivities.length) {
                        _setLocalStorageJsonItem("mapaDeEmprendedorAnswers/" + $scope.user.id, $scope.mapaDeEmprendedorAnswers);
                        $scope.$emit('HidePreloader');
                    };
                });
            }

            function createRequest(){
                var request = {
                    "userId": "" + $scope.user.id,
                    "alias": $scope.user.username,
                    "actividad": "Fábrica de emprendimiento",
                    "estrellas": "" + $scope.stars,
                    "pathImagenFicha": "",
                    "proyectos": []
                } 
                //set proyectos
                $scope.projectMap = [];
                $scope.mapaDeEmprendedorActivities = _.sortBy($scope.mapaDeEmprendedorActivities, function(a){ return a.coursemoduleid });
                for (var i = 0; i < $scope.mapaDeEmprendedorActivities.length; i++) {
                    var activity = $scope.mapaDeEmprendedorActivities[i];
                    $scope.projectMap.push({ "projectId": "" + activity.coursemoduleid, "orderId": "" + (i + 1)  });
                    var proyecto = {
                        "proyectoId": "" + (i + 1),
                        "proyecto": "",
                        "necesidades": "",
                        "clientes": "",
                        "propuesta": "",
                        "actividades": [],
                        "recursos": [],
                        "personas": [],
                        "relacion": [],
                        "formaEntrega": []
                    }
                    for(var j=0; j < $scope.mapaDeEmprendedorAnswers.length; j++){
                        var activityAnswers = $scope.mapaDeEmprendedorAnswers[j];
                        if (activityAnswers.questions && activityAnswers.coursemoduleid == activity.coursemoduleid) {
                            _.each(activityAnswers.questions, function(q){
                                for (var key in proyecto) {
                                    if (key.indexOf(q.title.toLowerCase().split(" ", 1)) > -1 && key != "proyectoId") {
                                        if(q.userAnswer.indexOf(";") > -1 || typeof proyecto[key] == 'object'){
                                            proyecto[key] = (q.userAnswer != "" ? q.userAnswer.split(";") : []);
                                            _.each(proyecto[key], function (a) { a.trim(); });
                                        }else{
                                            proyecto[key] = q.userAnswer;
                                        }
                                    }
                                }
                            });
                        }
                    }
                    request.proyectos.push(proyecto);
                }
                _setLocalStorageJsonItem("mapaDelEmprendedorProjectsMap", $scope.projectMap);
                return request;
            }

            $scope.downloadGame = function () {
                var r = createRequest();
                try {
                  cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [r]);
                }
                catch (e) {
                    successGame(
                        {"gustaActividad":"Si","proyectos":[{"recursos":["RSRCS"],"propuesta":"PPST","relacion":["RLCN"],"clientes":"CLNTS","personas":["PRSNS"],"formaEntrega":["NTRG"],"actividades":["NSWR","QSTN"],"necesidades":"NCSDDS","proyecto":"DFNTY FRST","proyectoId":"1"},{"recursos":["rcs","sds"],"propuesta":"2propuesta","relacion":["rlc2"],"clientes":"papa","personas":["PRSNS","mama"],"formaEntrega":["NTRG","sdas"],"actividades":["NSWR","act2"],"necesidades":"nccsds","proyecto":"definity","proyectoId":"2"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"3"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"4"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"5"}],"fechaFin":"10\/07\/2015 12:26:02","imagenFicha":"assets/images/results/FichaEmprendimiento.jpg","actividadCompleta":"Si","actividad":"Fábrica de emprendimiento","userid":"293","fechaInicio":"10\/07\/2015 12:22:52","duracion":"4"}
                    );
                }
            }

            function successGame(data){
                var quizzesRequests = [];
                $scope.projectMap = ($scope.dimensionMap ? $scope.dimensionMap : moodleFactory.Services.GetCacheJson("mapaDelEmprendedorProjectsMap"));
                $scope.pathImagenFicha = (!data.imagenFicha || data.imagenFicha == "" ? data.pathImagenFicha : data.imagenFicha );
                //Structure of questions defined in case response messes up with the order.
                var proyectoStructure = ["proyecto", "necesidades", "clientes", "propuesta", "actividades", "recursos", "personas", "relacion", "formaEntrega"];
                for (var i = 0; i < data.proyectos.length; i++) {
                    var proyecto = data.proyectos[i];
                    if(proyecto){
                        var proyectoId = _.find($scope.projectMap, function(p){ return p.orderId == proyecto.proyectoId }).projectId;
                        var logEntry = {
                            "userid":$scope.user.id,
                            "answers": [],
                            "coursemoduleid": proyectoId,
                            "like_status": (data.gustaActividad == "Si" ? 1 : 0 ),
                            "startingTime": data.fechaInicio,
                            "endingTime": data.fechaFin,
                            "quiz_answered": true,
                            "at_least_one": false
                        };
                        var activity = _.find($scope.mapaDeEmprendedorActivities, function(a){ return a.coursemoduleid == proyectoId; });
                        if(activity){
                            //Follows up a structure so, if json returns values out of place, it won't affect moodle questions order.
                            _.each(proyectoStructure, function(key){
                                var answer = _.find(proyecto, function(value, innerKey){ return key.toLowerCase().indexOf(innerKey.toLowerCase().trim()) > -1; });
                                var question = _.find(activity.questions, function(q){ return key.indexOf(q.title.toLowerCase().split(" ", 1)[0].slice(0, -1)) > -1 });
                                if(question){
                                    question.userAnswer = getAnswer(answer, true);
                                    var activityCache = _.find($scope.mapaDeEmprendedorAnswers, function(a){ return a.coursemoduleid == proyectoId; });
                                    if(activityCache){
                                        if(activityCache.questions && activityCache.questions.length == activity.questions.length){
                                            var questionCache = _.find(activityCache.questions, function(q){ return key.indexOf(q.title.toLowerCase().split(" ", 1)[0].slice(0, -1)) > -1 });
                                            questionCache.userAnswer = question.userAnswer;
                                        }else{
                                            activityCache.questions = (activityCache.questions ? activityCache.questions : [] );
                                            activityCache.questions.push(question);
                                        }
                                        logEntry.quiz_answered = question.userAnswer != "" && logEntry.quiz_answered;
                                        logEntry.at_least_one = question.userAnswer != "" || logEntry.at_least_one;
                                        logEntry.answers.push([getAnswer(answer, false)]);
                                    }
                                }
                            });
                            quizzesRequests.push(logEntry);
                        }
                    }
                }
                _setLocalStorageJsonItem("mapaDeEmprendedorAnswers/" + $scope.user.id, $scope.mapaDeEmprendedorAnswers);
                var quizzesAnswered = _.countBy($scope.mapaDeEmprendedorActivities, function(a){
                    if (a.questions) {
                        var questionsAnswers = _.countBy(a.questions, function(q){
                            return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                        });
                        return questionsAnswers && questionsAnswers.answered == a.questions.length ? 'completed' : 'incompleted';
                    }
                });

                //There is no need to know if the activity is completed or not ATM. I'm leaving this var in case in the near future a requirement needs it.
                $scope.IsComplete = $scope.mapaDeEmprendedorActivities &&
                                    $scope.mapaDeEmprendedorAnswers &&
                                    quizzesAnswered.completed &&
                                    quizzesAnswered.completed >= $scope.mapaDeEmprendedorActivities.length;

                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
                var parentUpdated = false;
                _.each(quizzesRequests, function(q){
                    if(q.quiz_answered){
                        subactivitiesCompleted.push(q.coursemoduleid);
                    }
                });

                if (parentActivity.status == 0 && quizzesAnswered.completed > 0) {
                    parentUpdated = true;
                    _endActivity(parentActivity);
                    updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted, false);
                }
                
                if (parentActivity.activities) {
                    userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted, false);
                    _setLocalStorageJsonItem("usercourse", userCourseUpdated);
                    for (var i = 0; i < quizzesRequests.length; i++) {
                        if (quizzesRequests[i].at_least_one) {
                            var userActivity = _.find(parentActivity.activities, function(a){ return a.coursemoduleid == quizzesRequests[i].coursemoduleid });
                            $scope.saveQuiz(userActivity, quizzesRequests[i], userCourseUpdated, parentUpdated);
                        }
                    }
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
                        var dataURL = c.toDataURL("image/jpg");
                        callback(dataURL.slice(22, dataURL.length));
                    }

                };
                img.src = imageUri;
            };

            $scope.saveQuiz = function(activity, quiz, userCourseUpdated, canPost) {
                
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
                _endActivity(activityModel, function() {
                    if ($routeParams.retry) {
                        moodleFactory.Services.ExecuteQueue();
                    }    
                    activitiesPosted++;
                    if (activitiesPosted == subactivitiesCompleted.length) {                   
                        if ($scope.pathImagenFicha != "" && canPost) {
                            
                            $scope.validateConnection(function() {
                            
                                moodleFactory.Services.GetAsyncForumDiscussions(91, currentUser.token, function(data, key) {
                                    var currentDiscussionIds = [];
                                    for(var d = 0; d < data.discussions.length; d++) {
                                        currentDiscussionIds.push(data.discussions[d].discussion);
                                    }
                                    localStorage.setItem("currentDiscussionIds", JSON.stringify(currentDiscussionIds));
                                    
                                    var discussion = _.find(data.discussions, function(d){ return d.name.toLowerCase().indexOf("comparte") > -1 });
    
                                    encodeImageUri($scope.pathImagenFicha, function (b64) {
                                        var requestData = {
                                            "userid": $scope.user.id,
                                            "discussionid": discussion.discussion,
                                            "parentid": discussion.id,
                                            "message": "Mi mapa del emprendedor",
                                            "createdtime": ((new Date(quiz.startingTime).getTime()) / 1000),
                                            "modifiedtime": ((new Date(quiz.endingTime).getTime()) / 1000),
                                            "posttype": 4,
                                            "filecontent": b64,
                                            "filename": 'mapa_de_emprendedor_' + $scope.user.id + '.jpg',
                                            "picture_post_author": $scope.user.profileimageurlsmall
                                        };
                                        
                                        moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                                            function() {
                                                $scope.sharedAlbumMessage = null;
                                                $scope.isShareCollapsed = false;
                                                $scope.showSharedAlbum = true;
                                                $scope.$emit('HidePreloader');
                                                checkForumExtraPoints();
                                                $location.path('/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Comentarios/3404/' + discussion.discussion);
                                            },
                                            function(){
                                                $scope.sharedAlbumMessage = null;
                                                $scope.isShareCollapsed = false;
                                                $scope.showSharedAlbum = false;
                                                $scope.$emit('HidePreloader');
                                                $location.path('/ZonaDeAterrizaje/Dashboard/3/3');
                                            }
                                        );
                                    });
                                    
                                }, function(){}, true);
                                
                            }, function(){});
                            
                        } else {
                            $location.path('/ZonaDeAterrizaje/Dashboard/3/3');
                        }
                    }
                });
            }
            
            function offlineCallback() {
                $timeout(function() { $location.path("/Offline"); }, 1000);
            }
            
            var checkForumExtraPoints = function() {
            
                var activityFromTree = getActivityByActivity_identifier(3404);
                
                /* check over extra points */
                var course = moodleFactory.Services.GetCacheJson("course");
                var forumData = moodleFactory.Services.GetCacheJson("postcounter/" + course.courseid);
                
                if (activityFromTree && activityFromTree.status == 1) {
                    /* sumar uno extra al total */
                    if (forumData.totalExtraPoints < 11) {
                         updateUserForumStars($routeParams.moodleid, 50, function (){
                            successPutStarsCallback();
                        });
                    }
                }
            };

            var failureGame = function (data){
                $location.path('/ZonaDeAterrizaje/Dashboard/3/3');
            }

            $scope.back = function () {
                $location.path('/ZonaDeAterrizaje/Dashboard/3/3');
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
                result = userAnswer.replace("/;/", ",");
                result = userAnswer.replace("/<br>/", "");
                result = userAnswer.replace("/<p>/", "");
                result = userAnswer.replace("/</p>/", "");
                result = userAnswer.replace("/\n/", "");
                return result;
            }

            if($routeParams.retry){
                try {
                    document.addEventListener("deviceready",  function() { cordova.exec(successGame, failureGame, "CallToAndroid", "setFabricaDeEmprendimientoCallback", [])}, false);
                }
                catch (e) {
                    successGame(
                        {"gustaActividad":"Si","proyectos":[{"recursos":["RSRCS"],"propuesta":"PPST","relacion":["RLCN"],"clientes":"CLNTS","personas":["PRSNS"],"formaEntrega":["NTRG"],"actividades":["NSWR","QSTN"],"necesidades":"NCSDDS","proyecto":"DFNTY FRST","proyectoId":"1"},{"recursos":["rcs","sds"],"propuesta":"2propuesta","relacion":["rlc2"],"clientes":"papa","personas":["PRSNS","mama"],"formaEntrega":["NTRG","sdas"],"actividades":["NSWR","act2"],"necesidades":"nccsds","proyecto":"definity","proyectoId":"2"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"3"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"4"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"5"}],"fechaFin":"10\/07\/2015 12:26:02","imagenFicha":"assets/images/results/FichaEmprendimiento.jpg","actividadCompleta":"Si","actividad":"Fábrica de emprendimiento","userid":"293","fechaInicio":"10\/07\/2015 12:22:52","duracion":"4"}
                    );
                }
            }
        }]);
