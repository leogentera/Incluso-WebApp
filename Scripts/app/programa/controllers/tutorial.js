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

            $scope.scrollToTop();
            $scope.model = getDataAsync();
            $scope.$emit('ShowPreloader');
            /* Models */
            //$scope.hasSeenTutorial = moodleFactory.Services.GetCacheObject("HasSeenTutorial");
            //$scope.avatarInfo = moodleFactory.Services.GetCacheJson("avatarInfo");
            //$scope.user = moodleFactory.Services.GetCacheJson("profile");

            /* Helpers */
            $scope.currentPage = 1;
            $scope.loading = false;

            //$scope.avatarInfo = [{
            //    "userid": "",//$scope.user.UserId,
            //    "alias": "", //$scope.user.username,
            //    "aplicacion": "Mi Avatar",
            //    "estrellas": 0,//$scope.user.stars,
            //    "PathImagen": "Android/data/<app-id>/images",
            //    "color_cabello": "amarillo",
            //    "estilo_cabello": "",
            //    "traje_color_principal": "",
            //    "traje_color_secundario": "",
            //    "rostro": "",
            //    "color_de_piel": "",
            //    "escudo:": "",
            //    "imagen_recortada": "",
            //}];

            console.log($scope.showFooter);

            $rootScope.pageName = "Guia de uso"
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false; 
            //function getDataAsync() {
            //    //moodleFactory.Services.GetAsyncAvatar(_getItem("userId"), getAvatarInfoCallback);
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
            //}

            function getDataAsync() {

                moodleFactory.Services.GetAsyncAvatar(_getItem("userId"), getAvatarInfoCallback);
                var m = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));

                if (!m) {
                    $location.path('/');
                    return "";
                }

                return m;
            }

            function getAvatarInfoCallback(){
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
               $scope.$emit('HidePreloader');
            }

            //function errorCallback(data){
            //    console.log(data);
            //}  


            //$scope.continue = function() {
			//	$scope.hasSeenTutorial = true;
            //    localStorage.setItem("HasSeenTutorial", "true");
            //    $scope.scrollToTop();
            //    $location.path('/Perfil');

            //}
            
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
                    //alert('loading avatar');
                    c.width = this.width;
                    c.height = this.height;
                    ctx.drawImage(img, 0, 0);

                    if(typeof callback === 'function'){
                        var dataURL = c.toDataURL("image/jpeg");
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
                //if ($scope.user != null) {
                //    $scope.avatarInfo[0].UserId = $scope.user.UserId;
                //    $scope.avatarInfo[0].Alias = $scope.user.username;
                //    $scope.avatarInfo[0].Estrellas = $scope.user.stars;
                //}
                //localStorage.setItem("avatarInfo", JSON.stringify($scope.avatarInfo));
                //$scope.scrollToTop();         
                //$location.path('/Juegos/Avatar');

                //the next fields should match the integration document shared with the game app
                var avatarInfoForGameIntegration = {
                    "userid": $scope.model.id,
                    "alias": $scope.model.username,
                    "actividad": "Mi Avatar",
                    "estrellas": "100",
                    "pathimagen": "",
                    "genero": "",
                    "rostro": "",
                    "color_de_piel": "",
                    "estilo_cabello": "",
                    "color_cabello": "",
                    "traje_color_principal": "",
                    "traje_color_secundario": "",
                    "escudo": ""
                };    
                cordova.exec(SuccessAvatar, FailureAvatar, "CallToAndroid", "openApp", [JSON.stringify(avatarInfoForGameIntegration)]);
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
                    "imagen_recortada": data.imagen_recortada,
                    "ultima_modificacion": data.fecha_modificacion,
                    "Te_gusto_la_actividad": data.Te_gusto_la_actividad,
                    "pathimagen": data.pathimagen,
                    "estrellas": "100",
                    "alias": $scope.model.username,
                    "escudo" : $scope.model.shield
                }];
                uploadAvatar($scope.avatarInfo);
                localStorage.setItem("avatarInfo", JSON.stringify($scope.avatarInfo));
            }
        
            function FailureAvatar(data) {
                console.log("Couldn't retrieve avatar");
            }
            //function SuccessAvatar(data) {
            //        $scope.avatarInfo = [{
            //            "userid": data["UserId"],
            //            "alias": data["Alias"],
            //            "aplicacion": data["Aplicacion"],
            //            "estrellas": data["Estrellas"],
            //            "PathImagen": "Android/data/<app-id>/images",
            //            "color_cabello": data["Color Cabello"],
            //            "estilo_cabello": data["Estilo Cabello"],
            //            "traje_color_principal": data["Traje color principal"],
            //            "traje_color_secundario": data["Traje color secundario"],
            //            "rostro": data["Rostro"],
            //            "color_de_piel": data["Color de piel"],
            //            "escudo:": data["Escudo"],
            //            "imagen_recortada": data["Imagen Recortada"],
            //        }]; 

            //      localStorage.setItem("avatarInfo", JSON.stringify($scope.avatarInfo));
            //}
            
            //function FailureAvatar() {
            //}

            $scope.navigateToPage = function(pageNumber){
                $scope.currentPage = pageNumber;
                $scope.scrollToTop();
            };
        }]);
