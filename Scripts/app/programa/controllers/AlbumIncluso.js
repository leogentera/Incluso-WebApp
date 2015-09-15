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
        $scope.setToolbar($location.$$path,"AlbumIncluso");
        $rootScope.showFooter = false; 
        $rootScope.showFooterRocks = false;
        $scope.$emit('ShowPreloader');

        $timeout(function() {
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

                
    }]);