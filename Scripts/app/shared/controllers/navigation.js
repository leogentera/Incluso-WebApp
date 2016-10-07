/* Controller to handle navigation controls */
var app = angular.module('inlcuso.shared.mainNavigation', ['ui.bootstrap']);
app.controller('navController', ['$scope', function($scope){

	/* Shows left menu */
	$scope.isNavCollapsed = true;
}]);

/* Controller to handle navigation controls */
app.controller('menuController', [
	'$rootScope',
	'$scope',
	'$location', 
	function($rootScope, $scope, $location){

		$(".accsub").unbind("click");
		$(".accsub").bind("click",function(e){
			e.stopPropagation();
			$(this).siblings("i").toggleClass("icon-arrow icon-arrow-up green white blue")
			var cual = $(this).attr('data-id');
			  $('#sub' + cual).toggle();

		});	

        $scope.logout = function(){
        	$rootScope.sidebar = false;
            logout($scope, $location);
        }; 
}]);
 
 /* Controller to handle navigation controls */
 app.controller('menuOffCanvas',[
 	'$scope',
 	'$location',
 	function($scope, $location){

 		$scope.sideToggle = function(action){ 
 			
 			if(action == 'toggle')
				$("body").toggleClass("sidebar-left-visible sidebar-left-in");
 			else if(action == 'in')
 				$("body").addClass("sidebar-left-visible sidebar-left-in");
 			else
 				$("body").removeClass("sidebar-left-visible sidebar-left-in");
 		};

 		$scope.sideToggleOut = function () {
 			$("body").removeClass("sidebar-left-visible sidebar-left-in");
 		};
 }]);