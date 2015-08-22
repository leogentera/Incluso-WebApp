// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
angular
    .module('incluso.juegos.avatar', [])
    .controller('juegosAvatarController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
		'$timeout',
		'$rootScope',
		'$http',
        '$anchorScroll',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {

            //$scope.scrollToTop();
            $scope.avatarInfo = moodleFactory.Services.GetCacheJson("avatarInfo");
            $scope.imageSrc =  "amarillo"; //$scope.avatarInfo[0]["color_cabello"];

            $scope.selectAvatarCabelloAmarillo = function() {
                if ( $scope.avatarInfo != null) {
                    $scope.avatarInfo[0]["color_cabello"] = "amarillo";
                    $('#avatarControl').attr("src", 'assets/images/avatar/create_avatar_cabello_amarillo.jpg');
                } else {
                    $location.path('/ProgramaDashboard');
                }
            }
            
            $scope.selectAvatarCabelloRojo = function() {
                if ( $scope.avatarInfo != null) {
                    $scope.avatarInfo[0]["color_cabello"] = "rojo";
                    $('#avatarControl').attr("src", 'assets/images/avatar/create_avatar_cabello_rojo.jpg');
                } else {
                    $location.path('/ProgramaDashboard');
                }
            }


            $scope.selectAvatarCabelloVerde = function() {
                if ( $scope.avatarInfo != null) {
                    $scope.avatarInfo[0]["color_cabello"] = "verde";
                    $('#avatarControl').attr("src", 'assets/images/avatar/create_avatar_cabello_verde.jpg');
                } else {
                    $location.path('/ProgramaDashboard');
                }
            }


            $scope.selectAvatarCabelloCafe= function() {
                if ( $scope.avatarInfo != null) {
                    $scope.avatarInfo[0]["color_cabello"] = "cafe";
                    $('#avatarControl').attr("src", 'assets/images/avatar/create_avatar_cabello_cafe.jpg');

                } else {
                    $location.path('/ProgramaDashboard');
                }
            }

            $scope.selectAvatar= function() {
                if ( $scope.avatarInfo != null) {
                    localStorage.setItem("avatarInfo", JSON.stringify($scope.avatarInfo));
                    $location.path('/ProgramaDashboard');
                } else {
                    $location.path('/ProgramaDashboard');
                }
            }
            
        }]);
