angular
    .module('incluso.programa.postPhotoGalleryDetailController', [])
    .controller('postPhotoGalleryDetailController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        '$filter',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal, $filter) {
            
            $rootScope.pageName = "Galería";
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            
            $scope.userToken = JSON.parse(localStorage.getItem('CurrentUser')).token;
            $scope.model = JSON.parse(localStorage.getItem("galleryDetail"));
            
            function loadCarousel() {
                
                $scope.$emit('ShowPreloader');
                
                $timeout(function() {
                    
                    galleryFunctions = {
                        "init": function (gallery) {
                            gallery.owlCarousel({
                                navigation: false,
                                pagination: false,
                                paginationSpeed: 1000,
                                goToFirstSpeed: 2000,
                                singleItem: true,
                                autoHeight: true,
                                touchDrag: true,
                                mouseDrag: false,
                                transitionStyle: "fade",
                                afterAction: galleryFunctions.afterAction,
                                afterInit: galleryFunctions.initCarousel
                            });
                            $(".control.next").click(function (e) {
                                if (!$(this).hasClass("disable"))
                                    gallery.trigger('owl.next');
                                e.preventDefault();
                            });
                            $(".control.back").click(function (e) {
                                if (!$(this).hasClass("disable"))
                                    gallery.trigger('owl.prev');
                                e.preventDefault();
                            });
                        },
                        "initCarousel": function () {
                            $(".total-number").text(this.owl.owlItems.length);
                        },
                        "afterAction": function () {
                            var item = this.owl.currentItem;
                            var total = this.owl.owlItems.length;
                            
                            if (total === 0) {
                                $(".control.back").addClass("disable");
                                $(".control.next").addClass("disable"); 
                            } else if (item === 0) {
                                $(".control.back").addClass("disable");
                                $(".control.next").removeClass("disable"); 
                            } else if (item === total - 1) {
                                $(".control.back").removeClass("disable");
                                $(".control.next").addClass("disable"); 
                            }

                            $(".currentItem").text(item + 1);
                        }
                    }
                    
                    galleryFunctions.init($("#gallery-carousel"));
                    $scope.$emit('HidePreloader');
                }, 1500);
            }
            
            $scope.scrollToTop();
            localStorage.removeItem("galleryDetail");
            loadCarousel();
        }]);

