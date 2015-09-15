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
                afterInit: function (el) {



                }
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
            $scope.$emit('HidePreloader');
        }, 1000);

        $scope.message = "Todos los logros en un solo lugar. <br/> Recuerda lo vivido en esta misi&#243;n y no te olvides de continuar con tus prop&#243;sitos.";

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
            //Albun no reachable
        }


    }]);