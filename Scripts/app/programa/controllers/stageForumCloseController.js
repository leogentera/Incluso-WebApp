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
           
             var userCourse = JSON.parse(localStorage.getItem('usercourse'));
             var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
             var activityFromTree;
             if (parentActivity.activities && parentActivity.activities.length) {
                activityFromTree = parentActivity.activities[0];
             } else {
                activityFromTree = parentActivity
             }



             $scope.activityPoints = activityFromTree.points;
             $scope.activityname = activityFromTree.activityname;
             $scope.like_status = 1;

            $scope.$emit('HidePreloader');

            var endForumActivity = function(moodleid){

               var parentActivity = getActivityByActivity_identifier($routeParams.moodleid, userCourse);
               var activities = parentActivity.activities;

               parentActivity.status = 1;
               if (activities) {
                 for(var i = 0; i < activities.length; i++) {
                    activities[i].status = 1;
                 }
               }
               localStorage.setItem('usercourse', JSON.stringify(userCourse));


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

                moodleFactory.Services.PutEndActivity(moodleid, data, parentActivity, userToken,
                    function(response){
                          var profile = JSON.parse(localStorage.getItem("profile"));
                          var model = {
                              userId: userId,
                              stars: activityFromTree.points,
                              instance: parentActivity.coursemoduleid,
                              instanceType: 0,
                              date: new Date()
                          };

                          moodleFactory.Services.PutStars(model, profile, userToken, function() {
                            updateActivityStatus(moodleid);
                            $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage);
                          }, errorCallback);
                    },
                    function(){
                      $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage);                
                    });

            };


            $scope.finishActivity = function () {
               endForumActivity(parentActivity.coursemoduleid);
            }



        }]).controller('tutorialController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });   