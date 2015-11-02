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

            drupalFactory.Services.GetContent("1039results", function (data, key) {
                $scope.contentResources = data.node;
            }, function () {}, false);

            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false; 

            $scope.scrollToTop();
            $scope.isCollapsed = true;

            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            $scope.profile = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
           
            $scope.fortalezas = _.filter($scope.retoMultipleActivities, function(a){ return a.score == "3"});
            $scope.fortalezas = _.sortBy($scope.fortalezas, function(f){ 
                if(f.name.slice(0,4).toLowerCase().indexOf($scope.profile.shield.slice(0,4).toLowerCase()) > -1){
                    f.total_score *= 1000;
                }
                return -f.total_score
            });
            $scope.aFortalecer = _.filter($scope.retoMultipleActivities, function(a){ return a.score != "3"});
            $scope.$emit('HidePreloader');

            $scope.back = function () {
                $location.path('/ZonaDeVuelo/Dashboard/1/2');
            }

        }]);