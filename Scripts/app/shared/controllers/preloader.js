/* Controller to handle terms and conditions */
var preloader = angular.module('inlcuso.shared.preloader', ['ui.bootstrap']);
preloader.controller('preloaderController', [
	'$rootScope',
	'$scope',
	'$location',
	'$http',
	function($rootScope, $scope, $location, $http){

		/* open terms and conditions modal */
        $scope.openModal = function (size) {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'termsAndConditionsModal.html',
                controller: 'termsAndConditionsController',
                size: size,
                windowClass: 'modal-theme-default',
                backdrop: 'static'
            });
        };
	}
]);
preloader.controller('modalController', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);