angular
.module('incluso.programa.reconocimiento', [])
.controller('reconocimientoController', [
	'$q',
	'$scope',
	'$location',
	'$routeParams',
	'$timeout',
	'$rootScope',
	'$http',
	'$modal',
	'$timeout',
    function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $timeout) {
        $scope.setToolbar($location.$$path, "Reconocimiento");
        $rootScope.showFooter = true;
        $rootScope.showFooterRocks = false;
        $scope.$emit('HidePreloader');

        $scope.currentYear = moment().format('YYYY');

        controllerInit();

        function controllerInit() {
            $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
            $scope.profile = JSON.parse(localStorage.getItem("profile/" + $scope.currentUser.id));
        }
    }]);