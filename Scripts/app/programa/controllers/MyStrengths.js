angular
    .module('incluso.program.myStrengths', [])
    .controller('MyStrengthsController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            $rootScope.pageName = "Mis cualidades"
            $rootScope.navbarorange = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
           
}]);
