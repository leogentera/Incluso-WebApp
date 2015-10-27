angular
    .module('incluso.programa.tutorial', [])
    .controller('programaTutorialController', [
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
            $scope.$emit('ShowPreloader'); //show preloader
            _timeout = $timeout;
            $scope.scrollToTop();
            $scope.model = getDataAsync();
            $scope.currentPage = 1;
            $scope.loading = false;
            $rootScope.pageName = "Guia de uso"
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false; 

            $scope.avatarInfo = [{
                "userid": "",//$scope.user.UserId,
                "alias": "", //$scope.user.username,
                "aplicacion": "Mi Avatar",
                "estrellas": 0,//$scope.user.stars,
                "PathImagen": "Android/data/<app-id>/images",
                "color_cabello": "amarillo",
                "estilo_cabello": "",
                "traje_color_principal": "",
                "traje_color_secundario": "",
                "rostro": "",
                "color_de_piel": "",
                "escudo:": "",
                "imagen_recortada": "",
            }];

            function getDataAsync() {

                var m = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
                if (!m) {
                    $location.path('/');
                    return "";
                }
                $scope.$emit('HidePreloader');

                return m;
            }

               $scope.avatarInfo = moodleFactory.Services.GetCacheJson("avatarInfo");
               if ($scope.avatarInfo == null || $scope.avatarInfo.length == 0) {
                   $scope.avatarInfo = [{
                       "userid": "",//$scope.user.UserId,
                       "alias": "", //$scope.user.username,
                       "aplicacion": "Mi Avatar",
                       "estrellas": 0,//$scope.user.stars,
                       "PathImagen": "Android/data/<app-id>/images",
                       "color_cabello": "amarillo",
                       "estilo_cabello": "",
                       "traje_color_principal": "",
                       "traje_color_secundario": "",
                       "rostro": "",
                       "color_de_piel": "",
                       "escudo:": "",
                       "imagen_recortada": "",
                   }];             
               }


            
          $scope.playVideo = function(videoAddress, videoName){                 
                 //var videoAddress = "assets/media";
                 //var videoName = "TutorialTest2.mp4";
                playVideo(videoAddress, videoName);
            };

            encodeImageUri = function(imageUri, callback) {
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

            uploadAvatar = function(avatarInfo) {                
                var pathimagen = "assets/avatar/" + avatarInfo[0].pathimagen;
                encodeImageUri(pathimagen, function(b64) {
                    avatarInfo[0]["filecontent"] = b64;
                    $http({
                        method: 'POST',
                        url: API_RESOURCE.format('avatar'),
                        data: avatarInfo[0]
                    })
                    .success(function(){
                        console.log('Foto guardada exitosamente!');
                        $location.path('/ProgramaDashboard');
                    })
                    .error(function(){
                        console.log('Error al subir la foto!');
                        $location.path('/ProgramaDashboard');
                    });
                });
            }
            
            $scope.avatar = function () {

                var avatarInfoForGameIntegration = {
                    "userid": $scope.model.id,
                    "alias": $scope.model.alias,
                    "actividad": "Mi Avatar",
                    "estrellas": "100",
                    "pathimagen": "",
                    "genero": $scope.avatarInfo[0].imagen_recortada,
                    "rostro": $scope.avatarInfo[0].rostro,
                    "color_de_piel": $scope.avatarInfo[0].color_de_piel,
                    "estilo_cabello": $scope.avatarInfo[0].estilo_cabello,
                    "color_cabello": $scope.avatarInfo[0].color_cabello,
                    "traje_color_principal": $scope.avatarInfo[0].traje_color_principal,
                    "traje_color_secundario": $scope.avatarInfo[0].traje_color_secundario,
                    "escudo": ""
                };   

                $scope.$emit('ShowPreloader');

                try {
                    cordova.exec(SuccessAvatar, FailureAvatar, "CallToAndroid", "openApp", [JSON.stringify(avatarInfoForGameIntegration)]);
                } catch(e) {
                    SuccessAvatar(
                        {"userid":$scope.model.id,"actividad":"Mi Avatar","alias": $scope.model.alias, "genero":"Hombre","rostro":"Preocupado","color_de_piel":"E6C8B0","estilo_cabello":"Cabello02","color_cabello":"694027","traje_color_principal":"00A0FF","traje_color_secundario":"006192","imagen_recortada":"app/initializr/media","fecha_modificacion":"09/05/2015 09:32:04","Te_gusto_la_actividad":null, "pathimagen":"default.png"}                
                    );
                }
            };
            
            function SuccessAvatar(data) {
                $scope.avatarInfo = [{
                    "userid": data.userid,
                    "aplicacion": data.actividad,
                    "genero": data.genero,
                    "rostro": data.rostro,
                    "color_de_piel": data.color_de_piel,
                    "estilo_cabello": data.estilo_cabello,
                    "color_cabello": data.color_cabello,
                    "traje_color_principal": data.traje_color_principal,
                    "traje_color_secundario": data.traje_color_secundario,
                    "imagen_recortada": data.genero,
                    "ultima_modificacion": data.fecha_modificacion,
                    "Te_gusto_la_actividad": data.Te_gusto_la_actividad,
                    "pathimagen": data.pathimagen,
                    "estrellas": "100",
                    "alias": $scope.model.alias,
                    "escudo" : $scope.model.shield
                }];
                uploadAvatar($scope.avatarInfo);
                _setLocalStorageJsonItem("avatarInfo", $scope.avatarInfo);
            }
        
            function FailureAvatar(data) {
                console.log("Couldn't retrieve avatar");
                $location.path('/ProgramaDashboard');
            }

            $scope.navigateToPage = function(pageNumber){
                $scope.currentPage = pageNumber;
                $scope.scrollToTop();
            };
        }]);
