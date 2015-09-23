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
    '$filter',
    function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $filter) {
        
        $scope.setToolbar($location.$$path, "Album Incluso");
        $rootScope.showFooter = false;
        $rootScope.showFooterRocks = false;
        $scope.isShareCollapsed = false;
        $scope.showSharedAlbum = false;
        $scope.sharedAlbumMessage = null;
        
        var _course = moodleFactory.Services.GetCacheJson("course");
        var _userId = moodleFactory.Services.GetCacheObject("userId");
        var _userProfile = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
        var albumSrc = null;
        
        $scope.discussion = null;
        $scope.forumId = null;

        
        $scope.$emit('ShowPreloader');
        
        $timeout(function () {
            //apply carousel to album layout
            var owlAlbum = $("#owlAlbum");

            owlAlbum.owlCarousel({
                navigation: false,
                pagination: false,
                goToFirstSpeed: 2000,
                singleItem: true,
                autoHeight: true,
                touchDrag: false,
                mouseDrag: false,
                transitionStyle: "fade",
                afterInit: function (el) {}
            });

            $(".next").click(function (ev) {
                $scope.scrollToTop();
                owlAlbum.trigger('owl.next');
                ev.preventDefault();

            });

            $(".back").click(function (ev) {
                $scope.scrollToTop();
                owlAlbum.trigger('owl.prev');
                ev.preventDefault();
            });            
        }, 1000);

        $scope.message = "Todos los logros en un solo lugar. <br/> Recuerda lo vivido en esta misi&#243;n y no te olvides de continuar con tus prop&#243;sitos.";
        
        $scope.postTextToCommunity = function(){
            
            $scope.$emit('ShowPreloader');
                
            if ($scope.discussion == null || $scope.forumId == null) {
                
                moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, function(data, key) {
                    
                    $scope.discussion = data.discussions[0];
                    $scope.forumId = data.forumid;
                    generateAlbumImgSrc(postAlbumToCommunity);
                    
                    }, function(data){
                        $scope.sharedAlbumMessage = null;
                        $scope.isShareCollapsed = false;
                        $scope.showSharedAlbum = false;
                        $scope.$emit('HidePreloader');
                    }, true);
            } else {
                generateAlbumImgSrc(postAlbumToCommunity);
            }
            
        };
        
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
                $scope.$emit('HidePreloader');
            }
        }

        function successfullCallBack(albumData) {
            if (albumData != null) {
                _setLocalStorageJsonItem("album", albumData);
                $scope.album = albumData;                
                $scope.$emit('HidePreloader');
            }
            else {
                //Albun no reachable
            }
        }
        
        function generateAlbumImgSrc(callback) {
            
            if (albumSrc == null) {
                    var svgString = new XMLSerializer().serializeToString(document.querySelector('svg'));
                    console.log(document.querySelector('image'));
                    var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
                    var DOMURL = self.URL || self.webkitURL || self;
                    var url = DOMURL.createObjectURL(svg);
                    
                    var canvas = document.getElementById("canvas");
                    var ctx = canvas.getContext("2d");
                    
                    var img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, 0, 0);
                        albumSrc = canvas.toDataURL("image/png");
                        callback();
                    };
                    img.src = url;
            }else{
                callback();   
            }
        }
        
        function postAlbumToCommunity() {
            
                var requestData = {
                    "userid": _userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": $scope.sharedAlbumMessage,
                    "createdtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "modifiedtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "posttype": 4,
                    "filecontent":albumSrc.replace("data:image/png;base64", ""),
                    "filename": 'album.png',
                    "picture_post_author": _userProfile.profileimageurlsmall
                };
                
                moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                    function() {
                        $scope.sharedAlbumMessage = null;
                        $scope.isShareCollapsed = false;
                        $scope.showSharedAlbum = true;
                        $scope.$emit('HidePreloader');
                    },
                    function(){
                        $scope.sharedAlbumMessage = null;
                        $scope.isShareCollapsed = false;
                        $scope.showSharedAlbum = false;
                        $scope.$emit('HidePreloader');
                    }
                );
        }

    }]);