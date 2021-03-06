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
            $scope.file = null;
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            var user = JSON.parse(moodleFactory.Services.GetCacheObject("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));
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
                    _setLocalStorageJsonItem("avatarInfo", $scope.avatarInfo);
                    $location.path('/ProgramaDashboard');
                } else {
                    $location.path('/ProgramaDashboard');
                }
            }

            $scope.encodeImageUri = function(imageUri, callback) {
                var c = document.createElement('canvas');
                var ctx = c.getContext("2d");
                var img = new Image();
                img.onload = function() {
                    c.width = this.width;
                    c.height = this.height;
                    ctx.drawImage(img, 0, 0);

                    if(typeof callback === 'function'){
                        var dataURL = c.toDataURL("image/png");
                        callback(dataURL.slice(22, dataURL.length));
                    }
                };
                img.src = imageUri;
            }

            $scope.uploadAvatar = function(file) {                

                $scope.encodeImageUri("assets/images/avatar.svg", function(b64) {
                $http({
                    method: 'POST',
                    url: API_RESOURCE.format('avatar'),
                    data: {
                        userid: user.id,
                            filecontent: b64
                    }
                })
                .success(function(){
                    $location.path('/ProgramaDashboard');
                })
                .error(function(){
                    $location.path('/ProgramaDashboard');
                });
            
                    });
               }
            
        }]);
