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
    function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
        $scope.setToolbar($location.$$path,"AlbumIncluso");
        $rootScope.showFooter = false; 
        $rootScope.showFooterRocks = false;
        $scope.$emit('ShowPreloader');

        //apply carousel to album layout
         var owlAlbum = $("#owlAlbum");

                owlAlbum.owlCarousel({
                    navigation: false,
                    pagination: false,
                    //paginationSpeed: 1000,
                    goToFirstSpeed: 2000,
                    singleItem: true,
                    autoHeight: true,
                    touchDrag:false,
                    mouseDrag:false,
                    transitionStyle:"fade",
                    afterInit : function(el){
                        $scope.$emit('HidePreloader');
                    }
                    //afterMove: callback1
                });

                $("#next").click(function (ev) {
                    owlAlbum.trigger('owl.next');
                    ev.preventDefault();

                });

                $("#prev").click(function (ev) {
                    owlAlbum.trigger('owl.prev');
                    ev.preventDefault();
                });
    }]);