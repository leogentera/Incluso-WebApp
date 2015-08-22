angular
    .module('incluso.program.privacyNotice', [])
    .controller('PrivacyNoticeController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            $rootScope.pageName = "Aviso de privacidad"
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

}]);
