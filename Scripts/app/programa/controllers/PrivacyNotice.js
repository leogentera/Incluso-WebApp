angular
    .module('incluso.program.privacyNotice', [])
    .controller('PrivacyNoticeController', [
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
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"Incluso");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
            
            $scope.contentResources = {};
            
            function getContentResources(activityIdentifierId) {
                drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                    _loadedResources = true;
                    
                    $scope.contentResources = data.node;
                    if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
                    
                    }, function () { _loadedResources = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); } }, false);
            }

            getContentResources("PrivacyNotice");
}]);
