angular
    .module('incluso.program.systemRequirements', [])
    .controller('programaSystemRequirementsController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            var _loadedResources = false;
            var _pageLoaded = true;
            
            $scope.$emit('ShowPreloader');
            $scope.setToolbar($location.$$path,"Incluso");
            $rootScope.showFooter = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;

            getContentResources("systemRequirements");

            function getContentResources(resourceKey) {
                drupalFactory.Services.GetContent(resourceKey, function (data, key) {
                    _loadedResources = true;
                    $scope.contentResources = data.node;
                    if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
                }, function () { 
                    if (_pageLoaded) { $scope.$emit('HidePreloader'); } 
                }, false);
            }

}]);