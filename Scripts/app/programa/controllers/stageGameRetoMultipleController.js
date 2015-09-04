// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
angular
    .module('incluso.stage.gameretomultiplecontroller', [])
    .controller('stageGameRetoMultipleController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {

            console.log('mis fortalezas');

            _timeout = $timeout;
            _httpFactory = $http;

            $scope.$emit('ShowPreloader');
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();

            localStorage.setItem("retoMultipleActivities", null);
            // localStorage.setItem("activity/57", null);
            // localStorage.setItem("activity/58", null);
            // localStorage.setItem("activity/59", null);
            // localStorage.setItem("activity/60", null);
            // localStorage.setItem("activity/61", null);
            // localStorage.setItem("activity/62", null);
            // localStorage.setItem("activity/105", null);
            // localStorage.setItem("activity/106", null);

            $scope.user = moodleFactory.Services.GetCacheJson("profile");
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.profile = moodleFactory.Services.GetCacheJson("profile");
            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            console.log('mis fortalezas 2');
            var stars = 0;            

            if (!$scope.retoMultipleActivities) {
               $scope.retoMultipleActivities = [];
               var retosMultipleChallenge = _.find($scope.activities, function(a) { return a.activity_identifier == $routeParams.moodleid});
               if (retosMultipleChallenge) {
                  retoMultipleArray = retosMultipleChallenge.activities;
                  for(i = 0; i < retosMultipleChallenge.activities.length; i++)
                  {
                    stars = stars + retosMultipleChallenge.activities[i].points;
                    var activity = moodleFactory.Services.GetCacheJson("activity/" + retosMultipleChallenge.activities[i].coursemoduleid);
                    if (activity) {
                        $scope.retoMultipleActivities.push(activity);
                    } else {
                        moodleFactory.Services.GetAsyncActivity(retosMultipleChallenge.activities[i].coursemoduleid, function(data) {
                          $scope.retoMultipleActivities.push(data);
                          assignCourseModuleId(true, data);
                        });
                    }
                    if ($scope.retoMultipleActivities.length > 0) {
                      assignCourseModuleId(false, retosMultipleChallenge.activities[i]);
                    }
                  }
                  localStorage.setItem("retoMultipleActivities", JSON.stringify($scope.retoMultipleActivities));
                  //localStorage.setItem("retoMultipleActivitiesParent", $routeParams.moodleid);
               }
            }

            $scope.stars = stars;

            function assignCourseModuleId(asyncRequest, data){
              $scope.retoMultipleActivities[$scope.retoMultipleActivities.length - 1]["coursemoduleid"] = 
              ( asyncRequest ? _.find(retosMultipleChallenge.activities, function(r){ return r.activityname == data.name }).coursemoduleid : data.coursemoduleid);
              $scope.$emit('HidePreloader');
            }

            function createRequest() {


                var request = {
                            "userid  ": $scope.user.id,
                            "alias": $scope.user.username,
                            "actividad": "Reto múltiple",
                            "sub_actividades": []
                        };

                for(i = 0; i < $scope.retoMultipleActivities.length; i++) {
                    var subactivity = {
                        "estrellas": $scope.retoMultipleActivities[i].points,
                        "sub_actividad": $scope.retoMultipleActivities[i].name
                    };

                    request.sub_actividades.push(subactivity);
                }
                return request;

            }

            $scope.downloadGame = function () {
                var r = createRequest();
                cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [r]);
                //localStorage.setItem("tmpRetoMultipleRequest", JSON.stringify(r));
                //$location.path('/ZonaDeVuelo/Conocete/RetoMultipleExternalApp');
            }
            
            var successGame = function (data){
                var shield = "";
                var quizzesRequests = [];

                //Shield of highest score
                if (data.inteligencia_predominante) {
                  shield = _.max(data.inteligencia_predominante, function(m){ 
                    return  m.puntuacion;
                  }).inteligencia;
                }

                //Assign results to answers.
                for (var i = 0; i < data.resultado.length; i++) {
                  var logEntry = {
                    "userid": $scope.user.id,
                    "answers": [],
                    "coursemoduleid": "",
                    "like_status": "",
                    "startingTime":"",
                    "endingTime": "",
                    "quiz_answered": true
                  };
                  var activity = _.find($scope.retoMultipleActivities, function(a){ return a.name == data.resultado[i].subactividad; });
                  if (activity) {
                    var questionAnswers = _.countBy(activity.questions, function(q){
                      return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                    });
                    for(var j = 0; j < data.resultado[i].preguntas.length - 1; j++){
                      if (activity.questions[j] && data.resultado[i].preguntas[j].respuesta != "") {
                          activity.questions[j]["userAnswer"] = data.resultado[i].preguntas[j].respuesta;
                          logEntry.answers.push((j < data.resultado[i].preguntas.length - 2 ? data.resultado[i].preguntas[j+1].respuesta : data.resultado[i].preguntas[0].respuesta ));
                      }
                      logEntry.quiz_answered = ( data.resultado[i].preguntas[j].respuesta != "" && logEntry.quiz_answered);
                    }
                    logEntry.coursemoduleid = activity.coursemoduleid;
                    logEntry.like_status = (data.resultado[i].preguntas[4].respuesta == "No" ? 0 : 1 );
                    logEntry.startingTime = data.resultado[i].fecha_inicio;
                    logEntry.endingTime = data.resultado[i].fecha_fin;
                    quizzesRequests.push(logEntry);
                  }
                }

                var completedActivities = _.countBy($scope.retoMultipleActivities, function(a) {
                    if (a.questions) {
                        var questionAnswers = _.countBy(a.questions, function(q) {
                            return q.userAnswer && q.userAnswer != '' ? 'answered' : 'unanswered';
                        });
                        if (questionAnswers) {
                            console.log("answered:" + questionAnswers.answered);
                        }
                        return questionAnswers && questionAnswers.answered > 0 ? 'completed' : 'incompleted';

                    }
                });


                $scope.IsComplete = $scope.retoMultipleActivities && 
                                    completedActivities.completed && 
                                    $scope.retoMultipleActivities && 
                                    completedActivities.completed >= $scope.retoMultipleActivities.length &&
                                    completedActivities.completed > 1;

                //save response
                var parentActivityIdentifier = $routeParams.moodleid;
                var parentActivity = getActivityByActivity_identifier(parentActivityIdentifier);
                var subactivitiesCompleted = [];
                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                if (parentActivity.status == 0) {
                  if (shield != "" && $scope.profile) {
                    //update profile
                    $scope.profile["shield"] = shield;
                    localStorage.setItem("profile", JSON.stringify($scope.profile));
                    $scope.saveUser();
                  }

                  if ($scope.IsComplete) {
                    _endActivity(parentActivity);
                  }

                  if (parentActivity.activities) {
                    //Searches for the quizzes completed
                    _.each(quizzesRequests, function(q){
                      if(q.quiz_answered){
                        subactivitiesCompleted.push(q.coursemoduleid);
                      }
                    });
                    //Posts the stars of the finished subactivities and if they're all finished, posts the stars of the parent
                    updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted);
                    //Updates the statuses of the subactivities completed
                    userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted);
                  }
                }

                for(i = 0; i < quizzesRequests.length; i++){
                  if (quizzesRequests[i].quiz_answered) {
                    var userActivity = _.find(parentActivity.activities, function(a){ return a.coursemoduleid == quizzesRequests[i].coursemoduleid });
                    $scope.saveQuiz(userActivity, quizzesRequests[i], userCourseUpdated);
                  }
                }

                localStorage.setItem("retoMultipleActivities", JSON.stringify($scope.retoMultipleActivities));
                
                if ($scope.IsComplete) {
                    //Only shows the results if all of the quizzes are answered
                    $location.path('/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados');  
                } else {
                    $location.path('/ZonaDeVuelo/Dashboard/1');
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
              _endActivity(activityModel);
            }

            $scope.saveUser = function () {
                moodleFactory.Services.PutAsyncProfile(_getItem("userId"), $scope.profile,
                function (data) {
                    console.log('Save profile successful...');
                },
                function (date) {
                    console.log('Save profile fail...');
                });
            };
                
            var failureGame = function (data){
              alert("Fail");
              $location.path('/ProgramaDashboard');
            }

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

        }]);