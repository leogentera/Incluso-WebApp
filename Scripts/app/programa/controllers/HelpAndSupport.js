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
            $rootScope.pageName = "Ayuda y soporte"
            $rootScope.navbarblue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $scope.$emit('HidePreloader');
           
}]);
