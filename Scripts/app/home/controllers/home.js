angular
    .module('incluso.home', [])
    .controller('homeCtrl', [
        '$scope',
        '$location',
        '$anchorScroll',
        function ($scope, $location, $anchorScroll) {
        	// http://stackoverflow.com/questions/15033195/showing-spinner-gif-during-http-request-in-angular
			// To handle page reloads

        	if ($location.$$path.split('/')[1]) {
        		$scope.loading = true;
        	} else {
        		$scope.loading = false;
        	}


            $scope.scrollToTop = function(){
                $anchorScroll();
            }
        }]);