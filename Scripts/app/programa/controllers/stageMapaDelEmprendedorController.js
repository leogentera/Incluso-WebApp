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

            _setLocalStorageItem("mapaDeEmprendedorActivities", null);

            $scope.user = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.mapaDeEmprendedorActivities = moodleFactory.Services.GetCacheJson("mapaDeEmprendedorActivities");
            $scope.mapaDeEmprendedorAnswers = moodleFactory.Services.GetCacheJson("mapaDeEmprendedorAnswers");
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            var activitiesPosted = 0;
            $scope.stars = 0;
            $scope.isInstalled = false;

            try {
              cordova.exec(function(data) { $scope.isInstalled = data.isInstalled }, function() {} , "CallToAndroid", " isInstalled", []);
            }
            catch (e) {
                $scope.isInstalled = true;
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
                            moodleFactory.Services.GetAsyncActivity(mapaDeEmprendedorActivity.activities[i].coursemoduleid, function(data){
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
                moodleFactory.Services.GetAsyncActivity(activityId + "?userid=" + $scope.user.id, function(data){
                    $scope.mapaDeEmprendedorAnswers.push(data);
                    $scope.mapaDeEmprendedorAnswers[$scope.mapaDeEmprendedorAnswers.length-1]["coursemoduleid"] = activityId;
                    if ($scope.mapaDeEmprendedorAnswers.length == $scope.mapaDeEmprendedorActivities.length) {
                        _setLocalStorageJsonItem("mapaDeEmprendedorAnswers", $scope.mapaDeEmprendedorAnswers);
                        $scope.$emit('HidePreloader');
                    };
                });
            }

            function createRequest(){
                var request = {
                    "userid": $scope.user.id,
                    "alias": $scope.user.username,
                    "actividad": "Fábrica de emprendimiento",
                    "estrellas": $scope.stars,
                    "proyectos": []
                } 
                //set proyectos
                for (var i = 0; i < $scope.mapaDeEmprendedorActivities.length; i++) {
                    var activity = $scope.mapaDeEmprendedorActivities[i];
                    var proyecto = {
                        //replaces all the strings to nothing
                        "proyectoId": activity.coursemoduleid,
                        "proyecto": "",
                        "necesidades":"",
                        "clientes":"",
                        "propuestas_valor":"",
                        "actividades":[],
                        "recursos":[],
                        "personas":[],
                        "relacion":[],
                        "forma_entrega":[]
                    }
                    for(var j=0; j < $scope.mapaDeEmprendedorAnswers.length; j++){
                        var activityAnswers = $scope.mapaDeEmprendedorAnswers[j];
                        if (activityAnswers.questions && activityAnswers.coursemoduleid == activity.coursemoduleid) {
                            _.each(activityAnswers.questions, function(q){
                                for (var key in proyecto) {
                                    if (key.includes(q.title.toLowerCase().split(" ", 1)) && key != "proyectoId") {
                                        if(q.userAnswer.includes(";")){
                                            proyecto[key] = q.userAnswer.split(";");
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
                return request;
            }

            $scope.downloadGame = function () {
                var r = createRequest();
                /*debugger;
                try {
                  cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [r]);
                }
                catch (e) {*/
                    successGame(
                        /**/{"userid":"103", "actividad":"Fábrica de emprendimiento", "duración":"5", "fecha_inicio":"2015-07-15 14:23:12", "fecha_fin":"2015-07-15 14:28:12", "actividad_completa":"No", "gusta_actividad":"Si", "proyectos":[{ "proyectoId":249,"proyecto":"Proyecto 1", "necesidades":"Agua", "clientes":"Mamá", "propuestas_valor":"Dar agua", "actividades":["Embotellar agua","Contratar Jumapam"], "recursos":["Dinero"], "personas ":["Hijo","Hija"], "relacion ":["1 a 1"], "forma_entrega":["Botella","Potable","Garrafón"]},{"proyectoId":250,"proyecto":"Proyecto 2","necesidades":"Luz","clientes":"Papá","propuestas_valor":"Dar luz","actividades":["Construir panel solar","Contratar CFE"],"recursos":["Talento","Recursos"],"personas ":["Hija","Hijo"],"relacion ":["N a M","1 a N"],"forma_entrega":["Electricidad","Panel Solar"]},{"proyectoId":251,"proyecto":"Proyecto 3","necesidades":"Comida","clientes":"Hermanos","propuestas_valor":"Dar comida","actividades":["Preparar comida","Dar vales","Dar alimentos enlatados"],"recursos":["Tiempo","Talento","Dinero"],"personas":["Hermano","Hermana"],"relacion":["1 a 1"],"forma_entrega":["Valesdedespensa","Comidas","Dinero"]},{"proyectoId":252,"proyecto":"Proyecto4","necesidades":"Ropa","clientes":"Abuelos","propuestas_valor":"Dar ropa","actividades":["Comprar","Tejer"],"recursos":["Tesoro","Talento"],"personas":["Nieta","Nieto"],"relacion":["N a M","1 a N"],"forma_entrega":["Giftcard","Ropa"]},{"proyectoId":253,"proyecto":"Proyecto5","necesidades":"Casa","clientes":"Tíos","propuestas_valor":"Dar casa","actividades":["Construir","Reconstruir"],"recursos":["Dinero","Tiempo"],"personas":["Primo","Prima"],"relacion":["1 a N"],"forma_entrega":["Física","Emocional"]}]}
                    );
                //}
            }

            function successGame(data){
                var quizzesRequests = [];
                //Structure of questions defined in case response messes up with the order.
                var proyectoStructure = ["proyecto", "necesidades", "clientes", "propuestas_valor", "actividades", "recursos", "personas", "relacion", "forma_entrega"];
                for (var i = 0; i < data.proyectos.length; i++) {
                    var proyecto = data.proyectos[i];
                    if(proyecto){
                        var logEntry = {
                            "userid":$scope.user.id,
                            "answers": [],
                            "coursemoduleid": proyecto.proyectoId,
                            "like_status": (data.gusta_actividad == "Si" ? 1 : 0 ),
                            "startingTime": data.fecha_inicio,
                            "endingTime": data.fecha_fin,
                            "quiz_answered": true,
                            "at_least_one": false
                        };
                        _.each($scope.mapaDeEmprendedorActivities, function(a){
                            if(a.coursemoduleid == proyecto.proyectoId){
                                //Sets user answer to emprendedor de activities just in case
                                _.each(proyectoStructure, function(key){
                                    var answerConcat = "";
                                    for(var innerkey in proyecto){
                                        if(key == innerkey.trim()){
                                            var question = _.find(a.questions, function(q){ return key.includes(q.title.toLowerCase().split(" ", 1)) });
                                            if(question){
                                                question.userAnswer = getAnswer(proyecto[innerkey], true);
                                                break;
                                            }
                                        }
                                    }
                                    //Sets user answers to localStorage
                                    var answerObj = _.find($scope.mapaDeEmprendedorAnswers, function(a){ return a.coursemoduleid == proyecto.proyectoId; });
                                    if(answerObj){
                                        var currentQuestion = _.find(answerObj.questions, function(q){ return key.includes(q.title.toLowerCase().split(" ", 1)) });
                                        if (!answerObj.questions || !currentQuestion) {
                                            var questionStructure = {
                                                "question": key,
                                                "title": key,
                                                "userAnswer": getAnswer(proyecto[innerkey], true)
                                            }
                                            answerObj.questions = (!answerObj.questions ? [] : answerObj.questions );
                                            answerObj.questions.push(questionStructure);
                                        }else{
                                            currentQuestion.userAnswer = getAnswer(proyecto[innerkey],true);
                                        }
                                    }
                                    //Sets user answers to logEntry
                                    logEntry.quiz_answered = proyecto[innerkey] != "" && logEntry.quiz_answered;
                                    logEntry.at_least_one = proyecto[innerkey] != "" || logEntry.at_least_one;
                                    return logEntry.answers.push([getAnswer(proyecto[innerkey], false)]);
                                });
                                return;
                            }
                        }); 
                    }
                    quizzesRequests.push(logEntry);
                }
                _setLocalStorageJsonItem("mapaDeEmprendedorAnswers", $scope.mapaDeEmprendedorAnswers);
                                
                var quizzesAnswered = _.countBy($scope.mapaDeEmprendedorActivities, function(a){
                    if (a.questions) {
                        var questionsAnswers = _.countBy(a.questions, function(q){
                            return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                        });
                        return questionsAnswers && questionsAnswers.answered == a.questions.length ? 'completed' : 'incompleted';
                    }
                });

                $scope.IsComplete = $scope.mapaDeEmprendedorActivities &&
                                    $scope.mapaDeEmprendedorAnswers &&
                                    quizzesAnswered.completed &&
                                    quizzesAnswered.completed >= $scope.mapaDeEmprendedorActivities.length;

                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
                var subactivitiesCompleted = [];
                _.each(quizzesRequests, function(q){
                    if(q.quiz_answered){
                        subactivitiesCompleted.push(q.coursemoduleid);
                    }
                });
                
                if (parentActivity.status == 0  && $scope.IsComplete) {
                    _endActivity(parentActivity);
                    parentActivity.status = 1;
                    updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted);
                }
                
                if (parentActivity.activities) {
                    userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted);
                    _setLocalStorageJsonItem("usercourse", userCourseUpdated);
                    for (var i = 0; i < quizzesRequests.length; i++) {
                        if (quizzesRequests[i].at_least_one) {
                            var userActivity = _.find(parentActivity.activities, function(a){ return a.coursemoduleid == quizzesRequests[i].coursemoduleid });
                            $scope.saveQuiz(userActivity, quizzesRequests[i], userCourseUpdated);
                        }
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
                $scope.$emit('ShowPreloader'); 
                _endActivity(activityModel, function(){
                    activitiesPosted++;
                    if (activitiesPosted == $scope.activityAnswers.length) {
                        $scope.$emit('HidePreloader');
                    }
                });
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

        }]);