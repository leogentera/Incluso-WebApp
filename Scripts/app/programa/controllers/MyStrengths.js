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
            $scope.setToolbar($location.$$path,"Mis habilidades");
            $rootScope.showFooter = true; 
           
}]);
