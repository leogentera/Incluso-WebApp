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

            _httpFactory = $http;

            $scope.$emit('ShowPreloader');
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();

            localStorage.setItem("retoMultipleActivities", null);
            //localStorage.setItem("activity/57", null);
            //localStorage.setItem("activity/58", null);
            //localStorage.setItem("activity/59", null);
            //localStorage.setItem("activity/60", null);
            //localStorage.setItem("activity/61", null);
            //localStorage.setItem("activity/62", null);
            //localStorage.setItem("activity/105", null);
            //localStorage.setItem("activity/106", null);

            $scope.user = moodleFactory.Services.GetCacheJson("profile");
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            console.log('mis fortalezas 2');

            if (!$scope.retoMultipleActivities) {
               $scope.retoMultipleActivities = [];
               var retosMultipleChallenge = _.find($scope.activities, function(a) { return a.coursemoduleid == '139'});
               if (retosMultipleChallenge) {
                  retoMultipleArray = retosMultipleChallenge.activities;
                  for(i = 0; i < retosMultipleChallenge.activities.length; i++)
                  {
                    var activity = moodleFactory.Services.GetCacheJson("activity/" + retosMultipleChallenge.activities[i].coursemoduleid);
                    if (activity) {
                        $scope.retoMultipleActivities.push(activity);
                    } else {
                        moodleFactory.Services.GetAsyncActivity(retosMultipleChallenge.activities[i].coursemoduleid, function(data) {$scope.retoMultipleActivities.push(data)});
                    }
                  }
                  localStorage.setItem("retoMultipleActivities", JSON.stringify($scope.retoMultipleActivities));
               }
            }



            function calculateStars() {
               var stars = 0;
               _.each($scope.retoMultipleActivities, function(activity) { stars = stars + activity.points; });
               $scope.$emit('HidePreloader');
               return stars;
            }

            $scope.stars = calculateStars();

            function createRequest() {


                var request = {
                            "userid  ": $scope.user.id,
                            "alias": $scope.user.username,
                            "actividad": "Reto múltiple",
                            "estado": "",
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
                localStorage.setItem("tmpRetoMultipleRequest", JSON.stringify(r));
                $location.path('/ZonaDeVuelo/Conocete/RetoMultipleExternalApp');
            }

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

        }]);