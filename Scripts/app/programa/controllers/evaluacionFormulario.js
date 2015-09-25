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
		$scope.setToolbar($location.$$path,"");
		$rootScope.showFooter = true; 
        $rootScope.showFooterRocks = false;
        $rootScope.showStage1Footer = false;
        $rootScope.showStage2Footer = false;
        $rootScope.showStage3Footer = false;
		$scope.$emit('HidePreloader');
		
		$scope.showAddNewOption = true; 	

		$scope.toggleAddNewOptionButton = function () {
			var result = $scope.showAddNewOption ? false : true;
			$scope.showAddNewOption = result;
		}

	}]);