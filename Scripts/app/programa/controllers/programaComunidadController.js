angular
    .module('incluso.programa.comunidad', [])
    .controller('programaComunidadController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            $rootScope.pageName = "Comunidad"
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

        }]);