// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
angular
    .module('incluso.stage.gameretomultipleresultscontroller', [])
    .controller('stageGameRetoMultipleResultsController', [
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

            $scope.$emit('ShowPreloader');
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();
            $scope.isCollapsed = true;

            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            $scope.profile = moodleFactory.Services.GetCacheJson("profile");
           
            $scope.fortalezas = _.filter($scope.retoMultipleActivities, function(a){ return a.score == "3"});
            $scope.aFortalecer = _.filter($scope.retoMultipleActivities, function(a){ return a.score != "3"});
            $scope.$emit('HidePreloader');

            $scope.back = function () {
                $location.path('/ZonaDeVuelo/Dashboard/1/2');
            }

        }]);