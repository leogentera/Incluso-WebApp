angular
    .module('incluso.program.hallOfFame', [])
    .controller('HallOfFameController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            $rootScope.pageName = "Salón de la fama"
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

}]);
