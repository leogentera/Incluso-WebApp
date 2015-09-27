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
            _httpFactory = $http;
            _timeout = $timeout;

            $scope.currentChallenge = 2;
             var userCourse = JSON.parse(localStorage.getItem('usercourse'));
            var parentActivity = getActivityByActivity_identifier($routeParams.activityId, userCourse);
            var activityFromTree;

             if (parentActivity.activities && parentActivity.activities.length) {
                activityFromTree = parentActivity.activities[0];
             } else {
                activityFromTree = parentActivity;
             }



             $scope.activityPoints = activityFromTree.points;
             $scope.activityname = activityFromTree.activityname;
             $scope.like_status = 1;

            $scope.$emit('HidePreloader');

            var endForumActivity = function(moodleid){
                console.log('Closing time: ' + moodleid);
                $scope.$emit('ShowPreloader');
               var activities = parentActivity.activities;

               parentActivity.status = 1;
               if (activities) {
                 for(var i = 0; i < activities.length; i++) {
                    activities[i].status = 1;
                 }
               }
               _setLocalStorageJsonItem('usercourse', userCourse);

                console.log('Finishing activity...');
                var like_status = $scope.like_status;

                var userToken = JSON.parse(localStorage.getItem('CurrentUser')).token;
                var userId = localStorage.getItem('userId');

                var data = {
                    userid: userId,
                    like_status: like_status
                };

                var userCurrentStage = localStorage.getItem("currentStage");
               if (activities) {
                 for(var i = 0; i < activities.length; i++) {
                  moodleFactory.Services.PutEndActivity(activities[i].coursemoduleid, data, activities[i], userToken, function() {});
                 }
               }
                moodleFactory.Services.PutEndActivity(parentActivity.coursemoduleid, data, parentActivity, userToken,
                    function(response){
                          var profile = JSON.parse(localStorage.getItem("profile/" + moodleFactory.Services.GetCacheObject("userId")));
                          var model = {
                              userId: userId,
                              stars: activityFromTree.points,
                              instance: parentActivity.coursemoduleid,
                              instanceType: 0,
                              date: new Date()
                          };

                          moodleFactory.Services.PutStars(model, profile, userToken, function() {
                            updateActivityStatus($routeParams.activityId);
                            _updateRewardStatus();
                              $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + moodleid ));
                              $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.discussion == Number($routeParams.discussionId); });
                              var extraPointsCounter = getForumsExtraPointsCounter();
                              var currentDiscussionCounter = _.find(extraPointsCounter, function(discussion){ return discussion.discussion_id == $routeParams.discussionId; });
                              debugger;
                              var extraPoints = $routeParams.extraPoints? extraPoints = $routeParams.extraPoints : extraPoints = 0;
                              updateUserStars($routeParams.activityId);
                              //$timeout(
                              //    function() {
                              //        updateUserStars($routeParams.activityId, extraPoints);
                              //    },2000);
                              updateUserStars($routeParams.activityId, extraPoints);


                              $scope.$emit('HidePreloader');
                              var activityId = Number($routeParams.activityId);
                              if(activityId == 1010 || activityId == 1049 || activityId == 1008 ){
                                  $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/' + $scope.currentChallenge);
                              } else if(activityId == 2030 || activityId == 2026){
                                  $location.path('/ZonaDeNavegacion/Dashboard/' + userCurrentStage + '/' + $scope.currentChallenge);
                              } else if(activityId == 3304 || activityId == 3404){
                                  $location.path('/ZonaDeNavegacion/Dashboard/' + userCurrentStage + '/' + $scope.currentChallenge);
                              }

                          }, errorCallback);
                    },
                    function(){
                        var activityId = Number($routeParams.activityId);
                        if(activityId == 1010 || activityId == 1049 || activityId == 1008 ){
                            $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/' + $scope.currentChallenge);
                        } else if(activityId == 2030 || activityId == 2026){
                            $location.path('/ZonaDeNavegacion/Dashboard/' + userCurrentStage + '/' + $scope.currentChallenge);
                        } else if(activityId == 3304 || activityId == 3404){
                            $location.path('/ZonaDeNavegacion/Dashboard/' + userCurrentStage + '/' + $scope.currentChallenge);
                        }
                    });

            };


            $scope.finishActivity = function () {
                var moodleId = getMoodleIdFromTreeActivity($routeParams.activityId);
                endForumActivity(moodleId);
            }



        }]).controller('tutorialController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });   