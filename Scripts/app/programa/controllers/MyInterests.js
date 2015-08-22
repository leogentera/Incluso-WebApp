angular
    .module('incluso.program.myInterests', [])
    .controller('MyInterestsController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            $rootScope.pageName = "Mis Gustos"
            $rootScope.navbarorange = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
           
}]);
