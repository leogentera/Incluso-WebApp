var FAQsModule = angular.module('incluso.program.FAQs', []);

FAQsModule
    .controller('FAQsController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {

            $scope.$emit('ShowPreloader');

            _httpFactory = $http;
            _timeout = $timeout;
            $scope.setToolbar($location.$$path,"Incluso");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            };

            drupalFactory.Services.GetContent("FAQS", function (data, key) {
                $scope.contentResources = data.node;

                $scope.$emit('HidePreloader');
            }, function () {
            }, false);

}]);
