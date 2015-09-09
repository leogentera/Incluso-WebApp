angular
.module('incluso.programa.reconocimiento', [])
.controller('reconocimiento', [
	'$q',
	'$scope',
	'$location',
	'$routeParams',
	'$timeout',
	'$rootScope',
	'$http',
	'$modal',
	function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
		$scope.setToolbar($location.$$path,"Reconocimiento");
		$rootScope.showFooter = true; 
		$rootScope.showFooterRocks = false;
		$scope.$emit('HidePreloader');

	}]);