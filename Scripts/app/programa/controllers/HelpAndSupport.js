angular
    .module('incluso.program.helpAndSupport', [])
    .controller('HelpAndSupportController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            $scope.setToolbar($location.$$path,"Incluso");
            $rootScope.showFooter = true; 
            $scope.$emit('HidePreloader');
           
}]);
