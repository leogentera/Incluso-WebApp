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
            $scope.setToolbar($location.$$path, "");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;

            $scope.scrollToTop();

            _setLocalStorageItem("mapaDeVidaActivities", null);
            getContentResources();
            $scope.user = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.mapaDeVidaActivities = moodleFactory.Services.GetCacheJson("mapaDeVidaActivities");
            $scope.stars = 0;
            $scope.isInstalled = false;
            $scope.pathImagenFicha = "";
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
            var activitiesPosted = 0;
            var activitiesAtLeastOne = 0;

            if (!$routeParams.retry) {
                try {
                    cordova.exec(function (data) {
                        $scope.isInstalled = data.isInstalled
                    }, function () {
                    }, "CallToAndroid", " isInstalled", []);
                }
                catch (e) {
                    $scope.isInstalled = true;
                }
            }

            if (!$scope.mapaDeVidaActivities) {
                $scope.mapaDeVidaActivities = [];
                var mapaDeVidaActivity = _.find($scope.activities, function (a) {
                    return a.activity_identifier == $routeParams.moodleid
                });
                if (mapaDeVidaActivity) {
                    $scope.stars += mapaDeVidaActivity.points;
                    for (var i = 0; i < mapaDeVidaActivity.activities.length; i++) {
                        $scope.stars += mapaDeVidaActivity.activities[i].points;
                        var activity = moodleFactory.Services.GetCacheJson("activity/" + mapaDeVidaActivity.activities[i].coursemoduleid);
                        if (activity) {
                            $scope.mapaDeVidaActivities.push(activity);
                            assignCourseModuleId(false, mapaDeVidaActivity.activities[i]);
                        } else {
                            moodleFactory.Services.GetAsyncActivity(mapaDeVidaActivity.activities[i].coursemoduleid, currentUser.token, function (data) {
                                $scope.mapaDeVidaActivities.push(data);
                                assignCourseModuleId(true, data);
                            }, function(obj) {
                                $scope.$emit('HidePreloader');
                            })
                        }
                    }
                }
            }

            function assignCourseModuleId(asyncRequest, data) {
                $scope.mapaDeVidaActivities[$scope.mapaDeVidaActivities.length - 1]["coursemoduleid"] =
                    ( asyncRequest ? _.find(mapaDeVidaActivity.activities, function (r) {
                        return r.activityname == data.name
                    }).coursemoduleid : data.coursemoduleid);
                $scope.$emit('HidePreloader');
                _setLocalStorageJsonItem("mapaDeVidaActivities", $scope.mapaDeVidaActivities);
            }

            function createRequest() {
                var request = {
                    "userId": "" + $scope.user.id,
                    "alias": $scope.user.username,
                    "actividad": "Proyecta tu vida",
                    "estrellas": "" + $scope.stars,
                    "pathImagenFicha": "",
                    "imagenFicha": "",
                    "genero": ($scope.user.gender.toLowerCase().indexOf('femenino') >= 0 ? 'Mujer' : 'Hombre'),
                    "pathImagen": "",
                    "fichaProyecto": []
                };

                $scope.dimensionMap = [];
                $scope.mapaDeVidaActivities = _.sortBy($scope.mapaDeVidaActivities, function (a) {
                    return a.coursemoduleid;
                });
                for (var i = 0; i < $scope.mapaDeVidaActivities.length; i++) {
                    var activity = $scope.mapaDeVidaActivities[i];
                    var dimensionMap = {"dimensionId": "" + activity.coursemoduleid, "orderId": "" + (i + 1), "questions": []};
                    var proyecto = {
                        "dimensionId": "" + (i + 1),
                        "respuestas": []
                    };

                    _.each(activity.questions, function (q, j) {
                        var respuesta = {"preguntaId": "" + (j + 1), "respuesta": ""};
                        var activityAnswer = _.find($scope.mapaDeVidaActivities, function (a) {
                            return a.coursemoduleid == activity.coursemoduleid
                        });
                        if (activityAnswer.questions) {
                            var questionAnswer = _.find(activityAnswer.questions, function (a) {
                                return a.id == q.id
                            });
                            if (questionAnswer) {
                                var userAnswer = questionAnswer.userAnswer;
                                respuesta.respuesta = ( userAnswer.indexOf(";") > -1 || j == 2 ? (userAnswer != "" ? userAnswer.split(";") : []) : userAnswer );
                            }
                        } else if (j == 2 && respuesta.respuesta == "") {
                            respuesta.respuesta = [];
                        }
                        proyecto.respuestas.push(respuesta);
                        dimensionMap.questions.push({"questionId": "" + q.id, "orderId": "" + (j + 1)});
                    });
                    request.fichaProyecto.push(proyecto);
                    $scope.dimensionMap.push(dimensionMap);
                }
                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivityIdentifier = $routeParams.moodleid;
                var parentActivity = getActivityByActivity_identifier(parentActivityIdentifier, userCourseUpdated);
               request.fechaModificación=parentActivity.modifieddate;
                _setLocalStorageJsonItem("mapaDeVidaDimensionMap", $scope.dimensionMap);
                return request;
            }

            $scope.downloadGame = function () {
                var r = createRequest();
               try {
                    cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [r]);
                }
                catch (e) {
                    successGame(
                        {
                            "userid": "103",
                            "actividad": "Proyecta tu Vida",
                            "duración": "5",
                            "imagenFicha": "assets/images/results/FichaProyectaTuVida.jpg",
                            "pathImagenFicha": "",
                            "fechaInicio": "2015/09/15 14:23:12",
                            "fechaFin": "2015/09/15 14:28:12",
                            "actividadCompleta": "Si",
                            "gustaActividad": "Si",
                            "fechaModificación": "06/10/2016 11:08:18",
                            "fichaProyecto": [{
                                "dimensionId": 1,
                                "respuestas": [{"preguntaId": 1, "respuesta": "Dimension 11 1."}, {"preguntaId": 2, "respuesta": "Dimension 11 2."}, {
                                    "preguntaId": 3,
                                    "respuesta": ["Dimension 1 3 1.", "Dimension 1 3 2.", "Dimension 1 3 3."]
                                }, {"preguntaId": 4, "respuesta": "Dimension 1 4"}, {"preguntaId": 5, "respuesta": "Dimension 1 5."}, {"preguntaId": 6, "respuesta": "Dimension 1 6."}]
                            }, {
                                "dimensionId": 2,
                                "respuestas": [{"preguntaId": 1, "respuesta": "Dimension 2 1."}, {"preguntaId": 2, "respuesta": "Dimension 2 2."}, {
                                    "preguntaId": 3,
                                    "respuesta": ["Dimension 2 3 1", "Dimension 2 3 2", "Dimension 2 3 3"]
                                }, {"preguntaId": 4, "respuesta": "Dimension 2 4"}, {"preguntaId": 5, "respuesta": "Dimension 2 5."}, {"preguntaId": 6, "respuesta": "Dimension 2 6."}]
                            }, {
                                "dimensionId": 3,
                                "respuestas": [{"preguntaId": 1, "respuesta": "Dimension 3 1."}, {"preguntaId": 2, "respuesta": "Dimension 3 2."}, {
                                    "preguntaId": 3,
                                    "respuesta": ["Dimension 3 3 1.", "Dimension 3 3 2.", "Dimension 3 3 3."]
                                }, {"preguntaId": 4, "respuesta": "Dimension 3 4"}, {"preguntaId": 5, "respuesta": "Dimension 3 5."}, {"preguntaId": 6, "respuesta": "Dimension 3 6."}]
                            }, {
                                "dimensionId": 4,
                                "respuestas": [{"preguntaId": 1, "respuesta": "Dimension 4 1."}, {"preguntaId": 2, "respuesta": "Dimension 4 2."}, {
                                    "preguntaId": 3,
                                    "respuesta": ["Dimension 4 3 1", "Dimension 4 3 2", "Dimension 4 3 3"]
                                }, {"preguntaId": 4, "respuesta": "Dimension 4 4"}, {"preguntaId": 5, "respuesta": "Dimension 4 5."}, {"preguntaId": 6, "respuesta": "Dimension 4 6."}]
                            }, {
                                "dimensionId": 5,
                                "respuestas": [{"preguntaId": 1, "respuesta": "Dimension 5 1"}, {"preguntaId": 2, "respuesta": "Dimension 5 2"}, {
                                    "preguntaId": 3,
                                    "respuesta": ["Dimension 5 3 1", "Dimension 5 3 2", "Dimension 5 3 3"]
                                }, {"preguntaId": 4, "respuesta": "Dimension 5 4"}, {"preguntaId": 5, "respuesta": "Dimension 555 5"}, {"preguntaId": 6, "respuesta": "Dimension 55 6"}]
                            }]
                        }
                    );
                }
            };

            function successGame(data) {
                var quizzesRequests = [];
                $scope.dimensionMap = ($scope.dimensionMap ? $scope.dimensionMap : moodleFactory.Services.GetCacheJson("mapaDeVidaDimensionMap"));
                $scope.pathImagenFicha = data.imagenFicha;
                for (var i = 0; i < data.fichaProyecto.length; i++) {
                    var logEntry = {
                        "userid": $scope.user.id,
                        "answers": [],
                        "coursemoduleid": "",
                        "like_status": "",
                        "startingTime": "",
                        "endingTime": "",
                        "quiz_answered": true,
                        "at_least_one": false
                    };
                    var dimension = data.fichaProyecto[i];
                    if (dimension) {
                        var dimensionId = _.find($scope.dimensionMap, function (d) {
                            return d.orderId == dimension.dimensionId;
                        }).dimensionId;
                        var activity = _.find($scope.mapaDeVidaActivities, function (a) {
                            return a.coursemoduleid == dimensionId;
                        });
                        var activityCache = _.find($scope.mapaDeVidaActivities, function (a) {
                            return a.coursemoduleid == dimensionId;
                        });
                        for (var j = 0; j < dimension.respuestas.length; j++) {
                            var respuesta = dimension.respuestas[j];
                            if (activity.questions) {
                                var activityQuestion = activity.questions[respuesta.preguntaId - 1];
                                if (activityQuestion) {
                                    activityQuestion.userAnswer = getAnswer(respuesta.respuesta, true);
                                    if (activityCache.questions && activityCache.questions.length == activity.questions.length) {
                                        var questionCache = activityCache.questions[respuesta.preguntaId - 1];
                                        questionCache.userAnswer = activityQuestion.userAnswer;
                                    } else {
                                        activityCache.questions = (activityCache.questions ? activityCache.questions : [] );
                                        var question = {
                                            "id": activityQuestion.id,
                                            "question": activityQuestion.question,
                                            "title": activityQuestion.title,
                                            "userAnswer": activityQuestion.userAnswer
                                        };
                                        activityCache.questions.push(question);
                                    }
                                }
                            }
                            logEntry.answers.push([getAnswer(respuesta.respuesta, false)]);
                            logEntry.at_least_one = ( ( respuesta.respuesta != undefined && respuesta.respuesta != "" ) || logEntry.at_least_one );
                            logEntry.quiz_answered = ( respuesta.respuesta != undefined && respuesta.respuesta != "" && logEntry.quiz_answered );
                        }

                        logEntry.coursemoduleid = dimensionId;
                        logEntry.startingTime = data.fechaInicio;
                        logEntry.endingTime = data.fechaFin;
                        logEntry.like_status = (data.gustaActividad == "Si" ? 1 : 0 );
                        quizzesRequests.push(logEntry);
                        //_setLocalStorageJsonItem("activity/" + dimensionId + "?userid=" + logEntry.userid, activity);
                        _setLocalStorageJsonItem("activity/" + dimensionId, activity);
                    }
                }
                _setLocalStorageJsonItem("mapaDeVidaActivities", $scope.mapaDeVidaActivities);
                var quizzesAnswered = _.countBy($scope.mapaDeVidaActivities, function (a) {
                    if (a.questions) {
                        var questionsAnswers = _.countBy(a.questions, function (q) {
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
                var subactivitiesCompleted = [];
                var activitiesCompleted = 0;
                var parent_finished = false;
                
                parentActivity.modifieddate=data.fechaModificación || '';
                parentActivity.onlymodifieddate=true;

                _.each(quizzesRequests, function (q) {
                    if (q.quiz_answered) {
                        subactivitiesCompleted.push(q.coursemoduleid);
                    }
                    if (q.at_least_one) {
                        activitiesAtLeastOne++;
                    }
                });
                
                if (parentActivity.status == 0 && $scope.IsComplete) {
                    parentActivity.status = 1;
                    parent_finished = true;
                    parentActivity.onlymodifieddate=false;
                }
                    _endActivity(parentActivity, function(){}, function(){
                        $scope.$emit('HidePreloader');
                    }, true);
                    updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted, false, function(){
                        $scope.$emit('HidePreloader');
                    }, true);
                
                if (activitiesAtLeastOne > 0) {
                    if (parentActivity.activities) {
                        for (var i = 0; i < subactivitiesCompleted.length; i++) {
                            $scope.activities = updateActivityManager($scope.activities, subactivitiesCompleted[i], true);
                        }

                        userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted);
                        _setLocalStorageJsonItem("usercourse", userCourseUpdated);
                        _setLocalStorageJsonItem("activityManagers", $scope.activities);
                        $scope.$emit('ShowPreloader');

                        for (var i = 0; i < quizzesRequests.length; i++) {
                            if (quizzesRequests[i].at_least_one) {
                                var userActivity = _.find(parentActivity.activities, function (a) {
                                    return a.coursemoduleid == quizzesRequests[i].coursemoduleid
                                });
                                $scope.saveQuiz(userActivity, quizzesRequests[i], userCourseUpdated, (parent_finished));
                            }
                        }
                    }
                } else {
                    $timeout(function () {
                        $location.path('/ZonaDeNavegacion/Dashboard/2/4');
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
                    controller: 'timeOutMapaDeVida',
                    size: size,
                    windowClass: 'user-help-modal dashboard-programa'
                });
            };

            $scope.saveQuiz = function (activity, quiz, userCourseUpdated, parentStatus) {
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

                _endActivity(activityModel, function () {
                    activitiesPosted++;
                    if (activitiesPosted == activitiesAtLeastOne) {
                        _forceUpdateConnectionStatus(function () {
                            $timeout(function () {
                                if ($scope.pathImagenFicha != "" && parentStatus) {
                                    moodleFactory.Services.GetAsyncForumDiscussions(85, currentUser.token, function (data, key) {
                                        var currentDiscussionIds = [];
                                        for (var d = 0; d < data.discussions.length; d++) {
                                            currentDiscussionIds.push(data.discussions[d].discussion);
                                        }
                                        localStorage.setItem("currentDiscussionIds", JSON.stringify(currentDiscussionIds));

                                        var discussion = _.find(data.discussions, function (d) {
                                            return d.name.toLowerCase().indexOf("toma el reto") > -1 || d.name.toLowerCase().indexOf("comparte") > -1
                                        });
                                        var requestData = {
                                            "userid": $scope.user.id,
                                            "discussionid": discussion.discussion,
                                            "parentid": discussion.id,
                                            "message": "Mi mapa de vida",
                                            "createdtime": ((new Date(quiz.startingTime).getTime()) / 1000),
                                            "modifiedtime": ((new Date(quiz.endingTime).getTime()) / 1000),
                                            "posttype": 4,
                                            "hasfilecontent": true,
                                            "imageuri": $scope.pathImagenFicha,
                                            "datatype": "image/jpg",
                                            "filecontent": "",
                                            "filename": 'mapa_de_vida_' + $scope.user.id + '.jpg',
                                            "picture_post_author": $scope.user.profileimageurlsmall,
                                            "iscountable": 0,
                                            "isgamepost": 1
                                        };

                                        function postToForum() {
                                            moodleFactory.Services.PostAsyncForumPost('new_post', requestData,
                                                function () {//Success
                                                    $timeout(function () {
                                                        $scope.sharedAlbumMessage = null;
                                                        $scope.isShareCollapsed = false;
                                                        $scope.showSharedAlbum = true;
                                                        $timeout(function () {
                                                            var url = '';
                                                            if (_isDeviceOnline) {
                                                                url = '/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Comentarios/2026/' + discussion.discussion;
                                                            } else {
                                                                url = '/ZonaDeNavegacion/Dashboard/2/4';
                                                            }
                                                            $scope.$apply(function () {
                                                                $location.path(url);
                                                            });
                                                        }, 500);
                                                    }, 500);
                                                },function () {//Error
                                                    $timeout(function () {
                                                        $scope.sharedAlbumMessage = null;
                                                        $scope.isShareCollapsed = false;
                                                        $scope.showSharedAlbum = false;
                                                        $scope.$emit('HidePreloader');
                                                        $location.path('/ZonaDeNavegacion/Dashboard/2/4');
                                                    }, 500);
                                                }, true, false, true
                                            );
                                        }

                                        if (_isDeviceOnline) {
                                            encodeImageUri($scope.pathImagenFicha, function (b64) {
                                                requestData.filecontent = b64;
                                                postToForum();
                                            });
                                        } else {

                                            encodeImageUri($scope.pathImagenFicha, function (b64) {
                                                requestData.filecontent = b64;
                                                postToForum();
                                                $scope.$emit('HidePreloader');
                                                $timeout(function () {
                                                    $location.path('/Offline');
                                                }, 1000);

                                            });
                                        }
                                    }, function (obj) {
                                        $scope.$emit('HidePreloader');                                        
                                    });
                                } else {
                                    $timeout(function () {
                                        $scope.$apply(function () {
                                            $location.path('/ZonaDeNavegacion/Dashboard/2/4');
                                        });
                                    }, 1000);
                                }
                            }, 1000);
                            if ($routeParams.retry) {
                                if (_isDeviceOnline) {
                                    moodleFactory.Services.ExecuteQueue();
                                }
                            }
                        }, function () {
                            postToForum();
                        });
                    }
                }, function(){
                    $scope.$emit('HidePreloader');
                }, true);
            };

            var failureGame = function (data) {
                $location.path('/ZonaDeNavegacion/Dashboard/2/4');
            };

            $scope.back = function () {
                $location.path('/ZonaDeNavegacion/Dashboard/2/4');
            };

            Array.prototype.getIndexBy = function (name, value) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][name] == value) {
                        return i;
                    }
                }
            };

            function getAnswer(answer, forLocalStorage) {
                var answerConcat = "";
                if (typeof answer != 'string') {
                    _.each(answer, function (r) {
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

            function getContentResources() {
                drupalFactory.Services.GetContent("mapaVida", function (data, key) {
                    $scope.contentResources = data.node;
                }, function () {
                }, false);
            }

            if ($routeParams.retry) {
                _loadedDrupalResources = true;
                try {
                    document.addEventListener("deviceready", function () {
                        cordova.exec(successGame, failureGame, "CallToAndroid", "setProyectaTuVidaCallback", [])
                    }, false);
                }
                catch (e) {
                    successGame(
                        {
                            "userid": "103",
                            "actividad": "Proyecta tu Vida",
                            "duración": "5",
                            "imagenFicha": "assets/images/results/FichaProyectaTuVida.jpg",
                            "pathImagenFicha": "",
                            "fechaInicio": "2015/09/15 14:23:12",
                            "fechaFin": "2015/09/15 14:28:12",
                            "actividadCompleta": "Si",
                            "gustaActividad": "Si",
                            "fichaProyecto": [{
                                "dimensionId": 1,
                                "respuestas": [{"preguntaId": 1, "respuesta": "Dimension 1 1."}, {"preguntaId": 2, "respuesta": "Dimension 1 2."}, {
                                    "preguntaId": 3,
                                    "respuesta": ["Dimension 1 3 1.", "Dimension 1 3 2.", "Dimension 1 3 3."]
                                }, {"preguntaId": 4, "respuesta": "Dimension 1 4"}, {"preguntaId": 5, "respuesta": "Dimension 1 5."}, {"preguntaId": 6, "respuesta": "Dimension 1 6."}]
                            }, {
                                "dimensionId": 2,
                                "respuestas": [{"preguntaId": 1, "respuesta": "Dimension 2 1."}, {"preguntaId": 2, "respuesta": "Dimension 2 2."}, {
                                    "preguntaId": 3,
                                    "respuesta": ["Dimension 2 3 1", "Dimension 2 3 2", "Dimension 2 3 3"]
                                }, {"preguntaId": 4, "respuesta": "Dimension 2 4"}, {"preguntaId": 5, "respuesta": "Dimension 2 5."}, {"preguntaId": 6, "respuesta": "Dimension 2 6."}]
                            }, {
                                "dimensionId": 3,
                                "respuestas": [{"preguntaId": 1, "respuesta": "Dimension 3 1."}, {"preguntaId": 2, "respuesta": "Dimension 3 2."}, {
                                    "preguntaId": 3,
                                    "respuesta": ["Dimension 3 3 1.", "Dimension 3 3 2.", "Dimension 3 3 3."]
                                }, {"preguntaId": 4, "respuesta": "Dimension 3 4"}, {"preguntaId": 5, "respuesta": "Dimension 3 5."}, {"preguntaId": 6, "respuesta": "Dimension 3 6."}]
                            }, {
                                "dimensionId": 4,
                                "respuestas": [{"preguntaId": 1, "respuesta": "Dimension 4 1."}, {"preguntaId": 2, "respuesta": "Dimension 4 2."}, {
                                    "preguntaId": 3,
                                    "respuesta": ["Dimension 4 3 1", "Dimension 4 3 2", "Dimension 4 3 3"]
                                }, {"preguntaId": 4, "respuesta": "Dimension 4 4"}, {"preguntaId": 5, "respuesta": "Dimension 4 5."}, {"preguntaId": 6, "respuesta": "Dimension 4 6."}]
                            }, {
                                "dimensionId": 5,
                                "respuestas": [{"preguntaId": 1, "respuesta": "Dimension 5 1"}, {"preguntaId": 2, "respuesta": "Dimension 5 2"}, {
                                    "preguntaId": 3,
                                    "respuesta": ["Dimension 5 3 1", "Dimension 5 3 2", "Dimension 5 3 3"]
                                }, {"preguntaId": 4, "respuesta": "Dimension 5 4"}, {"preguntaId": 5, "respuesta": "Dimension 5 5"}, {"preguntaId": 6, "respuesta": "Dimension 5 6"}]
                            }]
                        }
                    );
                }
            }

        }]).controller('timeOutMapaDeVida', ['$scope', '$modalInstance', function ($scope, $modalInstance) {//TimeOut Robot

    $scope.ToDashboard = function () {
        $scope.$emit('ShowPreloader');
        $modalInstance.dismiss('cancel');
    };

}]);
