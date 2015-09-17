// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
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
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();

            _setLocalStorageItem("multiplicaTuDineroActivities", null);

            $scope.user = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.profile = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.multiplicaTuDineroActivity = moodleFactory.Services.GetCacheJson("multiplicaTuDineroActivities");
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            $scope.stars = 0;

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
                            moodleFactory.Services.GetAsyncActivity(multiplicaTuDinero.activities[i].coursemoduleid, function(data){
                                $scope.multiplicaTuDineroActivity = data;
                                assignCourseModuleId(true, data);
                            })
                        }
                    };
                }
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
                    "pathimagenes":"",
                    "activitidad": "Toma de decisiones",
                    "preguntas": [],
                    "catalogorespuestas": []
                }
                for (var i = 0; i < $scope.multiplicaTuDineroActivity.questions.length; i++) {
                    var currentQuestion = $scope.multiplicaTuDineroActivity.questions[i];
                    var question = {
                        "orden": i + 1,
                        "preguntaid": currentQuestion.id,
                        "pregunta": currentQuestion.question,
                        "tiporespuesta": "Retroalimentacion"
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

            $scope.downloadGame = function () {
                var r = createRequest();

                try {
                  cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [r]);
                }
                catch (e) {
                    successGame(
                        {"userid":2,"pathImagenes":"","actividad":"Toma de decisiones","respuestas":[{"preguntaid":127,"respuesta":529},{"preguntaid":128,"respuesta":532},{"preguntaid":129,"respuesta":534},{"preguntaid":130,"respuesta":536},{"preguntaid":131,"respuesta":540},{"preguntaid":132,"respuesta":543},{"preguntaid":133,"respuesta":545},{"preguntaid":134,"respuesta":550},{"preguntaid":135,"respuesta":552},{"preguntaid":136,"respuesta":555},{"preguntaid":137,"respuesta":557},{"preguntaid":138,"respuesta":560},{"preguntaid":139,"respuesta":563},{"preguntaid":140,"respuesta":567},{"preguntaid":141,"respuesta":570},{"preguntaid":142,"respuesta":573},{"preguntaid":143,"respuesta":576},{"preguntaid":144,"respuesta":579},{"preguntaid":145,"respuesta":581},{"preguntaid":146,"respuesta":584}]}
                    );
                }
            }

            function successGame(data){
                //asign answers to the questions
                var logEntry = {
                    "userid":$scope.user.id,
                    "answers": [],
                    "coursemoduleid": $scope.multiplicaTuDineroActivity.coursemoduleid,
                    "like_status": 1,
                    "startingTime": new Date(),
                    "endingTime": new Date(),
                    "quiz_answered": true
                };
                for (var i = 0; i < data.respuestas.length; i++) {
                    _.each($scope.multiplicaTuDineroActivity.questions, function(q){
                        if (q.id == data.respuestas[i].preguntaid) {
                            q.userAnswer = data.respuestas[i].respuesta;
                            //finds index of answer to insert it into array of logentry
                            var answerIndex = q.answers.getIndexBy("id", data.respuestas[i].respuesta);
                            logEntry.answers.push(answerIndex);
                        }
                    });

                }
                var questionsAnswered = _.countBy($scope.multiplicaTuDineroActivity.questions, function(q) {
                    return (q.userAnswer && q.userAnswer != '' ? 'completed' : 'incompleted');
                });

                $scope.IsComplete = $scope.multiplicaTuDineroActivity && 
                                    questionsAnswered.completed && 
                                    questionsAnswered.completed >= $scope.multiplicaTuDineroActivity.questions.length &&
                                    questionsAnswered.completed > 0;

                //save response
                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
                var subactivitiesCompleted = [];
                var activitiesCompleted = 0;
                if (parentActivit == 0) {
                    parentActivity.status = 1;
                    for (var i = 0; i < parentActivity.activities.length; i++) {
                        if(parentActivity.activities[i].status == 1 && i != 0){
                            activitiesCompleted++;
                        }
                    }
                    if (activitiesCompleted == parentActivity.activities.length - 1) {
                        _endActivity(parentActivity, function(){ });
                        $scope.activities = updateActivityManager($scope.activities, parentActivity.coursemoduleid);
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
                $location.path('/ZonaDeAterrizaje/Dashboard/3');
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

            var failureGame = function (data){
              $location.path('/ZonaDeAterrizaje/Dashboard/3');
            }

            $scope.back = function () {
                $location.path('/ZonaDeAterrizaje/Dashboard/3');
            }

            Array.prototype.getIndexBy = function (name, value) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][name] == value) {
                        return i;
                    }
                }
            }
        }]);