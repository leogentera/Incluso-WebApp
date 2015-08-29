angular
    .module('incluso.programa.acercaPrograma', [])
    .controller('programaAcercaProgramaController', [
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
            $rootScope.showFooterRocks = false; 
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

        }]);
