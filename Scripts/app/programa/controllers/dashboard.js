angular
    .module('incluso.programa.dashboard', [])
    .controller('programaDashboardController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
		'$timeout',
		'$rootScope',
		'$http',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http) {

            _httpFactory = $http;

            $scope.Math = window.Math;

            $scope.user = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));
            $scope.usercourse = JSON.parse(moodleFactory.Services.GetCacheObject("usercourse"));
            $scope.course = JSON.parse(moodleFactory.Services.GetCacheObject("course"));
            $scope.currentStage = JSON.parse(moodleFactory.Services.GetCacheObject("currentStage"));
            $scope.stage = JSON.parse(moodleFactory.Services.GetCacheObject("stage"));
            getDataAsync();

            $scope.logout = function () {
                localStorage.removeItem("CurrentUser");
                $location.path('/');
            };

            $scope.navigateToStage = function(){
                $location.path('/ProgramaDashboardEtapa/' + $scope.stage.stageId);
            };

            function getDataAsync() {
                moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), getDataAsyncCallback, errorCallback);
            }

            function getDataAsyncCallback(){
                $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));

                moodleFactory.Services.GetAsyncCourse($scope.usercourse.courseId, function(){
                    $scope.course = JSON.parse(localStorage.getItem("course"));
                    $scope.currentStage = getCurrentStage();

                    localStorage.setItem("currentStage", $scope.currentStage);
                }, errorCallback);
            }

            function errorCallback(data){
                console.log(data);
            }

            function getCurrentStage(){
                var currentStage = 1;

                for(var i = 0; i < $scope.usercourse.stages.length; i++){
                    var uc = $scope.usercourse.stages[i];

                    localStorage.setItem("stage", uc);
                    $scope.stage = uc;
                    if(uc.stageStatus === 0){
                        break;
                    }

                    currentStage++;
                }

                return currentStage;
            }
        }]);
