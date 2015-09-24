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
                              //var activity_identifier = null;
                              //if(moodleid == 151){
                              //    activity_identifier = 1010;
                              //    moodleid = 64;
                              //} else if(moodleid == 64){
                              //    activity_identifier = 1010;
                              //    moodleid = 64;
                              //} else if(moodleid == 73){
                              //    activity_identifier = 1008;
                              //    moodleid = 73;
                              //} else if(moodleid == 147){
                              //    activity_identifier = 1049;
                              //    moodleid = 147;
                              //} else if(moodleid == 148){
                              //    activity_identifier = 1049;
                              //    moodleid = 148;
                              //} else if(moodleid == 178){
                              //    activity_identifier = 2008;
                              //    moodleid = 178;
                              //} else if(moodleid == 179){
                              //    activity_identifier = 2008;
                              //    moodleid = 178;
                              //}


                              //updateUserStars(activity_identifier);
                              updateUserStars($routeParams.activityId);
                              $scope.$emit('HidePreloader');
                              if($routeParams.activityId == 1010 || $routeParams.activityId == 1049 || $routeParams.activityId == 1008 ){
                                  $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/' + $scope.currentChallenge);
                              } //else if($routeParams.activityId == 1010){}

                          }, errorCallback);
                    },
                    function(){
                      $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/' + $scope.currentChallenge);
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