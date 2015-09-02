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
           
             var parentActivity = getActivityByActivity_identifier($routeParams.moodleid);
             var activityFromTree;
             if (parentActivity.activities && parentActivity.activities.length) {
                activityFromTree = parentActivity.activities[0];
             } else {
                activityFromTree = parentActivity
             }

             $scope.activityPoints = activityFromTree.points;
             $scope.activityname = activityFromTree.activityname;

            $scope.$emit('HidePreloader');

            var endForumActivity = function(moodleid){

                console.log('Finishing activity...');
                var like_status = $scope.like_status;

                var userToken = JSON.parse(localStorage.getItem('CurrentUser')).token;
                var userId = localStorage.getItem('userId');

                var data = {
                    userid: userId,
                    like_status: like_status
                };

                var userCurrentStage = localStorage.getItem("currentStage");

                moodleFactory.Services.PutEndActivity(moodleid, data, activityFromTree, userToken,
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
                            $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage);
                          }, errorCallback);
                    },
                    function(){
                      $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage);                
                    });
                updateActivityStatus(moodleid);

            };


            $scope.finishActivity = function () {
               endForumActivity(parentActivity.coursemoduleid);
            }



        }]).controller('tutorialController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });   