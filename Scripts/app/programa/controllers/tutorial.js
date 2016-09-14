angular
    .module('incluso.programa.tutorial', ['ngSanitize'])
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
            $scope.$emit('ShowPreloader');
            _timeout = $timeout;
            $scope.scrollToTop();
            $scope.model = getDataAsync();
            $scope.currentPage = 2;
            $rootScope.loading = false;
            $rootScope.pageName = "Guia de uso";
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.isInstalled = false;
            _inTutorial = true;

            $scope.avatarInfo = [{
                "userid": "",
                "alias": "",
                "aplicacion": "Mi Avatar",
                "estrellas": 0,
                "PathImagen": "Android/data/<app-id>/images",
                "color_cabello": "amarillo",
                "estilo_cabello": "",
                "traje_color_principal": "",
                "traje_color_secundario": "",
                "rostro": "",
                "color_de_piel": "",
                "escudo:": "",
                "imagen_recortada": ""
            }];

            if (!$routeParams.retry) {
                
                
                
                var videoPlayed = JSON.parse(localStorage.getItem("videoPlayed"));
                if (!videoPlayed) {
                    localStorage.setItem("videoPlayed", JSON.stringify("true"));
                    $scope.playVideo('assets/media', 'video-tutorial.mp4');
                }else{
                    console.log("isMisionInclusoInstalled");
                    isMisionInclusoInstalled();
                }
                
                
            }
            
            function isMisionInclusoInstalled() {
                try {
                    cordova.exec(function (data) {
                        $scope.isInstalled = data.isInstalled;
                        if ($scope.isInstalled) {
                            $scope.navigateToPage(3);
                        }else{
                            $scope.navigateToPage(2);
                        }
                    }, function () {
                    }, "CallToAndroid", " isInstalled", []);
                }
                catch (e) {
                    $scope.isInstalled = true;
                }
            }
           
            //cordova.exec(function (data) {
            //        $scope.isInstalled = data.isInstalled
            //    }, function () {
            //}, "CallToAndroid", " isInstalled", []);
            
                       
            function getDataAsync() {
                var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
                //moodleFactory.Services.GetAsyncAvatar(_getItem("userId"), currentUser.token , getAvatarInfoCallback);

                if (!currentUser) {
                    $location.path('/');
                    return "";
                }
                $scope.$emit('HidePreloader');

                return currentUser;
            }

            function getAvatarInfoCallback() {
                $scope.avatarInfo = moodleFactory.Services.GetCacheJson("avatarInfo");
                if ($scope.avatarInfo == null || $scope.avatarInfo.length == 0) {
                    $scope.avatarInfo = [{
                        "userid": "",
                        "alias": "",
                        "aplicacion": "Mi Avatar",
                        "estrellas": 0,
                        "PathImagen": "Android/data/<app-id>/images",
                        "color_cabello": "amarillo",
                        "estilo_cabello": "",
                        "traje_color_principal": "",
                        "traje_color_secundario": "",
                        "rostro": "",
                        "color_de_piel": "",
                        "escudo:": "",
                        "imagen_recortada": ""
                    }];
                }
                $scope.$emit('HidePreloader');
            }


            $scope.playVideo = function (videoAddress, videoName) {
                playVideo(videoAddress, videoName);
                isMisionInclusoInstalled();
            };

            encodeImageUri = function (imageUri, callback) {
                var c = document.createElement('canvas');
                var ctx = c.getContext("2d");
                var img = new Image();
                img.onload = function () {
                    c.width = this.width;
                    c.height = this.height;
                    ctx.drawImage(img, 0, 0);
                    if (typeof callback === 'function') {
                        var dataURL = c.toDataURL("image/png");
                        callback(dataURL.slice(22, dataURL.length));
                    }
                };
                img.src = imageUri;
            };

            uploadAvatar = function (avatarInfo) {
                var pathimagen = "assets/avatar/" + avatarInfo[0].pathimagen;
                encodeImageUri(pathimagen, function (b64) {
                    avatarInfo[0]["filecontent"] = b64;
                    moodleFactory.Services.PostAsyncAvatar(avatarInfo[0], successCallback, function (obj) {
                        $scope.$emit('HidePreloader');
                        if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                          $timeout(function () {
                            $location.path('/Offline'); //This behavior could change
                          }, 1);
                        } else {//Another kind of Error happened
                          $timeout(function () {
                              console.log("Another kind of Error happened");
                              $scope.$emit('HidePreloader');
                              $location.path('/connectionError');
                          }, 1);
                        }
                    }, true);
                });
            };

            var successCallback = function () {
                _tutorial = true;

                if ($routeParams.retry) {
                    _forceUpdateConnectionStatus(function () {
                        if (_isDeviceOnline) {
                            moodleFactory.Services.ExecuteQueue();
                        }
                    }, function (obj) {
                        if (obj.statusCode == 408) {//Request Timeout
                            $timeout(function () {
                                $location.path('/Offline');
                            }, 1000);
                        }
                    });
                }

                $timeout(function () {
                    _loadedDrupalResources = true;
                    $location.path('/ProgramaDashboard');
                }, 500);
            };


            $scope.avatar = function () {
                var avatarInfoForGameIntegration = {
                    "userId": "" + $scope.model.id,
                    "alias": $scope.model.alias,
                    "actividad": "Mi Avatar",
                    "estrellas": "100",
                    "pathImagen": "",
                    "genero": $scope.avatarInfo[0].imagen_recortada,
                    "rostro": $scope.avatarInfo[0].rostro,
                    "colorPiel": $scope.avatarInfo[0].color_de_piel,
                    "estiloCabello": $scope.avatarInfo[0].estilo_cabello,
                    "colorCabello": $scope.avatarInfo[0].color_cabello,
                    "trajeColorPrincipal": $scope.avatarInfo[0].traje_color_principal,
                    "trajeColorSecundario": $scope.avatarInfo[0].traje_color_secundario,
                    "escudo": "",
                    "avatarType": "Tutorial"
                };

                try {
                    cordova.exec(SuccessAvatar, FailureAvatar, "CallToAndroid", "openApp", [JSON.stringify(avatarInfoForGameIntegration)]);
                } catch (e) {
                    SuccessAvatar(
                        {
                            "userId": $scope.model.id,
                            "actividad": "Mi Avatar",
                            "alias": $scope.model.alias,
                            "genero": "Mujer",
                            "rostro": "Preocupado",
                            "colorPiel": "E6C8B0",
                            "estiloCabello": "Cabello02",
                            "colorCabello": "694027",
                            "trajeColorPrincipal": "00A0FF",
                            "trajeColorSecundario": "006192",
                            "imagenRecortada": "app/initializr/media",
                            "fechaModificación": "09/05/2015 09:32:04",
                            "gustaActividad": "Si",
                            "pathImagen": "default.png"
                        }
                    );
                }
            };

            function SuccessAvatar(data) {

                $rootScope.loaderForLogin = false;//-
                $scope.loaderRandom(); //Reinit Preloader//-
                $scope.$emit('ShowPreloader');

                $timeout(function(){
                    $scope.avatarInfo = [{
                        "userid": $scope.model.id,
                        "aplicacion": data.actividad,
                        "genero": data.genero,
                        "rostro": data.rostro,
                        "color_de_piel": data.colorPiel,
                        "estilo_cabello": data.estiloCabello,
                        "color_cabello": data.colorCabello,
                        "traje_color_principal": data.trajeColorPrincipal,
                        "traje_color_secundario": data.trajeColorSecundario,
                        "imagen_recortada": data.genero,
                        "ultima_modificacion": data["fechaModificación"],
                        "Te_gusto_la_actividad": data.gustaActividad,
                        "pathimagen": data.pathImagen,
                        "estrellas": "100",
                        "alias": $scope.model.alias,
                        "escudo": $scope.model.shield
                    }];

                    _setLocalStorageJsonItem("avatarInfo", $scope.avatarInfo);
                    var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                    if (data.imageB64) {
                        currentUser.base64Image = 'data:image/png;base64,' + data.imageB64;
                    };
                    currentUser.haspicture = "1";
                    localStorage.setItem("CurrentUser", JSON.stringify(currentUser));

                    uploadAvatar($scope.avatarInfo);
                }, 500);
            }

            function FailureAvatar(data) {
                 $scope.$emit('HidePreloader');
                //$location.path('/ProgramaDashboard');
            }

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
                $scope.scrollToTop();
            };

            if ($routeParams.retry) {
                 $scope.$emit('ShowPreloader');
                try {
                    document.addEventListener("deviceready", function () {
                         $scope.$emit('ShowPreloader');
                        cordova.exec(SuccessAvatar, FailureAvatar, "CallToAndroid", "setMiAvatarIntentCallback", [])
                    }, false);
                }
                catch (e) {
                    SuccessAvatar(
                        {
                            "userId": $scope.model.id,
                            "actividad": "Mi Avatar",
                            "alias": $scope.model.alias,
                            "genero": "Mujer",
                            "rostro": "Preocupado",
                            "colorPiel": "E6C8B0",
                            "estiloCabello": "Cabello02",
                            "colorCabello": "694027",
                            "trajeColorPrincipal": "00A0FF",
                            "trajeColorSecundario": "006192",
                            "imagenRecortada": "app/initializr/media",
                            "fechaModificación": "09/05/2015 09:32:04",
                            "gustaActividad": "Si",
                            "pathImagen": "avatar_196.png"
                        }
                    );
                }
            }

            function getContentResources() {
                drupalFactory.Services.GetContent("tutorial", function (data, key) {
                        $scope.contentResources = data.node;
                        
                        drupalFactory.Services.GetContent("tutorial2", function(data2, key){
                                $scope.contentResources2 = data2.node;
                                
                                drupalFactory.Services.GetContent("tutorial3", function(data3, key){
                                    $scope.contentResources3 = data3.node;
                                }, function(){
                                    }, false);
                                
                            }, function(){
                                }, false);
                        
                    }, function () {
                        }, false);

            }

            getContentResources();
        }]);
