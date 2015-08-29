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
            $scope.setToolbar($location.$$path,"Mis gustos");
            $rootScope.showFooter = true; 
           
}]);
