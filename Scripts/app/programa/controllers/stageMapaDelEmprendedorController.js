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

            $scope.user = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.mapaDeEmprendedorActivities = moodleFactory.Services.GetCacheJson("mapaDeEmprendedorActivities");
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            var activitiesPosted = 0;
            var subactivitiesCompleted = [];
            $scope.stars = 0;
            $scope.isInstalled = false;
            var prevCurrentDiscussionIds;

            if(!$routeParams.retry) {
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
                            }, function (obj) {
                                $scope.$emit('HidePreloader');
                            })
                        }
                    };
                }
            }

            function assignCourseModuleId(asyncRequest, data){
                $scope.mapaDeEmprendedorActivities[$scope.mapaDeEmprendedorActivities.length - 1]["coursemoduleid"] = 
                    ( asyncRequest ? _.find(mapaDeEmprendedorActivity.activities, function(r){ return r.activityname == data.name }).coursemoduleid : data.coursemoduleid);
                    $scope.$emit('HidePreloader');
                _setLocalStorageJsonItem("mapaDeEmprendedorActivities", $scope.mapaDeEmprendedorActivities);

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
                    for(var j=0; j < $scope.mapaDeEmprendedorActivities.length; j++){
                        var activityAnswers = $scope.mapaDeEmprendedorActivities[j];
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
                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivityIdentifier = $routeParams.moodleid;
                var parentActivity = getActivityByActivity_identifier(parentActivityIdentifier, userCourseUpdated);
                request.fechaModificación=parentActivity.modifieddate;
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
                        {"gustaActividad":"Si","fechaModificación": "06/10/2016 11:08:18","proyectos":[{"recursos":["RSRCS"],"propuesta":"PPST","relacion":["RLCN"],"clientes":"CLNTS","personas":["PRSNS"],"formaEntrega":["NTRG"],"actividades":["NSWR","QSTN"],"necesidades":"NCSDDS","proyecto":"DFNTY FRST","proyectoId":"1"},{"recursos":["rcs","sds"],"propuesta":"2propuesta","relacion":["rlc2"],"clientes":"papa","personas":["PRSNS","mama"],"formaEntrega":["NTRG","sdas"],"actividades":["NSWR","act2"],"necesidades":"nccsds","proyecto":"definity","proyectoId":"2"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"3"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"4"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"5"}],"fechaFin":"10\/07\/2015 12:26:02","imagenFicha":"assets/images/results/FichaEmprendimiento.jpg","actividadCompleta":"Si","actividad":"Fábrica de emprendimiento","userid":"293","fechaInicio":"10\/07\/2015 12:22:52","duracion":"4"}
                    );
               }
            }

            function successGame(data){
                var quizzesRequests = [];
                $scope.projectMap = ($scope.dimensionMap ? $scope.dimensionMap : moodleFactory.Services.GetCacheJson("mapaDelEmprendedorProjectsMap"));
                $scope.pathImagenFicha = (!data.imagenFicha || data.imagenFicha == "" ? data.pathImagenFicha : data.imagenFicha );
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
                            _.each(proyectoStructure, function(key){
                                var answer = _.find(proyecto, function(value, innerKey){ return key.toLowerCase().indexOf(innerKey.toLowerCase().trim()) > -1; });
                                var question = _.find(activity.questions, function(q){ return key.indexOf(q.title.toLowerCase().split(" ", 1)[0].slice(0, -1)) > -1 });
                                if(question){
                                    question.userAnswer = getAnswer(answer, true);
                                    var activityCache = _.find($scope.mapaDeEmprendedorActivities, function(a){ return a.coursemoduleid == proyectoId; });
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
                            _setLocalStorageJsonItem("activity/" + logEntry.coursemoduleid , activity);
                        }
                    }
                }
                _setLocalStorageJsonItem("mapaDeEmprendedorActivities", $scope.mapaDeEmprendedorActivities);
                var quizzesAnswered = _.countBy($scope.mapaDeEmprendedorActivities, function(a){
                    if (a.questions) {
                        var questionsAnswers = _.countBy(a.questions, function(q){
                            return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                        });
                        return questionsAnswers && questionsAnswers.answered == a.questions.length ? 'completed' : 'incompleted';
                    }
                });

                $scope.IsComplete = $scope.mapaDeEmprendedorActivities &&
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
                parentActivity.modifieddate=data.fechaModificación || '';
                parentActivity.onlymodifieddate=true;
                if (parentActivity.status == 0 && quizzesAnswered.completed > 0) {
                    parentUpdated = true;
                    parentActivity.onlymodifieddate=false;
                }
                    _endActivity(parentActivity, function() {}, function(){
                        $scope.$emit('HidePreloader');
                    }, true);
                    updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted, false, function(){
                        $scope.$emit('HidePreloader');
                    }, true);
                
                if (subactivitiesCompleted.length > 0) {
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
                }else{
                    $timeout(function(){
                        $location.path('/ZonaDeAterrizaje/Dashboard/3/3');
                    }, 1000);
                }
            }
            
            encodeImageUri = function (imageUri, callback) {
                cordova.exec(function (data) {
                        callback(data);
                    }, function () {
                        console.log("Image couldnt be retrieved from cordova");
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
                    }, "CallToAndroid", " getImage", [imageUri]);
                
            };

            //Time Out Message modal
            $scope.openModal = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'timeOutModal.html',
                    controller: 'timeOutMapaDelEmprendedor',
                    size: size,
                    windowClass: 'user-help-modal dashboard-programa'
                });
            };

            $scope.saveQuiz = function(activity, quiz, userCourseUpdated, canPost) {
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
                    activitiesPosted++;
                    if (activitiesPosted == subactivitiesCompleted.length) {
                        _forceUpdateConnectionStatus(function() {
                            $timeout(function(){
                                if ($scope.pathImagenFicha != "" && canPost) {
                                    moodleFactory.Services.GetAsyncForumDiscussions(91, currentUser.token, function(data, key) {
                                        var currentDiscussionIds = [];
                                        for(var d = 0; d < data.discussions.length; d++) {
                                            currentDiscussionIds.push(data.discussions[d].discussion);
                                        }

                                        //Save previous value of "currentDiscussionIds" object.
                                        prevCurrentDiscussionIds = localStorage.getItem("currentDiscussionIds");

                                        localStorage.setItem("currentDiscussionIds", JSON.stringify(currentDiscussionIds));
                                        
                                        var discussion = _.find(data.discussions, function(d){ return d.name.toLowerCase().indexOf("comparte") > -1 });
                                        var requestData = {
                                            "userid": $scope.user.id,
                                            "discussionid": discussion.discussion,
                                            "parentid": discussion.id,
                                            "message": "Mi mapa del emprendedor",
                                            "createdtime": ((new Date(quiz.startingTime).getTime()) / 1000),
                                            "modifiedtime": ((new Date(quiz.endingTime).getTime()) / 1000),
                                            "posttype": 4,
                                            "hasfilecontent": true,
                                            "imageuri": $scope.pathImagenFicha,
                                            "datatype": "image/jpg",
                                            "filecontent": "",
                                            "filename": 'mapa_de_emprendedor_' + $scope.user.id + '.jpg',
                                            "picture_post_author": $scope.user.profileimageurlsmall,
                                            "iscountable":0,
                                            "isgamepost": 1
                                        };

                                        function postToForum(){
                                            moodleFactory.Services.PostAsyncForumPost('new_post', requestData,
                                                function() {//Success
                                                    $timeout(function () {
                                                        $scope.sharedAlbumMessage = null;
                                                        $scope.isShareCollapsed = false;
                                                        $scope.showSharedAlbum = true;
                                                        $timeout(function(){
                                                                var url = '';
                                                                if (_isDeviceOnline) {
                                                                    url = '/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Comentarios/3404/' + discussion.discussion;
                                                                }else{
                                                                    url = '/ZonaDeAterrizaje/Dashboard/3/3';
                                                                }
                                                                $scope.$apply(function() {
                                                                    $location.path(url);
                                                                });
                                                        }, 500);
                                                    }, 500);
                                                },

                                                function(obj){//Error
                                                    $timeout(function () {
                                                        $scope.sharedAlbumMessage = null;
                                                        $scope.isShareCollapsed = false;
                                                        $scope.showSharedAlbum = false;
                                                        $scope.$emit('HidePreloader');

                                                        //Revert previous request action.
                                                        if (prevCurrentDiscussionIds === null) {
                                                            localStorage.removeItem("currentDiscussionIds");
                                                        } else {
                                                            localStorage.setItem("currentDiscussionIds", prevCurrentDiscussionIds);
                                                        }

                                                        $location.path('/ZonaDeAterrizaje/Dashboard/3/3');
                                                    }, 500);
                                                }, true, false, true
                                            );
                                        }

                                        if (_isDeviceOnline) {
                                            encodeImageUri($scope.pathImagenFicha, function (b64) {
                                                requestData.filecontent = b64;
                                                postToForum();
                                            });
                                        }else{
                                            encodeImageUri($scope.pathImagenFicha, function (b64) {
                                                requestData.filecontent = b64;
                                                postToForum();
                                                $scope.$emit('HidePreloader');
                                                $timeout(function () {
                                                    $location.path('/ZonaDeAterrizaje/Dashboard/3/3');
                                                }, 1000);
                                            });
                                        }
                                    }, function(obj){
                                        $scope.$emit('HidePreloader');
                                    });
                                } else {
                                    $timeout(function () {
                                        $scope.$apply(function() {
                                            $location.path('/ZonaDeAterrizaje/Dashboard/3/3');
                                        });
                                    }, 1000);
                                }
                            }, 1000);
                            if ($routeParams.retry) {
                                if (_isDeviceOnline) {
                                    moodleFactory.Services.ExecuteQueue();
                                }
                            }    
                        }, function(){});
                    }
                }, function(){
                    $scope.$emit('HidePreloader');
                }, true);
            }
            
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
                _loadedDrupalResources = true;
                try {
                    document.addEventListener("deviceready",  function() { cordova.exec(successGame, failureGame, "CallToAndroid", "setFabricaDeEmprendimientoCallback", [])}, false);
                }
                catch (e) {
                    successGame(
                        {"gustaActividad":"Si","proyectos":[{"recursos":["RSRCS"],"propuesta":"PPST","relacion":["RLCN"],"clientes":"CLNTS","personas":["PRSNS"],"formaEntrega":["NTRG"],"actividades":["NSWR","QSTN"],"necesidades":"NCSDDS","proyecto":"DFNTY FRST","proyectoId":"1"},{"recursos":["rcs","sds"],"propuesta":"2propuesta","relacion":["rlc2"],"clientes":"papa","personas":["PRSNS","mama"],"formaEntrega":["NTRG","sdas"],"actividades":["NSWR","act2"],"necesidades":"nccsds","proyecto":"definity","proyectoId":"2"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"3"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"4"},{"recursos":[],"propuesta":"","relacion":[],"clientes":"","personas":[],"formaEntrega":[],"actividades":[],"necesidades":"","proyecto":"","proyectoId":"5"}],"fechaFin":"10\/07\/2015 12:26:02","imagenFicha":"assets/images/results/FichaEmprendimiento.jpg","actividadCompleta":"Si","actividad":"Fábrica de emprendimiento","userid":"293","fechaInicio":"10\/07\/2015 12:22:52","duracion":"4"}
                    );
                }
            }
        }]).controller('timeOutMapaDelEmprendedor', ['$scope', '$modalInstance', function ($scope, $modalInstance) {//TimeOut Robot

    $scope.ToDashboard = function () {
        $scope.$emit('ShowPreloader');
        $modalInstance.dismiss('cancel');
    };

}]);
