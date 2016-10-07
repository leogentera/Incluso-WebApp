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
            var _loadedResources = false;
            var _pageLoaded = true;

            _timeout = $timeout;
            _httpFactory = $http;

            $scope.$emit('ShowPreloader');

            drupalFactory.Services.GetContent("3303", function (data, key) {
                _loadedResources = true;
                $scope.contentResources = data.node;
                if (_loadedResources && _pageLoaded) {
                    $scope.$emit('HidePreloader');
                }
            }, function () {
                _loadedResources = true;
                if (_loadedResources && _pageLoaded) {
                    $scope.$emit('HidePreloader');
                }
            }, false);

            drupalFactory.Services.GetContent("3303results", function (data, key) {
                _loadedResources = true;
                $scope.contentResourcesResult = data.node;
            }, function () {
                _loadedResources = true;
            }, false);

            $scope.setToolbar($location.$$path, "");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;

            $scope.scrollToTop();

            _setLocalStorageItem("multiplicaTuDineroActivities", null);

            $scope.user = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.multiplicaTuDineroActivity = moodleFactory.Services.GetCacheJson("multiplicaTuDineroActivities");
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
            $scope.stars = 0;
            $scope.isInstalled = false;

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
            if ($routeParams.moodleid) {
                if (!$scope.multiplicaTuDineroActivity) {
                    $scope.multiplicaTuDineroActivity = {};
                    var multiplicaTuDinero = _.find($scope.activities, function (a) {
                        return a.activity_identifier == $routeParams.moodleid
                    });

                    if (multiplicaTuDinero) {
                        $scope.stars += multiplicaTuDinero.points;
                        for (var i = 0; i < multiplicaTuDinero.activities.length; i++) {
                            $scope.stars += multiplicaTuDinero.activities[i].points;
                            var activity = moodleFactory.Services.GetCacheJson("activity/" + multiplicaTuDinero.activities[i].coursemoduleid);
                            if (activity) {
                                $scope.multiplicaTuDineroActivity = activity;
                                assignCourseModuleId(false, multiplicaTuDinero.activities[i]);
                            } else {
                                moodleFactory.Services.GetAsyncActivity(multiplicaTuDinero.activities[i].coursemoduleid, currentUser.token, function (data) {
                                    $scope.multiplicaTuDineroActivity = data;
                                    assignCourseModuleId(true, data);
                                }, function(obj) {
                                    $scope.$emit('HidePreloader');
                                })
                            }
                        }
                    }
                }
            } else {
                $scope.$emit('HidePreloader');
            }

            function assignCourseModuleId(asyncRequest, data){
                $scope.multiplicaTuDineroActivity["coursemoduleid"] =
                    ( asyncRequest ? _.find(multiplicaTuDinero.activities, function(r){
                        return r.activityname == data.name })
                        .coursemoduleid : data.coursemoduleid);

                $scope.$emit('HidePreloader');
                _setLocalStorageJsonItem("multiplicaTuDineroActivities", $scope.multiplicaTuDineroActivity);
            }

            function createRequest() {
                var request = {
                    "userId": "" + $scope.user.id,
                    "alias": $scope.user.username,
                    "actividad": "Multiplica tu dinero",
                    "estrellas": "" + $scope.stars,
                    "pathImagenes": "",
                    "preguntas": [],
                    "introducción": $scope.multiplicaTuDineroActivity.description,
                    "instrucciones": "Responde las siguientes preguntas, pon a prueba tus decisiones y conoce más acerca de cómo cuidar tus finanzas.",
                    "retroAprobado": (_.max($scope.multiplicaTuDineroActivity.quiz_feedback, function (a) {
                        return a.mingrade;
                    })).feedbacktext,
                    "retroRegular": (_.find($scope.multiplicaTuDineroActivity.quiz_feedback, function (a) {
                        return a.maxgrade == 5;
                    })).feedbacktext,
                    "retroReprobado": (_.min($scope.multiplicaTuDineroActivity.quiz_feedback, function (a) {
                        return a.mingrade;
                    })).feedbacktext
                };

                $scope.questionMap = [];
                for (var i = 0; i < $scope.multiplicaTuDineroActivity.questions.length; i++) {
                    var currentQuestion = $scope.multiplicaTuDineroActivity.questions[i];
                    var questionMap = {"questionId": "" + currentQuestion.id, "orderId": "" + (i + 1), "answers": []};
                    var question = {
                        "orden": "" + (i + 1),
                        "preguntaId": "" + (i + 1),
                        "pregunta": currentQuestion.question,
                        "imagen": currentQuestion.tag + ".jpg",
                        "respuestas": [],
                        "retroRespCorrecta": "",
                        "retroRespIncorrecta": ""
                    };

                    for (var j = 0; j < currentQuestion.answers.length; j++) {
                        var currentAnswer = currentQuestion.answers[j];
                        var answer = {
                            "respuestaId": "" + (i * 3 + (j + 1)),
                            "respuesta": currentAnswer.answer,
                            "tipo": (currentAnswer.fraction == 0 ? "incorrecta" : "correcta")
                        }
                        questionMap.answers.push({"answerId": "" + currentAnswer.id, "orderId": "" + (i * 3 + (j + 1))});
                        question.respuestas.push(answer);
                        if (currentAnswer.fraction == 0) {
                            question.retroRespIncorrecta = currentAnswer.feedback;
                        } else {
                            question.retroRespCorrecta = currentAnswer.feedback;
                        }
                    }

                    request.preguntas.push(question);
                    $scope.questionMap.push(questionMap);
                }

                _setLocalStorageJsonItem("multiplicaTuDineroQuestionMap", $scope.questionMap);
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
                            "userid": 2,
                            "pathImagenes": "",
                            "actividad": "Multiplica tu dinero",
                            "duracion": "5",
                            "fecha_inicio": "2015-07-15 14:23:12",
                            "fecha_fin": "2015-07-15  14:28:12",
                            "actividad_completa": "Si",
                            "calificación": "Aprobado",
                            "gusta_actividad": "Si",
                            "respuestas": [
                              {"preguntaId": 1, "respuestaId": 2}, {"preguntaId": 2, "respuestaId": 6},
                              {"preguntaId": 3, "respuestaId": 8}, {"preguntaId": 4, "respuestaId": 11},
                              {"preguntaId": 10, "respuestaId": 29},{"preguntaId": 11,"respuestaId": 33},
                              {"preguntaId": 15, "respuestaId": 44}, {"preguntaId": 18, "respuestaId": 52}]});
                }
            };

            function successGame(data) {
                

                $scope.questionMap = ($scope.questionMap ? $scope.questionMap : moodleFactory.Services.GetCacheJson("multiplicaTuDineroQuestionMap"));
                var logEntry = {
                    "userid": $scope.user.id,
                    "answers": [],
                    "coursemoduleid": $scope.multiplicaTuDineroActivity.coursemoduleid,
                    "like_status": (data.gustaActividad == "Si" ? 1 : 0 ),
                    "startingTime": data.fechaInicio,
                    "endingTime": data.fechaFin
                };

                var quiz_finished = (data.actividadCompleta == "Si" ? true : false);
                for (var i = 0; i < $scope.multiplicaTuDineroActivity.questions.length; i++) {
                    var activity = $scope.multiplicaTuDineroActivity.questions[i];
                    _.each(data.respuestas, function (a) {
                        var questionMap = _.find($scope.questionMap, function (q) {
                            return q.orderId == a.preguntaId
                        });
                        if (questionMap.questionId == activity.id) {
                            var answerMap = _.find(questionMap.answers, function (answer) {
                                return answer.orderId == a.respuestaId
                            });
                            activity.userAnswer = answerMap.answerId;
                            var answerIndex = activity.answers.getIndexBy("id", answerMap.answerId);
                            logEntry.answers.push(answerIndex);
                        }
                    });
                    if (!activity.userAnswer || activity.userAnswer == "") {
                        logEntry.answers.push(null);
                    }
                }

                var questionsAnswered = _.countBy($scope.multiplicaTuDineroActivity.questions, function (q) {
                    return (q.userAnswer && q.userAnswer != '' ? 'completed' : 'incompleted');
                });

                $scope.IsComplete = $scope.multiplicaTuDineroActivity && questionsAnswered.completed == data.respuestas.length;


                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
                var subactivitiesCompleted = [];
                var activitiesCompleted = 0;
                subactivitiesCompleted.push(parentActivity.activities[0].coursemoduleid);

                if (parentActivity.status == 0) {
                    for (var i = 0; i < parentActivity.activities.length; i++) {
                        if (parentActivity.activities[i].status == 1 && i != 0) {
                            activitiesCompleted++;
                        }
                    }
                    var setAsCompleted= false; //Indicates if the activity should be completed or not
                    if ((activitiesCompleted == parentActivity.activities.length - 1) && $scope.IsComplete) {
                        if (data["calificación"] && (data["calificación"] == "Aprobado" || data["calificación"] == "Regular" ) ) {
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
                        if(data["calificación"] && (data["calificación"] == "Aprobado" || data["calificación"] == "Regular" ) && (user.financialAbility == "-1" || !user.financialAbility)){
                          user.financialAbility = 1;
                        }else if (data["calificación"] && data["calificación"] == "Reprobado" && (user.financialAbility == "-1" || !user.financialAbility)) {
                          user.financialAbility = 0;
                        }
                        _endActivity(parentActivity, function () {}, function(){
                            $scope.$emit('HidePreloader');
                        }, true);
                        moodleFactory.Services.PutAsyncProfile(userid, user,function (data) {},function (obj) {
                            $scope.$emit('HidePreloader');
                        }, false, true);
                        
                        $scope.activities = updateActivityManager($scope.activities, parentActivity.coursemoduleid);
                    }
                    //We are going to assing stars once they pass
                    if (setAsCompleted) {
                            updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted, false, function(){
                                $scope.$emit('HidePreloader');
                            }, true);
                    }
                }

                if (data["calificación"] && data["calificación"] == "Reprobado") {
                    $timeout(function () {
                        $scope.isReprobado = true;
                        _loadedResources = false;
                        _pageLoaded = true;
                        drupalFactory.Services.GetContent("MultiplicaTuDineroRobot", function (data, key) {
                            _loadedResources = true;
                            if (_loadedResources && _pageLoaded) {
                                $scope.$emit('HidePreloader');
                            }
                            var modalInstance = $modal.open({
                                templateUrl: 'MultiplicaTuDineroModal.html',
                                controller: 'stageMultiplicaTuDineroModalController',
                                resolve: {
                                    content: function () {
                                        return data.node;
                                    }
                                },
                                windowClass: 'closing-stage-modal user-help-modal'
                            });
                        }, function () {
                            _loadedResources = true;
                            if (_loadedResources && _pageLoaded) {
                                $scope.$emit('HidePreloader');
                            }
                        }, false);
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
                    $scope.multiplicaTuDineroActivity.setAsCompleted=setAsCompleted;
                    $scope.saveQuiz($scope.multiplicaTuDineroActivity, logEntry, userCourseUpdated);
                }
            }

            $scope.saveQuiz = function (activity, quiz, userCourseUpdated) {
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
                        _forceUpdateConnectionStatus(function () {
                            if (_isDeviceOnline) {
                                moodleFactory.Services.ExecuteQueue();
                            }
                        }, function () {
                        });
                    }

                    $timeout(function () {
                        $scope.$emit('HidePreloader');
                        var url = "";
                        if ($scope.IsComplete) {
                            url = ($scope.isReprobado ? '/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDinero/3302' : '/ZonaDeAterrizaje/EducacionFinanciera/ResultadosMultiplicaTuDinero');
                        } else {
                            url = '/ZonaDeAterrizaje/Dashboard/3/2';
                        }
                        ;
                        $scope.$apply(function () {
                            $location.path(url);
                        });
                    }, 1000);
                }, function(){
                    $scope.$emit('HidePreloader');
                }, true);
            };

            var failureGame = function (data) {
                $location.path('/ZonaDeAterrizaje/Dashboard/3/2');
            };

            $scope.back = function () {
                $location.path('/ZonaDeAterrizaje/Dashboard/3/2');
            };

            Array.prototype.getIndexBy = function (name, value) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][name] == value) {
                        return i;
                    }
                }

            }

            if ($routeParams.retry) {
                _loadedDrupalResources = true;
                try {
                    document.addEventListener("deviceready", function () {
                        cordova.exec(successGame, failureGame, "CallToAndroid", "setMultiplicaTuDineroCallback", [])
                    }, false);
                }
                catch (e) {
                    successGame(
                        {
                            "userid": 2,
                            "pathImagenes": "",
                            "actividad": "Multiplica tu dinero",
                            "duracion": "5",
                            "fecha_inicio": "2015-07-15 14:23:12",
                            "fecha_fin": "2015-07-15  14:28:12",
                            "actividad_completa": "Si",
                            "calificacion": "Reprobado",
                            "gusta_actividad": "Si",
                            "respuestas": [{"preguntaId": 1, "respuestaId": 2}, {"preguntaId": 2, "respuestaId": 6}, {"preguntaId": 3, "respuestaId": 8}, {"preguntaId": 4, "respuestaId": 11}, {"preguntaId": 10, "respuestaId": 29}, {
                                "preguntaId": 11,
                                "respuestaId": 33
                            }, {"preguntaId": 15, "respuestaId": 44}, {"preguntaId": 18, "respuestaId": 52}]
                        }
                    );
                }
            }

        }])
    .controller('stageMultiplicaTuDineroModalController', ['$scope', '$modalInstance', 'content', function ($scope, $modalInstance, content) {
        $scope.message = content.mensaje;
        $scope.title = content.titulo;
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
