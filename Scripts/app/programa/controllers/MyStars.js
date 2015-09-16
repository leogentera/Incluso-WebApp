angular
    .module('incluso.program.myStars', [])
    .controller('MyStarsController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"Mis estrellas");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
            $scope.$emit('HidePreloader'); //hide preloader
}]);