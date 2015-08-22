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

            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

             $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");

             $scope.fortalezas = _.filter($scope.retoMultipleActivities, function(a){ return a.score == "3"});
             $scope.aFortalecer = _.filter($scope.retoMultipleActivities, function(a){ return a.score != "3"});

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

        }]);