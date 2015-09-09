angular
    .module('incluso.program.album', [])
    .controller('AlbumInclusoController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
           
            $scope.setToolbar($location.$$path,"AlbumIncluso");
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;           
            $scope.$emit('HidePreloader');
                     
        }
]);
