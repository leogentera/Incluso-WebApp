angular
.module('incluso.programa.evaluacionFormulario', [])
.controller('evaluacionFormulario', [
	'$q',
	'$scope',
	'$location',
	'$routeParams',
	'$timeout',
	'$rootScope',
	'$http',
	'$modal',
	function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
		$rootScope.pageName = "Evaluación"
		$rootScope.navbarBlue = true;
		$rootScope.showToolbar = true;
		$rootScope.showFooter = true; 
		$rootScope.showFooterRocks = false;
		
		$scope.showAddNewOption = true; 	

		$scope.toggleAddNewOptionButton = function () {
			var result = $scope.showAddNewOption ? false : true;
			$scope.showAddNewOption = result;
		}

	}]);