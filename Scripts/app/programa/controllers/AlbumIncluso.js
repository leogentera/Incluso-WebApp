angular
.module('incluso.programa.album', [])
.controller('AlbumInclusoController', [
    '$q',
    '$scope',
    '$location',
    '$routeParams',
    '$timeout',
    '$rootScope',
    '$http',
    '$modal',
    '$timeout',
    function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $timeout) {
        $scope.setToolbar($location.$$path, "AlbumIncluso");
        $rootScope.showFooter = false;
        $rootScope.showFooterRocks = false;
        $scope.$emit('ShowPreloader');

// :)

        $timeout(function () {
            //apply carousel to album layout
            var owlAlbum = $("#owlAlbum");

            owlAlbum.owlCarousel({
                navigation: false,
                pagination: false,
                //paginationSpeed: 1000,
                goToFirstSpeed: 2000,
                singleItem: true,
                autoHeight: true,
                touchDrag: false,
                mouseDrag: false,
                transitionStyle: "fade",
                afterInit: function (el) {}
                //afterMove: callback1
            });

            $(".next").click(function (ev) {
                owlAlbum.trigger('owl.next');
                ev.preventDefault();

            });

            $(".back").click(function (ev) {
                owlAlbum.trigger('owl.prev');
                ev.preventDefault();
            });            
        }, 1000);

        $scope.message = "Todos los logros en un solo lugar. <br/> Recuerda lo vivido en esta misi&#243;n y no te olvides de continuar con tus prop&#243;sitos.";

        $scope.badgeFileName = function getFileName(id) {
            var filename = "";

            switch (id) {
                case 2:
                    filename = "combustible.svg";
                    break;
                case 3:
                    filename = "turbina.svg";
                    break;
                case 4:
                    filename = "ala.svg";
                    break;
                case 5:
                    filename = "sistNavegacion.svg";
                    break;
                case 6:
                    filename = "propulsor.svg";
                    break;
                case 7:
                    filename = "misiles.svg";
                    break;
                case 8:
                    filename = "escudo.svg";
                    break;
                case 9:
                    filename = "radar.svg";
                    break;
                case 10:
                    filename = "tanqueoxigeno.svg";
                    break;
                case 11:
                    filename = "sondaEspacial.svg";
                    break;
                case 12:
                    filename = "foro_interplanetario.svg";
                    break;
                case 13:
                    filename = "IDintergalactica.svg";
                    break;
                case 14:
                    filename = "participacion_electrica.svg";
                    break;
                case 15:
                    filename = "corazon_digital.svg";
                    break;
                case 16:
                    filename = "casco.svg";
                    break;
                case 17:
                    filename = "radioComunicacion.svg";
                    break;
                case 18:
                    filename = "turbo.svg";
                    break;
                default:
                    filename = "default_placeholder.svg";
            }

            return filename;
        }

        controllerInit();

        function controllerInit() {
            
            $scope.album = JSON.parse(_getItem("album"));
            $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

            if ($scope.album == null) {
                if ($scope.currentUser.userId != null) {
                    moodleFactory.Services.GetAsyncAlbum($scope.currentUser.userId, successfullCallBack, errorCallback, true);
                }
                else {
                    //Albun no reachable
                }
            }
            else {
                renderInfo();
            }
        }

        function successfullCallBack(albumData) {
            if (albumData != null) {
                _setLocalStorageJsonItem("album", albumData);
                $scope.album = albumData;                
                renderInfo();
            }
            else {
                //Albun no reachable
            }
        }

        function errorCallback(albumData) {            
            //Albun no reachable
        }

        function renderInfo() {
            $scope.$emit('HidePreloader');
        }
    }]);