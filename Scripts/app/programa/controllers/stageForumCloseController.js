angular
    .module('incluso.stage.forumclosecontroller', [])
    .controller('stageForumCloseController', [
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
            var _loadedResources = false;
            var _pageLoaded = true;
            _httpFactory = $http;
            _timeout = $timeout;
            

            //Closing message content from drupal
            var closingActivityId = $routeParams.activityId;
            var stageClosingContent = "";
            if(closingActivityId > 999 && closingActivityId < 2000)
                stageClosingContent = "ZonaDeVueloClosing";
            else if(closingActivityId > 1999 && closingActivityId < 3000)
                stageClosingContent = "ZonaDeNavegacionClosing";
            else
                stageClosingContent = "ZonaDeAterrizajeClosing";
            drupalFactory.Services.GetContent(stageClosingContent, function (data, key)
            {
                _loadedResources = true;
                $scope.closingContent = data.node;
                if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
            }, function () { _loadedResources = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); } }, false);
            //finish getting content
            
            var userCourse = JSON.parse(localStorage.getItem('usercourse'));
            var parentActivity = getActivityByActivity_identifier($routeParams.activityId, userCourse);
            var activityFromTree;

            if (parentActivity.activities && parentActivity.activities.length) {
                activityFromTree = parentActivity.activities[0];
            } else {
                activityFromTree = parentActivity;
            }

            $scope.activityPoints = activityFromTree.points;
            $scope.activityname = Number($routeParams.moodleId) == 148? "Foro Artístico": activityFromTree.activityname;
            $scope.like_status = 1;
            $scope.currentActivity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId));

            if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader')};

            var endForumActivity = function(moodleid) {
                $scope.$emit('ShowPreloader');
                var activities = parentActivity.activities;
                
                parentActivity.status = 1;
                parentActivity.last_status_update = moment(Date.now()).unix();
                if (activities) {
                    for(var i = 0; i < activities.length; i++) {
                        activities[i].status = 1;
                    }
                }
                _setLocalStorageJsonItem('usercourse', userCourse);

                var like_status = $scope.like_status;

                var userToken = JSON.parse(localStorage.getItem('CurrentUser')).token;
                var userId = localStorage.getItem('userId');

                var data = {
                    userid: userId,
                    like_status: like_status
                };

                var userCurrentStage = localStorage.getItem("currentStage");
                
                var finishChildCounter = 0;
                if (activities){
                    for(var i = 0; i < activities.length; i++) {
                        if ($routeParams.moodleId == 147 || $routeParams.moodleId == 148) {
                            
                            if (activities[i].coursemoduleid == $routeParams.moodleId) {
                                moodleFactory.Services.PutEndActivity(activities[i].coursemoduleid, data, activities[i], userToken, endParentActivity, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });
                            }

                        }else {
                            moodleFactory.Services.PutEndActivity(activities[i].coursemoduleid, data, activities[i], userToken, function() {
                                finishChildCounter++;
                                if (finishChildCounter == activities.length) {
                                    endParentActivity();
                                }
                            }, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });
                        }
                    }
                }else{
                    endParentActivity();
                }

               function endParentActivity() {

                    moodleFactory.Services.PutEndActivity(parentActivity.coursemoduleid, data, parentActivity, userToken,
                      function(response){
                            var profile = JSON.parse(localStorage.getItem("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));
                            var model = {
                                userId: userId,
                                stars: activityFromTree.points,
                                instance: parentActivity.coursemoduleid,
                                instanceType: 0,
                                date: new Date()
                            };

                            moodleFactory.Services.PutStars(model, profile, userToken, function() {
                                //alert("PutStars");
                                updateActivityStatus($routeParams.activityId);
                                _updateRewardStatus();

                                profile.stars = Number(profile.stars) + Number(activityFromTree.points);
                                _setLocalStorageJsonItem("Perfil/" + moodleFactory.Services.GetCacheObject("userId"),profile);

                                $routeParams.activityId == 1049? moodleid =$routeParams.moodleId : moodleid = getMoodleIdFromTreeActivity($routeParams.activityId);
                                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + moodleid ));

                                var userStars = JSON.parse(localStorage.getItem("userStars"));

                                var localStorageStarsData = {
                                    dateissued: moment(Date.now()).unix(),
                                    instance: model.instance,
                                    instance_type: model.instanceType,
                                    message: "",
                                    is_extra: false,
                                    points: model.stars,
                                    userid: parseInt(model.userId)
                                };

                                userStars.push(localStorageStarsData);

                                localStorage.setItem("userStars", JSON.stringify(userStars));

                                var extraPoints = Number(moodleFactory.Services.GetCacheObject("starsToAssignedAfterFinishActivity"));

                                if (extraPoints != 0) {//alert(extraPoints);

                                    updateUserForumStars($routeParams.activityId, extraPoints,true, successPutStarsCallback, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });
                                }

                                var course = moodleFactory.Services.GetCacheJson("course");
                                var user = moodleFactory.Services.GetCacheJson("CurrentUser");
                                moodleFactory.Services.GetAsyncUserPostCounter(user.token, course.courseid, function(){}, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            }, true);

                                localStorage.removeItem("starsToAssignedAfterFinishActivity");

                                $scope.$emit('HidePreloader');
                                var activityId = Number($routeParams.activityId);

                                if(activityId == 1010 || activityId == 1049 || activityId == 1008 ){
                                    $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/' + getChallengeByActivity_identifier(activityId, userCourse));
                                } else if(activityId == 2030 || activityId == 2026){
                                    $location.path('/ZonaDeNavegacion/Dashboard/' + userCurrentStage + '/' + getChallengeByActivity_identifier(activityId, userCourse));
                                } else if(activityId == 3304 || activityId == 3404){
                                    $location.path('/ZonaDeAterrizaje/Dashboard/' + userCurrentStage + '/' + getChallengeByActivity_identifier(activityId, userCourse));
                                }

                            },function(obj){
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                     console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });
                      },
                      function(obj){
                          var activityId = Number($routeParams.activityId);
                          if(activityId == 1010 || activityId == 1049 || activityId == 1008 ){
                              $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/' + getChallengeByActivity_identifier(activityId, userCourse));
                          } else if(activityId == 2030 || activityId == 2026){
                              $location.path('/ZonaDeNavegacion/Dashboard/' + userCurrentStage + '/' + getChallengeByActivity_identifier(activityId, userCourse));
                          } else if(activityId == 3304 || activityId == 3404){
                              $location.path('/ZonaDeAterrizaje/Dashboard/' + userCurrentStage + '/' + getChallengeByActivity_identifier(activityId, userCourse));
                          }
                      });
                }

            };


            $scope.finishActivity = function () {
                var moodleId = getMoodleIdFromTreeActivity($routeParams.activityId);
                endForumActivity(moodleId);
            }



        }]).controller('tutorialController', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }]);
